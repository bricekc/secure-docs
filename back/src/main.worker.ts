import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const app = await NestFactory.createApplicationContext(WorkerModule);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
