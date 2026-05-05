import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Prisma } from "@prisma/client";

interface ResponseLike {
  status(statusCode: number): {
    json(body: {
      statusCode: number;
      message: string;
      code: string;
      timestamp: string;
    }): void;
  };
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<ResponseLike>();
    const status = exception.code === "P2002" ? HttpStatus.CONFLICT : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: "No pudimos completar la operacion solicitada.",
      code: exception.code,
      timestamp: new Date().toISOString()
    });
  }
}
