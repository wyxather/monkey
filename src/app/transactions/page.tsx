import "server-only";

import { getCategories } from "@/actions/categories/action";
import { getProfiles } from "@/actions/profiles/action";
import { getTransactions } from "@/actions/transactions/action";
import { TransactionsTable } from "@/components/client/transactions_table";

export default async function TransactionsPage() {
  const [profiles, categories, transactions] = await Promise.all([
    getProfiles(),
    getCategories(),
    getTransactions(),
  ]);
  return (
    <TransactionsTable
      profiles={profiles}
      categories={categories}
      transactions={transactions}
    />
  );
}
