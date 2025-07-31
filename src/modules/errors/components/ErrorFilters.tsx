import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Filter,
  X, RotateCcw,
  Calendar,
  AlertTriangle,
  Bug,
  Search,
  Users,
  Code,
  Globe,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ErrorFilters as ErrorFiltersType } from '../types/errors.types';

interface ErrorFiltersProps {
  filters: ErrorFiltersType;
  onFiltersChange?: (filters: ErrorFiltersType) => void;
  className?: string;
}

const severityOptions = [
  { value: 'low', label: 'Baixo', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-800' }
];

const statusOptions = [
  { value: 'new', label: 'Novo', color: 'bg-gray-100 text-gray-800' },
  { value: 'investigating', label: 'Investigando', color: 'bg-blue-100 text-blue-800' },
  { value: 'resolved', label: 'Resolvido', color: 'bg-green-100 text-green-800' },
  { value: 'ignored', label: 'Ignorado', color: 'bg-gray-100 text-gray-600' }
];

const typeOptions = [
  'TypeError',
  'ReferenceError',
  'SyntaxError',
  'RangeError',
  'NetworkError',
  'ValidationError',
  'DatabaseError',
  'AuthenticationError',
  'PermissionError',
  'TimeoutError'
];

const platformOptions = [
  'web',
  'mobile',
  'desktop',
  'api',
  'ios',
  'android',
  'server'
];

const environmentOptions = [
  'development',
  'staging',
  'production'
];

const providerOptions = [
  'stripe',
  'sendgrid',
  'aws',
  'google',
  'firebase',
  'mongodb',
  'redis',
  'postgresql'
];

export function ErrorFilters({ filters, onFiltersChange, className }: ErrorFiltersProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleFilterChange = (key: keyof ErrorFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange?.(newFilters);
  };

  const handleMultiSelectChange = (key: keyof ErrorFiltersType, value: string, checked: boolean) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    handleFilterChange(key, newValues);
  };

  const handleReset = () => {
    const resetFilters: ErrorFiltersType = {
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date()
      }
    };
    onFiltersChange?.(resetFilters);
  };

  const removeFilter = (key: keyof ErrorFiltersType, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const currentValues = filters[key] as string[];
      handleFilterChange(key, currentValues.filter(v => v !== value));
    } else {
      handleFilterChange(key, undefined);
    }
  };

  const hasFiltersApplied = !!(
    filters.severity?.length ||
    filters.status?.length ||
    filters.types?.length ||
    filters.platforms?.length ||
    filters.providers?.length ||
    filters.environments?.length ||
    filters.versions?.length ||
    filters.hasUsers !== undefined ||
    filters.search
  );

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.severity?.length) count++;
    if (filters.status?.length) count++;
    if (filters.types?.length) count++;
    if (filters.platforms?.length) count++;
    if (filters.providers?.length) count++;
    if (filters.environments?.length) count++;
    if (filters.versions?.length) count++;
    if (filters.hasUsers) count++;
    if (filters.search) count++;
    return count;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Erros
            </CardTitle>
            {hasFiltersApplied && (
              <Badge variant="secondary">
                {getActiveFilterCount()} {getActiveFilterCount() === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasFiltersApplied}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Busca
          </Label>
          <Input
            placeholder="Buscar em mensagens, stacks, tipos..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período
          </Label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => handleFilterChange('dateRange', range)}
            placeholder="Selecionar período"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Severity */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Severidade
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.severity?.length
                    ? `${filters.severity.length} severidade${filters.severity.length !== 1 ? 's' : ''}`
                    : 'Todas'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2">
                  {severityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={filters.severity?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('severity', option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                        <Badge className={option.color}>
                          {option.label}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Status
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.status?.length
                    ? `${filters.status.length} status`
                    : 'Todos'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={filters.status?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('status', option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
                        <Badge className={option.color}>
                          {option.label}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Types */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Tipos de Erro
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.types?.length
                    ? `${filters.types.length} tipo${filters.types.length !== 1 ? 's' : ''}`
                    : 'Todos'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {typeOptions.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.types?.includes(type) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('types', type, checked as boolean)
                        }
                      />
                      <Label htmlFor={type} className="cursor-pointer font-mono text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Plataformas
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.platforms?.length
                    ? `${filters.platforms.length} plataforma${filters.platforms.length !== 1 ? 's' : ''}`
                    : 'Todas'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2">
                  {platformOptions.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={filters.platforms?.includes(platform) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('platforms', platform, checked as boolean)
                        }
                      />
                      <Label htmlFor={platform} className="cursor-pointer capitalize">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Providers */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Provedores
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.providers?.length
                    ? `${filters.providers.length} provedor${filters.providers.length !== 1 ? 'es' : ''}`
                    : 'Todos'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2">
                  {providerOptions.map((provider) => (
                    <div key={provider} className="flex items-center space-x-2">
                      <Checkbox
                        id={provider}
                        checked={filters.providers?.includes(provider) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('providers', provider, checked as boolean)
                        }
                      />
                      <Label htmlFor={provider} className="cursor-pointer capitalize">
                        {provider}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Environments */}
          <div className="space-y-2">
            <Label>Ambiente</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  {filters.environments?.length
                    ? `${filters.environments.length} ambiente${filters.environments.length !== 1 ? 's' : ''}`
                    : 'Todos'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <div className="p-4 space-y-2">
                  {environmentOptions.map((env) => (
                    <div key={env} className="flex items-center space-x-2">
                      <Checkbox
                        id={env}
                        checked={filters.environments?.includes(env) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('environments', env, checked as boolean)
                        }
                      />
                      <Label htmlFor={env} className="cursor-pointer capitalize">
                        {env}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Versions */}
        <div className="space-y-2">
          <Label>Versões</Label>
          <Input
            placeholder="v1.0.0, v1.1.0, v2.0.0..."
            value={filters.versions?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const versions = value ? value.split(',').map(v => v.trim()).filter(Boolean) : undefined;
              handleFilterChange('versions', versions);
            }}
          />
        </div>

        {/* Has Users Filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hasUsers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Apenas erros que afetam usuários
          </Label>
          <Switch
            id="hasUsers"
            checked={filters.hasUsers || false}
            onCheckedChange={(checked) =>
              handleFilterChange('hasUsers', checked ? true : undefined)
            }
          />
        </div>

        {/* Active Filters Display */}
        {hasFiltersApplied && (
          <div className="space-y-2">
            <Label>Filtros Ativos</Label>
            <div className="flex flex-wrap gap-1">
              {filters.severity?.map((severity) => (
                <Badge key={severity} variant="secondary" className="text-xs">
                  {severityOptions.find(s => s.value === severity)?.label || severity}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('severity', severity)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {filters.status?.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {statusOptions.find(s => s.value === status)?.label || status}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('status', status)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {filters.types?.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('types', type)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {filters.platforms?.map((platform) => (
                <Badge key={platform} variant="secondary" className="text-xs">
                  {platform}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('platforms', platform)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {filters.hasUsers && (
                <Badge variant="secondary" className="text-xs">
                  Usuários afetados
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('hasUsers')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}