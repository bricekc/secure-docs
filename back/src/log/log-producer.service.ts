import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { LogGateway } from './log.gateway';

@Injectable()
export class LogProducerService {
  constructor(
    @InjectQueue('log-queue')
    private readonly logQueue: Queue,
    private logGateway: LogGateway,
  ) {}

  async addLog(type: string, message: string) {
    const newLog = await this.logQueue.add('log', { type, message });
    const logData = {
      id: newLog.id,
      message,
      timestamp: Date.now(),
      type,
    };
    this.logGateway.sendNewLog(logData);
  }
}
