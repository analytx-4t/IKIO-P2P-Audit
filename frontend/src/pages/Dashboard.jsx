import React, { useState } from 'react'
import { useStore } from '../store'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

import Cover        from '../sections/Cover'
import Executive    from '../sections/Executive'
import PoStatus     from '../sections/PoStatus'
import GateEntry    from '../sections/GateEntry'
import QtyVariance  from '../sections/QtyVariance'
import PriceVariance from '../sections/PriceVariance'
import GlBalances   from '../sections/GlBalances'
import PaymentAging from '../sections/PaymentAging'
import Msme         from '../sections/Msme'
import VendorMaster from '../sections/VendorMaster'
import GrpoExcept   from '../sections/GrpoExcept'
import ThreeWay     from '../sections/ThreeWay'
import DataMap      from '../sections/DataMap'
import Appendix     from '../sections/Appendix'

const SECTIONS = {
  cover:         Cover,
  executive:     Executive,
  postatus:      PoStatus,
  gateentry:     GateEntry,
  qtyvariance:   QtyVariance,
  pricevariance: PriceVariance,
  glbalances:    GlBalances,
  paymentaging:  PaymentAging,
  msme:          Msme,
  vendormaster:  VendorMaster,
  grpoexcept:    GrpoExcept,
  threeway:      ThreeWay,
  datamap:       DataMap,
  appendix:      Appendix,
}

export default function Dashboard() {
  const { activeSection, results } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const Section = SECTIONS[activeSection] || Cover
  const sectionData = results?.[activeSection] || {}

  return (
    <div className="app-bg flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <div className="page-section">
            <Section data={sectionData} results={results} />
          </div>
        </main>
      </div>
    </div>
  )
}
