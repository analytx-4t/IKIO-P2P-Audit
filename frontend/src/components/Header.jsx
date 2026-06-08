import React from 'react'
import { useStore } from '../store'

const SECTION_TITLES = {
  cover:        'Cover',
  executive:    'Executive Dashboard',
  postatus:     'PO Status Analysis',
  gateentry:    'Gate Entry Date Check',
  qtyvariance:  'Quantity Variance',
  pricevariance:'Price Variance & Savings',
  glbalances:   'GL Vendor Balances',
  paymentaging: 'Payment Aging',
  msme:         'MSME Compliance',
  vendormaster: 'Vendor Master',
  grpoexcept:   'GRPO Exceptions',
  threeway:     '3-Way Matching',
  datamap:      'Data Map & Logic',
  appendix:     'Appendix',
}

export default function Header({ onMenuClick }) {
  const { activeSection } = useStore()
  const title = SECTION_TITLES[activeSection] || activeSection

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-300 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 lg:px-8 h-14">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">IKIO Technologies Limited</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All Data Verified
          </span>
          <span className="text-xs text-slate-500">vFinal</span>
        </div>
      </div>
    </header>
  )
}
