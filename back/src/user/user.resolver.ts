import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/CreateUserInput';
import { Role as GqlRole } from './user.model';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UserDTO } from './dto/UserDTO';
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gard';

@Resolver(() => UserDTO)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => UserDTO)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserDTO> {
    const user = await this.userService.create(input);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as GqlRole,
    };
  }

  @Query(() => [UserDTO])
  @UseGuards(AdminGuard)
  async getUsers(): Promise<UserDTO[]> {
    const users = await this.userService.findAll();
    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as GqlRole,
    }));
  }

  @Query(() => UserDTO, { nullable: true })
  @UseGuards(AdminGuard)
  async getUserById(
    @CurrentUser() user: { userId: number },
  ): Promise<UserDTO | null> {
    const currentUser = await this.userService.findById(user.userId);
    if (!currentUser) return null;

    return {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role as GqlRole,
    };
  }

  @Query(() => UserDTO, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser() user: { userId: number },
  ): Promise<UserDTO | null> {
    const userReturn = await this.userService.findById(user.userId);
    if (!userReturn) return null;

    return {
      id: userReturn.id,
      email: userReturn.email,
      name: userReturn.name,
      role: userReturn.role as GqlRole,
    };
  }
}
