import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePickerWithRange } from '@/components/ui/date-picker';
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
import {
  Filter,
  X,
  Save,
  RotateCcw,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { useFilters } from '../hooks/useFilters';
import { useState } from 'react';

const categoryOptions = [
  'user', 'system', 'business', 'integration', 'error', 'performance'
];

const actionOptions = [
  'page_view', 'click', 'form_submit', 'payment', 'login', 'logout',
  'search', 'download', 'api_call', 'webhook'
];

const providerOptions = [
  'celcoin', 'pix_provider_2', 'payment_gateway', 'cpf_api', 'cnpj_api'
];

const deviceOptions = [
  'desktop', 'mobile', 'tablet'
];

interface MetricsFilterProps {
  onFiltersChange?: (filters: any) => void;
}

export function MetricsFilter({ onFiltersChange }: MetricsFilterProps) {
  const {
    filters,
    updateFilters,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
  } = useFilters();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleDateRangeChange = (dateRange: any) => {
    updateFilters({ dateRange });
    onFiltersChange?.({ ...filters, dateRange });
  };

  const handleMultiSelectChange = (key: string, value: string, checked: boolean) => {
    const currentValues = filters[key] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);

    updateFilters({ [key]: newValues });
    onFiltersChange?.({ ...filters, [key]: newValues });
  };

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveCurrentFilters(filterName.trim());
      setFilterName('');
      setSaveDialogOpen(false);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count += filters.categories.length;
    if (filters.actions?.length) count += filters.actions.length;
    if (filters.providers?.length) count += filters.providers.length;
    if (filters.deviceTypes?.length) count += filters.deviceTypes.length;
    return count;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Limpar
          </Button>
          <Popover open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <Label htmlFor="filter-name">Nome do filtro</Label>
                <Input
                  id="filter-name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Ex: Últimos 30 dias - Mobile"
                />
                <Button onClick={handleSaveFilter} className="w-full">
                  Salvar Filtro
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Período</Label>
          <DatePickerWithRange
            from={filters.dateRange.from}
            to={filters.dateRange.to}
            onSelect={handleDateRangeChange}
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Categories */}
          <div className="space-y-2">
            <Label>Categorias</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.categories?.length
                    ? `${filters.categories.length} selecionadas`
                    : 'Todas'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.categories?.includes(category)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('categories', category, checked as boolean)
                        }
                      />
                      <Label htmlFor={`category-${category}`} className="capitalize">
                        {category}
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
                <Button variant="outline" className="w-full justify-between">
                  {filters.actions?.length
                    ? `${filters.actions.length} selecionadas`
                    : 'Todas'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {actionOptions.map((action) => (
                    <div key={action} className="flex items-center space-x-2">
                      <Checkbox
                        id={`action-${action}`}
                        checked={filters.actions?.includes(action)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('actions', action, checked as boolean)
                        }
                      />
                      <Label htmlFor={`action-${action}`} className="capitalize">
                        {action.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Providers */}
          <div className="space-y-2">
            <Label>Provedores</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.providers?.length
                    ? `${filters.providers.length} selecionados`
                    : 'Todos'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {providerOptions.map((provider) => (
                    <div key={provider} className="flex items-center space-x-2">
                      <Checkbox
                        id={`provider-${provider}`}
                        checked={filters.providers?.includes(provider)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('providers', provider, checked as boolean)
                        }
                      />
                      <Label htmlFor={`provider-${provider}`} className="capitalize">
                        {provider.replace('_', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Devices */}
          <div className="space-y-2">
            <Label>Dispositivos</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.deviceTypes?.length
                    ? `${filters.deviceTypes.length} selecionados`
                    : 'Todos'
                  }
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  {deviceOptions.map((device) => (
                    <div key={device} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${device}`}
                        checked={filters.deviceTypes?.includes(device)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('deviceTypes', device, checked as boolean)
                        }
                      />
                      <Label htmlFor={`device-${device}`} className="capitalize">
                        {device}
                      </Label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <Label>Filtros Ativos</Label>
            <div className="flex flex-wrap gap-2">
              {filters.categories?.map((category) => (
                <Badge key={`cat-${category}`} variant="secondary">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange('categories', category, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.actions?.map((action) => (
                <Badge key={`act-${action}`} variant="secondary">
                  {action.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange('actions', action, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.providers?.map((provider) => (
                <Badge key={`prov-${provider}`} variant="secondary">
                  {provider.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange('providers', provider, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.deviceTypes?.map((device) => (
                <Badge key={`dev-${device}`} variant="secondary">
                  {device}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange('deviceTypes', device, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
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
                    onClick={() => loadSavedFilters(saved)}
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