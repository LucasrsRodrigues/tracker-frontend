import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Search,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface JsonViewerProps {
  data: any
  title?: string
  searchable?: boolean
  collapsible?: boolean
  showDataTypes?: boolean
  maxDepth?: number
  className?: string
}

interface JsonNodeProps {
  data: any
  keyName?: string
  level: number
  maxDepth: number
  searchTerm: string
  showDataTypes: boolean
  path: string
}

export function JsonViewer({
  data,
  title = 'JSON Data',
  searchable = true,
  collapsible = true,
  showDataTypes = true,
  maxDepth = Infinity,
  className
}: JsonViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']))
  const [showRawJson, setShowRawJson] = useState(false)

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy JSON:', err)
    }
  }, [data])

  const downloadJson = useCallback(() => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [data])

  const togglePath = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }, [])

  const getDataType = (value: any): string => {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-green-600'
      case 'number': return 'text-blue-600'
      case 'boolean': return 'text-purple-600'
      case 'null': return 'text-gray-500'
      case 'object': return 'text-orange-600'
      case 'array': return 'text-pink-600'
      default: return 'text-gray-600'
    }
  }

  const highlightSearch = (text: string, search: string): React.ReactNode => {
    if (!search.trim()) return text

    const parts = text.split(new RegExp(`(${search})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ?
        <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> :
        part
    )
  }

  const shouldHighlight = (value: string, path: string): boolean => {
    if (!searchTerm.trim()) return false
    return value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.toLowerCase().includes(searchTerm.toLowerCase())
  }

  const JsonNode: React.FC<JsonNodeProps> = ({
    data,
    keyName,
    level,
    maxDepth,
    searchTerm,
    showDataTypes,
    path
  }) => {
    const dataType = getDataType(data)
    const isExpandable = (dataType === 'object' || dataType === 'array') && data !== null
    const isExpanded = expandedPaths.has(path)
    const shouldCollapse = level >= maxDepth
    const isHighlighted = shouldHighlight(String(data), path)

    if (shouldCollapse && !isExpanded) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePath(path)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isExpandable ? '...' : String(data)}
          </button>
        </div>
      )
    }

    if (!isExpandable) {
      const valueStr = dataType === 'string' ? `"${data}"` : String(data)
      return (
        <div className={cn("flex items-center gap-2", isHighlighted && "bg-yellow-50 rounded px-1")}>
          {keyName && (
            <span className="text-gray-700 font-medium">
              {highlightSearch(keyName, searchTerm)}:
            </span>
          )}
          <span className={getTypeColor(dataType)}>
            {highlightSearch(valueStr, searchTerm)}
          </span>
          {showDataTypes && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              {dataType}
            </Badge>
          )}
        </div>
      )
    }

    const entries = Array.isArray(data)
      ? data.map((item, index) => [index.toString(), item])
      : Object.entries(data)

    return (
      <div className={cn(isHighlighted && "bg-yellow-50 rounded p-1")}>
        <div className="flex items-center gap-2 mb-1">
          {collapsible && (
            <button
              onClick={() => togglePath(path)}
              className="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          {keyName && (
            <span className="text-gray-700 font-medium">
              {highlightSearch(keyName, searchTerm)}:
            </span>
          )}

          <span className="text-gray-500 text-sm">
            {dataType === 'array' ? `[${entries.length}]` : `{${entries.length}}`}
          </span>

          {showDataTypes && (
            <Badge variant="outline" className="text-xs h-4 px-1">
              {dataType}
            </Badge>
          )}
        </div>

        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-4 space-y-1">
            {entries.map(([key, value]) => (
              <JsonNode
                key={key}
                data={value}
                keyName={key}
                level={level + 1}
                maxDepth={maxDepth}
                searchTerm={searchTerm}
                showDataTypes={showDataTypes}
                path={`${path}.${key}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const propertyCount = data && typeof data === 'object'
    ? Object.keys(data).length
    : 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="secondary">
              {propertyCount} {propertyCount === 1 ? 'propriedade' : 'propriedades'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawJson(!showRawJson)}
            >
              {showRawJson ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showRawJson ? 'Estruturado' : 'Raw JSON'}
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
            <Button variant="outline" size="sm" onClick={downloadJson}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {searchable && !showRawJson && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar no JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {showRawJson ? (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm font-mono max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="font-mono text-sm max-h-96 overflow-auto">
            <JsonNode
              data={data}
              level={0}
              maxDepth={maxDepth}
              searchTerm={searchTerm}
              showDataTypes={showDataTypes}
              path="root"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}