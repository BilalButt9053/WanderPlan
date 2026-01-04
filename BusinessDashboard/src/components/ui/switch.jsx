import React from 'react'

export function Switch({ checked = false, onChange, className = '' }) {
  return (
    <label className={`inline-flex relative items-center cursor-pointer ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange && onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:bg-primary transition-all" />
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition-transform" />
    </label>
  )
}

export default Switch
