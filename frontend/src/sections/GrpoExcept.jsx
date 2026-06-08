import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function GrpoExcept({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const donut = charts.exceptions_donut || { total: 0, segments: [] }
  const vd    = charts.visual_distribution || []

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">GRPO / Gate-Entry / Invoice Linkage Exceptions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Breakdown of linkage gaps between GRPO, Gate Entry, and Invoice</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'GRPO No Invoice',  value: kpis.grpo_no_invoice, color: 'text-amber-600' },
          { label: 'GE No GRPO',       value: kpis.ge_no_grpo,      color: 'text-rose-600' },
          { label: 'Invoice No GE',    value: kpis.invoice_no_ge,   color: 'text-rose-600' },
          { label: 'Total Exceptions', value: kpis.total_exceptions, color: 'text-rose-600' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'text-slate-900 dark:text-white'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Exceptions by Type</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={donut.segments || []}
              centerText={(donut.total || 0).toLocaleString()}
              centerSub="Total"
            />
          </div>
          <div className="space-y-2">
            {(donut.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Visual Distribution</h3>
          <div className="space-y-3 mt-4">
            {vd.map((item, i) => {
              const colors = ['bg-indigo-500', 'bg-amber-500', 'bg-red-500']
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-semibold dark:text-white">{(item.value || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i % 3]} flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(item.pct, 1)}%` }}>
                      <span className="text-[10px] font-bold text-white">{item.pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
