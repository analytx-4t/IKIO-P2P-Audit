import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function QtyVariance({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const vb  = charts.variance_buckets   || { total: 0, within_pct: 0, segments: [] }
  const gs  = charts.goods_vs_services  || []

  const gsColors = ['bg-emerald-500', 'bg-red-500', 'bg-emerald-400', 'bg-red-400']

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold app-title">Quantity Variance Analysis</h2>
        <p className="text-sm app-muted mt-0.5">PO lines by variance tolerance: 0-5% acceptable, &gt;5% review</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Lines',    value: kpis.total_lines },
          { label: 'Within 0-5%',   value: kpis.within_tol,     color: 'text-emerald-600' },
          { label: 'Above 5%',      value: kpis.above_tol,      color: 'text-rose-600' },
          { label: 'Exception Rate', value: `${kpis.exception_rate ?? 0}%`, color: 'text-rose-600' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-xl border p-4">
            <div className="text-[10px] font-medium app-label uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'app-title'}`}>
              {(k.value ?? '—').toLocaleString?.() ?? k.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Variance Buckets</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={(vb.segments || []).map(s => ({
                ...s, color: s.label?.includes('Within') ? '#22c55e' : '#ef4444',
              }))}
              centerText={`${vb.within_pct ?? 0}%`}
              centerSub="Within Tol"
            />
          </div>
          <div className="space-y-2">
            {(vb.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.label?.includes('Within') ? '#22c55e' : '#ef4444' }} />
                  {s.label}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Goods vs Services</h3>
          <div className="space-y-3">
            {gs.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium app-body">{item.label}</span>
                  <span className="font-semibold dark:text-white">{(item.value || 0).toLocaleString()}</span>
                </div>
                <div className="app-track rounded-full h-5 overflow-hidden">
                  <div className={`h-full rounded-full ${gsColors[i % 4]}`}
                    style={{ width: `${Math.max(item.pct, 1)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
