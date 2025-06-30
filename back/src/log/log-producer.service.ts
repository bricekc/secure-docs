import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class LogProducerService {
  constructor(@InjectQueue('log-queue') private readonly logQueue: Queue) {}

  async addLog(type: string, message: string) {
    await this.logQueue.add('log', { type, message });
  }
}
