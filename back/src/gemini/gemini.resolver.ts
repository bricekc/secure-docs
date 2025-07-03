// src/gemini/gemini.resolver.ts
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GeminiService } from './gemini.service';
import { SendMessageInput } from './dto/SendMessageInput';

@Resolver()
export class GeminiResolver {
  constructor(private readonly geminiService: GeminiService) {}

  @Mutation(() => String)
  async sendMessage(@Args('input') input: SendMessageInput): Promise<string> {
    return this.geminiService.envoyerMessage(input.message);
  }
}
