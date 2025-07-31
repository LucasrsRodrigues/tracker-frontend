import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'


interface AlertBadgeProps extends Omit<typeof Badge, 'children'> {
  severity: 'low' | 'medium' | 'high' | 'critical'
  status?: 'firing' | 'resolved' | 'acknowledged' | 'suppressed' | 'muted'
  showIcon?: boolean
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const severityConfig = {
  low: {
    label: 'Baixa',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Info
  },
  medium: {
    label: 'Média',
    variant: 'outline' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle
  },
  high: {
    label: 'Alta',
    variant: 'destructive' as const,
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle
  },
  critical: {
    label: 'Crítica',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  }
}

const statusConfig = {
  firing: {
    label: 'Ativo',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  },
  resolved: {
    label: 'Resolvido',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  acknowledged: {
    label: 'Reconhecido',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle
  },
  suppressed: {
    label: 'Suprimido',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle
  },
  muted: {
    label: 'Silenciado',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Clock
  }
}

const sizeConfig = {
  sm: {
    className: 'text-xs px-2 py-0.5 gap-1',
    iconSize: 'h-3 w-3'
  },
  md: {
    className: 'text-sm px-2.5 py-0.5 gap-1.5',
    iconSize: 'h-3.5 w-3.5'
  },
  lg: {
    className: 'text-sm px-3 py-1 gap-2',
    iconSize: 'h-4 w-4'
  }
}

export function AlertBadge({
  severity,
  status,
  showIcon = true,
  children,
  className,
  size = 'md',
  ...props
}: AlertBadgeProps) {
  const config = status ? statusConfig[status] : severityConfig[severity]
  const sizeStyles = sizeConfig[size]

  const Icon: LucideIcon = config.icon
  const label = children || config.label

  return (
    <Badge
      className={cn(
        'inline-flex items-center font-medium border',
        config.className,
        sizeStyles.className,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className={sizeStyles.iconSize} />}
      {label}
    </Badge>
  )
}

// Componente específico para severidade
export function SeverityBadge({
  severity,
  showIcon = true,
  size = 'md',
  className,
  ...props
}: Omit<AlertBadgeProps, 'status'>) {
  return (
    <AlertBadge
      severity={severity}
      showIcon={showIcon}
      size={size}
      className={className}
      {...props}
    />
  )
}

// Componente específico para status
export function StatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className,
  ...props
}: Omit<AlertBadgeProps, 'severity'> & { status: NonNullable<AlertBadgeProps['status']> }) {
  return (
    <AlertBadge
      severity="low" // não usado quando status é fornecido
      status={status}
      showIcon={showIcon}
      size={size}
      className={className}
      {...props}
    />
  )
}

// Utilitários para uso programático
export const getSeverityColor = (severity: AlertBadgeProps['severity']) => {
  return severityConfig[severity].className
}

export const getStatusColor = (status: NonNullable<AlertBadgeProps['status']>) => {
  return statusConfig[status].className
}

export const getSeverityIcon = (severity: AlertBadgeProps['severity']) => {
  return severityConfig[severity].icon
}

export const getStatusIcon = (status: NonNullable<AlertBadgeProps['status']>) => {
  return statusConfig[status].icon
}