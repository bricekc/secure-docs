import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
}
