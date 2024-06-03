import "server-only";

import { getCategories } from "@/actions/categories/action";
import { getTransactions } from "@/actions/transactions/action";
import { CategoriesTable } from "@/components/client/categories_table";

export default async function CategoriesPage() {
  const [categories, transactions] = await Promise.all([
    getCategories(),
    getTransactions(),
  ]);
  return (
    <CategoriesTable categories={categories} transactions={transactions} />
  );
}
