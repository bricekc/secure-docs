import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.model';

@ObjectType()
export class Document {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  userId: number;

  @Field(() => [User])
  posts: User[];
}
