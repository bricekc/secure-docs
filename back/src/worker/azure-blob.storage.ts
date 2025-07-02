import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { BlobSASPermissions } from '@azure/storage-blob';

@Injectable()
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor() {
    const connectionString = process.env.AZURE_BLOB_STORAGE as string;

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);

    const containerName = 'uploadfile';
    this.containerClient =
      this.blobServiceClient.getContainerClient(containerName);
  }

  async uploadFile(fileName: string, data: Buffer): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
    });

    return blockBlobClient.url;
  }

  async deleteFile(filePath: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.delete();
  }

  async getFileSasUrl(filePath: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);

    const sasOptions = {
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 24000),
      permissions: BlobSASPermissions.parse('r'),
    };

    const sasToken = await blockBlobClient.generateSasUrl(sasOptions);
    return sasToken;
  }

  async downloadFileContent(filePath: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    const downloadBlockBlobResponse = await blockBlobClient.downloadToBuffer();
    return downloadBlockBlobResponse.toString('utf-8');
  }
}
