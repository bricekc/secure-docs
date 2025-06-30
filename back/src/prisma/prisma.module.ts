import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaResolver } from './prisma.resolver';

@Global()
@Module({
  providers: [PrismaResolver, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
