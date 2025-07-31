import { ChevronRight, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  current?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  showHome?: boolean
  homeHref?: string
  maxItems?: number
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/analytics': 'Analytics',
  '/user-journey': 'Jornada do Usuário',
  '/monitoring': 'Monitoramento',
  '/events': 'Eventos',
  '/errors': 'Erros',
  '/alerts': 'Alertas',
  '/integrations': 'Integrações',
  '/performance': 'Performance',
  '/reports': 'Relatórios'
}

export function Breadcrumbs({
  items,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  showHome = true,
  homeHref = '/dashboard',
  maxItems = 5
}: BreadcrumbsProps) {
  const location = useLocation()

  // Auto-generate breadcrumbs from current route if no items provided
  const generatedItems = items || generateBreadcrumbsFromRoute(location.pathname)

  // Add home breadcrumb if enabled
  const allItems: BreadcrumbItem[] = showHome
    ? [
      {
        label: 'Home',
        href: homeHref,
        icon: Home
      },
      ...generatedItems
    ]
    : generatedItems

  // Truncate items if exceeding maxItems
  const displayItems = allItems.length > maxItems
    ? [
      allItems[0], // Always show first item
      { label: '...', current: false }, // Ellipsis
      ...allItems.slice(-2) // Show last 2 items
    ]
    : allItems

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm", className)}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1
          const isCurrent = item.current || isLast
          const Icon = item.icon

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 select-none">
                  {separator}
                </span>
              )}

              {item.label === '...' ? (
                <span className="text-muted-foreground select-none">...</span>
              ) : (
                <div className="flex items-center">
                  {Icon && <Icon className="h-4 w-4 mr-1.5" />}

                  {item.href && !isCurrent ? (
                    <Link
                      to={item.href}
                      className={cn(
                        "font-medium transition-colors hover:text-foreground",
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "font-medium",
                        isCurrent
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function generateBreadcrumbsFromRoute(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []

  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Get label from predefined routes or format segment
    const label = routeLabels[currentPath] || formatSegment(segment)

    items.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast
    })
  })

  return items
}

function formatSegment(segment: string): string {
  // Handle IDs (UUIDs, numbers, etc.)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return `${segment.slice(0, 8)}...`
  }

  if (/^\d+$/.test(segment)) {
    return `#${segment}`
  }

  // Format kebab-case to title case
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Hook for programmatic breadcrumb management
export function useBreadcrumbs() {
  const location = useLocation()

  const setBreadcrumbs = (items: BreadcrumbItem[]) => {
    // This could be implemented with a context if needed
    // For now, it's just a placeholder
    console.log('Setting breadcrumbs:', items)
  }

  const addBreadcrumb = (item: BreadcrumbItem) => {
    // Add breadcrumb to current path
    console.log('Adding breadcrumb:', item)
  }

  return {
    currentPath: location.pathname,
    setBreadcrumbs,
    addBreadcrumb
  }
}