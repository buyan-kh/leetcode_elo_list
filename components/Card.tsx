import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  theme?: 'dark' | 'light'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  className = '',
  theme = 'dark',
  children,
}) => (
  <div
    className={cn(
      'rounded-xl border shadow-sm',
      theme === 'dark'
        ? 'border-slate-800 bg-slate-900/60'
        : 'border-slate-200 bg-white',
      className
    )}
  >
    {children}
  </div>
)
