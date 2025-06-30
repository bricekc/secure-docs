import { Test, TestingModule } from '@nestjs/testing';
import { LogProducerService } from './log-producer.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('LogProducerService', () => {
  let service: LogProducerService;

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogProducerService,
        {
          provide: getQueueToken('log-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<LogProducerService>(LogProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a log to the queue', async () => {
    await service.addLog('test', 'test message');

    expect(mockQueue.add).toHaveBeenCalledWith('log', {
      type: 'test',
      message: 'test message',
    });
  });
});
