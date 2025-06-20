import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    JwtModule.register({
      secret: 'supersecretjwt',
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
  ],
  providers: [AuthService, AuthResolver, JwtStrategy],
})
export class AuthModule {}
