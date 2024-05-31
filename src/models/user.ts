import bcrypt from "bcrypt";
import {
  FlattenMaps,
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

interface User {
  username: string;
  password: string;
}

export type UserObject = FlattenMaps<User> & {
  _id?: Types.ObjectId;
};

interface UserQuery {}

interface UserMethod {}

export type UserDocument = HydratedDocument<User, UserMethod, UserQuery>;

interface UserModel extends Model<User, UserQuery, UserMethod> {
  login(username: string, password: string): Promise<UserObject | null>;
  register(username: string, password: string): Promise<void>;
}

const UserSchema = new Schema<User, UserModel, UserMethod, UserQuery>(
  {
    username: { type: Schema.Types.String, required: true },
    password: { type: Schema.Types.String, required: true },
  },
  { collection: "users" },
);

UserSchema.statics.login = async function (username: string, password: string) {
  const user = await this.findOne({ username }).lean();
  return user && bcrypt.compareSync(password, user.password) ? user : null;
};

UserSchema.statics.register = async function (
  username: string,
  password: string,
) {
  if (await this.findOne({ username }).lean()) {
    throw Error("Username already exist.");
  }
  await this.create({
    username,
    password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
  });
};

export default (models.User as UserModel) ||
  model<User, UserModel>("User", UserSchema);
