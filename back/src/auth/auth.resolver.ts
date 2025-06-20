import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@ObjectType()
class AuthResponse {
  @Field()
  access_token: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponse> {
    return this.authService.login(email, password);
  }
}
