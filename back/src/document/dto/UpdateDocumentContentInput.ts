import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentContentInput {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  content: string;

  @Field(() => String)
  filename: string;
}
