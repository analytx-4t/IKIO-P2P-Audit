import React from 'react'
import DonutChart from '../components/DonutChart'
import BarRow from '../components/BarRow'
import RiskTable from '../components/RiskTable'

function Kpi({ label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-4">
      <div className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-xl font-bold ${color || 'text-slate-900 dark:text-white'}`}>{value ?? '—'}</div>
      {sub && <div className="text-[11px] text-slate-600 dark:text-slate-400">{sub}</div>}
    </div>
  )
}

export default function Executive({ data }) {
  const kpis   = data?.kpis   || {}
  const charts = data?.charts || {}
  const risks  = data?.top_risks || []

  const poChart   = charts.po_status    || { total: 0, segments: [] }
  const twChart   = charts.three_way    || { total: 0, segments: [] }
  const agingBars = charts.payment_aging || []

  // Legend dots for donuts
  const poSegs = poChart.segments || []
  const twSegs = (twChart.segments || []).slice(0, 5)

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Key Performance Indicators, Charts, and Top Risks</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Kpi label="PO Value"        value={`₹${kpis.po_value_cr ?? 0} Cr`}      sub={`Open: ₹${kpis.open_value_cr ?? 0} Cr`} />
        <Kpi label="AP Outstanding"  value={`₹${kpis.ap_outstanding_cr ?? 0} Cr`} sub={`Total AP Invoices: ${(kpis.ap_invoices ?? 0).toLocaleString()}`} color="text-orange-600 dark:text-orange-400" />
        <Kpi label="MSME Breaches"   value={kpis.msme_breaches ?? 0}             sub="45-Day Rule violations" color="text-rose-600 dark:text-rose-400" />
        <Kpi label="Late / Overdue"  value={kpis.late_overdue ?? 0}              sub="Invoices past due"      color="text-rose-600 dark:text-rose-400" />
        <Kpi label="Qty Variance >5%" value={kpis.qty_above_5pct ?? 0}           sub="Out of tolerance"       color="text-rose-600 dark:text-rose-400" />
        <Kpi label="Potential Savings" value={`₹${kpis.savings_l ?? 0} L`}       sub="Price leakage opportunity" color="text-emerald-600 dark:text-emerald-400" />
        <Kpi label="3-Way Perfect"   value={kpis.threeway_perfect ?? 0}          sub={`Match Rate: ${kpis.threeway_pct ?? 0}%`} />
        <Kpi label="Vendor Issues"   value={kpis.vendor_issues ?? 0}             sub={`${kpis.duplicates ?? 0} Dup + ${kpis.missing_gstin ?? 0} Missing GSTIN`} color="text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* PO Status donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">PO Status Distribution</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={poSegs.map(s => ({ ...s, color: s.label === 'Open' ? '#ea580c' : '#22c55e' }))}
              centerText={(poChart.total || 0).toLocaleString()}
              centerSub="Total Lines"
            />
          </div>
          <div className="space-y-1.5 text-sm">
            {poSegs.map(s => (
              <div key={s.label} className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.label === 'Open' ? '#ea580c' : '#22c55e' }} />
                  {s.label}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Way match donut */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">3-Way Match Status</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              segments={twSegs}
              centerText={(twChart.total || 0).toLocaleString()}
              centerSub="Total Lines"
            />
          </div>
          <div className="space-y-1 text-xs">
            {twSegs.map(s => (
              <div key={s.label} className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-semibold dark:text-white">{(s.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment aging bars */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Payment Aging</h3>
          <div className="space-y-2">
            {agingBars.map(b => (
              <BarRow key={b.label} label={b.label} value={b.value} pct={b.pct} color={`bg-[${b.color}]`} />
            ))}
          </div>
        </div>
      </div>

      <RiskTable risks={risks} />
    </>
  )
}
