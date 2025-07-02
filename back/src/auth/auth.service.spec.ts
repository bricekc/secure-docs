import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LogProducerService } from 'src/log/log-producer.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: any };
  let jwtService: { sign: jest.Mock };
  let logProducerService: { addLog: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(),
    };

    logProducerService = {
      addLog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: LogProducerService, useValue: logProducerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should return access_token if credentials are valid', async () => {
      const user = {
        id: 1,
        email,
        password: await bcrypt.hash(password, 10),
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('mocked.jwt.token');

      // mock bcrypt
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login(email, password);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({
        access_token: 'mocked.jwt.token',
        user: {
          id: user.id,
          email: user.email,
          name: undefined,
          role: user.role,
        },
      });
    });

    it('should throw if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw if password is invalid', async () => {
      const user = {
        id: 1,
        email,
        password: await bcrypt.hash('wrongpassword', 10),
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
