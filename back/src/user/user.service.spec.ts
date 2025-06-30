import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDTO } from './dto/UserDTO';
import * as bcrypt from 'bcrypt';
import { Role } from './user.model';
import { LogProducerService } from 'src/log/log-producer.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: any };
  let logProducerService: { addLog: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    logProducerService = {
      addLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
        { provide: LogProducerService, useValue: logProducerService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should hash password and create a user', async () => {
      const dto: UserDTO = {
        email: 'test@example.com',
        password: 'password',
        role: Role.USER,
      };

      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const createdUser = {
        id: 1,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      };

      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          password: expect.any(String),
        },
      });

      expect(result).toEqual(createdUser);
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const userMock = {
        id: 1,
        email: 'user@example.com',
        password: 'hashedpw',
        role: Role.USER,
      };

      prisma.user.findUnique.mockResolvedValue(userMock);

      const result = await service.findById(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(userMock);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const usersMock = [
        { id: 1, email: 'a@test.com', password: 'hashed', role: Role.USER },
        { id: 2, email: 'b@test.com', password: 'hashed2', role: Role.ADMIN },
      ];

      prisma.user.findMany.mockResolvedValue(usersMock);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(usersMock);
    });
  });
});
