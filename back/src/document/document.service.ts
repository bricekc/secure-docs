import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { Document } from '@prisma/client';
import { AzureBlobService } from '../worker/azure-blob.storage';
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
    fileBuffer: Buffer,
    originalFilename: string,
    userId: number,
    userEmail: string,
  ): Promise<boolean> {
    const existingDocument = await this.prisma.document.findFirst({
      where: { name: originalFilename, userId },
    });

    if (existingDocument) {
      throw new Error(
        `A document with the name "${originalFilename}" already exists.`,
      );
    }

    await this.documentQueue.add('upload-document', {
      fileBuffer,
      originalFilename,
      userId,
      userEmail,
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${originalFilename} created by user ${userId}`,
    );

    return true;
  }

  async updateDocument(
    id: number,
    fileBuffer: Buffer,
    originalFilename: string,
    userId: number,
    userEmail: string,
  ): Promise<boolean> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document || document.userId !== userId) {
      throw new UnauthorizedException('Document not found or unauthorized');
    }

    await this.documentQueue.add('update-document', {
      id,
      fileBuffer,
      originalFilename,
      userEmail,
    });

    await this.logProducerService.addLog(
      'document',
      `Document ${document.name} updated by user ${userId}`,
    );

    return true;
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

  async getSecuredFileUrl(id: number, userId: number): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have access to this document',
      );
    }
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    const filePath = `${user?.email}/${document.name}`;
    return this.azureBlobService.getFileSasUrl(filePath);
  }

  async getDocumentContent(id: number, userId: number): Promise<string> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have access to this document',
      );
    }

    if (!document.name.endsWith('.txt')) {
      throw new Error('This endpoint only supports .txt files.');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    const filePath = `${user?.email}/${document.name}`;
    return this.azureBlobService.downloadFileContent(filePath);
  }
}
