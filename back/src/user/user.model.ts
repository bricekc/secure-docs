import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Document } from 'src/document/document.model';

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [Document])
  posts: Document[];
}

enum Role {
  USER,
  ADMIN,
}
