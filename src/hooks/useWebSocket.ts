import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { APP_CONFIG } from '@/lib/constants'
import { logger } from '@/lib/logger'

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

export function useWebSocket(
  namespace: string = '',
  options: UseWebSocketOptions = {}
) {
  const {
    autoConnect = true,
    reconnectAttempts = APP_CONFIG.websocket.maxReconnectAttempts,
    reconnectInterval = APP_CONFIG.websocket.reconnectInterval,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    if (socketRef.current?.connected) return

    try {
      const url = namespace
        ? `${APP_CONFIG.websocket.url}${namespace}`
        : APP_CONFIG.websocket.url

      socketRef.current = io(url, {
        transports: ['websocket'],
        autoConnect: false,
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        logger.info('WebSocket connected', { namespace })
        setIsConnected(true)
        setConnectionError(null)
        reconnectCountRef.current = 0
      })

      socket.on('disconnect', (reason) => {
        logger.warn('WebSocket disconnected', { namespace, reason })
        setIsConnected(false)

        if (reason === 'io server disconnect') {
          // Server disconnected, need to reconnect manually
          attemptReconnect()
        }
      })

      socket.on('connect_error', (error) => {
        logger.error('WebSocket connection error', { namespace, error })
        setConnectionError(error.message)
        attemptReconnect()
      })

      socket.connect()
    } catch (error) {
      logger.error('Failed to create WebSocket connection', error)
      setConnectionError('Failed to create connection')
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setConnectionError(null)
    reconnectCountRef.current = 0
  }

  const attemptReconnect = () => {
    if (reconnectCountRef.current >= reconnectAttempts) {
      logger.error('Max reconnection attempts reached', { namespace })
      setConnectionError('Failed to reconnect after maximum attempts')
      return
    }

    reconnectCountRef.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      logger.info('Attempting to reconnect', {
        namespace,
        attempt: reconnectCountRef.current
      })
      connect()
    }, reconnectInterval)
  }

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [namespace, autoConnect])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    connect,
    disconnect,
  }
}