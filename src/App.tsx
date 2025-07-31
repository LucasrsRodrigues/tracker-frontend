import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { WebSocketProvider } from '@/contexts/websocket-context'

// Lazy load modules for better performance
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const AnalyticsPage = lazy(() => import('@/modules/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })))
const UserJourneyPage = lazy(() => import('@/modules/user-journey/pages/JourneyOverviewPage').then(m => ({ default: m.JourneyOverviewPage })))
const MonitoringPage = lazy(() => import('@/modules/monitoring/pages/MonitoringPage').then(m => ({ default: m.MonitoringPage })))
const EventsPage = lazy(() => import('@/modules/events/pages/EventsListPage').then(m => ({ default: m.EventsListPage })))
const ErrorsPage = lazy(() => import('@/modules/errors/pages/ErrorsOverviewPage').then(m => ({ default: m.ErrorsOverviewPage })))
const AlertsPage = lazy(() => import('@/modules/alerts/pages/AlertsPage').then(m => ({ default: m.AlertsPage })))
const IntegrationsPage = lazy(() => import('@/modules/integrations/pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
const PerformancePage = lazy(() => import('@/modules/performance/pages/PerformancePage').then(m => ({ default: m.PerformancePage })))
const ReportsPage = lazy(() => import('@/modules/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tracking-ui-theme">
      <AuthProvider>
        <WebSocketProvider>
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/user-journey" element={<UserJourneyPage />} />
                <Route path="/monitoring" element={<MonitoringPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/errors" element={<ErrorsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </WebSocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App