import { Test, TestingModule } from '@nestjs/testing';
import { LogResolver } from './log.resolver';
import { LogService } from './log.service';

describe('LogResolver', () => {
  let resolver: LogResolver;

  const mockLogService = {
    getLogs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogResolver,
        {
          provide: LogService,
          useValue: mockLogService,
        },
      ],
    }).compile();

    resolver = module.get<LogResolver>(LogResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return logs', async () => {
    const mockLogs = [
      { id: '1', type: 'test', message: 'test message', timestamp: new Date() },
    ];
    mockLogService.getLogs.mockResolvedValue(mockLogs);

    const logs = await resolver.logs({ types: ['test'] });

    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe('test');
    expect(logs[0].message).toBe('test message');
  });
});
