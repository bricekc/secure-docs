import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker/worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  await app.listen(process.env.PORT ?? 30001);
}

bootstrap().catch((err) => {
  console.error('Failed to start worker application:', err);
  process.exit(1);
});
