import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  current?: boolean
}

interface PageAction {
  label: string
  onClick?: () => void
  href?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  icon?: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface PageHeaderProps {
  title: string
  description?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  breadcrumbs?: BreadcrumbItem[]
  actions?: PageAction[]
  children?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PageHeader({
  title,
  description,
  badge,
  breadcrumbs,
  actions,
  children,
  className,
  size = 'md'
}: PageHeaderProps) {
  const sizeStyles = {
    sm: {
      title: 'text-2xl',
      description: 'text-sm',
      spacing: 'space-y-2',
      padding: 'pb-4'
    },
    md: {
      title: 'text-3xl',
      description: 'text-base',
      spacing: 'space-y-3',
      padding: 'pb-6'
    },
    lg: {
      title: 'text-4xl',
      description: 'text-lg',
      spacing: 'space-y-4',
      padding: 'pb-8'
    }
  }

  const styles = sizeStyles[size]

  return (
    <div className={cn('border-b bg-background', styles.padding, className)}>
      <div className={cn('space-y-4', styles.spacing)}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}

        {/* Main header content */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
          {/* Title section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className={cn('font-bold tracking-tight', styles.title)}>
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'secondary'}>
                  {badge.text}
                </Badge>
              )}
            </div>

            {description && (
              <p className={cn('text-muted-foreground max-w-3xl', styles.description)}>
                {description}
              </p>
            )}
          </div>

          {/* Actions section */}
          {(actions || children) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions?.map((action, index) => {
                const Icon = action.icon

                return (
                  <Button
                    key={index}
                    variant={action.variant || 'default'}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    asChild={!!action.href}
                  >
                    {action.href ? (
                      <a href={action.href}>
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {action.label}
                      </a>
                    ) : (
                      <>
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {action.label}
                      </>
                    )}
                  </Button>
                )
              })}

              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para sub-headers dentro de páginas
interface SubHeaderProps {
  title: string
  description?: string
  actions?: PageAction[]
  children?: React.ReactNode
  className?: string
}

export function SubHeader({
  title,
  description,
  actions,
  children,
  className
}: SubHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0', className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex items-center gap-2">
          {actions?.map((action, index) => {
            const Icon = action.icon

            return (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href}>
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </a>
                ) : (
                  <>
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </>
                )}
              </Button>
            )
          })}

          {children}
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar estado do header
export function usePageHeader() {
  const setTitle = (title: string) => {
    document.title = `${title} | Tracking Platform`
  }

  const setMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
  }

  return {
    setTitle,
    setMetaDescription
  }
}