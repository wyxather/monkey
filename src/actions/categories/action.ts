"use server";

import { ActionResult, ActionState } from "@/actions/types";
import Category, { CategoryObject } from "@/models/category";
import Profile from "@/models/profile";
import Transaction from "@/models/transaction";
import { getUserSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getCategories(): Promise<CategoryObject[]> {
  let categories: CategoryObject[] = [];

  const user = await getUserSession();
  if (!user) {
    return categories;
  }

  try {
    await Mongoose.connect();
    categories = await Category.find({ user: user._id }).lean();
    categories = JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error(error);
  }

  return categories;
}

export async function addCategory(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    name: data.get("name"),
  };

  const Schema = z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long.")
      .max(64, "Name must not exceed 64 characters long."),
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
    await Category.create({ ...schema.data, user: user._id });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/categories");

  return ActionResult.ok();
}

export async function deleteCategory(
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

    const transactions = await Transaction.find({
      category: schema.data._id,
      user: user._id,
    });

    await mongoose.connection.transaction(async () => {
      const promises = transactions.map(async (transaction) => {
        await Promise.all([
          Profile.updateOne(
            {
              _id: transaction.profile,
              user: user._id,
            },
            { $inc: { balance: -transaction.balance } },
          ),
          transaction.deleteOne(),
        ]);
      });

      await Promise.all([
        ...promises,
        Category.deleteOne({ ...schema.data, user: user._id }),
      ]);
    });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/categories");

  return ActionResult.ok();
}

export async function editCategory(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    _id: data.get("_id"),
    name: data.get("name"),
  };

  const Schema = z.object({
    _id: z.custom<Types.ObjectId>((_id) => Types.ObjectId.isValid(_id)),
    name: z
      .string()
      .min(1, "Name must be at least 1 character long.")
      .max(64, "Name must not exceed 64 characters long."),
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
    await Category.updateOne(
      { _id: schema.data._id, user: user._id },
      schema.data,
    );
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/categories");

  return ActionResult.ok();
}
