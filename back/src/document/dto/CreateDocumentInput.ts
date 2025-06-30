import { Field, InputType } from '@nestjs/graphql';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';

@InputType()
export class CreateDocumentInput {
  @Field()
  name: string;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}
