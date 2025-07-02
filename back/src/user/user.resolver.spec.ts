import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { Role, User } from './user.model';
import { CreateUserInput } from './dto/CreateUserInput';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: Partial<Record<keyof UserService, jest.Mock>>;

  beforeEach(async () => {
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: userService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const input: CreateUserInput = {
        email: 'johndoe@gmail.com',
        password: 'password',
        name: 'johndoe',
      };

      const createdUser: User = {
        id: 1,
        email: input.email,
        name: 'johndoe',
        password: input.password,
        role: Role.USER,
      };

      userService.create!.mockResolvedValue(createdUser);

      const result = await resolver.createUser(input);
      const { password, ...expectedResult } = createdUser;
      expect(result).toEqual({
        ...expectedResult,
        role: Role.USER,
      });
      expect(userService.create).toHaveBeenCalledWith(input);
    });
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          email: 'user1@example.com',
          password: 'pass1',
          role: Role.USER,
        },
        {
          id: 2,
          email: 'admin@example.com',
          password: 'pass2',
          role: Role.ADMIN,
        },
      ];

      userService.findAll!.mockResolvedValue(mockUsers);

      const result = await resolver.getUsers();
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].role).toBe(Role.ADMIN);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userMock: User = {
        id: 1,
        email: 'me@example.com',
        password: 'pass',
        role: Role.USER,
      };

      userService.findById!.mockResolvedValue(userMock);

      const result = await resolver.getUserById({ userId: 1 });
      const { password, ...expectedResult } = userMock;

      expect(result).toEqual({
        ...expectedResult,
        role: Role.USER,
      });
      expect(userService.findById).toHaveBeenCalledWith(1);
    });

    it('should return null if user not found', async () => {
      userService.findById!.mockResolvedValue(null);

      const result = await resolver.getUserById({ userId: 42 });
      expect(result).toBeNull();
      expect(userService.findById).toHaveBeenCalledWith(42);
    });
  });
});
