import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Processor('document-queue')
@Injectable()
export class DocumentProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'upload-document':
        return this.handleUploadDocument(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleUploadDocument(job: Job) {
    console.log('Processing upload document job:', job.data);

    await this.azureUpload(job.data.data);

    // const document = await this.prisma.document.create({...});

    console.log('Document processed successfully!');
    return { success: true };
  }

  private async azureUpload(data: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(`File uploaded to Azure: ${data}`);
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
