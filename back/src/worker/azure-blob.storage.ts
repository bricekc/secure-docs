import { Injectable } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

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

  async uploadFile(
    fileName: string,
    data: Buffer | Uint8Array | Blob | string,
  ): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);

    const uploadData = typeof data === 'string' ? Buffer.from(data) : data;

    await blockBlobClient.uploadData(uploadData, {
      blobHTTPHeaders: { blobContentType: 'application/octet-stream' },
    });

    return blockBlobClient.url;
  }

  async deleteFile(filePath: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(filePath);
    await blockBlobClient.delete();
  }
}
