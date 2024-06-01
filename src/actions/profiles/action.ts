"use server";

import { ActionResult, ActionState } from "@/actions/types";
import Profile, { ProfileObject } from "@/models/profile";
import Transaction from "@/models/transaction";
import { getUserSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getProfiles(): Promise<ProfileObject[]> {
  let profiles: ProfileObject[] = [];

  const user = await getUserSession();
  if (!user) {
    return profiles;
  }

  try {
    await Mongoose.connect();
    profiles = await Profile.find({ user: user._id }).lean();
    profiles = JSON.parse(JSON.stringify(profiles));
  } catch (error) {
    console.error(error);
  }

  return profiles;
}

export async function addProfile(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    name: data.get("name"),
    description: data.get("description"),
    balance: data.get("balance"),
  };

  const Schema = z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long.")
      .max(64, "Name must not exceed 64 characters long."),
    description: z
      .string()
      .max(64, "Description must not exceed 64 characters long."),
    balance: z.coerce.number({ message: "Balance must be a number." }),
  });

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return ActionResult.error(Error(schema.error.issues.at(0)?.message));
  }

  const user = await getUserSession();
  if (!user) {
    return ActionResult.error(Error("Invalid user session."));
  }

  try {
    await Mongoose.connect();
    await Profile.create({ ...schema.data, user: user._id });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/profiles");

  return ActionResult.ok();
}

export async function deleteProfile(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    _id: data.get("_id"),
  };

  const Schema = z.object({
    _id: z.custom<Types.ObjectId>((_id) => Types.ObjectId.isValid(_id)),
  });

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return ActionResult.error(Error(schema.error.issues.at(0)?.message));
  }

  const user = await getUserSession();
  if (!user) {
    return ActionResult.error(Error("Invalid user session."));
  }

  try {
    const mongoose = await Mongoose.connect();

    await mongoose.connection.transaction(async () => {
      await Promise.all([
        Transaction.deleteMany({
          profile: schema.data._id,
          user: user._id,
        }),
        Profile.deleteOne({ ...schema.data, user: user._id }),
      ]);
    });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/profiles");

  return ActionResult.ok();
}

export async function editProfile(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    _id: data.get("_id"),
    name: data.get("name"),
    description: data.get("description"),
    balance: data.get("balance"),
  };

  const Schema = z.object({
    _id: z.custom<Types.ObjectId>((_id) => Types.ObjectId.isValid(_id)),
    name: z
      .string()
      .min(1, "Name must be at least 1 character long.")
      .max(64, "Name must not exceed 64 characters long."),
    description: z
      .string()
      .max(64, "Description must not exceed 64 characters long."),
    balance: z.coerce.number({ message: "Balance must be a number." }),
  });

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return ActionResult.error(Error(schema.error.issues.at(0)?.message));
  }

  const user = await getUserSession();
  if (!user) {
    return ActionResult.error(Error("Invalid user session."));
  }

  try {
    await Mongoose.connect();
    await Profile.updateOne(
      { _id: schema.data._id, user: user._id },
      schema.data,
    );
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/profiles");

  return ActionResult.ok();
}
