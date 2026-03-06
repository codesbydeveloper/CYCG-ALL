function AuthLayout({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-[#EBEBEB]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1800&auto=format&fit=crop')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.7)_0%,rgba(8,8,8,0.95)_100%)]" />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  )
}

export default AuthLayout
