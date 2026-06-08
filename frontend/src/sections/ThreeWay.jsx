import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function ThreeWay({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const donut  = charts.match_donut  || { total: 0, segments: [] }
  const pvg    = charts.po_vs_grpo   || {}

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">3-Way Matching Exceptions</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">PO vs GRPO vs Invoice comparison</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Records',       value: kpis.total_records },
          { label: 'Fully Matched',       value: kpis.fully_matched,   color: 'text-emerald-600' },
          { label: 'Quantity Exceptions', value: kpis.qty_exceptions,  color: 'text-rose-600' },
          { label: 'Rate Exceptions',     value: kpis.rate_exceptions, color: 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'text-slate-900 dark:text-white'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Matching Results</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={donut.segments || []}
              centerText={(donut.total || 0).toLocaleString()}
              centerSub="Records"
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">PO vs GRPO Comparison</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: 'Matched Correctly', value: pvg.matched,    bg: 'bg-emerald-50 dark:bg-slate-800', text: 'text-emerald-700 dark:text-emerald-300' },
              { label: 'PO > GRPO',         value: pvg.po_gt_grpo, bg: 'bg-rose-50 dark:bg-slate-800',   text: 'text-rose-700 dark:text-rose-300' },
              { label: 'PO < GRPO',         value: pvg.po_lt_grpo, bg: 'bg-amber-50 dark:bg-slate-800',  text: 'text-amber-700 dark:text-amber-300' },
            ].map(c => (
              <div key={c.label} className={`text-center ${c.bg} rounded-lg p-3`}>
                <div className={`text-[10px] font-medium ${c.text}`}>{c.label}</div>
                <div className={`text-lg font-bold ${c.text}`}>{(c.value || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
            <h4 className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">Qty Performance</h4>
            {[
              { label: 'Total PO Qty',   value: pvg.total_po_qty },
              { label: 'Total GRPO Qty', value: pvg.total_grpo_qty },
              { label: 'Short Receipt',  value: pvg.short_receipt, color: 'text-rose-600' },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{r.label}</span>
                <span className={`text-xs font-bold dark:text-white ${r.color || ''}`}>
                  {(r.value || 0).toLocaleString()} units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
