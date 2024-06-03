"use server";

import { ActionResult, ActionState } from "@/actions/types";
import Profile from "@/models/profile";
import Transaction, { TransactionObject } from "@/models/transaction";
import { getUserSession } from "@/utilities/server/auth";
import { Mongoose } from "@/utilities/server/mongoose";
import { parseZonedDateTime } from "@internationalized/date";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function getTransactions(): Promise<TransactionObject[]> {
  let transactions: TransactionObject[] = [];

  const user = await getUserSession();
  if (!user) {
    return transactions;
  }

  try {
    await Mongoose.connect();
    transactions = await Transaction.find({ user: user?._id })
      .lean()
      .populate(["profile", "category"]);
    transactions = JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    console.error(error);
  }

  return transactions;
}

export async function addTransaction(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    profile: data.get("profile"),
    category: data.get("category"),
    description: data.get("description"),
    balance: data.get("balance"),
    date: data.get("date"),
  };

  const Schema = z.object({
    profile: z.custom<Types.ObjectId>((profile) =>
      Types.ObjectId.isValid(profile),
    ),
    category: z.custom<Types.ObjectId>((category) =>
      Types.ObjectId.isValid(category),
    ),
    description: z
      .string()
      .max(64, "Description must no exceed 64 characters long."),
    balance: z.coerce.number({ message: "Balance must be a number." }),
    date: z.string().refine((date) => {
      try {
        parseZonedDateTime(date);
        return true;
      } catch (error) {
        return false;
      }
    }, "Date must be a valid zoned date time format."),
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

    const profile = await Profile.findOne({
      _id: schema.data.profile,
      user: user._id,
    });
    if (!profile) {
      return ActionResult.error(Error("Profile doesn't exist."));
    }

    mongoose.connection.transaction(async () => {
      await Promise.all([
        Transaction.create({
          ...schema.data,
          user: user._id,
        }),
        profile.updateOne({ $inc: { balance: schema.data.balance } }),
      ]);
    });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/transactions");

  return ActionResult.ok();
}

export async function deleteTransaction(
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

    const transaction = await Transaction.findOne({
      ...schema.data,
      user: user._id,
    });
    if (!transaction) {
      return ActionResult.error(Error("Transaction doesn't exist."));
    }

    mongoose.connection.transaction(async () => {
      await Promise.all([
        Profile.updateOne(
          {
            _id: transaction.profile._id,
            user: user._id,
          },
          { $inc: { balance: -transaction.balance } },
        ),
        transaction.deleteOne(),
      ]);
    });
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/transactions");

  return ActionResult.ok();
}

export async function editTransaction(
  _state: ActionState,
  data: FormData,
): Promise<ActionState> {
  const input = {
    _id: data.get("_id"),
    profile: data.get("profile"),
    category: data.get("category"),
    description: data.get("description"),
    balance: data.get("balance"),
    date: data.get("date"),
  };

  const Schema = z.object({
    _id: z.custom<Types.ObjectId>((_id) => Types.ObjectId.isValid(_id)),
    profile: z.custom<Types.ObjectId>((profile) =>
      Types.ObjectId.isValid(profile),
    ),
    category: z.custom<Types.ObjectId>((category) =>
      Types.ObjectId.isValid(category),
    ),
    description: z
      .string()
      .max(64, "Description must no exceed 64 characters long."),
    balance: z.coerce.number({ message: "Balance must be a number." }),
    date: z.string().refine((date) => {
      try {
        parseZonedDateTime(date);
        return true;
      } catch (error) {
        return false;
      }
    }, "Date must be a valid zoned date time format."),
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

    const transaction = await Transaction.findOne({
      _id: schema.data._id,
      user: user._id,
    });
    if (!transaction) {
      return ActionResult.error(Error("Transaction doesn't exist."));
    }

    const profile = await Profile.findOne({
      _id: transaction.profile._id,
      user: user._id,
    });
    if (!profile) {
      return ActionResult.error(
        Error("Profile associate with current transaction doesn't exist."),
      );
    }

    if (transaction.profile._id === schema.data.profile) {
      await mongoose.connection.transaction(async () => {
        await Promise.all([
          profile.updateOne({
            $inc: { balance: schema.data.balance - transaction.balance },
          }),
          transaction.updateOne(schema.data),
        ]);
      });
    } else {
      const newProfile = await Profile.findOne({
        _id: schema.data.profile,
        user: user._id,
      });
      if (!newProfile) {
        return ActionResult.error(Error("Profile doesn't exist."));
      }

      await mongoose.connection.transaction(async () => {
        await Promise.all([
          profile.updateOne({ $inc: { balance: -transaction.balance } }),
          newProfile.updateOne({ $inc: { balance: schema.data.balance } }),
          transaction.updateOne(schema.data),
        ]);
      });
    }
  } catch (error: any) {
    return ActionResult.error(error);
  }

  revalidatePath("/transactions");

  return ActionResult.ok();
}
