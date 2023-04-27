import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';

@Catch()
export class AllWsExceptionsFilter extends BaseWsExceptionFilter {
  logg = new Logger(AllWsExceptionsFilter.name)
  catch(exception: any, host: ArgumentsHost) {
    // AllWsExceptionsFilter.logger.debug(AllWsExceptionsFilter)
    this.logg.debug(exception)
    super.catch(exception, host);
  }
}