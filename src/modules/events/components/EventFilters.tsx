import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Filter,
  X,
  Save,
  RotateCcw,
  Calendar,
  Users,
  Tag,
  Smartphone,
  Globe,
  Search,
  AlertTriangle
} from 'lucide-react';
import { useFilters } from '@/hooks/useFilters';
import { cn } from '@/lib/utils';
import type { EventFilters as EventFiltersType } from '../types/events.types';

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange?: (filters: EventFiltersType) => void;
  className?: string;
}

const categoryOptions = [
  { value: 'user', label: 'Usuário', icon: '👤' },
  { value: 'system', label: 'Sistema', icon: '⚙️' },
  { value: 'business', label: 'Negócio', icon: '💼' },
  { value: 'integration', label: 'Integração', icon: '🔗' }
];

const platformOptions = [
  'web',
  'mobile',
  'desktop',
  'api',
  'ios',
  'android'
];

const deviceOptions = [
  'desktop',
  'mobile',
  'tablet'
];

const commonActions = [
  'login',
  'logout',
  'register',
  'purchase',
  'click',
  'view',
  'search',
  'download',
  'upload',
  'share',
  'error',
  'warning',
  'info'
];

const statusCodeOptions = [
  200, 201, 204, 400, 401, 403, 404, 422, 500, 502, 503, 504
];

