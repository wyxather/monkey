"use server";

import { LoginResult } from "@/actions/auth/login/result";
import User from "@/models/user";
import { createSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { z } from "zod";

const Schema = z.object({
  username: z
    .string()
    .min(1, { message: "Username must be at least 1 character long." })
    .max(64, { message: "Username must not exceed 64 characters long." }),
  password: z
    .string()
    .min(1, { message: "Password must be at least 1 character long." })
    .max(64, { message: "Password must not exceed 64 characters long." }),
});

export async function login(
  state: { result: LoginResult; message: string },
  data: FormData,
) {
  if (state.result !== LoginResult.Undefined) {
    return {
      result: LoginResult.Error,
      message: "Invalid login state.",
    };
  }

  const input = {
    username: data.get("username"),
    password: data.get("password"),
  };

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return {
      result: LoginResult.Error,
      message: schema.error.issues[0].message,
    };
  }

  try {
    await Mongoose.connect();
    const user = await User.login(schema.data.username, schema.data.password);
    if (!user) {
      return {
        result: LoginResult.Error,
        message: "Invalid username or password",
      };
    }
    createSession(user);
  } catch (error: any) {
    return {
      result: LoginResult.Error,
      message: error.message,
    };
  }

  return {
    result: LoginResult.Ok,
    message: "",
  };
}
