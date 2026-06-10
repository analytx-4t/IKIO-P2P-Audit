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
    <div className="app-card rounded-lg overflow-hidden mb-5">
      <div className="px-5 py-4 border-b app-divider flex items-center justify-between">
        <h4 className="text-sm font-semibold app-title">{title}</h4>
        <span className="text-[10px] app-muted">
          {rows.length.toLocaleString()} rows
        </span>
      </div>
      <div className={scrollable ? 'overflow-auto max-h-96' : 'overflow-x-auto'}>
        <table className="w-full text-xs">
          <thead className="app-table-head">
            <tr>
              {cols.map(c => (
                <th key={c} className="text-left px-3 py-2 app-label whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row, i) => (
              <tr key={i} className="app-row-hover">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 app-body whitespace-nowrap">
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
