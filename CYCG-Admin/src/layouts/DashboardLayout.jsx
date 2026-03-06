import { useState } from 'react'

function DashboardLayout({
  children,
  onRefresh,
  onLogout,
  user,
  tabs,
  activeTab,
  onTabChange,
  users = [],
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function handleTabClick(tabId) {
    onTabChange(tabId)
    setIsMenuOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#080808] text-[#EBEBEB]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className="w-full rounded-2xl border border-[#2E2E2E] bg-[#111111] p-4 text-white shadow-sm lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-72 lg:shrink-0 lg:overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-[#818181]">
                CYCG Admin
              </p>
              <p className="mt-1 truncate font-sans text-lg font-semibold text-[#EBEBEB]">
                {user?.name || user?.email || 'Admin'}
              </p>
            </div>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="rounded-md border border-[#333333] px-3 py-1 font-sans text-sm text-[#EBEBEB] lg:hidden"
            >
              {isMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>

          <nav
            className={`mt-4 space-y-2 border-t border-[#2E2E2E] pt-4 ${isMenuOpen ? 'block' : 'hidden'} lg:block`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-sans text-sm font-semibold uppercase tracking-wide transition ${activeTab === tab.id
                  ? 'bg-[#2E2E2E] text-white shadow-sm'
                  : 'bg-[#1A1A1A] text-[#EBEBEB] hover:bg-[#242424] hover:text-white'
                  }`}
              >
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id
                      ? 'bg-white/25 text-white'
                      : 'bg-white/10 text-[#EBEBEB]'
                      }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#2E2E2E] pt-4 lg:mt-6">
            <button
              onClick={onRefresh}
              className="rounded-lg border border-[#333333] px-3 py-2 font-sans text-sm font-semibold text-[#EBEBEB] transition hover:bg-[#242424]"
            >
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg bg-[#2E2E2E] px-3 py-2 font-sans text-sm font-semibold text-white transition hover:bg-[#3A3A3A]"
            >
              Logout
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-5">
          <header className="rounded-2xl border border-[#2E2E2E] bg-[#111111] p-5 shadow-sm">
            <h1 className="font-display text-2xl font-normal text-white">
              Dashboard
            </h1>
            <p className="mt-1 font-sans text-sm font-normal text-[#B5B5B5]">
              Manage categories and blogs from one place.
            </p>
          </header>
          {children}
        </section>
      </div>

    </main>
  )
}

export default DashboardLayout
