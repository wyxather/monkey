import 'server-only'

import { getCategories } from '@/actions/categories/action'
import { CategoriesTable } from '@/components/client/categories_table'

export default async function CategoriesPage() {
  const categories = await getCategories()
  return <CategoriesTable categories={categories} />
}
