// src/modules/user-journey/components/JourneyFilters.tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Filter,
  X,
  Save,
  RotateCcw,
  Calendar,
  Users,
  Target,
  Funnel
} from 'lucide-react'
import { useFilters } from '@/hooks/useFilters'
import { cn } from '@/lib/utils'

interface JourneyFiltersProps {
  onFiltersChange?: (filters: JourneyFilterState) => void
  className?: string
}

export interface JourneyFilterState {
  dateRange?: {
    from: Date
    to: Date
  }
  segments?: string[]
  funnels?: string[]
  deviceTypes?: string[]
  userTypes?: string[]
  conversionEvents?: string[]
  minSessionDuration?: number
  maxSessionDuration?: number
  includeAnonymous?: boolean
  cohortType?: 'acquisition' | 'behavioral'
  pathLength?: {
    min: number
    max: number
  }
}

const segmentOptions = [
  'new_users',
  'returning_users',
  'active_users',
  'churned_users',
  'high_value',
  'mobile_users',
  'desktop_users'
]

const deviceTypeOptions = [
  'desktop',
  'mobile',
  'tablet'
]

const userTypeOptions = [
  'registered',
  'anonymous',
  'premium',
  'free'
]

const conversionEventOptions = [
  'purchase',
  'signup',
  'subscription',
  'contact_form',
  'download'
]

export function JourneyFilters({ onFiltersChange, className }: JourneyFiltersProps) {
  const {
    filters,
    updateFilters,
    resetFilters,
    savedFilters,
    saveCurrentFilters,
    loadSavedFilters,
    deleteSavedFilter,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilters<JourneyFilterState>()

  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState('')

  const handleFilterChange = (key: keyof JourneyFilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    updateFilters({ [key]: value })
    onFiltersChange?.(newFilters)
  }

  const handleMultiSelectChange = (key: keyof JourneyFilterState, value: string, checked: boolean) => {
    const currentValues = (filters[key] as string[]) || []
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value)

    handleFilterChange(key, newValues)
  }

  const handleReset = () => {
    resetFilters()
    onFiltersChange?.({})
  }

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveCurrentFilters(filterName)
      setFilterName('')
      setSaveDialogOpen(false)
    }
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Filtros de Jornada</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} {activeFilterCount === 1 ? 'filtro' : 'filtros'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Popover open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasActiveFilters()}
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
                      placeholder="Ex: Usuários Mobile..."
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
              disabled={!hasActiveFilters()}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
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

        {/* Segments */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Segmentos de Usuário
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                {filters.segments?.length ?
                  `${filters.segments.length} selecionado(s)` :
                  'Selecionar segmentos'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                {segmentOptions.map((segment) => (
                  <div key={segment} className="flex items-center space-x-2">
                    <Checkbox
                      id={segment}
                      checked={filters.segments?.includes(segment)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('segments', segment, checked as boolean)
                      }
                    />
                    <Label htmlFor={segment} className="capitalize">
                      {segment.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {filters.segments && filters.segments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filters.segments.map((segment) => (
                <Badge key={segment} variant="secondary">
                  {segment.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange('segments', segment, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Device Types */}
        <div className="space-y-2">
          <Label>Tipo de Dispositivo</Label>
          <div className="flex flex-wrap gap-2">
            {deviceTypeOptions.map((device) => (
              <div key={device} className="flex items-center space-x-2">
                <Checkbox
                  id={device}
                  checked={filters.deviceTypes?.includes(device)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange('deviceTypes', device, checked as boolean)
                  }
                />
                <Label htmlFor={device} className="capitalize">
                  {device}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* User Types */}
        <div className="space-y-2">
          <Label>Tipo de Usuário</Label>
          <div className="flex flex-wrap gap-2">
            {userTypeOptions.map((userType) => (
              <div key={userType} className="flex items-center space-x-2">
                <Checkbox
                  id={userType}
                  checked={filters.userTypes?.includes(userType)}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange('userTypes', userType, checked as boolean)
                  }
                />
                <Label htmlFor={userType} className="capitalize">
                  {userType}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Events */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Eventos de Conversão
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                {filters.conversionEvents?.length ?
                  `${filters.conversionEvents.length} selecionado(s)` :
                  'Selecionar eventos'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-2">
                {conversionEventOptions.map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <Checkbox
                      id={event}
                      checked={filters.conversionEvents?.includes(event)}
                      onCheckedChange={(checked) =>
                        handleMultiSelectChange('conversionEvents', event, checked as boolean)
                      }
                    />
                    <Label htmlFor={event} className="capitalize">
                      {event.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Session Duration */}
        <div className="space-y-2">
          <Label>Duração da Sessão (minutos)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Mínimo</Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minSessionDuration || ''}
                onChange={(e) => handleFilterChange('minSessionDuration',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
              />
            </div>
            <div>
              <Label className="text-xs">Máximo</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filters.maxSessionDuration || ''}
                onChange={(e) => handleFilterChange('maxSessionDuration',
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
              />
            </div>
          </div>
        </div>

        {/* Path Length */}
        <div className="space-y-2">
          <Label>Tamanho do Caminho (eventos)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Mínimo</Label>
              <Input
                type="number"
                placeholder="1"
                value={filters.pathLength?.min || ''}
                onChange={(e) => handleFilterChange('pathLength', {
                  ...filters.pathLength,
                  min: e.target.value ? parseInt(e.target.value) : 1
                })}
              />
            </div>
            <div>
              <Label className="text-xs">Máximo</Label>
              <Input
                type="number"
                placeholder="∞"
                value={filters.pathLength?.max || ''}
                onChange={(e) => handleFilterChange('pathLength', {
                  ...filters.pathLength,
                  max: e.target.value ? parseInt(e.target.value) : undefined
                })}
              />
            </div>
          </div>
        </div>

        {/* Cohort Type */}
        <div className="space-y-2">
          <Label>Tipo de Coorte</Label>
          <Select
            value={filters.cohortType || ''}
            onValueChange={(value) => handleFilterChange('cohortType', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="acquisition">Aquisição</SelectItem>
              <SelectItem value="behavioral">Comportamental</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Include Anonymous */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeAnonymous"
            checked={filters.includeAnonymous || false}
            onCheckedChange={(checked) =>
              handleFilterChange('includeAnonymous', checked as boolean)
            }
          />
          <Label htmlFor="includeAnonymous">
            Incluir usuários anônimos
          </Label>
        </div>

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
                      loadSavedFilters(saved)
                      onFiltersChange?.(saved.filters as JourneyFilterState)
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
  )
}