import type { CategoryItem } from '../api'

type CategoryPickerProps = {
  type: 'income' | 'expense'
  categories: CategoryItem[]
  favoriteCategories: CategoryItem[]
  selectedCategoryId: string
  onSelect: (categoryId: string) => void
  isLoading: boolean
}

function CategoryButton({
  category,
  isSelected,
  onSelect,
}: {
  category: CategoryItem
  isSelected: boolean
  onSelect: (categoryId: string) => void
}) {
  return (
    <button
      type="button"
      className={isSelected ? 'category-picker__item category-picker__item--active' : 'category-picker__item'}
      onClick={() => onSelect(category.id)}
    >
      {category.name}
    </button>
  )
}

export function CategoryPicker({
  type,
  categories,
  favoriteCategories,
  selectedCategoryId,
  onSelect,
  isLoading,
}: CategoryPickerProps) {
  const typeCategories = categories.filter((category) => category.type === type)
  const favoriteIds = new Set(favoriteCategories.map((category) => category.id))
  const remainingCategories = typeCategories.filter((category) => !favoriteIds.has(category.id))

  return (
    <section className="transaction-form__field" aria-labelledby="category-picker-title">
      <div className="transaction-form__field-header">
        <span id="category-picker-title">Category</span>
      </div>

      {isLoading ? <p className="transaction-form__hint">Loading categories...</p> : null}

      {!isLoading && favoriteCategories.length > 0 ? (
        <div className="category-picker__group">
          <p className="category-picker__label">Favorites</p>
          <div className="category-picker__list">
            {favoriteCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading ? (
        <div className="category-picker__group">
          <p className="category-picker__label">All {type} categories</p>
          <div className="category-picker__list">
            {remainingCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategoryId === category.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && typeCategories.length === 0 ? (
        <p className="transaction-form__hint">No {type} categories yet. Add categories from the backend.</p>
      ) : null}
    </section>
  )
}
