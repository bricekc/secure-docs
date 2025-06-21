import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentResolver } from './document.resolver';
import { DocumentService } from './document.service';
import { PrismaService } from '../prisma.service';
import { AzureBlobService } from 'src/worker/azure-blob.storage';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-queue',
    }),
  ],
  providers: [
    DocumentResolver,
    DocumentService,
    PrismaService,
    AzureBlobService,
  ],
})
export class DocumentModule {}
