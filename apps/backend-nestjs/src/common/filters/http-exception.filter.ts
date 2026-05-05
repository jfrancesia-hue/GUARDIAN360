import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  correlationId?: string;
  timestamp: string;
}

interface ResponseLike {
  status(statusCode: number): {
    json(body: ErrorResponse): void;
  };
}

interface RequestLike {
  id?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<ResponseLike>();
    const request = context.getRequest<RequestLike>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const body =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? (exceptionResponse as Partial<ErrorResponse>)
        : { message: String(exceptionResponse) };

    const payload: ErrorResponse = {
      statusCode: status,
      message: body.message ?? exception.message,
      timestamp: new Date().toISOString()
    };

    if (body.error) {
      payload.error = body.error;
    }

    if (request.id) {
      payload.correlationId = request.id;
    }

    response.status(status).json(payload);
  }
}
