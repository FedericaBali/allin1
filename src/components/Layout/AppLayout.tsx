import type { ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #FFE4F0 0%, #E8D5FF 100%)',
    }}>
      {children}
    </div>
  )
}
