import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { LogResolver } from './log.resolver';
import { LogProducerService } from './log-producer.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogGateway } from './log.gateway';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    BullModule.registerQueue({
      name: 'log-queue',
      defaultJobOptions: {
        removeOnComplete: {
          age: 60 * 60 * 24 * 7, // keep logs for 7 days
          count: 1000, // keep the last 1000 completed logs
        },
        removeOnFail: {
          age: 60 * 60 * 24 * 7, // keep failed logs for 7 days
          count: 1000, // keep the last 1000 failed logs
        },
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LogService, LogResolver, LogProducerService, LogGateway],
  exports: [LogService, LogProducerService],
})
export class LogModule {}
