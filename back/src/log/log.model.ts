import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Log {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  message: string;

  @Field()
  timestamp: Date;
}
