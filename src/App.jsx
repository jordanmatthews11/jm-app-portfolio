import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import PortfolioPage from './pages/PortfolioPage'
import AdminPage from './pages/AdminPage'
import RedirectResolver from './pages/RedirectResolver'
import { RESERVED_SLUGS } from './hooks/useRedirects'

const HomePage = lazy(() => import('./pages/HomePage'))

function AppContent() {
  const { user, loading, signOut, isAllowed, firebaseError } = useAuth()

  if (firebaseError) {
    return (
      <div className="auth-loading auth-denied">
        <p className="firebase-config-title">Firebase configuration error</p>
        <p className="firebase-config-message">{firebaseError}</p>
        <p className="firebase-config-hint">
          Copy <code>.env.example</code> to <code>.env</code> and add your Firebase web app config (Project settings → Your apps). Make sure <code>VITE_FIREBASE_API_KEY</code> is correct and restart the dev server.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <span>Loading…</span>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  if (!isAllowed) {
    return (
      <div className="auth-loading auth-denied">
        <p>Access not allowed.</p>
        <button type="button" className="btn btn-secondary" onClick={signOut}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="auth-loading"><span>Loading…</span></div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function AppRouter() {
  const location = useLocation()
  const pathname = location.pathname
  const segments = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean)
  const isOneSegment = segments.length === 1
  const slug = segments[0]
  const isReserved = RESERVED_SLUGS.includes(slug)
  const isShortlinkPath = isOneSegment && !isReserved

  if (isShortlinkPath) {
    return <RedirectResolver slug={slug} />
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
