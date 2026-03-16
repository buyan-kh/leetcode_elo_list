import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light'
}

export const Input: React.FC<InputProps> = ({
  className = '',
  theme = 'dark',
  ...props
}) => (
  <input
    className={cn(
      'h-10 w-full rounded-md border px-3 text-sm shadow-sm outline-none ring-0 transition-colors',
      theme === 'dark'
        ? 'border-slate-800 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:border-slate-500'
        : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500',
      className
    )}
    {...props}
  />
)
