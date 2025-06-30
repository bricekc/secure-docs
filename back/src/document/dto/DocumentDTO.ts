import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class DocumentDTO {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field(() => Int)
  userId: number;
}
