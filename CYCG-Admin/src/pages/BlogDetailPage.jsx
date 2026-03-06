import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PrimaryButton from '../components/common/PrimaryButton'
import RichTextEditor from '../components/common/RichTextEditor'
import {
  fetchBlogById,
  fetchBlogs,
  fetchCategories,
  updateBlog,
} from '../services/contentService'
import { stripHtml } from '../utils/text'

function getOrdinalDay(day) {
  if (day > 3 && day < 21) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

function formatDisplayDate(value) {
  const date = value ? new Date(value) : new Date()
  if (Number.isNaN(date.getTime())) return 'N/A'

  const day = getOrdinalDay(date.getDate())
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

function BlogDetailPage() {
  const { blogId } = useParams()
  const [blog, setBlog] = useState(null)
  const [recentBlogs, setRecentBlogs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    image: null,
  })

  useEffect(() => {
    async function loadBlogData() {
      setLoading(true)
      setError('')
      try {
        const [data, blogsData, categoriesData] = await Promise.all([
          fetchBlogById(blogId),
          fetchBlogs(),
          fetchCategories(),
        ])

        setBlog(data)
        setRecentBlogs(blogsData.filter((item) => String(item.id) !== String(blogId)))
        setCategories(categoriesData)
        setEditForm({
          title: data?.title || '',
          content: data?.content || '',
          categoryId: data?.categoryId || data?.category?.id || '',
          image: null,
        })
      } catch (loadError) {
        setError(loadError.message || 'Failed to load blog details.')
      } finally {
        setLoading(false)
      }
    }

    loadBlogData()
  }, [blogId])

  const imageUrl =
    blog?.imageUrl || blog?.image || blog?.thumbnail || blog?.coverImage || ''
  const heroImage =
    imageUrl ||
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1920&auto=format&fit=crop'
  const plainSummary = useMemo(() => stripHtml(blog?.content || ''), [blog?.content])
  const displayDate = useMemo(
    () => formatDisplayDate(blog?.createdAt || blog?.updatedAt),
    [blog?.createdAt, blog?.updatedAt],
  )

  function handleEditInputChange(event) {
    const { name, value, files } = event.target
    if (name === 'image') {
      setEditForm((prev) => ({ ...prev, image: files?.[0] || null }))
      return
    }
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSaveEdits() {
    const contentText = stripHtml(editForm.content)
    if (!editForm.title.trim() || !contentText) {
      setStatusMessage('Title and content are required.')
      return
    }

    setSaving(true)
    setStatusMessage('')
    try {
      await updateBlog(blogId, {
        ...editForm,
        position: blog?.position || 1,
      })
        window.location.reload()
      const refreshed = await fetchBlogById(blogId)
      setBlog(refreshed)
      setIsEditing(false)
      setStatusMessage('Blog updated successfully.')
    } catch (saveError) {
      setStatusMessage(saveError.message || 'Failed to update blog.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-[#EBEBEB]">
      <section className="relative h-[560px] overflow-hidden md:h-[100vh]">
        <img
          src={heroImage}
          alt="Blog cover"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,#000000_100%)]" />
      </section>

      <section className="relative z-10 mx-auto -mt-40 w-full max-w-[1320px] px-4 pb-16 md:-mt-[340px] md:px-8">
        {loading ? (
          <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414]/95 p-6 text-sm text-[#C7C7C7]">
            Loading blog details...
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        ) : !blog ? (
          <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414]/95 p-6 text-sm text-[#C7C7C7]">
            Blog not found.
          </div>
        ) : (
          <>
            <div className="rounded-[24px] border border-[#1F1F1F] bg-[#141414]/95 shadow-[0_40px_56px_0_#00000052]">
              <div className="flex flex-col gap-8 px-4 py-6 md:gap-10 md:px-8 md:py-10 xl:flex-row">
                <article className="w-full xl:max-w-[820px]">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-[16px] tracking-wide text-[#EBEBEB] hover:underline"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 12H5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 19L5 12L12 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Return to All Views
                  </Link>
                    <button
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#EBEBEB] hover:bg-[#242424]"
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </button>
                </div>

                  <p className="mb-2 text-xs text-[#EBEBEB]/60 md:text-sm">{displayDate}</p>

                {statusMessage && (
                  <p className="mb-4 rounded-lg border border-[#2B2B2B] bg-[#1A1A1A] px-3 py-2 text-sm text-[#D8D8D8]">
                    {statusMessage}
                  </p>
                )}

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditInputChange}
                        placeholder="Blog title"
                        className="rounded-lg border border-[#2E2E2E] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none ring-[#4B5563] focus:ring"
                      />
                      <select
                        name="categoryId"
                        value={editForm.categoryId}
                        onChange={handleEditInputChange}
                        className="rounded-lg border border-[#2E2E2E] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none ring-[#4B5563] focus:ring"
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
                      name="image"
                      type="file"
                      onChange={handleEditInputChange}
                      className="rounded-lg border border-[#2E2E2E] bg-[#121212] px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-[#2A2A2A] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                    />

                    <RichTextEditor
                      value={editForm.content}
                      onChange={(html) =>
                        setEditForm((prev) => ({ ...prev, content: html }))
                      }
                      placeholder="Write your blog content..."
                    />

                    <div className="flex flex-wrap gap-2">
                      <PrimaryButton onClick={handleSaveEdits} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </PrimaryButton>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-[#2E2E2E] bg-[#1B1B1B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#242424]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="font-kiona mb-10 text-[24px] font-normal uppercase leading-[90%] text-white md:text-[40px]">
                      {blog?.title || 'Untitled blog'}
                    </h1>
                    
                    <div className="ql-content-render ql-content-render-dark max-w-[760px] text-[15px] leading-[1.5] md:text-[18px]">
                      {blog?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                      ) : (
                        <p>No content.</p>
                      )}
                    </div>
                  </div>
                )}
                </article>

                <aside className="w-full xl:max-w-[488px] xl:px-2 xl:pt-24">
                  <h2 className="font-kiona mb-12 text-[32px] font-normal uppercase leading-[90%] text-white md:text-[40px]">
                    Recent Views
                  </h2>
                  <div className="flex flex-col gap-5">
                    {recentBlogs.slice(0, 6).map((item) => {
                      const thumb =
                        item?.imageUrl ||
                        item?.image ||
                        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop'
                      return (
                        <Link
                          key={item.id}
                          to={`/blogs/${item.id}`}
                          className="flex gap-3 rounded-[16px] bg-[#242424] p-3 transition-colors hover:bg-[#2E2E2E]"
                        >
                          <div className="h-[72px] w-[96px] flex-shrink-0 overflow-hidden rounded-[12px]">
                            <img
                              src={thumb}
                              alt={item?.title || 'Blog'}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-[14px] leading-snug text-white">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[12px] text-[#EBEBEB]/70">
                              {formatDisplayDate(item?.createdAt || item?.updatedAt)}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                    {recentBlogs.length === 0 && (
                      <p className="rounded-[16px] bg-[#242424] px-3 py-3 text-sm text-[#BDBDBD]">
                        No recent blogs.
                      </p>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default BlogDetailPage
