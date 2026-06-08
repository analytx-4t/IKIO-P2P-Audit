import React from 'react'
import DataTable from '../components/DataTable'

export default function PriceVariance({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []
  const top10  = charts.top10_savings || []

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Price Variance &amp; Potential Cost Savings</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Items with &gt;5% price variance across vendors</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Items >5%',     value: kpis.items_above_5pct },
          { label: 'Total Savings', value: `₹${kpis.total_saving_l ?? 0} L`, color: 'text-emerald-600' },
          { label: 'Biggest Saving',value: kpis.biggest_saving != null ? `₹${(kpis.biggest_saving / 1e7).toFixed(2)} Cr` : '—' },
          { label: 'Rows Reviewed', value: kpis.rows_reviewed },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'text-slate-900 dark:text-white'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      {top10.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Top 10 Items by Potential Savings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">#</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">Item</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300 uppercase">Saving (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {top10.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{row.rank || i + 1}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-800 dark:text-white">{row['Description'] || row['Item No.']}</td>
                    <td className="px-4 py-3 text-right text-[11px] font-semibold dark:text-white">
                      {Number(row['Potential Saving (₹)']).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
