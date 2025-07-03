// src/gemini/dto/send-message.input.ts
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SendMessageInput {
  @Field()
  message: string;
}
