import React from 'react'

export default function Footer() {
  return (
    <>
      <footer className="app-footer" style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--white)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span>© 2024 EduManage</span>
        <span className="footer-tagline">Built with ❤️ for Education</span>
      </footer>
      <style>{`
        @media (max-width: 480px) {
          .app-footer {
            flex-direction: column !important;
            text-align: center !important;
            padding: 1rem !important;
            font-size: 0.75rem !important;
          }
          .footer-tagline {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}