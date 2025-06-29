import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDTO } from './dto/UserDTO';
import { Role as GqlRole, User } from './user.model';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => User)
  async createUser(@Args('input') input: UserDTO): Promise<User> {
    const user = await this.userService.create(input);
    return {
      ...user,
      role: user.role as GqlRole,
    };
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async getUsers(): Promise<User[]> {
    const users = await this.userService.findAll();
    return users.map((user) => ({
      ...user,
      role: user.role as GqlRole,
    }));
  }

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getUserById(
    @CurrentUser() user: { userId: number },
  ): Promise<User | null> {
    const currentUser = await this.userService.findById(user.userId);
    if (!currentUser) return null;

    return {
      ...currentUser,
      role: currentUser.role as GqlRole,
    };
  }
}
