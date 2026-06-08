import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'

export default function VendorMaster({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const exc   = charts.exceptions_donut || { total: 0, segments: [] }
  const msmeBars = charts.msme_bars || []
  const msmeColors = ['bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-slate-500']

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Master Validation</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Data quality: duplicates, missing GSTIN/PAN, and MSME registration</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Vendors',  value: kpis.total_vendors },
          { label: 'Duplicates',     value: kpis.duplicates,    color: 'text-rose-600' },
          { label: 'Missing GSTIN',  value: kpis.missing_gstin, color: 'text-amber-600' },
          { label: 'Missing PAN',    value: kpis.missing_pan,   color: 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
            <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase">{k.label}</div>
            <div className={`text-xl font-bold ${k.color || 'text-slate-900 dark:text-white'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Data Quality Exceptions</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={exc.segments || []}
              centerText={(exc.total || 0).toLocaleString()}
              centerSub="Exceptions"
            />
          </div>
          <div className="space-y-2">
            {(exc.segments || []).map(s => (
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
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">MSME Registration Distribution</h3>
          <div className="space-y-3 mt-4">
            {msmeBars.map((b, i) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-24">{b.label}</span>
                <div className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
                  <div className={`h-full rounded-full ${msmeColors[i % 4]} flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(b.pct, 1)}%` }}>
                    <span className="text-[10px] font-bold text-white">{(b.value || 0).toLocaleString()}</span>
                  </div>
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
