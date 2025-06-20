import { Test, TestingModule } from '@nestjs/testing';
import { PrismaResolver } from './prisma.resolver';
import { PrismaService } from './prisma.service';

describe('PrismaResolver', () => {
  let resolver: PrismaResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaResolver, PrismaService],
    }).compile();

    resolver = module.get<PrismaResolver>(PrismaResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
