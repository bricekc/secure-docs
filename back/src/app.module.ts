import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DocumentModule } from './document/document.module';
import { BullModule } from '@nestjs/bullmq';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './log/log.filter';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Enable gaphql Apollo playground on /graphql
      graphiql: true,
      // Generate the schema file automatically
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      buildSchemaOptions: { dateScalarMode: 'timestamp' },
      csrfPrevention: false,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    DocumentModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
      },
    }),
    LogModule,
  ],
  providers: [
    PrismaService,
    // https://docs.nestjs.com/exception-filters#binding-filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
