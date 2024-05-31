"use server";

import { RegisterResult } from "@/actions/auth/register/result";
import User from "@/models/user";
import { Mongoose } from "@/utilities/server/mongoose";
import { z } from "zod";

const Schema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Username must be at least 1 character long." })
      .max(64, { message: "Username must not exceed 64 characters long." }),
    password1: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(64, { message: "Password must not exceed 64 characters long." }),
    password2: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .max(64, { message: "Password must not exceed 64 characters long." }),
  })
  .refine((schema) => schema.password1 === schema.password2, {
    message: "Passwords do not match.",
  });

export async function register(
  state: { result: RegisterResult; message: string },
  data: FormData,
) {
  if (state.result !== RegisterResult.Undefined) {
    return {
      result: RegisterResult.Error,
      message: "Invalid register state.",
    };
  }

  const input = {
    username: data.get("username"),
    password1: data.get("password1"),
    password2: data.get("password2"),
  };

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return {
      result: RegisterResult.Error,
      message: schema.error.issues[0].message,
    };
  }

  try {
    await Mongoose.connect();
    await User.register(schema.data.username, schema.data.password1);
  } catch (error: any) {
    return {
      result: RegisterResult.Error,
      message: error.message,
    };
  }

  return {
    result: RegisterResult.Ok,
    message: "",
  };
}
