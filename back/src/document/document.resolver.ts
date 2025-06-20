import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { DocumentService } from './document.service';
import { Document } from './document.model';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Mutation(() => Boolean)
  async createDocument(@Args('data') data: string): Promise<boolean> {
    return await this.documentService.create(data);
  }

  @Query(() => String)
  hello(): string {
    return 'Hello from DocumentResolver!';
  }
}
