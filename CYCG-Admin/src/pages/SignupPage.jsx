import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import PrimaryButton from '../components/common/PrimaryButton'
import TextInput from '../components/common/TextInput'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../layouts/AuthLayout'

function SignupPage() {
  const navigate = useNavigate()
  const { isAuthenticated, signUp } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    setLoading(true)
    try {
      await signUp(form)
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError.message || 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create account"
        subtitle="Sign up and start managing categories and blogs"
        footer={
          <span>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#EBEBEB] underline underline-offset-4">
              Login
            </Link>
          </span>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            Signup is currently disabled. Use login page with admin credentials.
          </p>
          <TextInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Your full name"
          />
          <TextInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="name@example.com"
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Create password"
          />
          <TextInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Repeat password"
          />
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}
          <PrimaryButton type="submit" disabled={loading} className="w-full uppercase tracking-wide">
            {loading ? 'Creating account...' : 'Sign up'}
          </PrimaryButton>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}

export default SignupPage
