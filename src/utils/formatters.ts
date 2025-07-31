import { format, formatDistanceToNow as fnsFormatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Format numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString('pt-BR')
}

/**
 * Format percentage values
 */
export function formatPercentage(num: number, decimals: number = 1): string {
  return `${num.toFixed(decimals)}%`
}

/**
 * Format duration in milliseconds
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`
  }
  if (ms < 3600000) {
    return `${(ms / 60000).toFixed(1)}m`
  }
  return `${(ms / 3600000).toFixed(1)}h`
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format dates to relative time (e.g., "2 hours ago")
 */
export function formatDistanceToNow(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return fnsFormatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: ptBR
  })
}

/**
 * Format dates to specific format
 */
export function formatDate(date: Date | string, pattern: string = 'dd/MM/yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern, { locale: ptBR })
}

/**
 * Format error severity level
 */
export function formatSeverity(severity: string): { label: string; color: string } {
  const severityMap = {
    low: { label: 'Baixa', color: 'text-green-600' },
    medium: { label: 'Média', color: 'text-yellow-600' },
    high: { label: 'Alta', color: 'text-orange-600' },
    critical: { label: 'Crítica', color: 'text-red-600' },
  }

  return severityMap[severity as keyof typeof severityMap] || { label: severity, color: 'text-gray-600' }
}

/**
 * Format event category
 */
export function formatCategory(category: string): { label: string; icon: string; color: string } {
  const categoryMap = {
    user: { label: 'Usuário', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    system: { label: 'Sistema', icon: '⚙️', color: 'bg-gray-100 text-gray-800' },
    business: { label: 'Negócio', icon: '💼', color: 'bg-green-100 text-green-800' },
    integration: { label: 'Integração', icon: '🔗', color: 'bg-purple-100 text-purple-800' },
    error: { label: 'Erro', icon: '❌', color: 'bg-red-100 text-red-800' },
    performance: { label: 'Performance', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  }

  return categoryMap[category as keyof typeof categoryMap] || {
    label: category,
    icon: '📄',
    color: 'bg-gray-100 text-gray-800'
  }
}

/**
 * Format status
 */
export function formatStatus(status: string): { label: string; color: string; bgColor: string } {
  const statusMap = {
    active: { label: 'Ativo', color: 'text-green-700', bgColor: 'bg-green-100' },
    inactive: { label: 'Inativo', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    pending: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    error: { label: 'Erro', color: 'text-red-700', bgColor: 'bg-red-100' },
    warning: { label: 'Aviso', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    success: { label: 'Sucesso', color: 'text-green-700', bgColor: 'bg-green-100' },
    healthy: { label: 'Saudável', color: 'text-green-700', bgColor: 'bg-green-100' },
    unhealthy: { label: 'Problemático', color: 'text-red-700', bgColor: 'bg-red-100' },
    degraded: { label: 'Degradado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  }

  return statusMap[status as keyof typeof statusMap] || {
    label: status,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  }
}

/**
 * Format HTTP status codes
 */
export function formatHttpStatus(code: number): { label: string; color: string } {
  if (code >= 200 && code < 300) {
    return { label: `${code} - Sucesso`, color: 'text-green-600' }
  } else if (code >= 300 && code < 400) {
    return { label: `${code} - Redirecionamento`, color: 'text-blue-600' }
  } else if (code >= 400 && code < 500) {
    return { label: `${code} - Erro do Cliente`, color: 'text-orange-600' }
  } else if (code >= 500) {
    return { label: `${code} - Erro do Servidor`, color: 'text-red-600' }
  }

  return { label: `${code}`, color: 'text-gray-600' }
}

/**
 * Format phone number (Brazilian format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Format CPF (Brazilian document)
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Format object keys to human readable format
 */
export function formatObjectKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}