import { CategoryObject } from "@/models/category";
import { ProfileObject } from "@/models/profile";
import { getLocalTimeZone, now } from "@internationalized/date";
import {
  FlattenMaps,
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

interface Transaction {
  user: Types.ObjectId;
  profile: ProfileObject | Types.ObjectId;
  category: CategoryObject | Types.ObjectId;
  description: string;
  balance: number;
  date: string;
}

export type TransactionObject = FlattenMaps<Transaction> & {
  _id: Types.ObjectId;
};

interface TransactionQuery {}

interface TransactionMethod {}

export type TransactionDocument = HydratedDocument<
  Transaction,
  TransactionMethod,
  TransactionQuery
>;

interface TransactionModel
  extends Model<Transaction, TransactionQuery, TransactionMethod> {}

const TransactionSchema = new Schema<
  Transaction,
  TransactionModel,
  TransactionMethod,
  TransactionQuery
>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: Schema.Types.String, default: "" },
    balance: { type: Schema.Types.Number, required: true },
    date: {
      type: Schema.Types.String,
      default: now(getLocalTimeZone()).toString(),
    },
  },
  { collection: "transactions" },
);

export default (models.Transaction as TransactionModel) ||
  model<Transaction, TransactionModel>("Transaction", TransactionSchema);
