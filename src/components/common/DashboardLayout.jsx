import React, { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 992
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(prev => !prev)
    } else {
      setCollapsed(prev => !prev)
    }
  }

  const mainStyle = {
    marginLeft: isMobile ? 0 : (collapsed ? 72 : 260),
    width: isMobile ? '100%' : `calc(100% - ${collapsed ? 72 : 260}px)`,
  }

  return (
    <div className="app-layout">
      <Navbar onToggleSidebar={handleToggle} />
      <Sidebar
        collapsed={isMobile ? true : collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main
        className="main-content"
        style={{
          ...mainStyle,
          transition: 'all 0.3s ease',
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