import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PrimaryButton from '../common/PrimaryButton'
import RichTextEditor from '../common/RichTextEditor'
import { stripHtml } from '../../utils/text'

function BlogPanel({
  categories,
  formValues,
  onInputChange,
  onSubmit,
  creating,
  blogs,
  onDeleteBlog,
}) {
  const BLOGS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(blogs.length / BLOGS_PER_PAGE))

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * BLOGS_PER_PAGE
    return blogs.slice(start, start + BLOGS_PER_PAGE)
  }, [blogs, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function handlePreviousPage() {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  function handleNextPage() {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  return (
    <section className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-white">Blogs</h2>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          name="title"
          value={formValues.title}
          onChange={onInputChange}
          placeholder="Blog title"
          className="w-full rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none ring-[#5A5A5A] focus:ring"
        />
        <div>
          <p className="mb-2 text-sm font-medium text-[#CFCFCF]">Blog Content</p>
          <RichTextEditor
            value={formValues.content}
            onChange={(html) =>
              onInputChange({ target: { name: 'content', value: html } })
            }
            placeholder="Write rich blog content here..."
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-1">
          <select
            name="categoryId"
            value={formValues.categoryId}
            onChange={onInputChange}
            className="w-full rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-sm text-white outline-none ring-[#5A5A5A] focus:ring"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <input
          type="file"
          name="image"
          onChange={onInputChange}
          className="w-full rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-sm text-[#D9D9D9] file:mr-3 file:rounded-md file:border-0 file:bg-[#2A2A2A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        <PrimaryButton type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create Blog'}
        </PrimaryButton>
      </form>

      <div className="mt-5">
        {blogs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#333333] px-3 py-4 text-sm text-[#9A9A9A]">
            No blogs found
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {paginatedBlogs.map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-white">
                      {blog.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        to={`/blogs/${blog.id}`}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => onDeleteBlog(blog.id)}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs text-[#BDBDBD]">
                    {stripHtml(blog.content)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#A0A0A0]">
                    {blog.category?.name ? (
                      <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-indigo-200">
                        {blog.category.name}
                      </span>
                    ) : null}
                    {blog.position ? (
                      <span className="rounded-full bg-[#2A2A2A] px-2 py-1 text-[#CFCFCF]">
                        Position {blog.position}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-2">
              <p className="text-xs text-[#A0A0A0]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="rounded-md border border-[#333333] px-3 py-1.5 text-xs font-medium text-[#E0E0E0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-[#333333] px-3 py-1.5 text-xs font-medium text-[#E0E0E0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default BlogPanel
