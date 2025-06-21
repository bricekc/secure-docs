import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AzureBlobService } from './azure-blob.storage';

interface UploadFileJob {
  fileName: string;
  content: string;
  userId: number;
}

@Processor('document-queue')
@Injectable()
export class DocumentProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private azureBlobService: AzureBlobService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'upload-document':
        return this.handleUploadFileToAzure(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleUploadFileToAzure(job: Job<UploadFileJob>) {
    const { fileName, content, userId } = job.data;

    try {
      console.log(`Starting Azure upload for file: ${fileName}`);

      const buffer = Buffer.from(content, 'base64');

      const url = await this.azureBlobService.uploadFile(fileName, buffer);

      await this.prisma.document.create({
        data: {
          name: fileName.split('/').pop() || fileName,
          status: 'uploaded',
          userId: userId,
        },
      });

      console.log(`File uploaded successfully to Azure: ${url}`);
      return { success: true, url };
    } catch (error) {
      console.error(`Failed to upload file ${fileName}:`, error);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`Job ${job.id} completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.log(`Job ${job.id} failed:`, err.message);
  }
}
