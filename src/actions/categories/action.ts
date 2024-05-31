"use server";

import { CategoryResult } from "@/actions/categories/result";
import Category, { CategoryObject } from "@/models/category";
import { getUserSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getCategories() {
  let categories: CategoryObject[] = [];
  try {
    await Mongoose.connect();
    const user = await getUserSession();
    categories = await Category.find({ user: user?._id }).lean();
    categories = JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error(error);
  }
  return categories;
}
export async function addCategory(
  state: {
    result: CategoryResult;
    message: string;
  },
  data: FormData,
) {
  if (state.result !== CategoryResult.Undefined) {
    return { result: CategoryResult.Error, message: "Invalid category state." };
  }

  const Schema = z.object({
    name: z
      .string()
      .min(1, { message: "Name must be at least 1 character long." })
      .max(64, { message: "Name must not exceed 64 characters long." }),
  });

  const input = {
    name: data.get("name"),
  };

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return {
      result: CategoryResult.Error,
      message: schema.error.issues[0].message,
    };
  }

  try {
    await Mongoose.connect();
    const user = await getUserSession();
    await Category.create({ ...schema.data, user: user?._id });
  } catch (error: any) {
    return { result: CategoryResult.Error, message: error.message };
  }

  revalidatePath("/categories");

  return { result: CategoryResult.Ok, message: "" };
}

export async function deleteCategory(
  state: {
    result: CategoryResult;
    message: string;
  },
  data: FormData,
) {
  if (state.result !== CategoryResult.Undefined) {
    return { result: CategoryResult.Error, message: "Invalid category state." };
  }

  const Schema = z.object({
    _id: z
      .string()
      .min(24, { message: "Id must be exactly 24 characters long." })
      .max(24, { message: "Id must be exactly 24 characters long." }),
  });

  const input = {
    _id: data.get("_id"),
  };

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return {
      result: CategoryResult.Error,
      message: schema.error.issues[0].message,
    };
  }

  try {
    await Mongoose.connect();
    const user = await getUserSession();
    await Category.deleteOne({ ...schema.data, user: user?._id });
  } catch (error: any) {
    return { result: CategoryResult.Error, message: error.message };
  }

  revalidatePath("/categories");

  return { result: CategoryResult.Ok, message: "" };
}

export async function editCategory(
  state: {
    result: CategoryResult;
    message: string;
  },
  data: FormData,
) {
  if (state.result !== CategoryResult.Undefined) {
    return { result: CategoryResult.Error, message: "Invalid category state." };
  }

  const Schema = z.object({
    _id: z
      .string()
      .min(24, { message: "Id must be exactly 24 characters long." })
      .max(24, { message: "Id must be exactly 24 characters long." }),
    name: z
      .string()
      .min(1, { message: "Name must be at least 1 character long." })
      .max(64, { message: "Name must not exceed 64 characters long." }),
  });

  const input = {
    _id: data.get("_id"),
    name: data.get("name"),
  };

  const schema = Schema.safeParse(input);
  if (!schema.success) {
    return {
      result: CategoryResult.Error,
      message: schema.error.issues[0].message,
    };
  }

  try {
    await Mongoose.connect();
    const user = await getUserSession();
    await Category.findOneAndUpdate(
      { _id: schema.data._id, user: user?._id },
      schema.data,
    );
  } catch (error: any) {
    return { result: CategoryResult.Error, message: error.message };
  }

  revalidatePath("/categories");

  return { result: CategoryResult.Ok, message: "" };
}
