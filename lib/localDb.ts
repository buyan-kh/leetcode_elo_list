const ACCOUNTS_KEY = 'lc-tracking-accounts'
const SESSION_KEY = 'lc-tracking-session'
const PROGRESS_PREFIX = 'lc-tracking-progress'

export interface LocalUser {
  id: string
  email: string
}

interface LocalAccount extends LocalUser {
  password: string
}

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

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const getAccounts = () => readJson<LocalAccount[]>(ACCOUNTS_KEY, [])

const saveAccounts = (accounts: LocalAccount[]) => {
  writeJson(ACCOUNTS_KEY, accounts)
}

const toUser = (account: LocalAccount): LocalUser => ({
  id: account.id,
  email: account.email,
})

const progressKey = (userId: string) => `${PROGRESS_PREFIX}:${userId}`

export const localDb = {
  getCurrentUser(): LocalUser | null {
    const session = readJson<{ userId: string } | null>(SESSION_KEY, null)
    if (!session) return null

    const account = getAccounts().find((item) => item.id === session.userId)
    return account ? toUser(account) : null
  },

  signUp(email: string, password: string): LocalUser {
    const normalizedEmail = normalizeEmail(email)
    const accounts = getAccounts()

    if (accounts.some((account) => account.email === normalizedEmail)) {
      throw new Error('Account already exists')
    }

    const account: LocalAccount = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password,
    }

    saveAccounts([...accounts, account])
    writeJson(SESSION_KEY, { userId: account.id })
    return toUser(account)
  },

  signIn(email: string, password: string): LocalUser {
    const normalizedEmail = normalizeEmail(email)
    const account = getAccounts().find(
      (item) => item.email === normalizedEmail && item.password === password
    )

    if (!account) {
      throw new Error('Invalid email or password')
    }

    writeJson(SESSION_KEY, { userId: account.id })
    return toUser(account)
  },

  signOut() {
    ensureClient()
    localStorage.removeItem(SESSION_KEY)
  },

  getProgress(userId: string): ProgressRecord {
    return readJson<ProgressRecord>(progressKey(userId), {})
  },

  saveSolved(userId: string, problemId: number, solvedAt: string) {
    const progress = this.getProgress(userId)
    progress[String(problemId)] = solvedAt
    writeJson(progressKey(userId), progress)
  },

  deleteSolved(userId: string, problemId: number) {
    const progress = this.getProgress(userId)
    delete progress[String(problemId)]
    writeJson(progressKey(userId), progress)
  },
}
