function StatsGrid({ categoriesCount, blogsCount }) {
  const stats = [
    { label: 'Total Categories', value: categoriesCount },
    { label: 'Total Blogs', value: blogsCount },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm"
        >
          <p className="font-sans text-sm text-[#9A9A9A]">{stat.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">
            {stat.value}
          </p>
        </article>
      ))}
    </section>
  )
}

export default StatsGrid
