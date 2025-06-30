import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';
import { LogProducerService } from './log-producer.service';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  constructor(private readonly logProducerService: LogProducerService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    GqlArgumentsHost.create(host);

    const isHttpException = exception instanceof HttpException;
    const message = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    await this.logProducerService.addLog('error', JSON.stringify(message));

    return exception;
  }
}
