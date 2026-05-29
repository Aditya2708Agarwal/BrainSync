import { Link } from 'react-router-dom'
import { Brain } from 'lucide-react'

export function BrandLogo({ to = '/', size = 'md', showLabel = true, className = '' }) {
  const sizeClasses = size === 'sm'
    ? 'h-7 w-7 rounded-md'
    : 'h-8 w-8 rounded-lg'

  const iconClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const labelClasses = size === 'sm' ? 'text-base' : 'text-lg'

  return (
    <Link to={to} className={`flex items-center gap-2.5 ${className}`.trim()}>
      <div className={`relative grid place-items-center bg-linear-to-br from-primary to-fuchsia-500 shadow-lg shadow-primary/30 ${sizeClasses}`}>
        <Brain className={`${iconClasses} text-primary-foreground`} />
      </div>
      {showLabel ? (
        <span className={`font-heading font-semibold tracking-tight ${labelClasses}`}>
          BrainSync
        </span>
      ) : null}
    </Link>
  )
}