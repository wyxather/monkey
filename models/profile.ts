import {
  FlattenMaps,
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from 'mongoose'

interface Profile {
  user: Types.ObjectId
  name: string
  description: string
  balance: number
}

interface ProfileQuery {}

interface ProfileMethod {}

interface ProfileModel extends Model<Profile, ProfileQuery, ProfileMethod> {}

const ProfileSchema = new Schema<
  Profile,
  ProfileModel,
  ProfileMethod,
  ProfileQuery
>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: true },
    balance: { type: Schema.Types.Number, required: true },
  },
  { collection: 'profiles' }
)

export type ProfileObject = FlattenMaps<Profile> & {
  _id?: Types.ObjectId
}

export type ProfileDocument = HydratedDocument<
  Profile,
  ProfileMethod,
  ProfileQuery
>

export default (models.Profile as ProfileModel) ||
  model<Profile, ProfileModel>('Profile', ProfileSchema)
