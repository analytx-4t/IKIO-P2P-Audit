import React from 'react'
import DonutChart from '../components/DonutChart'
import BarRow from '../components/BarRow'
import DataTable from '../components/DataTable'
import { BAR_COLORS, CHART_COLORS } from '../theme'

export default function GateEntry({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const pve  = charts.pass_vs_exception || { total: 0, segments: [] }
  const checks = charts.detailed_checks || []

  const maxCheck = Math.max(...checks.map(c => c.value || 0), 1)

  return (
    <>
      <div className="mb-6">
        <h2 className="section-title">Gate Entry Date Integrity</h2>
        <p className="section-subtitle">Vendor Bill Date ≤ GE Date ≤ GRPO Date ≤ AP Date rule</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gate Entries',   value: kpis.gate_entries },
          { label: 'GRPO Documents', value: kpis.grpo_docs },
          { label: 'Exceptions',     value: kpis.exceptions,    color: 'metric-risk' },
          { label: 'Integrity',      value: `${kpis.integrity_pct ?? 0}%`, color: 'metric-success' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-lg p-5">
            <div className="app-label mb-3">{k.label}</div>
            <div className={`metric-value ${k.color || 'app-title'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Pass vs Exception</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={(pve.segments || []).map(s => ({
                ...s, color: s.label === 'Pass' ? CHART_COLORS.success : CHART_COLORS.risk,
              }))}
              centerText={`${kpis.integrity_pct ?? 0}%`}
              centerSub="Pass"
            />
          </div>
          <div className="space-y-2">
            {(pve.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.label === 'Pass' ? CHART_COLORS.success : CHART_COLORS.risk }} />
                  {s.label === 'Pass' ? 'Pass (Correct Order)' : 'Exception (GE > GRPO)'}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Detailed Checks</h3>
          <div className="space-y-2">
            {checks.map(c => {
              const colors = {
                'Total': BAR_COLORS.neutral, 'GE = GRPO (same)': BAR_COLORS.success,
                'GE < GRPO (normal)': BAR_COLORS.info, 'GE > GRPO (error)': BAR_COLORS.risk,
                'Missing GRPO Date': BAR_COLORS.warning, 'Missing Bill Date': 'bg-slate-300',
              }
              return (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-xs app-muted w-36">{c.label}</span>
                  <div className="flex-1 app-track rounded-full h-5 overflow-hidden">
                    <div className={`h-full rounded-full ${colors[c.label] || 'bg-slate-400'}`}
                      style={{ width: `${Math.max(c.pct, 0.3)}%` }} />
                  </div>
                  <span className="text-xs font-semibold dark:text-white w-12 text-right">
                    {(c.value || 0).toLocaleString()}
                  </span>
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
