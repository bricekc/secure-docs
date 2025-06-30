import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(
    graphqlUploadExpress({
      maxFileSize: 10_000_000,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Failed to start main application:', err);
  process.exit(1);
});
