import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  theme?: 'dark' | 'light'
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  theme = 'dark',
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium',
      theme === 'dark'
        ? 'border-slate-700 text-slate-100'
        : 'border-slate-300 text-slate-900',
      className
    )}
  >
    {children}
  </span>
)
