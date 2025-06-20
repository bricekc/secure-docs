import { Resolver } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';

@Resolver()
export class PrismaResolver {
  constructor(private readonly prismaService: PrismaService) {}
}
