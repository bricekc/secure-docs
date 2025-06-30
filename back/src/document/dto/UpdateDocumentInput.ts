import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLUpload, { FileUpload } from 'graphql-upload/GraphQLUpload.mjs';

@InputType()
export class UpdateDocumentInput {
  @Field(() => Int)
  id: number;

  @Field(() => GraphQLUpload)
  file: Promise<FileUpload>;
}
