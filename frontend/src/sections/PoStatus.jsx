import React from 'react'
import KpiCard from '../components/KpiCard'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function PoStatus({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const ps = charts.po_status || { total: 0, segments: [] }
  const pv = charts.po_value  || { closed: {}, open: {} }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold app-title">Purchase Order Status Analysis</h2>
        <p className="text-sm app-muted mt-0.5">Open vs Closed PO analysis by vendor</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Unique POs',     value: kpis.unique_pos },
          { label: 'Total Lines',    value: kpis.total_lines },
          { label: 'Open Lines',     value: kpis.open_lines,    color: 'text-amber-600' },
          { label: 'Closed Lines',   value: kpis.closed_lines,  color: 'text-emerald-600' },
          { label: 'Total Value',    value: `₹${kpis.total_value_cr ?? 0} Cr` },
          { label: 'Open Value',     value: `₹${kpis.open_value_cr ?? 0} Cr`, color: 'text-amber-600' },
          { label: '% Open Value',   value: `${kpis.pct_open_value ?? 0}%` },
          { label: 'Top Vendor Open',value: `${kpis.top_vendor_open ?? 0} POs` },
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
          <h3 className="text-sm font-semibold app-title mb-4">PO Status Distribution</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={(ps.segments || []).map(s => ({
                ...s, color: s.label === 'Open' ? '#f59e0b' : '#22c55e',
              }))}
              centerText={(ps.total || 0).toLocaleString()}
              centerSub="Total Lines"
            />
          </div>
          <div className="space-y-2">
            {(ps.segments || []).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm" style={{ background: s.label === 'Open' ? '#f59e0b' : '#22c55e' }} />
                  {s.label} Lines
                </span>
                <span className="font-semibold dark:text-white">
                  {(s.value || 0).toLocaleString()} ({s.label === 'Open'
                    ? `${kpis.open_lines && kpis.total_lines ? ((kpis.open_lines / kpis.total_lines) * 100).toFixed(1) : 0}%`
                    : `${kpis.closed_lines && kpis.total_lines ? ((kpis.closed_lines / kpis.total_lines) * 100).toFixed(1) : 0}%`})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="app-card rounded-xl border p-5">
          <h3 className="text-sm font-semibold app-title mb-4">PO Value (₹ Crores)</h3>
          <div className="space-y-4 mt-8">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Closed Value</span>
                <span className="font-semibold dark:text-white">₹{pv.closed?.value_cr ?? 0} Cr</span>
              </div>
              <div className="app-track rounded-full h-7 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 flex items-center justify-end pr-3"
                  style={{ width: `${pv.closed?.pct ?? 0}%` }}>
                  <span className="text-[11px] font-bold text-white">{pv.closed?.pct ?? 0}%</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Open Value</span>
                <span className="font-semibold dark:text-white">₹{pv.open?.value_cr ?? 0} Cr</span>
              </div>
              <div className="app-track rounded-full h-7 overflow-hidden">
                <div className="h-full rounded-full bg-amber-500 flex items-center justify-end pr-3"
                  style={{ width: `${Math.max(pv.open?.pct ?? 0, 1)}%` }}>
                  <span className="text-[11px] font-bold text-white">{pv.open?.pct ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tables.map(t => <DataTable key={t.title} title={t.title} rows={t.rows} />)}
    </>
  )
}
