import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetLogsInput {
  @Field(() => [String], { nullable: true })
  types?: string[];
}
