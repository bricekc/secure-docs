import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { LogModule } from 'src/log/log.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    LogModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, AdminGuard],
  exports: [AdminGuard],
})
export class AuthModule {}
