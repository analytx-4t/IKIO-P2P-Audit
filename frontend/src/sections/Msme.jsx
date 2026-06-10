import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'
import { BAR_COLORS, CHART_COLORS } from '../theme'

export default function Msme({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const donut    = charts.msme_donut     || { total: 0, segments: [] }
  const delayBars = charts.avg_delay_bars || []

  const catColors = { MEDIUM: CHART_COLORS.info, MICRO: CHART_COLORS.success, N: CHART_COLORS.neutral, SMALL: CHART_COLORS.warning }

  return (
    <>
      <div className="mb-6">
        <h2 className="section-title">MSME Vendor Compliance</h2>
        <p className="section-subtitle">MSMED Act §16 — 45-day payment rule for Micro &amp; Small enterprises</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Micro Invoices',    value: kpis.micro_invoices },
          { label: 'Small Invoices',    value: kpis.small_invoices },
          { label: 'Total MSME',        value: kpis.total_msme },
          { label: 'MSME Value',        value: `₹${kpis.msme_value_cr ?? 0} Cr` },
          { label: '45-Day Breaches',   value: kpis.breaches,      color: 'metric-risk' },
          { label: 'Breach Value',      value: `₹${kpis.breach_val_cr ?? 0} Cr`, color: 'metric-risk' },
          { label: 'Indicative Penalty',value: `₹${kpis.penalty_l ?? 0} L`,      color: 'metric-warning' },
          { label: 'Breach Rate',       value: `${kpis.breach_rate ?? 0}%`,       color: 'metric-risk' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-lg p-5">
            <div className="app-label mb-3">{k.label}</div>
            <div className={`metric-value ${k.color || 'app-title'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Invoices by MSME Category</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={(donut.segments || [])}
              centerText={(donut.total || 0).toLocaleString()}
              centerSub="Total Inv"
            />
          </div>
          <div className="space-y-1.5">
            {(donut.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.color || catColors[s.label] || '#94a3b8' }} />
                  {s.label}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Average Payment Delay by Category</h3>
          <div className="space-y-3 mt-4">
            {delayBars.map((b, i) => {
              const rowColors = [BAR_COLORS.success, BAR_COLORS.info, BAR_COLORS.primary, BAR_COLORS.warning]
              return (
                <div key={b['MSME Category']} className="flex items-center gap-3">
                  <span className="text-xs app-muted w-24">{b['MSME Category']}</span>
                  <div className="flex-1 app-track rounded-full h-6 overflow-hidden">
                    <div className={`h-full rounded-full ${rowColors[i % 4]} flex items-center justify-end pr-2`}
                      style={{ width: `${Math.max(b.pct, 2)}%` }}>
                      <span className="text-[10px] font-bold text-white">{b['Avg Delay Days']} days</span>
                    </div>
                  </div>
                </div>
              )
            })}
            <p className="text-[10px] app-faint mt-2">Negative values = early payment (before due date)</p>
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
