import {
  ArgumentsHost,
  Catch,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../generated/prisma/client';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientInitializationError,
    host: ArgumentsHost,
  ) {
    const code =
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? exception.code
        : exception.errorCode;

    this.logger.error(`Database request failed: ${code ?? exception.name}`);

    const unavailableCodes = [
      'P1001',
      'P1002',
      'P1008',
      'P1017',
      'P2024',
      'P2037',
    ];
    const response = unavailableCodes.includes(code ?? '')
      ? new ServiceUnavailableException('Service temporarily unavailable')
      : new InternalServerErrorException('Internal server error');

    super.catch(response, host);
  }
}
