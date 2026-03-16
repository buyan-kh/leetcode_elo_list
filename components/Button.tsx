import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
  theme?: 'dark' | 'light'
  component?: 'button' | 'span'
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  className = '',
  theme = 'dark',
  component = 'button',
  children,
  ...props
}) => {
  const variants = {
    default:
      theme === 'dark'
        ? 'bg-slate-100 text-slate-900 hover:bg-white/80'
        : 'bg-slate-800 text-slate-50 hover:bg-slate-700',
    outline:
      theme === 'dark'
        ? 'border border-slate-700 text-slate-50 hover:bg-slate-800'
        : 'border border-slate-300 text-slate-900 hover:bg-slate-100',
    ghost:
      theme === 'dark'
        ? 'text-slate-50 hover:bg-slate-800'
        : 'text-slate-900 hover:bg-slate-100',
  }
  const Component = component
  return (
    <Component
      className={cn(
        'h-9 px-3 inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
        theme === 'dark'
          ? 'focus-visible:outline-slate-300'
          : 'focus-visible:outline-slate-500',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
