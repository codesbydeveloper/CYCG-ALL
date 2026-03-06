import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import PrimaryButton from '../components/common/PrimaryButton'
import TextInput from '../components/common/TextInput'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'

function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Login"
        subtitle="Sign in to access your admin dashboard"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Login ID"
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your login ID"
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter password"
          />
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}
          <PrimaryButton type="submit" disabled={loading} className="w-full uppercase tracking-wide">
            {loading ? 'Logging in...' : 'Login'}
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default LoginPage
