import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AzureBlobService } from './azure-blob.storage';
import { UpdateFileJob, UploadFileJob } from 'src/document/dto/UploadJobData';
import { DocumentGateway } from './document.gateway';

@Processor('document-queue')
@Injectable()
export class DocumentProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private azureBlobService: AzureBlobService,
    private documentGateway: DocumentGateway,
  ) {
    super();
  }

  async process(
    job: Job<UploadFileJob | UpdateFileJob, any, string>,
  ): Promise<any> {
    switch (job.name) {
      case 'upload-document':
        return this.handleUploadFileToAzure(job as Job<UploadFileJob>);
      case 'update-document':
        return this.handleUpdateFileInAzure(job as Job<UpdateFileJob>);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleUploadFileToAzure(job: Job<UploadFileJob>) {
    const { fileBuffer, originalFilename, userId, userEmail } = job.data;
    const azureFilename = `${userEmail}/${originalFilename}`;

    const buffer = Buffer.from(fileBuffer.data);

    try {
      console.log(`Starting Azure upload for file: ${azureFilename}`);
      const url = await this.azureBlobService.uploadFile(azureFilename, buffer);

      const data = await this.prisma.document.create({
        data: {
          name: originalFilename,
          status: 'uploaded',
          userId: userId,
        },
      });

      console.log(`File uploaded successfully to Azure: ${url}`);
      data['url'] = await this.azureBlobService.getFileSasUrl(
        `${userEmail}/${originalFilename}`,
      );
      data['types'] = originalFilename.split('.').pop();
      this.documentGateway.sendDocumentUpload(userId.toString(), data);
      return { success: true, url };
    } catch (error) {
      console.error(`Failed to upload file ${azureFilename}:`, error);
      throw error;
    }
  }

  private async handleUpdateFileInAzure(job: Job<UpdateFileJob>) {
    const { id, fileBuffer, originalFilename, userEmail, userId } = job.data;
    const azureFilename = `${userEmail}/${originalFilename}`;

    const buffer = Buffer.from(fileBuffer.data);

    try {
      console.log(`Starting Azure update for file: ${azureFilename}`);

      const url = await this.azureBlobService.uploadFile(azureFilename, buffer);

      const data = await this.prisma.document.update({
        where: { id },
        data: { status: 'updated' },
      });

      console.log(
        `File updated successfully in Azure: ${url}, by user: ${userId}`,
      );
      data['url'] = this.azureBlobService.getFileSasUrl(
        `${userEmail}/${originalFilename}`,
      );
      data['types'] = originalFilename.split('.').pop();
      this.documentGateway.sendDocumentUpdate(userId.toString(), data);
      return { success: true, url };
    } catch (error) {
      console.error(`Failed to update file ${azureFilename}:`, error);
      throw error;
    }
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
