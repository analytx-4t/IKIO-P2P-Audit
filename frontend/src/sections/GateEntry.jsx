import React from 'react'
import DonutChart from '../components/DonutChart'
import BarRow from '../components/BarRow'
import DataTable from '../components/DataTable'

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
        <h2 className="text-xl font-bold app-title">Gate Entry Date Integrity</h2>
        <p className="text-sm app-muted mt-0.5">Vendor Bill Date ≤ GE Date ≤ GRPO Date ≤ AP Date rule</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gate Entries',   value: kpis.gate_entries },
          { label: 'GRPO Documents', value: kpis.grpo_docs },
          { label: 'Exceptions',     value: kpis.exceptions,    color: 'text-rose-600' },
          { label: 'Integrity',      value: `${kpis.integrity_pct ?? 0}%`, color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-xl border p-4">
            <div className="text-[10px] font-medium app-label uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'app-title'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Pass vs Exception</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={(pve.segments || []).map(s => ({
                ...s, color: s.label === 'Pass' ? '#22c55e' : '#ef4444',
              }))}
              centerText={`${kpis.integrity_pct ?? 0}%`}
              centerSub="Pass"
            />
          </div>
          <div className="space-y-2">
            {(pve.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.label === 'Pass' ? '#22c55e' : '#ef4444' }} />
                  {s.label === 'Pass' ? 'Pass (Correct Order)' : 'Exception (GE > GRPO)'}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Detailed Checks</h3>
          <div className="space-y-2">
            {checks.map(c => {
              const colors = {
                'Total': 'bg-slate-500', 'GE = GRPO (same)': 'bg-emerald-500',
                'GE < GRPO (normal)': 'bg-cyan-500', 'GE > GRPO (error)': 'bg-red-500',
                'Missing GRPO Date': 'bg-amber-500', 'Missing Bill Date': 'bg-gray-300',
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
