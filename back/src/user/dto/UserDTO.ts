import { InputType, Field } from '@nestjs/graphql';
import { Role } from '../user.model';

@InputType()
export class UserDTO {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field(() => Role, { defaultValue: Role.USER })
  role?: Role;
}
