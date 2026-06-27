import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/Auth/LoginPage'
import AppLayout from './components/Layout/AppLayout'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #FFE4F0 0%, #E8D5FF 100%)',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(232,121,160,0.3)',
          borderTopColor: '#E879A0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          user ? (
            <AppLayout>
              <Routes>
                <Route path="/" element={<CalendarPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
              </Routes>
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}
