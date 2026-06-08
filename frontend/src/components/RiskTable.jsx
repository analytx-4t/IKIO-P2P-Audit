import React from 'react'

const SEV_CLASSES = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH:     'bg-red-100 text-red-700',
  MEDIUM:   'bg-amber-100 text-amber-700',
  LOW:      'bg-slate-100 text-slate-600',
}

export default function RiskTable({ risks = [] }) {
  if (!risks.length) return null
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Top 10 Risks &amp; Recommended Actions
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {['ID','Risk','Magnitude','Severity','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {risks.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {r.id}
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-white text-[11px]">{r.risk}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px] hidden md:table-cell">
                  {r.magnitude}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SEV_CLASSES[r.severity] || SEV_CLASSES.LOW}`}>
                    {r.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-[11px] hidden lg:table-cell">
                  {r.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
