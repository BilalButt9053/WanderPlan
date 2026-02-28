import React from 'react'

export function Badge({ children, variant = 'default', className = '' }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    default: 'bg-muted text-muted-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border bg-transparent text-muted-foreground',
    destructive: 'bg-destructive text-white',
  }
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`}>{children}</span>
}

export default Badge
