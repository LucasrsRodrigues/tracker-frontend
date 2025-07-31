import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Code,
  FileText,
  GitBranch
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StackFrame {
  filename: string
  function: string
  lineno: number
  colno?: number
  context?: string[]
  inApp?: boolean
  module?: string
}

interface StackTraceProps {
  frames: StackFrame[]
  formatted?: string
  className?: string
  maxFrames?: number
  showContext?: boolean
  highlightInApp?: boolean
}

export function StackTrace({
  frames,
  formatted,
  className,
  maxFrames = 10,
  showContext = true,
  highlightInApp = true
}: StackTraceProps) {
  const [expandedFrames, setExpandedFrames] = useState<Set<number>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const [viewMode, setViewMode] = useState<'frames' | 'raw'>('frames')

  const displayFrames = showAll ? frames : frames.slice(0, maxFrames)
  const hasMoreFrames = frames.length > maxFrames

  const toggleFrame = (index: number) => {
    const newExpanded = new Set(expandedFrames)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedFrames(newExpanded)
  }

  const copyStackTrace = async () => {
    const text = formatted || frames.map(frame =>
      `  at ${frame.function} (${frame.filename}:${frame.lineno}:${frame.colno || 0})`
    ).join('\n')

    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy stack trace:', err)
    }
  }

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  const getLanguageIcon = (filename: string) => {
    const ext = getFileExtension(filename)
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return '⚡'
      case 'py':
        return '🐍'
      case 'java':
        return '☕'
      case 'php':
        return '🐘'
      case 'rb':
        return '💎'
      case 'go':
        return '🐹'
      case 'rs':
        return '🦀'
      default:
        return '📄'
    }
  }

  const formatFilename = (filename: string) => {
    if (filename.includes('/')) {
      const parts = filename.split('/')
      return {
        directory: parts.slice(0, -1).join('/'),
        file: parts[parts.length - 1]
      }
    }
    return { directory: '', file: filename }
  }

  if (!frames || frames.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <Code className="h-8 w-8 mx-auto mb-2" />
            <p>No stack trace available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Stack Trace</CardTitle>
            <Badge variant="outline">
              {frames.length} frame{frames.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border">
              <Button
                variant={viewMode === 'frames' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('frames')}
                className="rounded-r-none"
              >
                <GitBranch className="h-4 w-4 mr-1" />
                Frames
              </Button>
              <Button
                variant={viewMode === 'raw' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('raw')}
                className="rounded-l-none"
              >
                <FileText className="h-4 w-4 mr-1" />
                Raw
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={copyStackTrace}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'raw' ? (
          <div className="bg-muted rounded-lg p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
              {formatted || frames.map((frame, index) =>
                `  at ${frame.function} (${frame.filename}:${frame.lineno}:${frame.colno || 0})`
              ).join('\n')}
            </pre>
          </div>
        ) : (
          <div className="space-y-2">
            {displayFrames.map((frame, index) => {
              const isExpanded = expandedFrames.has(index)
              const { directory, file } = formatFilename(frame.filename)
              const isInApp = highlightInApp && frame.inApp

              return (
                <Collapsible key={index} open={isExpanded} onOpenChange={() => toggleFrame(index)}>
                  <CollapsibleTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                      isInApp && "border-primary/50 bg-primary/5"
                    )}>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-shrink-0 text-lg">
                        {getLanguageIcon(frame.filename)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium truncate">
                            {frame.function || '<anonymous>'}
                          </span>
                          {isInApp && (
                            <Badge variant="outline" className="text-xs">
                              App
                            </Badge>
                          )}
                          {frame.module && (
                            <Badge variant="secondary" className="text-xs">
                              {frame.module}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {directory && (
                            <span className="truncate">{directory}/</span>
                          )}
                          <span className="font-medium">{file}</span>
                          <span>:</span>
                          <span className="font-mono">{frame.lineno}</span>
                          {frame.colno && (
                            <>
                              <span>:</span>
                              <span className="font-mono">{frame.colno}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Aqui você pode implementar a abertura do arquivo no editor
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    {showContext && frame.context && frame.context.length > 0 && (
                      <div className="mt-2 ml-10 mr-4">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Context around line {frame.lineno}:
                          </div>
                          <div className="font-mono text-sm space-y-1">
                            {frame.context.map((line, lineIndex) => {
                              const lineNumber = frame.lineno - Math.floor(frame.context!.length / 2) + lineIndex
                              const isErrorLine = lineNumber === frame.lineno

                              return (
                                <div
                                  key={lineIndex}
                                  className={cn(
                                    "flex items-center gap-3 px-2 py-1 rounded",
                                    isErrorLine && "bg-destructive/10 border-l-2 border-destructive"
                                  )}
                                >
                                  <span className="text-xs text-muted-foreground w-8 text-right">
                                    {lineNumber}
                                  </span>
                                  <span className={cn(
                                    "flex-1",
                                    isErrorLine && "font-medium"
                                  )}>
                                    {line}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}

            {hasMoreFrames && !showAll && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                >
                  Show {frames.length - maxFrames} more frames
                </Button>
              </div>
            )}

            {showAll && hasMoreFrames && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(false)}
                >
                  Show less
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}