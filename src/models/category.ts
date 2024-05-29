import {
  FlattenMaps,
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from 'mongoose'

interface Category {
  user: Types.ObjectId
  name: string
}

export type CategoryObject = FlattenMaps<Category> & {
  _id?: Types.ObjectId
}

interface CategoryQuery {}

interface CategoryMethod {}

export type CategoryDocument = HydratedDocument<
  Category,
  CategoryMethod,
  CategoryQuery
>

interface CategoryModel
  extends Model<Category, CategoryQuery, CategoryMethod> {}

const CategorySchema = new Schema<
  Category,
  CategoryModel,
  CategoryMethod,
  CategoryQuery
>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: Schema.Types.String, required: true },
  },
  { collection: 'categories' }
)

export default (models.Category as CategoryModel) ||
  model<Category, CategoryModel>('Category', CategorySchema)
