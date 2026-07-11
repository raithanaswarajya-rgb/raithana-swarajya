export default function DashboardHeader({ name, roleLabel, isDark, onTheme, onLogout, children }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">Welcome back, {name}!</h1>
            <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Role: {roleLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            {children}
            <button onClick={onTheme} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}>
              {isDark ? "☀ Light" : "☾ Dark"}
            </button>
            <button onClick={onLogout} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700">Log out</button>
          </div>
        </div>
      </div>
    </header>
  );
}
