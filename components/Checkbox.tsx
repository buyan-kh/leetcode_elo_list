import { cn } from '@/lib/utils'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: 'dark' | 'light'
}

export const Checkbox: React.FC<CheckboxProps> = ({
  className = '',
  checked,
  theme = 'dark',
  ...props
}) => (
  <input
    type="checkbox"
    className={cn(
      'h-5 w-5 rounded border-2 cursor-pointer transition-all',
      checked
        ? 'border-emerald-500 bg-emerald-500 text-white'
        : theme === 'dark'
        ? 'border-slate-600 bg-slate-900 text-slate-100 hover:border-slate-500'
        : 'border-slate-400 bg-white text-slate-900 hover:border-slate-500',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2',
      theme === 'dark'
        ? 'focus-visible:ring-offset-slate-900'
        : 'focus-visible:ring-offset-white',
      className
    )}
    checked={checked}
    {...props}
  />
)
