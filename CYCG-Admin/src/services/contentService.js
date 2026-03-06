import { request } from './httpClient'

function extractArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  return []
}

function extractItem(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return data.data
    }
    return data
  }
  return null
}

export async function fetchCategories() {
  const response = await request('categories')
  return extractArray(response)
}

export function createCategory(name) {
  return request('categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
}

export function updateCategory(id, values) {
  return request(`categories/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: values.name,
      position: values.position,
    }),
  })
}

export function reorderCategories(items) {
  return request('categories/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),  
  })
}

export function deleteCategory(id) {
  return request(`categories/${id}`, { method: 'DELETE' })
}

export async function fetchBlogs() {
  const response = await request('blogs')
  return extractArray(response)
}

export async function fetchBlogById(id) {
  const response = await request(`blogs/${id}`)
  return extractItem(response)
}

export function updateBlog(id, values) {
  const formData = new FormData()
  formData.append('title', values.title)
  formData.append('content', values.content)
  formData.append('categoryId', String(values.categoryId))
  formData.append('position', String(values.position || 1))

  if (values.image) {
    formData.append('image', values.image)
  }

  return request(`blogs/${id}`, {
    method: 'POST',
    body: formData,
  })
}

export function createBlog(values) {
  const formData = new FormData()
  formData.append('title', values.title)
  formData.append('content', values.content)
  formData.append('categoryId', String(values.categoryId))
  formData.append('position', String(values.position || 1))

  if (values.image) {
    formData.append('image', values.image)
  }

  return request('blogs', { method: 'POST', body: formData })
}

export function deleteBlog(id) {
  return request(`blogs/${id}`, { method: 'DELETE' })
}

// contacts
export async function fetchContacts() {
  const response = await request('contacts')
  return extractArray(response)
}
