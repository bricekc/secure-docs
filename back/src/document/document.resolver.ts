import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './document.model';
import { AzureBlobService } from 'src/worker/azure-blob.storage';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly azureBlobService: AzureBlobService,
  ) {}

  @Mutation(() => Boolean)
  async createDocument(@Args('data') data: string): Promise<boolean> {
    return await this.documentService.create(data);
  }

  @Query(() => String)
  hello(): string {
    return 'Hello from DocumentResolver!';
  }

  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async uploadFile(
    @Args('fileName') fileName: string,
    @Args('content') content: string,
    @CurrentUser()
    user: { email: string; userId: number },
  ): Promise<string> {
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');

    await this.documentService.uploadFileToQueue({
      fileName: `${user.email}/${fileName}`,
      content: base64Content,
      userId: user.userId,
    });

    return `File ${fileName} queued for upload`;
  }

  @Query(() => [String])
  @UseGuards(JwtAuthGuard)
  async listFilesInFolder(
    @CurrentUser() user: { email: string },
  ): Promise<string[]> {
    const fileNames = await this.azureBlobService.listFiles(user.email);
    return fileNames;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteFileInFolder(
    @Args('fileName') fileName: string,
    @CurrentUser() user: { email: string },
  ): Promise<boolean> {
    await this.azureBlobService.deleteFile(`${user.email}/${fileName}`);
    return true;
  }
}
