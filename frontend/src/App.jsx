import React, { useEffect } from 'react'
import { useStore } from './store'
import UploadPage  from './pages/UploadPage'
import LoadingPage from './pages/LoadingPage'
import Dashboard   from './pages/Dashboard'

export default function App() {
  const { page, initTheme } = useStore()

  useEffect(() => {
    initTheme()
  }, [])

  if (page === 'loading')   return <LoadingPage />
  if (page === 'dashboard') return <Dashboard />
  return <UploadPage />
}
