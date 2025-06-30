import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './document.model';
import { AzureBlobService } from 'src/worker/azure-blob.storage';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { DeleteFileInput } from './dto/DeleteFileInput';
import { UpdateDocumentInput } from './dto/UpdateDocumentInput';
import { Stream } from 'stream';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';
import { DocumentDTO } from './dto/DocumentDTO';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  private streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async createDocument(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename }: FileUpload,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<boolean> {
    const stream = createReadStream();
    const buffer = await this.streamToBuffer(stream);

    return this.documentService.create(
      buffer,
      filename,
      user.userId,
      user.email,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async updateDocument(
    @Args('input') { id, file }: UpdateDocumentInput,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<boolean> {
    const { createReadStream, filename } = await file;
    const stream = createReadStream();
    const buffer = await this.streamToBuffer(stream);

    return await this.documentService.updateDocument(
      id,
      buffer,
      filename,
      user.userId,
      user.email,
    );
  }

  @Query(() => String)
  hello(): string {
    return 'Hello from DocumentResolver!';
  }

  @Query(() => [Document])
  @UseGuards(JwtAuthGuard)
  async listFilesInFolder(
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<DocumentDTO[]> {
    const files = await this.documentService.listFiles(user.userId);
    return files;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFileInFolder(
    @Args('input') input: DeleteFileInput,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<boolean> {
    await this.azureBlobService.deleteFile(`${user.email}/${input.fileName}`);
    await this.documentService.deleteFile(input.id, user.userId);
    return true;
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async getFileUrl(
    @Args('id') id: number,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<string> {
    return this.documentService.getSecuredFileUrl(id, user.userId);
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async getDocumentContent(
    @Args('id') id: number,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<string> {
    return this.documentService.getDocumentContent(id, user.userId);
  }
}
