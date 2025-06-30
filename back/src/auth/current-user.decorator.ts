import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface UserRequest {
  req: {
    user: {
      id: string;
      email: string;
      role: string;
    };
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserRequest['req']['user'] => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext<UserRequest>().req.user;
  },
);
