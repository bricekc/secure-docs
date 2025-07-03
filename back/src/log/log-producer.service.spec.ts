import { Test, TestingModule } from '@nestjs/testing';
import { LogProducerService } from './log-producer.service';
import { getQueueToken } from '@nestjs/bullmq';
import { LogGateway } from './log.gateway';

describe('LogProducerService', () => {
  let service: LogProducerService;

  const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'test-id' }),
  };

  const mockLogGateway = {
    sendNewLog: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogProducerService,
        {
          provide: getQueueToken('log-queue'),
          useValue: mockQueue,
        },
        {
          provide: LogGateway,
          useValue: mockLogGateway,
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

    expect(mockLogGateway.sendNewLog).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'test-id',
        message: 'test message',
        type: 'test',
      }),
    );
  });
});