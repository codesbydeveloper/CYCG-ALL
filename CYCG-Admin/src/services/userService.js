// simple service to fetch a static list of users stored in public/users.json

export async function fetchUsers() {
  const response = await fetch('https://cycgbackendapi.chaitanyarana.com/api/contacts')
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`)
  }
  const data = await response.json()
  return Array.isArray(data) ? data : []
}
