import React from 'react'
import KpiCard from '../components/KpiCard'

const NAV_ITEMS = [
  {n:1,c:'brand',label:'Cover — Overview & KPIs'},{n:2,c:'brand',label:'Executive Dashboard — KPIs & Charts'},
  {n:3,c:'slate',label:'Data Map & Logic — Sources & Joins'},{n:4,c:'slate',label:'PO Status Analysis — Open/Closed'},
  {n:5,c:'slate',label:'Gate Entry Date Check — Integrity'},{n:6,c:'slate',label:'Quantity Variance — Tolerance Analysis'},
  {n:7,c:'slate',label:'Price Variance & Savings'},{n:8,c:'slate',label:'GL Vendor Balances'},
  {n:9,c:'slate',label:'Payment Aging Analysis'},{n:10,c:'slate',label:'MSME Compliance — 45-Day Rule'},
  {n:11,c:'slate',label:'Vendor Master Validation'},{n:12,c:'slate',label:'GRPO Exceptions'},
  {n:13,c:'slate',label:'3-Way Matching'},{n:14,c:'slate',label:'Appendix — Methodology & Glossary'},
]

export default function Cover({ data }) {
  const kpis = data?.kpis || {}

  const cards = [
    { label: 'Records',      value: (kpis.purchase_orders ?? '—').toLocaleString?.() ?? kpis.purchase_orders, sub: 'Purchase Orders',       color: 'text-slate-900 dark:text-white' },
    { label: 'Documents',    value: (kpis.grpo_documents ?? '—').toLocaleString?.() ?? kpis.grpo_documents,   sub: 'GRPO Documents',         color: 'text-slate-900 dark:text-white' },
    { label: 'Entries',      value: (kpis.gate_entries ?? '—').toLocaleString?.() ?? kpis.gate_entries,       sub: 'Gate Entries',           color: 'text-slate-900 dark:text-white' },
    { label: 'Invoices',     value: (kpis.ap_invoices ?? '—').toLocaleString?.() ?? kpis.ap_invoices,         sub: 'AP Invoices',            color: 'text-slate-900 dark:text-white' },
    { label: 'Transactions', value: (kpis.gl_transactions ?? '—').toLocaleString?.() ?? kpis.gl_transactions, sub: 'GL Transactions',        color: 'text-slate-900 dark:text-white' },
    { label: 'Master',       value: (kpis.vendor_records ?? '—').toLocaleString?.() ?? kpis.vendor_records,   sub: 'Vendor Master Records',  color: 'text-slate-900 dark:text-white' },
    { label: 'Active',       value: (kpis.active_vendors ?? '—').toLocaleString?.() ?? kpis.active_vendors,   sub: 'Active Vendors',         color: 'text-slate-900 dark:text-white' },
    { label: 'Sheets',       value: '14',                                                                      sub: 'Report Sheets',          color: 'text-slate-900 dark:text-white' },
  ]

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">IKIO Technologies Limited</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Procure-to-Pay (P2P) Comprehensive Audit Report — FY 2026-27</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                {c.label}
              </span>
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-700 p-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Report Navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {NAV_ITEMS.map(item => (
            <div key={item.n} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
              <span className={`w-6 h-6 rounded-md bg-${item.c === 'brand' ? 'brand-600' : 'slate-500'} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                {item.n}
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
