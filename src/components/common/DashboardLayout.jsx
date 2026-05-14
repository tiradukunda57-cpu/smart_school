import React, { useState, useEffect, useCallback } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardLayout({ children }) {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth <= 992
    setIsMobile(mobile)
    if (mobile) {
      setCollapsed(false)
      setMobileOpen(false)
    }
  }, [])

  useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkMobile])

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => !prev)
    }
  }

  const desktopSidebarWidth = collapsed ? 72 : 272

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={handleToggle} />
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main
        className="main-content"
        style={{
          marginLeft: isMobile ? 0 : desktopSidebarWidth,
          width: isMobile ? '100%' : `calc(100% - ${desktopSidebarWidth}px)`,
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        <div className="page-container">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}