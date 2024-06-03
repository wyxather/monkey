type ErrorType =
  | Error
  | EvalError
  | RangeError
  | ReferenceError
  | SyntaxError
  | TypeError
  | URIError;

export interface ActionError {
  name: string;
  message: string;
  cause?: unknown;
}

export interface ActionState {
  error?: ActionError | null;
}

export class ActionResult {
  static state(error?: ErrorType | null): ActionState {
    if (error) {
      return {
        error: {
          name: error.name,
          message: error.message,
          cause: error.cause,
        },
      };
    }
    return { error };
  }

  static ok(): ActionState {
    return this.state(null);
  }

  static error(error: ErrorType): ActionState {
    return this.state(error);
  }
}
