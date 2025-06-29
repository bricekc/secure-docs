import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteFileInput {
  @Field()
  fileName: string;

  @Field()
  id: number;
}
