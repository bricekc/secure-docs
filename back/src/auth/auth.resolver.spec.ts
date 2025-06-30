import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const mockToken = { access_token: 'jwt.token.here' };
      const email = 'test@example.com';
      const password = 'securePassword123';

      authService.login.mockResolvedValue(mockToken);

      const result = await resolver.login({ email, password });

      expect(authService.login).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockToken);
    });
  });
});
