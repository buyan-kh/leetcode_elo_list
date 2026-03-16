'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Checkbox } from '@/components/Checkbox'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Progress } from '@/components/Progress'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Pagination } from '@/components/Pagination'
import { cn } from '@/lib/utils'
import { Problem, UserProgress } from '@/types'
import Link from 'next/link'

const THEME_KEY = 'lc-tracking-theme'

const loadTheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'dark'
  return (localStorage.getItem(THEME_KEY) || 'dark') as 'dark' | 'light'
}

const saveTheme = (theme: 'dark' | 'light') => {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_KEY, theme)
}

export default function HomePage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [bounds, setBounds] = useState({ min: null as number | null, max: null as number | null })
  const [minRating, setMinRating] = useState('')
  const [maxRating, setMaxRating] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [solvedIds, setSolvedIds] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'dark' | 'light'>(loadTheme)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const filtersInitializedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setAuthLoading(false)

      if (session?.user) {
        // Load user progress from Supabase
        const { data, error } = await supabase
          .from('user_progress')
          .select('problem_id, solved_at')
          .eq('user_id', session.user.id)

        if (!error && data) {
          const progressMap = new Map<number, string>()
          data.forEach((item: UserProgress) => {
            progressMap.set(item.problem_id, item.solved_at)
          })
          setSolvedIds(progressMap)
        }
      }
    }
    initAuth()
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Reload progress when user logs in
        supabase
          .from('user_progress')
          .select('problem_id, solved_at')
          .eq('user_id', session.user.id)
          .then(({ data, error }) => {
            if (!error && data) {
              const progressMap = new Map<number, string>()
              data.forEach((item: UserProgress) => {
                progressMap.set(item.problem_id, item.solved_at)
              })
              setSolvedIds(progressMap)
            }
          })
      } else {
        setSolvedIds(new Map())
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    saveTheme(theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.body.className =
      theme === 'dark'
        ? 'bg-slate-950 text-slate-50'
        : 'bg-slate-50 text-slate-900'
  }, [theme])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/data.json')
        if (!res.ok) throw new Error('Unable to load data file')
        const data = await res.json()
        setProblems(data)
        const ratings = data.map((p: Problem) => p.Rating)
        const min = Math.floor(Math.min(...ratings))
        const max = Math.ceil(Math.max(...ratings))
        setBounds({ min, max })
        setMinRating(String(min))
        setMaxRating(String(max))
        setError('')
        filtersInitializedRef.current = true
      } catch (err: any) {
        console.error(err)
        setError(`Failed to load problem data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const toggleSolved = async (id: number) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    const isSolved = solvedIds.has(id)
    const next = new Map(solvedIds)

    if (isSolved) {
      next.delete(id)
      // Delete from Supabase
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('problem_id', id)
    } else {
      const timestamp = new Date().toISOString()
      next.set(id, timestamp)
      // Insert into Supabase
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          problem_id: id,
          solved_at: timestamp,
        })
    }

    setSolvedIds(next)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const parsedMin = useMemo(() => {
    const num = Number(minRating)
    return Number.isFinite(num) ? num : bounds.min
  }, [minRating, bounds.min])

  const parsedMax = useMemo(() => {
    const num = Number(maxRating)
    return Number.isFinite(num) ? num : bounds.max
  }, [maxRating, bounds.max])

  const filtered = useMemo(() => {
    if (!problems.length) return []
    const min = parsedMin ?? -Infinity
    const max = parsedMax ?? Infinity
    return problems
      .filter((p) => p.Rating >= min && p.Rating <= max)
      .slice()
      .sort((a, b) =>
        sortDir === 'desc' ? b.Rating - a.Rating : a.Rating - b.Rating
      )
  }, [problems, parsedMin, parsedMax, sortDir])

  const prevFiltersRef = useRef({ minRating, maxRating, sortDir })
  useEffect(() => {
    if (filtersInitializedRef.current) {
      const prevFilters = prevFiltersRef.current
      const filtersChanged =
        prevFilters.minRating !== minRating ||
        prevFilters.maxRating !== maxRating ||
        prevFilters.sortDir !== sortDir

      if (filtersChanged) {
        setCurrentPage(1)
        prevFiltersRef.current = { minRating, maxRating, sortDir }
      }
    } else {
      prevFiltersRef.current = { minRating, maxRating, sortDir }
    }
  }, [minRating, maxRating, sortDir])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProblems = filtered.slice(startIndex, endIndex)

  const total = problems.length
  const solvedCount = useMemo(() => {
    if (!total) return 0
    return problems.reduce(
      (count, p) => (solvedIds.has(p.ID) ? count + 1 : 0),
      0
    )
  }, [problems, solvedIds])

  const progress = total ? Math.round((solvedCount / total) * 100) : 0

  const minELO = 1084
  const maxELO = 3125
  const eloRange = maxELO - minELO

  const userELO = useMemo(() => {
    if (!problems.length || solvedIds.size === 0) return 0
    let maxRating = 0
    problems.forEach((p) => {
      if (solvedIds.has(p.ID) && p.Rating > maxRating) {
        maxRating = p.Rating
      }
    })
    return Math.round(maxRating)
  }, [problems, solvedIds])

  const eloPercentage =
    userELO > 0 ? Math.round(((userELO - minELO) / eloRange) * 100) : 0

  const resetFilters = () => {
    if (bounds.min !== null) setMinRating(String(bounds.min))
    if (bounds.max !== null) setMaxRating(String(bounds.max))
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'min-h-screen transition-colors',
        theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'
      )}
    >
      <header
        className={cn(
          'border-b backdrop-blur',
          theme === 'dark'
            ? 'border-slate-800 bg-slate-900/70'
            : 'border-slate-200 bg-white/70'
        )}
      >
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1
                className={cn(
                  'text-xl font-semibold leading-tight',
                  theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
                )}
              >
                LeetCode Rating Tracker
              </h1>
              <p
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Filter by rating, sort, and mark problems solved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      'text-sm',
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    {user.email}
                  </span>
                  <Button variant="outline" theme={theme} onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="outline" theme={theme}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button theme={theme}>Sign Up</Button>
                  </Link>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 min-w-[280px]">
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                      )}
                    >
                      {solvedCount} / {total || 0} solved
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                        )}
                      >
                        ELO: {userELO || 0}
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        )}
                      >
                        ({userELO > 0 ? eloPercentage : 0}%)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <Progress value={progress} />
                  <div
                    className={cn(
                      'text-xs mt-1 text-right',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                    )}
                  >
                    {progress}% complete
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {!user && (
          <Card
            className={cn(
              'p-4',
              theme === 'dark'
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-50'
                : 'border-amber-500/40 bg-amber-50 text-amber-900'
            )}
            theme={theme}
          >
            <div className="text-sm">
              Please{' '}
              <Link href="/auth/login" className="underline">
                login
              </Link>{' '}
              or{' '}
              <Link href="/auth/signup" className="underline">
                sign up
              </Link>{' '}
              to track your progress across devices.
            </div>
          </Card>
        )}

        <Card className="p-4" theme={theme}>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}
                htmlFor="minRating"
              >
                Min rating
              </label>
              <Input
                id="minRating"
                type="number"
                value={minRating}
                min={bounds.min ?? undefined}
                max={bounds.max ?? undefined}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder={
                  bounds.min ? `Min: ${bounds.min}` : 'Min rating'
                }
                className="w-32"
                theme={theme}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}
                htmlFor="maxRating"
              >
                Max rating
              </label>
              <Input
                id="maxRating"
                type="number"
                value={maxRating}
                min={bounds.min ?? undefined}
                max={bounds.max ?? undefined}
                onChange={(e) => setMaxRating(e.target.value)}
                placeholder={
                  bounds.max ? `Max: ${bounds.max}` : 'Max rating'
                }
                className="w-32"
                theme={theme}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                )}
              >
                Sort
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  theme={theme}
                  onClick={() =>
                    setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
                  }
                >
                  {sortDir === 'desc'
                    ? 'Rating: High → Low'
                    : 'Rating: Low → High'}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  )}
                  htmlFor="itemsPerPage"
                >
                  Per page:
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className={cn(
                    'h-8 rounded-md border px-2 text-xs',
                    theme === 'dark'
                      ? 'border-slate-700 bg-slate-900 text-slate-50'
                      : 'border-slate-300 bg-white text-slate-900'
                  )}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div
                className={cn(
                  'text-sm',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                {filtered.length} of {total || 0} filtered
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card
            className={cn(
              'p-4',
              theme === 'dark'
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-50'
                : 'border-amber-500/40 bg-amber-50 text-amber-900'
            )}
            theme={theme}
          >
            {error}
          </Card>
        )}

        <Card theme={theme}>
          {loading ? (
            <div
              className={cn(
                'p-6 text-center',
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              Loading problems…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={cn(
                'p-6 text-center',
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              )}
            >
              No problems in this rating interval.
            </div>
          ) : (
            <>
              <div
                className={cn(
                  'divide-y',
                  theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
                )}
              >
                {paginatedProblems.map((problem, index) => {
                  const isSolved = solvedIds.has(problem.ID)
                  const displayNumber =
                    (currentPage - 1) * itemsPerPage + index + 1
                  return (
                    <div
                      key={problem.ID}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors',
                        isSolved
                          ? theme === 'dark'
                            ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                            : 'bg-emerald-50/50 hover:bg-emerald-50'
                          : theme === 'dark'
                          ? 'hover:bg-slate-900/80'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={cn(
                            'text-sm font-medium min-w-[2rem] text-right',
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                          )}
                        >
                          {displayNumber}.
                        </span>
                        <Checkbox
                          checked={isSolved}
                          onChange={() => toggleSolved(problem.ID)}
                          aria-label={`Mark ${problem.Title} as solved`}
                          theme={theme}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            {problem.TitleSlug ? (
                              <a
                                href={`https://leetcode.com/problems/${problem.TitleSlug}`}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  'text-lg leading-tight flex items-center gap-2 hover:underline',
                                  isSolved
                                    ? 'text-emerald-600 line-through'
                                    : theme === 'dark'
                                    ? 'text-slate-50 hover:text-slate-200'
                                    : 'text-slate-900 hover:text-slate-700'
                                )}
                              >
                                {problem.Title}
                                {isSolved && (
                                  <span className="text-xs text-emerald-500">
                                    ✓ Solved
                                  </span>
                                )}
                              </a>
                            ) : (
                              <div
                                className={cn(
                                  'text-lg leading-tight flex items-center gap-2',
                                  isSolved
                                    ? 'text-emerald-600 line-through'
                                    : theme === 'dark'
                                    ? 'text-slate-50'
                                    : 'text-slate-900'
                                )}
                              >
                                {problem.Title}
                                {isSolved && (
                                  <span className="text-xs text-emerald-500">
                                    ✓ Solved
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <Badge
                            theme={theme}
                            className={cn(
                              isSolved &&
                                (theme === 'dark'
                                  ? 'border-emerald-600 bg-emerald-950/40 text-emerald-200'
                                  : 'border-emerald-500 bg-emerald-100 text-emerald-700')
                            )}
                          >
                            Rating {Math.round(problem.Rating)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                theme={theme}
              />
              <div
                className={cn(
                  'px-4 pb-4 text-center text-sm',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Showing {startIndex + 1} to{' '}
                {Math.min(endIndex, filtered.length)} of {filtered.length}{' '}
                problems
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}
