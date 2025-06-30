import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma.service';
import { Document } from '@prisma/client';
import { UploadFileJob } from './dto/UploadJobData';
import { AzureBlobService } from 'src/worker/azure-blob.storage';
import { LogProducerService } from 'src/log/log-producer.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectQueue('document-queue') private documentQueue: Queue,
    private prisma: PrismaService,
    private azureBlobService: AzureBlobService,
    private logProducerService: LogProducerService,
  ) {}

  async create(
    name: string,
    content: string,
    userId: number,
  ): Promise<boolean> {
    const existingDocument = await this.prisma.document.findFirst({
      where: { name, userId },
    });

    if (existingDocument) {
      throw new Error(`A document with the name "${name}" already exists.`);
    }

    await this.documentQueue.add('upload-document', {
      fileName: name,
      content,
      userId,
      timestamp: new Date(),
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${name} created by user ${userId}`,
    );

    console.log(`Job added to queue with data: ${name}`);
    return true;
  }

  async updateDocument(
    id: number,
    newContent: string,
    userId: number,
  ): Promise<boolean> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.userId !== userId) {
      throw new UnauthorizedException('Document not found or unauthorized');
    }

    await this.prisma.document.update({
      where: { id },
      data: { status: 'updated' },
    });

    await this.documentQueue.add('update-document', {
      fileName: document.name,
      content: newContent,
      userId: userId,
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${document.name} updated by user ${userId}`,
    );

    console.log(`Update job added to queue for document: ${document.name}`);
    return true;
  }

  async uploadFileToQueue(uploadData: UploadFileJob): Promise<void> {
    const existingDocument = await this.prisma.document.findFirst({
      where: {
        name: uploadData.fileName.split('/').pop(),
        userId: uploadData.userId,
      },
    });

    if (existingDocument) {
      throw new Error(
        `A document with the name "${uploadData.fileName.split('/').pop()}" already exists.`,
      );
    }

    await this.documentQueue.add('upload-document', uploadData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${uploadData.fileName} uploaded by user ${uploadData.userId}`,
    );

    console.log(`File upload job added to queue: ${uploadData.fileName}`);
  }

  async listFiles(id: number): Promise<Document[]> {
    return await this.prisma.document.findMany({
      where: { userId: id },
    });
  }

  async deleteFile(id: number, userId: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    const document = await this.prisma.document.findFirst({
      where: { id },
    });
    if (user?.id !== document?.userId) {
      throw new UnauthorizedException();
    }
    await this.prisma.document.delete({
      where: { id },
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${document?.name || 'NO NAME'} deleted by user ${userId}`,
    );
  }
}
