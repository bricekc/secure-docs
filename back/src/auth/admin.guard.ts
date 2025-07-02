import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.gard';
import { Role } from '../user/user.model';
import { UserDTO } from 'src/user/dto/UserDTO';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext<{ req: Request & { user: UserDTO } }>().req;
    const { user } = req;

    if (user && user.role === Role.ADMIN) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to access this resource.',
    );
  }
}
