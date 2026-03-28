import type { CategoryItem, TransactionItem, TransactionType } from '../transactions/api'

export function pickFavoriteCategories(
  transactions: TransactionItem[],
  categories: CategoryItem[],
  type: TransactionType,
): CategoryItem[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const favoriteIds: string[] = []
  const seen = new Set<string>()

  for (const transaction of transactions) {
    if (favoriteIds.length >= 6) {
      break
    }

    if (!transaction.categoryId || seen.has(transaction.categoryId)) {
      continue
    }

    const category = categoriesById.get(transaction.categoryId)
    if (!category || category.type !== type) {
      continue
    }

    favoriteIds.push(transaction.categoryId)
    seen.add(transaction.categoryId)
  }

  return favoriteIds
    .map((id) => categoriesById.get(id))
    .filter((category): category is CategoryItem => Boolean(category))
}
