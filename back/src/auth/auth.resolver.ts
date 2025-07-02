import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/LoginInput';
import { UserDTO } from 'src/user/dto/UserDTO';
import { Role as GqlRole } from 'src/user/user.model';

@ObjectType()
class AuthResponse {
  @Field()
  access_token: string;

  @Field()
  user: UserDTO;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    const { access_token, user } = await this.authService.login(
      input.email,
      input.password,
    );
    console.log('User logged in:', user.email);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as GqlRole,
        name: user.name,
      },
    };
  }
}
