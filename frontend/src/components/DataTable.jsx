import React from 'react'

/**
 * Renders a scrollable card table — matches original renderAuditTables behaviour.
 * title: card heading
 * rows: array of objects
 * maxRows: show scroll if rows > this (default 15)
 */
export default function DataTable({ title, rows = [], maxRows = 15 }) {
  if (!rows.length) return null

  const cols = Object.keys(rows[0])
  const scrollable = rows.length > maxRows

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {rows.length.toLocaleString()} rows
        </span>
      </div>
      <div className={scrollable ? 'overflow-auto max-h-96' : 'overflow-x-auto'}>
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {cols.map(c => (
                <th key={c} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {row[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
