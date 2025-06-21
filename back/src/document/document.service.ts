import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from 'src/prisma.service';

interface UploadFileJob {
  fileName: string;
  content: string;
  userId: number;
}
@Injectable()
export class DocumentService {
  constructor(
    @InjectQueue('document-queue') private documentQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async create(data: string): Promise<boolean> {
    await this.documentQueue.add('upload-document', {
      data,
      timestamp: new Date(),
    });

    console.log(`Job added to queue with data: ${data}`);
    return true;
  }

  async uploadFileToQueue(uploadData: UploadFileJob): Promise<void> {
    await this.documentQueue.add('upload-document', uploadData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    console.log(`File upload job added to queue: ${uploadData.fileName}`);
  }

  async listFiles(
    id: number,
  ): Promise<{ name: string; id: number; status: string; userId: number }[]> {
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
  }
}
