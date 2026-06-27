import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { Language } from '../../types'

const translations = {
  it: {
    subtitle: 'Il tuo calendario tutto in uno',
    google: 'Continua con Google',
    microsoft: 'Continua con Microsoft',
    tagline: 'Sincronizza Google Calendar e Outlook in un unico posto',
    error: 'Errore durante il login. Riprova.',
  },
  en: {
    subtitle: 'Your all-in-one calendar',
    google: 'Continue with Google',
    microsoft: 'Continue with Microsoft',
    tagline: 'Sync Google Calendar and Outlook in one place',
    error: 'Login error. Please try again.',
  },
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithMicrosoft } = useAuth()
  const [lang, setLang] = useState<Language>('it')
  const [error, setError] = useState<string | null>(null)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'microsoft' | null>(null)

  const t = translations[lang]

  async function handleGoogle() {
    setError(null)
    setLoadingProvider('google')
    try {
      await signInWithGoogle()
    } catch {
      setError(t.error)
      setLoadingProvider(null)
    }
  }

  async function handleMicrosoft() {
    setError(null)
    setLoadingProvider('microsoft')
    try {
      await signInWithMicrosoft()
    } catch {
      setError(t.error)
      setLoadingProvider(null)
    }
  }

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Language toggle */}
      <div style={styles.langToggle}>
        <button
          style={{ ...styles.langBtn, ...(lang === 'it' ? styles.langBtnActive : {}) }}
          onClick={() => setLang('it')}
        >
          IT
        </button>
        <button
          style={{ ...styles.langBtn, ...(lang === 'en' ? styles.langBtnActive : {}) }}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>

      {/* Card */}
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#lg)" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E879A0" />
                  <stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <text x="18" y="25" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">A</text>
            </svg>
          </div>
          <h1 style={styles.appName}>Allin1</h1>
        </div>

        <p style={styles.subtitle}>{t.subtitle}</p>
        <p style={styles.tagline}>{t.tagline}</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Google button */}
        <button
          style={styles.googleBtn}
          onClick={handleGoogle}
          disabled={loadingProvider !== null}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>{loadingProvider === 'google' ? '...' : t.google}</span>
        </button>

        {/* Microsoft button */}
        <button
          style={styles.microsoftBtn}
          onClick={handleMicrosoft}
          disabled={loadingProvider !== null}
        >
          <svg width="20" height="20" viewBox="0 0 23 23">
            <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
            <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
          </svg>
          <span>{loadingProvider === 'microsoft' ? '...' : t.microsoft}</span>
        </button>

        {/* Decorative dots */}
        <div style={styles.dots}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ ...styles.dot, opacity: 0.3 + i * 0.15 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FFE4F0 0%, #E8D5FF 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,121,160,0.3) 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
    bottom: '-150px',
    right: '-150px',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,157,0.2) 0%, transparent 70%)',
    top: '50%',
    left: '60%',
    pointerEvents: 'none',
  },
  langToggle: {
    position: 'absolute',
    top: 24,
    right: 24,
    display: 'flex',
    gap: 4,
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
    borderRadius: 20,
    padding: '4px',
    border: '1px solid rgba(255,255,255,0.8)',
  },
  langBtn: {
    padding: '4px 12px',
    borderRadius: 16,
    border: 'none',
    background: 'transparent',
    color: '#4a4a6a',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  langBtnActive: {
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    color: 'white',
  },
  card: {
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.9)',
    borderRadius: 28,
    boxShadow: '0 20px 60px rgba(168,85,247,0.2), 0 4px 20px rgba(232,121,160,0.15)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  logoIcon: {
    display: 'flex',
  },
  appName: {
    fontSize: 42,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#4a4a6a',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: '#8a8aaa',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 1.5,
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '10px 16px',
    color: '#dc2626',
    fontSize: 13,
    marginBottom: 16,
    width: '100%',
    textAlign: 'center',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: '14px 24px',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a2e',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  microsoftBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    padding: '14px 24px',
    background: '#0078d4',
    border: '2px solid #0078d4',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 24,
    boxShadow: '0 2px 8px rgba(0,120,212,0.3)',
  },
  dots: {
    display: 'flex',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #E879A0, #A855F7)',
  },
}
