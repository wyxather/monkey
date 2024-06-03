"use server";

import { ActionResult, ActionState } from "@/actions/types";
import User from "@/models/user";
import { createSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function login(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    username: data.get("username"),
    password: data.get("password"),
  };

  const Schema = z.object({
    username: z
      .string()
      .min(1, "Username must be at least 1 character long.")
      .max(64, "Username must not exceed 64 characters long."),
    password: z
      .string()
      .min(1, "Password must be at least 1 character long.")
      .max(64, "Password must not exceed 64 characters long."),
  });

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return ActionResult.error(Error(schema.error.issues.at(0)?.message));
  }

  try {
    await Mongoose.connect();
  } catch (error: any) {
    return ActionResult.error(error);
  }

  const user = await User.login(schema.data.username, schema.data.password);
  if (!user) {
    return ActionResult.error(Error("Wrong username or password."));
  }

  try {
    await createSession(user);
  } catch (error: any) {
    return ActionResult.error(error);
  }

  return redirect("/profiles");
}
