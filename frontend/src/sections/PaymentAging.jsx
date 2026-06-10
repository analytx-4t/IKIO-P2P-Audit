import React from 'react'
import DataTable from '../components/DataTable'
import { BAR_COLORS } from '../theme'

export default function PaymentAging({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const bars     = charts.aging_bars      || []
  const ovdBars  = charts.overdue_amt_bars || []

  return (
    <>
      <div className="mb-6">
        <h2 className="section-title">Payment Aging Analysis</h2>
        <p className="section-subtitle">Invoice aging buckets: early, on-time, late, and overdue</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invoices', value: kpis.total_invoices },
          { label: 'Early',          value: kpis.early,           color: 'metric-success' },
          { label: 'On-Time',        value: kpis.on_time,         color: 'metric-info' },
          { label: 'Late',           value: kpis.late,            color: 'metric-risk' },
          { label: 'Not Due',        value: kpis.not_due },
          { label: 'Overdue',        value: kpis.overdue,         color: 'metric-risk' },
          { label: 'Overdue Amt',    value: `₹${kpis.overdue_amt_l ?? 0} L`, color: 'metric-risk' },
          { label: 'On-Time %',      value: `${kpis.on_time_pct ?? 0}%`, color: 'metric-success' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-lg p-5">
            <div className="app-label mb-3">{k.label}</div>
            <div className={`metric-value ${k.color || 'app-title'}`}>
              {(k.value ?? '—').toLocaleString?.() ?? k.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Invoices by Aging Bucket</h3>
          <div className="space-y-2">
            {bars.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="text-xs app-muted w-28">{b.label}</span>
                <div className="flex-1 app-track rounded-full h-5 overflow-hidden">
                  <div className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(b.pct, 1)}%`, background: b.color }}>
                    <span className="text-[10px] font-bold text-white">{(b.value || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Overdue Outstanding (₹ Lakhs)</h3>
          <div className="space-y-4 mt-4">
            {ovdBars.map((b, i) => {
              const colors = [BAR_COLORS.risk, BAR_COLORS.risk, BAR_COLORS.risk]
              return (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{b.label}</span>
                    <span className="font-semibold dark:text-white">₹{b.value_l} L</span>
                  </div>
                  <div className="app-track rounded-full h-6 overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i]}`}
                      style={{ width: `${Math.max(b.pct, 1)}%` }} />
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