export function EventFilters({ filters, onFiltersChange, className }: EventFiltersProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const {
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilters<EventFiltersType>();

  const handleFilterChange = (key: keyof EventFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange?.(newFilters);
  };

  const handleMultiSelectChange = (key: keyof EventFiltersType, value: string, checked: boolean) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    handleFilterChange(key, newValues);
  };

  const handleReset = () => {
    const resetFilters: EventFiltersType = {
      dateRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        to: new Date()
      }
    };
    onFiltersChange?.(resetFilters);
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveCurrentFilters(filterName.trim(), filters);
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  const removeFilter = (key: keyof EventFiltersType, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const currentValues = filters[key] as string[];
      handleFilterChange(key, currentValues.filter(v => v !== value));
    } else {
      handleFilterChange(key, undefined);
    }
  };

  const hasFiltersApplied = hasActiveFilters() ||
    filters.categories?.length ||
    filters.actions?.length ||
    filters.userIds?.length ||
    filters.sessionIds?.length ||
    filters.traceIds?.length ||
    filters.providers?.length ||
    filters.platforms?.length ||
    filters.devices?.length ||
    filters.countries?.length ||
    filters.statusCodes?.length ||
    filters.hasErrors !== undefined ||
    filters.search;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Eventos
            </CardTitle>
            {hasFiltersApplied && (
              <Badge variant="secondary">
                {getActiveFilterCount()} {getActiveFilterCount() === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Popover open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasFiltersApplied}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div>
                    <Label>Nome do Filtro</Label>
                    <Input
                      placeholder="Ex: Eventos de Login..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveFilter}>
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSaveDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
            Busca Textual
          </Label>
          <Input
            placeholder="Buscar em ações, labels, dados..."
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

        {/* Categories */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {filters.categories?.length
                  ? `${filters.categories.length} categoria${filters.categories.length !== 1 ? 's' : ''}`
                  : 'Todas as categorias'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-4 space-y-2">
                {categoryOptions.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={filters.categories?.includes(category.value) || false}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('categories', category.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={category.value} className="flex items-center gap-2 cursor-pointer">
                      <span>{category.icon}</span>
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Label>Ações</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {filters.actions?.length
                  ? `${filters.actions.length} ação${filters.actions.length !== 1 ? 'ões' : ''}`
                  : 'Todas as ações'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {commonActions.map((action) => (
                  <div key={action} className="flex items-center space-x-2">
                    <Checkbox
                      id={action}
                      checked={filters.actions?.includes(action) || false}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('actions', action, checked as boolean)
                      }
                    />
                    <Label htmlFor={action} className="cursor-pointer capitalize">
                      {action}
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
                  : 'Todas as plataformas'
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

        {/* Devices */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Dispositivos
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {filters.devices?.length
                  ? `${filters.devices.length} dispositivo${filters.devices.length !== 1 ? 's' : ''}`
                  : 'Todos os dispositivos'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-4 space-y-2">
                {deviceOptions.map((device) => (
                  <div key={device} className="flex items-center space-x-2">
                    <Checkbox
                      id={device}
                      checked={filters.devices?.includes(device) || false}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('devices', device, checked as boolean)
                      }
                    />
                    <Label htmlFor={device} className="cursor-pointer capitalize">
                      {device}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* User IDs */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            IDs de Usuário
          </Label>
          <Input
            placeholder="user1, user2, user3..."
            value={filters.userIds?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const userIds = value ? value.split(',').map(id => id.trim()).filter(Boolean) : undefined;
              handleFilterChange('userIds', userIds);
            }}
          />
        </div>

        {/* Session IDs */}
        <div className="space-y-2">
          <Label>IDs de Sessão</Label>
          <Input
            placeholder="session1, session2, session3..."
            value={filters.sessionIds?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const sessionIds = value ? value.split(',').map(id => id.trim()).filter(Boolean) : undefined;
              handleFilterChange('sessionIds', sessionIds);
            }}
          />
        </div>

        {/* Trace IDs */}
        <div className="space-y-2">
          <Label>IDs de Trace</Label>
          <Input
            placeholder="trace1, trace2, trace3..."
            value={filters.traceIds?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const traceIds = value ? value.split(',').map(id => id.trim()).filter(Boolean) : undefined;
              handleFilterChange('traceIds', traceIds);
            }}
          />
        </div>

        {/* Providers */}
        <div className="space-y-2">
          <Label>Provedores</Label>
          <Input
            placeholder="stripe, sendgrid, aws..."
            value={filters.providers?.join(', ') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const providers = value ? value.split(',').map(p => p.trim()).filter(Boolean) : undefined;
              handleFilterChange('providers', providers);
            }}
          />
        </div>

        {/* Status Codes */}
        <div className="space-y-2">
          <Label>Códigos de Status</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {filters.statusCodes?.length
                  ? `${filters.statusCodes.length} código${filters.statusCodes.length !== 1 ? 's' : ''}`
                  : 'Todos os códigos'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                {statusCodeOptions.map((code) => (
                  <div key={code} className="flex items-center space-x-2">
                    <Checkbox
                      id={code.toString()}
                      checked={filters.statusCodes?.includes(code) || false}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('statusCodes', code.toString(), checked as boolean)
                      }
                    />
                    <Label htmlFor={code.toString()} className="cursor-pointer font-mono">
                      {code}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Error Filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hasErrors" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Apenas eventos com erro
          </Label>
          <Switch
            id="hasErrors"
            checked={filters.hasErrors || false}
            onCheckedChange={(checked) =>
              handleFilterChange('hasErrors', checked ? true : undefined)
            }
          />
        </div>

        {/* Active Filters Display */}
        {hasFiltersApplied && (
          <div className="space-y-2">
            <Label>Filtros Ativos</Label>
            <div className="flex flex-wrap gap-1">
              {filters.categories?.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {categoryOptions.find(c => c.value === category)?.label || category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('categories', category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}

              {filters.actions?.map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  {action}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeFilter('actions', action)}
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

              {filters.hasErrors && (
                <Badge variant="destructive" className="text-xs">
                  Apenas erros
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 text-destructive-foreground"
                    onClick={() => removeFilter('hasErrors')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="space-y-2">
            <Label>Filtros Salvos</Label>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((saved) => (
                <div key={saved.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadSavedFilters(saved);
                      onFiltersChange?.(saved.filters as EventFiltersType);
                    }}
                  >
                    {saved.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => deleteSavedFilter(saved.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}