import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Document } from 'src/document/document.model';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User role (admin or user)',
});

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  password: string;

  @Field(() => Role)
  role: Role;

  @Field(() => [Document], { nullable: true })
  documents?: Document[];
}
