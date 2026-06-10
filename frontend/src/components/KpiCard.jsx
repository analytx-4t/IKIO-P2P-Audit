import React from 'react'

export default function KpiCard({ icon, label, value, sub, colorClass = 'app-title' }) {
  return (
    <div className="app-card rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
      {icon && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <span className="app-label">{label}</span>
          <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-200 flex items-center justify-center opacity-80">
            {icon}
          </div>
        </div>
      )}
      {!icon && (
        <div className="app-label mb-3">
          {label}
        </div>
      )}
      <div className={`metric-value ${colorClass}`}>{value ?? '—'}</div>
      {sub && <div className="text-xs app-muted mt-2 leading-relaxed">{sub}</div>}
    </div>
  )
}
