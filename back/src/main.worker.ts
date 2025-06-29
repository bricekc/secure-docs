import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const app = await NestFactory.create(WorkerModule);
  await app.listen(process.env.PORT ?? 30001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
