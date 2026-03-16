import { Button } from './Button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  theme: 'dark' | 'light'
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  theme,
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        theme={theme}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className={cn(
                  'px-2',
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                ...
              </span>
            )
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={cn(
                'h-9 w-9 rounded-md text-sm font-medium transition-colors',
                page === currentPage
                  ? theme === 'dark'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 text-white'
                  : theme === 'dark'
                  ? 'border border-slate-700 text-slate-50 hover:bg-slate-800'
                  : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
              )}
            >
              {page}
            </button>
          )
        })}
      </div>
      <Button
        variant="outline"
        theme={theme}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  )
}
