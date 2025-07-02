import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LogModule } from 'src/log/log.module';

import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    LogModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, AdminGuard],
  exports: [AdminGuard],
})
export class AuthModule {}
