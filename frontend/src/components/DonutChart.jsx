import React from 'react'

/**
 * SVG donut chart — identical to the original index.html style.
 * r=50, circumference ≈ 314.
 *
 * segments: [{label, value, dash, offset, color}]
 * centerText: primary label (e.g. "7,250")
 * centerSub: secondary label (e.g. "Total Lines")
 */
export default function DonutChart({ segments = [], centerText, centerSub, size = 140 }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-36 h-36">
      <circle
        cx={size / 2} cy={size / 2} r="50"
        fill="none" stroke="#e2e8f0" strokeWidth="14"
        className="dark:stroke-slate-800"
      />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={size / 2} cy={size / 2} r="50"
          fill="none"
          stroke={seg.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${seg.dash} 314`}
          strokeDashoffset={seg.offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ))}
      {centerText && (
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle"
          fill="#1e293b" fontSize="14" fontWeight="800"
          className="dark:fill-white">
          {centerText}
        </text>
      )}
      {centerSub && (
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle"
          fill="#64748b" fontSize="9" className="dark:fill-slate-400">
          {centerSub}
        </text>
      )}
    </svg>
  )
}
