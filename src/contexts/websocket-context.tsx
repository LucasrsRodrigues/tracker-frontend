import { createContext, useContext, useRef, useEffect, useCallback, useState, type ReactNode } from 'react'
import { APP_CONFIG } from '@/lib/constants'

type WebSocketMessage = {
  type: string
  payload: any
  timestamp: number
}

type MessageHandler = (message: WebSocketMessage) => void

interface WebSocketContextType {
  isConnected: boolean
  isConnecting: boolean
  subscribe: (type: string, handler: MessageHandler) => () => void
  unsubscribe: (type: string, handler: MessageHandler) => void
  send: (message: WebSocketMessage) => void
  reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const ws = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const messageHandlers = useRef<Map<string, Set<MessageHandler>>>(new Map())

  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    setIsConnecting(true)

    try {
      ws.current = new WebSocket(APP_CONFIG.websocket.url)

      ws.current.onopen = () => {
        console.log('WebSocket conectado')
        setIsConnected(true)
        setIsConnecting(false)
        reconnectAttempts.current = 0
      }

      ws.current.onclose = (event) => {
        console.log('WebSocket desconectado:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)

        // Tentar reconectar se não foi um fechamento intencional
        if (event.code !== 1000 && reconnectAttempts.current < APP_CONFIG.websocket.maxReconnectAttempts) {
          reconnectAttempts.current++
          console.log(`Tentativa de reconexão ${reconnectAttempts.current}/${APP_CONFIG.websocket.maxReconnectAttempts}`)

          reconnectTimeout.current = setTimeout(() => {
            connect()
          }, APP_CONFIG.websocket.reconnectInterval)
        }
      }

      ws.current.onerror = (error) => {
        console.error('Erro no WebSocket:', error)
        setIsConnecting(false)
      }

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          // Distribuir mensagem para handlers registrados
          const handlers = messageHandlers.current.get(message.type)
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(message)
              } catch (error) {
                console.error('Erro ao processar mensagem WebSocket:', error)
              }
            })
          }

          // Handler para mensagens genéricas (tipo *)
          const genericHandlers = messageHandlers.current.get('*')
          if (genericHandlers) {
            genericHandlers.forEach(handler => {
              try {
                handler(message)
              } catch (error) {
                console.error('Erro ao processar mensagem genérica:', error)
              }
            })
          }
        } catch (error) {
          console.error('Erro ao parsear mensagem WebSocket:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }

    if (ws.current) {
      ws.current.close(1000, 'Desconexão intencional')
      ws.current = null
    }
  }, [])

  const subscribe = useCallback((type: string, handler: MessageHandler) => {
    if (!messageHandlers.current.has(type)) {
      messageHandlers.current.set(type, new Set())
    }

    messageHandlers.current.get(type)!.add(handler)

    // Retornar função de cleanup
    return () => {
      unsubscribe(type, handler)
    }
  }, [])

  const unsubscribe = useCallback((type: string, handler: MessageHandler) => {
    const handlers = messageHandlers.current.get(type)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        messageHandlers.current.delete(type)
      }
    }
  }, [])

  const send = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket não está conectado. Mensagem não enviada:', message)
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttempts.current = 0
    setTimeout(connect, 1000)
  }, [connect, disconnect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    subscribe,
    unsubscribe,
    send,
    reconnect,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error('useWebSocket deve ser usado dentro de um WebSocketProvider')
  }
  return context
}

// Hook especializado para dados em tempo real
export function useRealTimeData<T>(dataType: string, initialData?: T) {
  const { subscribe, isConnected } = useWebSocket()
  const [data, setData] = useState<T | undefined>(initialData)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = subscribe(dataType, (message) => {
      setData(message.payload)
      setLastUpdate(new Date())
    })

    return unsubscribe
  }, [subscribe, dataType])

  return { data, lastUpdate, isConnected }
}