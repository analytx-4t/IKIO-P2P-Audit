import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function GlBalances({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const ps  = charts.payment_status || { total: 0, segments: [] }
  const ab  = charts.amount_bars    || []

  const maxAmt = Math.max(...ab.map(b => b.value_cr || 0), 1)

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Ledger Vendor Balances</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Outstanding, fully-paid, and advance vendor balances</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Outstanding',   value: kpis.outstanding_cnt, color: 'text-rose-600' },
          { label: 'Fully Paid',    value: kpis.fully_paid_cnt,  color: 'text-emerald-600' },
          { label: 'Advance/Debit', value: kpis.advance_cnt,     color: 'text-amber-600' },
          { label: 'Total Vendors', value: kpis.total_vendors },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'text-slate-900 dark:text-white'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Payment Status (Count)</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={ps.segments || []}
              centerText={(ps.total || 0).toLocaleString()}
              centerSub="Total"
            />
          </div>
          <div className="space-y-2">
            {(ps.segments || []).map(s => (
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Amount (₹ Crores)</h3>
          <div className="space-y-5 mt-6">
            {ab.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{b.label}</span>
                  <span className="font-semibold dark:text-white">₹{b.value_cr} Cr</span>
                </div>
                <div className="bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                  <div className={`h-full rounded-full ${b.label === 'Outstanding' ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(b.pct, 1)}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
              <div className="flex justify-between text-sm font-bold">
                <span>Net Liability</span>
                <span className="text-rose-600">₹{kpis.net_liability_cr} Cr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
