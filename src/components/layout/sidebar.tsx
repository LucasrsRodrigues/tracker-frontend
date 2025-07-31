import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Users,
  Activity,
  List,
  AlertTriangle,
  Bell,
  Zap,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: BarChart3,
    description: 'Visão geral do sistema'
  },
  {
    title: 'Analytics',
    href: ROUTES.ANALYTICS,
    icon: TrendingUp,
    description: 'Métricas e análises'
  },
  {
    title: 'Jornada do Usuário',
    href: ROUTES.USER_JOURNEY,
    icon: Users,
    description: 'Análise de jornadas'
  },
  {
    title: 'Monitoramento',
    href: ROUTES.MONITORING,
    icon: Activity,
    description: 'Tempo real'
  },
  {
    title: 'Eventos',
    href: ROUTES.EVENTS,
    icon: List,
    description: 'Lista de eventos'
  },
  {
    title: 'Erros',
    href: ROUTES.ERRORS,
    icon: AlertTriangle,
    description: 'Tracking de erros'
  },
  {
    title: 'Alertas',
    href: ROUTES.ALERTS,
    icon: Bell,
    description: 'Sistema de alertas'
  },
  {
    title: 'Integrações',
    href: ROUTES.INTEGRATIONS,
    icon: Zap,
    description: 'Provedores externos'
  },
  {
    title: 'Performance',
    href: ROUTES.PERFORMANCE,
    icon: Activity,
    description: 'Métricas de performance'
  },
  {
    title: 'Relatórios',
    href: ROUTES.REPORTS,
    icon: FileText,
    description: 'Relatórios e exports'
  }
]

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation()

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full bg-background border-r transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16",
        "lg:translate-x-0",
        !open && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b px-4">
            {open ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Tracking Platform</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <NavLink key={item.href} to={item.href}>
                  {({ isActive: linkIsActive }) => (
                    <div className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      (isActive || linkIsActive) && "bg-accent text-accent-foreground font-medium"
                    )}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {open && (
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-2">
            {/* Toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(!open)}
              className={cn(
                "w-full",
                open ? "justify-start" : "justify-center"
              )}
            >
              {open ? (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Recolher
                </>
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Settings link */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full mt-1",
                open ? "justify-start" : "justify-center"
              )}
            >
              <Settings className="h-4 w-4" />
              {open && <span className="ml-2">Configurações</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}