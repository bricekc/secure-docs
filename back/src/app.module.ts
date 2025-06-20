import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { AppResolver } from './app.resolver';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

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
    }),
    PrismaModule,
    UserModule,
    AuthModule
  ],
  providers: [PrismaService, AppResolver],
})
export class AppModule {}
