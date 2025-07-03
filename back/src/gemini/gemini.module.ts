import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiResolver } from './gemini.resolver';

@Module({
  providers: [GeminiService, GeminiResolver],
})
export class GeminiModule {}
