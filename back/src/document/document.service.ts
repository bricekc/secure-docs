import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

interface UploadFileJob {
  fileName: string;
  content: string;
  userId: number;
}
@Injectable()
export class DocumentService {
  constructor(@InjectQueue('document-queue') private documentQueue: Queue) {}

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
}
