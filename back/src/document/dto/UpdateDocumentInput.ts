import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentInput {
  @Field(() => Int)
  id: number;

  @Field()
  newContent: string;
}
