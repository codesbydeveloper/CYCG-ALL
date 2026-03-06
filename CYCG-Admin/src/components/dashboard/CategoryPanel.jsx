import PrimaryButton from '../common/PrimaryButton'

function CategoryPanel({
  value,
  onChange,
  onSubmit,
  categories,
  creating,
  onDeleteCategory,
}) {
  return (
    <section className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-white">Categories</h2>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={value}
          onChange={onChange}
          placeholder="New category name"
          className="w-full rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none ring-[#5A5A5A] focus:ring"
        />
        <PrimaryButton type="submit" disabled={creating}>
          {creating ? 'Adding...' : 'Add'}
        </PrimaryButton>
      </form>

      <ul className="mt-4 space-y-2">
        {categories.map((category) => (
          <li
            key={category.id}
            className="flex items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-2"
          >
            <span className="text-sm text-[#E3E3E3]">{category.name}</span>
            <button
              onClick={() => onDeleteCategory(category.id)}
              className="text-sm font-medium text-rose-400 hover:text-rose-300"
            >
              Delete
            </button>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="rounded-lg border border-dashed border-[#333333] px-3 py-4 text-sm text-[#9A9A9A]">
            No categories found
          </li>
        )}
      </ul>
    </section>
  )
}

export default CategoryPanel
