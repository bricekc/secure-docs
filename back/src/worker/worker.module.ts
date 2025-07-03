import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DocumentProcessor } from './worker.document.processor';
import { PrismaService } from '../prisma.service';
import { AzureBlobService } from './azure-blob.storage';
import { DocumentGateway } from './document.gateway';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: 'document-queue',
    }),
  ],
  providers: [
    DocumentProcessor,
    PrismaService,
    AzureBlobService,
    DocumentGateway,
  ],
})
export class WorkerModule {}
