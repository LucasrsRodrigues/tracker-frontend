import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'global'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  isDetailsOpen: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isDetailsOpen: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log do erro
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Callback personalizado
    this.props.onError?.(error, errorInfo)

    // Enviar erro para serviço de monitoramento
    this.logErrorToService(error, errorInfo)
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        id: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        level: this.props.level || 'component',
      }

      // Aqui você enviaria para seu serviço de tracking de erros
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      })
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        isDetailsOpen: false,
      })
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  private toggleDetails = () => {
    this.setState(prev => ({ isDetailsOpen: !prev.isDetailsOpen }))
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback
      }

      // UI de erro padrão
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informações básicas do erro */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ID do Erro</span>
                </div>
                <code className="text-sm bg-background px-2 py-1 rounded">
                  {this.state.errorId}
                </code>
              </div>

              {/* Detalhes técnicos (colapsível) */}
              <Collapsible open={this.state.isDetailsOpen} onOpenChange={this.toggleDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {this.state.isDetailsOpen ? 'Ocultar' : 'Mostrar'} detalhes técnicos
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="space-y-4">
                    {/* Mensagem de erro */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Mensagem de Erro:</h4>
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <code className="text-sm text-destructive">
                          {this.state.error?.message}
                        </code>
                      </div>
                    </div>

                    {/* Stack trace */}
                    {this.state.error?.stack && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Stack Trace:</h4>
                        <div className="bg-muted rounded p-3 max-h-40 overflow-auto">
                          <pre className="text-xs">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Component stack */}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Component Stack:</h4>
                        <div className="bg-muted rounded p-3 max-h-40 overflow-auto">
                          <pre className="text-xs">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3">
                {this.retryCount < this.maxRetries && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente ({this.maxRetries - this.retryCount} restantes)
                  </Button>
                )}

                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>

                <Button variant="outline" onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar página
                </Button>
              </div>

              {/* Informações de suporte */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Se o problema persistir, entre em contato com o suporte</p>
                <p>e informe o ID do erro acima.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook para usar o ErrorBoundary de forma mais simples
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const throwError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { throwError, clearError }
}

// Componente wrapper para páginas
interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
}

export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in page ${pageName}:`, error, errorInfo)
  }

  return (
    <ErrorBoundary level="page" onError={handleError}>
      {children}
    </ErrorBoundary>
  )
}

// Componente wrapper para componentes menores
interface ComponentErrorBoundaryProps {
  children: ReactNode
  componentName?: string
  fallback?: ReactNode
}

export function ComponentErrorBoundary({
  children,
  componentName,
  fallback
}: ComponentErrorBoundaryProps) {
  const defaultFallback = (
    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Erro ao carregar {componentName || 'componente'}
        </span>
      </div>
    </div>
  )

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error(`Error in component ${componentName}:`, error, errorInfo)
  }

  return (
    <ErrorBoundary
      level="component"
      fallback={fallback || defaultFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}