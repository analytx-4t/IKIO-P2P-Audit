import React from 'react'
import DonutChart from '../components/DonutChart'
import DataTable from '../components/DataTable'
import { BAR_COLORS } from '../theme'

export default function VendorMaster({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const tables = data?.tables || []

  const exc   = charts.exceptions_donut || { total: 0, segments: [] }
  const msmeBars = charts.msme_bars || []
  const msmeColors = [BAR_COLORS.success, BAR_COLORS.info, BAR_COLORS.warning, BAR_COLORS.neutral]

  return (
    <>
      <div className="mb-6">
        <h2 className="section-title">Vendor Master Validation</h2>
        <p className="section-subtitle">Data quality: duplicates, missing GSTIN/PAN, and MSME registration</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Vendors',  value: kpis.total_vendors },
          { label: 'Duplicates',     value: kpis.duplicates,    color: 'metric-risk' },
          { label: 'Missing GSTIN',  value: kpis.missing_gstin, color: 'metric-warning' },
          { label: 'Missing PAN',    value: kpis.missing_pan,   color: 'metric-warning' },
        ].map(k => (
          <div key={k.label} className="app-card rounded-lg p-5">
            <div className="app-label mb-3">{k.label}</div>
            <div className={`metric-value ${k.color || 'app-title'}`}>{k.value ?? '—'}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">Data Quality Exceptions</h3>
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

        <div className="app-card rounded-lg p-5">
          <h3 className="text-sm font-semibold app-title mb-4">MSME Registration Distribution</h3>
          <div className="space-y-3 mt-4">
            {msmeBars.map((b, i) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="text-xs app-muted w-24">{b.label}</span>
                <div className="flex-1 app-track rounded-full h-6 overflow-hidden">
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
