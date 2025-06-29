import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadFileInput {
  @Field()
  fileName: string;

  @Field()
  content: string;
}
