import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [LogModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
