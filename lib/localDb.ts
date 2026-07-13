const PROGRESS_KEY = 'lc-tracking-progress'

type ProgressRecord = Record<string, string>

const ensureClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('Local database is only available in the browser')
  }
}

const readJson = <T>(key: string, fallback: T): T => {
  ensureClient()
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const writeJson = <T>(key: string, value: T) => {
  ensureClient()
  localStorage.setItem(key, JSON.stringify(value))
}

export const localDb = {
  getProgress(): ProgressRecord {
    return readJson<ProgressRecord>(PROGRESS_KEY, {})
  },

  saveSolved(problemId: number, solvedAt: string) {
    const progress = this.getProgress()
    progress[String(problemId)] = solvedAt
    writeJson(PROGRESS_KEY, progress)
  },

  deleteSolved(problemId: number) {
    const progress = this.getProgress()
    delete progress[String(problemId)]
    writeJson(PROGRESS_KEY, progress)
  },
}
