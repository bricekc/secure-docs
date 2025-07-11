import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.model';

@ObjectType()
export class Document {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  status: string;

  @Field()
  userId: number;

  @Field(() => User)
  user: User;

  @Field({ nullable: true })
  url: string;

  @Field()
  types: string;
}
