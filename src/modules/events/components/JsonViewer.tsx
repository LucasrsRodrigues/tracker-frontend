import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface JsonViewerProps {
  data: Record<string, any>;
  maxDepth?: number;
  collapsible?: boolean;
}

export function JsonViewer({ data, maxDepth = 3, collapsible = true }: JsonViewerProps) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    // Could add toast notification here
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const renderValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedKeys.has(key);
    const shouldCollapse = collapsible && depth >= maxDepth;

    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-red-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-500">[]</span>;
      }

      if (shouldCollapse && !isExpanded) {
        return (
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ChevronRight className="h-3 w-3" />
            <span>[{value.length} items]</span>
          </button>
        );
      }

      return (
        <div>
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-1"
          >
            <ChevronDown className="h-3 w-3" />
            <span>[</span>
          </button>
          <div className="ml-4 space-y-1">
            {value.map((item, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-gray-500">{index}:</span>
                {renderValue(item, `${key}.${index}`, depth + 1)}
              </div>
            ))}
          </div>
          <span className="text-blue-600">]</span>
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return <span className="text-gray-500">{'{}'}</span>;
      }

      if (shouldCollapse && !isExpanded) {
        return (
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ChevronRight className="h-3 w-3" />
            <span>{`{${keys.length} keys}`}</span>
          </button>
        );
      }

      return (
        <div>
          <button
            onClick={() => toggleExpanded(key)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mb-1"
          >
            <ChevronDown className="h-3 w-3" />
            <span>{'{'}</span>
          </button>
          <div className="ml-4 space-y-1">
            {keys.map(objKey => (
              <div key={objKey} className="flex gap-2">
                <span className="text-purple-600">"{objKey}":</span>
                {renderValue(value[objKey], `${key}.${objKey}`, depth + 1)}
              </div>
            ))}
          </div>
          <span className="text-blue-600">{'}'}</span>
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">
            {Object.keys(data).length} {Object.keys(data).length === 1 ? 'propriedade' : 'propriedades'}
          </Badge>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" />
            Copiar JSON
          </Button>
        </div>
        <div className="font-mono text-sm bg-muted/50 p-4 rounded-lg overflow-x-auto">
          {renderValue(data, 'root')}
        </div>
      </CardContent>
    </Card>
  );
}