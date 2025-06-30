import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from './log.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('LogService', () => {
  let service: LogService;

  const mockQueue = {
    getJobs: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        {
          provide: getQueueToken('log-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return logs', async () => {
    const mockJobs = [
      {
        id: '1',
        data: { type: 'test', message: 'test message' },
        timestamp: Date.now(),
      },
    ];
    mockQueue.getJobs.mockResolvedValue(mockJobs);

    const logs = await service.getLogs(['test']);

    expect(logs).toHaveLength(1);
    expect(logs[0].type).toBe('test');
    expect(logs[0].message).toBe('test message');
  });
});
