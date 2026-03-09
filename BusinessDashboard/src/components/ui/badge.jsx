import React from 'react'

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium'
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border bg-transparent text-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    success: 'bg-success text-success-foreground',
  }
  return <span className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>{children}</span>
}

export default Badge
