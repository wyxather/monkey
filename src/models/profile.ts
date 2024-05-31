import {
  FlattenMaps,
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from "mongoose";

interface Profile {
  user: Types.ObjectId;
  name: string;
  description: string;
  balance: number;
}

export type ProfileObject = FlattenMaps<Profile> & {
  _id?: Types.ObjectId;
};

interface ProfileQuery {}

interface ProfileMethod {}

export type ProfileDocument = HydratedDocument<
  Profile,
  ProfileMethod,
  ProfileQuery
>;

interface ProfileModel extends Model<Profile, ProfileQuery, ProfileMethod> {}

const ProfileSchema = new Schema<
  Profile,
  ProfileModel,
  ProfileMethod,
  ProfileQuery
>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, default: "" },
    balance: { type: Schema.Types.Number, required: true },
  },
  { collection: "profiles" },
);

export default (models.Profile as ProfileModel) ||
  model<Profile, ProfileModel>("Profile", ProfileSchema);
