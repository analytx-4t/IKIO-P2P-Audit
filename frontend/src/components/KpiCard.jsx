import React from 'react'

export default function KpiCard({ icon, label, value, sub, colorClass = 'app-title' }) {
  return (
    <div className="app-card rounded-xl border p-4 hover:shadow-md transition-shadow">
      {icon && (
        <div className="flex items-center justify-between mb-2">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-[10px] font-medium app-label uppercase tracking-wider">
            {label}
          </span>
        </div>
      )}
      {!icon && (
        <div className="text-[10px] font-medium app-label uppercase tracking-wider mb-1">
          {label}
        </div>
      )}
      <div className={`text-xl font-bold ${colorClass}`}>{value ?? '—'}</div>
      {sub && <div className="text-[11px] app-muted mt-0.5">{sub}</div>}
    </div>
  )
}
