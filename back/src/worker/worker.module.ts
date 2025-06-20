import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DocumentProcessor } from './worker.document.processor';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'document-queue',
    }),
  ],
  providers: [DocumentProcessor, PrismaService],
})
export class WorkerModule {}
