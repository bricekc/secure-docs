import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../user.model';

@ObjectType()
export class UserDTO {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => Role)
  role: Role;
}
