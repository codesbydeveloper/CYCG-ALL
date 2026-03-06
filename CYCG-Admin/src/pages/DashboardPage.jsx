import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BlogPanel from '../components/dashboard/BlogPanel'
import CategoryPanel from '../components/dashboard/CategoryPanel'
import StatsGrid from '../components/dashboard/StatsGrid'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../layouts/DashboardLayout'
import { stripHtml } from '../utils/text'
import {
  createBlog,
  createCategory,
  deleteBlog,
  deleteCategory,
  fetchBlogs,
  fetchCategories,
  updateCategory,
  updateBlog,
  reorderCategories,
  fetchContacts,
} from '../services/contentService'
import { fetchUsers } from '../services/userService'

function DashboardPage() {
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [categories, setCategories] = useState([])
  const [blogs, setBlogs] = useState([])
  const [users, setUsers] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  // modal state for viewing full contact details
  const [viewingContact, setViewingContact] = useState(null)

  const [categoryName, setCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    categoryId: '',
    position: 1,
    image: null,
  })
  const [creatingBlog, setCreatingBlog] = useState(false)
  const [draggingCategoryId, setDraggingCategoryId] = useState(null)
  const [draggingBlogId, setDraggingBlogId] = useState(null)

  function sortByPosition(items) {
    return [...items].sort((a, b) => {
      const aPosition = Number(a?.position ?? Number.MAX_SAFE_INTEGER)
      const bPosition = Number(b?.position ?? Number.MAX_SAFE_INTEGER)
      if (aPosition !== bPosition) return aPosition - bPosition

      return Number(a?.id ?? 0) - Number(b?.id ?? 0)
    })
  }

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [categoriesData, blogsData] = await Promise.all([
        fetchCategories(),
        fetchBlogs(),
      ])
      setCategories(sortByPosition(categoriesData))
      setBlogs(sortByPosition(blogsData))
    } catch (loadError) {
      setError(loadError.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const data = await fetchUsers()
      setUsers(data)
    } catch (err) {
      console.error('could not load users', err)
    }
  }

  async function loadContacts() {
    try {
      const data = await fetchContacts()
      setContacts(data)
    } catch (err) {
      console.error('could not load contacts', err)
    }
  }

  useEffect(() => {
    loadData()
    loadUsers()
    loadContacts()
  }, [])

  function openContact(contact) {
    setViewingContact(contact)
  }

  function closeContact() {
    setViewingContact(null)
  }

  async function handleCreateCategory(event) {
    event.preventDefault()
    if (!categoryName.trim()) return

    setCreatingCategory(true)
    setError('')
    setSuccess('')
    try {
      await createCategory(categoryName.trim())
      setCategoryName('')
      setSuccess('Category created successfully.')
      await loadData()
    } catch (createError) {
      setError(createError.message || 'Failed to create category.')
    } finally {
      setCreatingCategory(false)
    }
  }

  async function handleDeleteCategory(id) {
    setError('')
    setSuccess('')
    try {
      await deleteCategory(id)
      setSuccess('Category deleted successfully.')
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete category.')
    }
  }

  function handleBlogInputChange(event) {
    const { name, value, files } = event.target
    if (name === 'image') {
      setBlogForm((prev) => ({ ...prev, image: files?.[0] ?? null }))
      return
    }
    setBlogForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateBlog(event) {
    event.preventDefault()
    const contentText = stripHtml(blogForm.content)
    if (!blogForm.title || !contentText || !blogForm.categoryId) {
      setError('Title, content and category are required.')
      return
    }

    setCreatingBlog(true)
    setError('')
    setSuccess('')
    try {
      await createBlog(blogForm)
      setBlogForm({
        title: '',
        content: '',
        categoryId: '',
        position: 1,
        image: null,
      })
      setSuccess('Blog created successfully.')
      await loadData()
    } catch (createError) {
      setError(createError.message || 'Failed to create blog.')
    } finally {
      setCreatingBlog(false)
    }
  }

  async function handleDeleteBlog(id) {
    setError('')
    setSuccess('')
    try {
      await deleteBlog(id)
      setSuccess('Blog deleted successfully.')
      await loadData()
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete blog.')
    }
  }

  function reorderItemsById(items, draggedId, targetId) {
    const sourceIndex = items.findIndex((item) => String(item.id) === String(draggedId))
    const targetIndex = items.findIndex((item) => String(item.id) === String(targetId))

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return items
    }

    const next = [...items]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)
    return next
  }


  async function persistCategoryOrder(reorderedCategories) {
    const payload = reorderedCategories.map((category, index) => ({
      id: category.id,
      position: index + 1,
    }))

    console.log("REORDER PAYLOAD:", payload)

    const res = await reorderCategories(payload)

    console.log("REORDER RESPONSE:", res)
  }

  async function persistBlogOrder(reorderedBlogs) {
    for (const [index, blog] of reorderedBlogs.entries()) {
      await updateBlog(blog.id, {
        title: blog.title || '',
        content: blog.content || '',
        categoryId: blog.categoryId || blog.category?.id || '',
        position: index + 1,
      })
    }
  }


  async function handleCategoryDrop(targetCategoryId) {
    if (!draggingCategoryId || draggingCategoryId === targetCategoryId) return

    const reordered = reorderItemsById(
      categories,
      draggingCategoryId,
      targetCategoryId
    )

    setCategories(reordered)
    setError('')
    setSuccess('')

    try {
      await persistCategoryOrder(reordered)
      setSuccess('Category positions updated.')

    } catch (error) {
      setError(error.message || 'Failed to reorder categories.')

    } finally {
      setDraggingCategoryId(null)
    }
  }
  async function handleBlogDrop(targetBlogId) {
    if (!draggingBlogId) return
    const reordered = reorderItemsById(blogs, draggingBlogId, targetBlogId)
    if (reordered === blogs) return

    setBlogs(reordered)
    setError('')
    setSuccess('')
    try {
      await persistBlogOrder(reordered)
      setSuccess('Blog positions updated.')
      await loadData()
    } catch (reorderError) {
      setError(reorderError.message || 'Failed to reorder blogs.')
      await loadData()
    } finally {
      setDraggingBlogId(null)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: 'Categories', badge: categories.length },
    { id: 'blogs', label: 'Blogs', badge: blogs.length },
    { id: 'users', label: 'Users', badge: users.length },
  ]

  return (
    <DashboardLayout
      onRefresh={loadData}
      onLogout={logout}
      user={user}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      users={users}
    >
      {success && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#2E2E2E] bg-[#111111] p-6 text-sm text-[#BDBDBD] shadow-sm">
          Loading dashboard data...
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StatsGrid
                categoriesCount={categories.length}
                blogsCount={blogs.length}
              />
              <div className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-white">
                    Recent Blogs
                  </h2>
                  <button
                    onClick={() => setActiveTab('blogs')}
                    className="text-sm font-medium text-indigo-300 hover:text-indigo-200"
                  >
                    Manage Blogs
                  </button>
                </div>
                {blogs.length === 0 ? (
                  <p className="text-sm text-[#9A9A9A]">No blogs available yet.</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {blogs.slice(0, 6).map((blog) => (
                      <Link
                        key={blog.id}
                        to={`/blogs/${blog.id}`}
                        className="rounded-xl border border-[#2E2E2E] bg-[#1A1A1A] p-4 transition hover:border-indigo-400"
                      >
                        <p className="line-clamp-2 text-sm font-semibold text-white">
                          {blog.title}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs text-[#BDBDBD]">
                          {stripHtml(blog.content)}

                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <CategoryPanel
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                onSubmit={handleCreateCategory}
                categories={categories}
                creating={creatingCategory}
                onDeleteCategory={handleDeleteCategory}
              />

              <section className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-white">
                  Drag to reorder
                </h2>
                <p className="mt-1 text-sm text-[#9A9A9A]">
                  Drag items to update positions for categories and blogs.
                </p>

                <div className="mt-4 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#D7D7D7]">
                      Categories Order
                    </h3>
                    <div className="space-y-2">
                      {categories.map((category, index) => (
                        <div
                          key={category.id}
                          draggable
                          onDragStart={() => setDraggingCategoryId(category.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleCategoryDrop(category.id)}
                          className="flex cursor-move items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-2 transition hover:border-indigo-400"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-base text-[#9A9A9A]">::</span>
                            <span className="truncate text-sm font-medium text-[#E8E8E8]">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-xs text-[#AFAFAF]">#{index + 1}</span>
                        </div>
                      ))}
                      {categories.length === 0 && (
                        <p className="rounded-lg border border-dashed border-[#333333] px-3 py-4 text-sm text-[#9A9A9A]">
                          No categories available.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[#D7D7D7]">
                      Blogs Order
                    </h3>
                    <div className="space-y-2">
                      {blogs.map((blog, index) => (
                        <div
                          key={blog.id}
                          draggable
                          onDragStart={() => setDraggingBlogId(blog.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => handleBlogDrop(blog.id)}
                          className="flex cursor-move items-center justify-between rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] px-3 py-2 transition hover:border-indigo-400"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-base text-[#9A9A9A]">::</span>
                            <span className="truncate text-sm font-medium text-[#E8E8E8]">
                              {blog.title}
                            </span>
                          </div>
                          <span className="text-xs text-[#AFAFAF]">#{index + 1}</span>
                        </div>
                      ))}
                      {blogs.length === 0 && (
                        <p className="rounded-lg border border-dashed border-[#333333] px-3 py-4 text-sm text-[#9A9A9A]">
                          No blogs available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'blogs' && (
            <BlogPanel
              categories={categories}
              formValues={blogForm}
              onInputChange={handleBlogInputChange}
              onSubmit={handleCreateBlog}
              creating={creatingBlog}
              blogs={blogs}
              onDeleteBlog={handleDeleteBlog}
            />
          )}

          {activeTab === 'users' && (
            <div className="rounded-2xl border border-[#2E2E2E] bg-[#111111]  p-5 shadow-sm space-y-3">
              <h2 className="font-display text-lg font-semibold text-white">
                USERS
              </h2>

              {contacts.length === 0 ? (
                <p className="text-sm text-[#9A9A9A]">No contacts available.</p>
              ) : (
           <div className="w-full overflow-x-auto max-h-[700px]">
  <table className="w-full min-w-[700px] table-fixed">
    <thead>
      <tr className="text-left text-[20px] rounded-2xl border-[#2E2E2E]">
        <th className="py-4 px-4 border border-[#2E2E2E] whitespace-nowrap">Name</th>
        <th className="py-4 px-4 border border-[#2E2E2E] whitespace-nowrap">Email</th>
        <th className="py-4 px-4 border border-[#2E2E2E] whitespace-nowrap">Subject</th>
        <th className="py-4 px-4 border border-[#2E2E2E] whitespace-nowrap">Message</th>
        <th className="py-4 px-4 border border-[#2E2E2E] whitespace-nowrap">Actions</th>
      </tr>
    </thead>
    <tbody>
      {contacts.map((c) => (
        <tr
          key={c.id}
          className="border-[#2E2E2E] text-[#beb8b8]"
        >
          <td className="py-4 px-4 truncate border border-[#2E2E2E] max-w-[160px]">
            {c.name}
          </td>
          <td className="py-4 px-4 truncate border border-[#2E2E2E] max-w-[200px]">
            {c.email}
          </td>
          <td className="py-4 px-4 truncate border border-[#2E2E2E] max-w-[180px]">
            {c.subject}
          </td>
          <td className="py-4 px-4 truncate border border-[#2E2E2E] max-w-[300px]">
            {c.message}
          </td>
          <td className="py-4 px-4 border border-[#2E2E2E] w-[92px]">
            <button
              className="px-3 py-1 text-sm rounded bg-[#2E2E2E] hover:bg-[#333] text-white whitespace-nowrap"
              onClick={() => setViewingContact(c)}
            >
              View
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
              )}
          
        {viewingContact && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onClick={() => setViewingContact(null)}
  >
    <div
      className="bg-[#0f0f0f] rounded-xl p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-[#222]"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-2xl font-semibold text-white mb-6">
        Contact details
      </h3>

      <div className="grid grid-cols-1 gap-7 text-[#EBEBEB]">
        <div>
          <div className="text-lg font-semibold text-[#AFAFAF] uppercase tracking-wide">
            Name
          </div>
          <div className="text-lg text-white break-words">
            {viewingContact.name}
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-[#AFAFAF] uppercase tracking-wide">
            Email
          </div>
          <div className="text-lg text-white break-words">
            {viewingContact.email}
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-[#AFAFAF] uppercase tracking-wide">
            Subject
          </div>
          <div className="text-lg text-white break-words">
            {viewingContact.subject}
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold text-[#AFAFAF] uppercase tracking-wide">
            Message
          </div>
          <div className="text-base text-white leading-relaxed whitespace-pre-wrap break-words">
            {viewingContact.message}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setViewingContact(null)}
          className="px-4 py-2 bg-[#2E2E2E] rounded-md text-white hover:bg-[#333]"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}

export default DashboardPage
