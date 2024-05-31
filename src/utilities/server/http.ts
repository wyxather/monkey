import "server-only";

import { NextRequest, NextResponse } from "next/server";

export type HttpError =
  | Error
  | EvalError
  | RangeError
  | ReferenceError
  | SyntaxError
  | TypeError
  | URIError;

export enum HttpStatus {
  Ok = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export class HttpRequest extends NextRequest {}

export class HttpResponse extends NextResponse {
  private static response(body: any, status: HttpStatus) {
    return NextResponse.json(body, { status });
  }

  private static responseError(error: HttpError, status: HttpStatus) {
    return NextResponse.json(
      {
        error: {
          name: error.name,
          message: error.message,
          cause: error.cause,
        },
      },
      { status },
    );
  }

  public static ok(body: any) {
    return this.response(body, HttpStatus.Ok);
  }

  public static badRequest(error: HttpError) {
    return this.responseError(error, HttpStatus.BadRequest);
  }

  public static unauthorized(error: HttpError) {
    return this.responseError(error, HttpStatus.Unauthorized);
  }

  public static forbidden(error: HttpError) {
    return this.responseError(error, HttpStatus.Forbidden);
  }

  public static notFound(error: HttpError) {
    return this.responseError(error, HttpStatus.NotFound);
  }

  public static internalServerError(error: HttpError) {
    return this.responseError(error, HttpStatus.InternalServerError);
  }
}
