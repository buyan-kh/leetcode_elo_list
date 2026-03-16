import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  theme: 'dark' | 'light'
  onToggle: () => void
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className={cn(
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
      theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-300'
    )}
    aria-label="Toggle theme"
  >
    <span
      className={cn(
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
      )}
    />
  </button>
)
