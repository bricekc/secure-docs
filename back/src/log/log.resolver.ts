import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Log } from './log.model';
import { LogService } from './log.service';
import { GetLogsInput } from './dto/get-logs.input';

@Resolver(() => Log)
export class LogResolver {
  constructor(private readonly logService: LogService) {}

  @Mutation(() => [Log])
  async logs(@Args('input') input: GetLogsInput): Promise<Log[]> {
    return this.logService.getLogs(input.types);
  }
}
