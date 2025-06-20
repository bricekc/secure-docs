import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, { name: 'Role' });

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
}
