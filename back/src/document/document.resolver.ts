import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './document.model';
import { AzureBlobService } from 'src/worker/azure-blob.storage';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CreateDocumentInput } from './dto/CreateDocumentInput';
import { UploadFileInput } from './dto/UploadFileInput';
import { DeleteFileInput } from './dto/DeleteFileInput';
import { UpdateDocumentInput } from './dto/UpdateDocumentInput';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async createDocument(
    @Args('input') input: CreateDocumentInput,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<boolean> {
    return await this.documentService.create(
      input.name,
      input.content,
      user.userId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async updateDocument(
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<boolean> {
    return await this.documentService.updateDocument(
      input.id,
      input.newContent,
      user.userId,
    );
  }

  @Query(() => String)
  hello(): string {
    return 'Hello from DocumentResolver!';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args('input') input: UploadFileInput,
    @CurrentUser()
    user: { email: string; userId: number },
  ): Promise<string> {
    const base64Content = Buffer.from(input.content, 'utf-8').toString(
      'base64',
    );

    await this.documentService.uploadFileToQueue({
      fileName: `${user.email}/${input.fileName}`,
      content: base64Content,
      userId: user.userId,
    });

    return `File ${input.fileName} queued for upload`;
  }

  @Query(() => [Document])
  @UseGuards(JwtAuthGuard)
  async listFilesInFolder(
    @CurrentUser() user: { email: string; userId: number },
  ): Promise<Document[]> {
    const files = await this.documentService.listFiles(user.userId);
    return files.map((file) => ({
      ...file,
      user: [],
    }));
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
}
