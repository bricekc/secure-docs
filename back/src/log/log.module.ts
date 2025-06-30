import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogResolver } from './log.resolver';
import { LogProducerService } from './log-producer.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: 'log-queue',
      defaultJobOptions: {
        removeOnComplete: {
          age: 60 * 60 * 24 * 7, // keep logs for 7 days
          count: 1000, // keep the last 1000 completed logs
        },
        removeOnFail: {
          age: 60 * 60 * 24 * 7, // keep failed logs for 7 days
          count: 1000, // keep the last 1000 failed logs
        },
      },
    }),
  ],
  providers: [LogService, LogResolver, LogProducerService],
  exports: [LogService, LogProducerService],
})
export class LogModule {}
