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
    <header className="app-header sticky top-0 z-30 border-b">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 -ml-1.5 rounded-md app-row-hover app-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="flex flex-col">
            <div className="app-label mb-0.5">
              IKIO Technologies Limited
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight app-title">
                {title}
              </h1>
              <span className="app-faint hidden sm:block">|</span>
              <span className="text-sm font-medium app-muted hidden sm:block">
                P2P Audit Report • FY 2026-27
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-medium">
          <div className="hidden sm:flex items-center gap-1.5 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-md ring-1 ring-inset ring-green-600/20 dark:ring-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            All Data Verified
          </div>
          <div className="w-px h-4 border-l app-divider hidden sm:block"></div>
          <span className="app-muted bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border app-divider">
            Version: Final
          </span>
        </div>
      </div>
    </header>
  )
}
