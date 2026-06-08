import React from 'react'

/**
 * Horizontal bar row — same style as the original index.html.
 * label: left label text
 * value: count shown inside/after bar
 * pct: bar width %
 * color: tailwind bg class, e.g. "bg-emerald-500"
 * labelWidth: tailwind width class for label, default "w-28"
 */
export default function BarRow({ label, value, pct, color = 'bg-brand-600', labelWidth = 'w-28' }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs app-muted ${labelWidth}`}>{label}</span>
      <div className="flex-1 app-track rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} flex items-center justify-end pr-2`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        >
          {value > 0 && (
            <span className="text-[10px] font-bold text-white">{value.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  )
}
