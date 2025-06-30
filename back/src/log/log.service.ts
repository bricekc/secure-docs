import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

class RawLog {
  id: string;
  data: {
    type: string;
    message: string;
  };
  timestamp: number;
}

@Injectable()
export class LogService {
  constructor(@InjectQueue('log-queue') private readonly logQueue: Queue) {}

  async getLogs(types?: string[]) {
    const jobs = (await this.logQueue.getJobs([
      'completed',
      'failed',
      'waiting',
      'active',
    ])) as RawLog[];

    let logs = jobs.map((job) => ({
      id: job.id,
      type: job.data.type,
      message: job.data.message,
      timestamp: new Date(job.timestamp),
    }));

    if (types && types.length > 0) {
      logs = logs.filter((log) => types.includes(log.type)); // Types are : document, user, error, auth
    }

    return logs;
  }
}
