"use server";

import { ActionResult, ActionState } from "@/actions/types";
import User from "@/models/user";
import { Mongoose } from "@/utilities/server/mongoose";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function register(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    username: data.get("username"),
    password: data.get("password"),
    confirmPassword: data.get("confirmPassword"),
  };

  const Schema = z
    .object({
      username: z
        .string()
        .min(1, "Username must be at least 1 character long.")
        .max(64, "Username must not exceed 64 characters long."),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password must not exceed 64 characters long."),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password must not exceed 64 characters long."),
    })
    .refine(
      (schema) => schema.password === schema.confirmPassword,
      "Passwords do not match.",
    );

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return ActionResult.error(Error(schema.error.issues.at(0)?.message));
  }

  try {
    await Mongoose.connect();

    const result = await User.register(
      schema.data.username,
      schema.data.password,
    );
    if (!result) {
      return ActionResult.error(Error("Username already exist."));
    }
  } catch (error: any) {
    return ActionResult.error(error);
  }

  return redirect("/auth/login");
}
