import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format, subDays, subHours, subMonths, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  showPresets?: boolean
  maxDate?: Date
  minDate?: Date
}

interface Preset {
  label: string
  value: () => DateRange
}

const presets: Preset[] = [
  {
    label: 'Última hora',
    value: () => ({
      from: subHours(new Date(), 1),
      to: new Date()
    })
  },
  {
    label: 'Últimas 24 horas',
    value: () => ({
      from: subDays(new Date(), 1),
      to: new Date()
    })
  },
  {
    label: 'Últimos 7 dias',
    value: () => ({
      from: startOfDay(subDays(new Date(), 7)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Últimos 30 dias',
    value: () => ({
      from: startOfDay(subDays(new Date(), 30)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Últimos 3 meses',
    value: () => ({
      from: startOfDay(subMonths(new Date(), 3)),
      to: endOfDay(new Date())
    })
  },
  {
    label: 'Este mês',
    value: () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        from: startOfDay(firstDay),
        to: endOfDay(now)
      }
    }
  },
  {
    label: 'Mês passado',
    value: () => {
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return {
        from: startOfDay(firstDay),
        to: endOfDay(lastDay)
      }
    }
  }
]

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Selecionar período',
  disabled = false,
  className,
  showPresets = true,
  maxDate,
  minDate
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value)

  useEffect(() => {
    setSelectedRange(value)
  }, [value])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    onChange?.(range)

    // Close popover if both dates are selected
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  const handlePresetSelect = (preset: Preset) => {
    const range = preset.value()
    handleSelect(range)
    setOpen(false)
  }

  const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) return placeholder

    if (!range.to) {
      return format(range.from, 'dd/MM/yyyy', { locale: ptBR })
    }

    return `${format(range.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(range.to, 'dd/MM/yyyy', { locale: ptBR })}`
  }

  const isPresetActive = (preset: Preset): boolean => {
    if (!selectedRange?.from || !selectedRange?.to) return false

    const presetRange = preset.value()
    const fromMatch = Math.abs(selectedRange.from.getTime() - presetRange.from.getTime()) < 1000
    const toMatch = Math.abs(selectedRange.to.getTime() - presetRange.to.getTime()) < 1000

    return fromMatch && toMatch
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(selectedRange)}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            {showPresets && (
              <div className="border-r">
                <div className="p-3">
                  <h4 className="text-sm font-medium mb-2">Períodos</h4>
                  <div className="space-y-1">
                    {presets.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={isPresetActive(preset) ? 'default' : 'ghost'}
                        className="w-full justify-start text-sm h-8"
                        onClick={() => handlePresetSelect(preset)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={selectedRange?.from}
                selected={selectedRange}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={ptBR}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
              />

              {/* Quick actions */}
              <div className="flex justify-between items-center pt-3 border-t mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedRange(undefined)
                    onChange?.(undefined)
                  }}
                >
                  Limpar
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancelar
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      onChange?.(selectedRange)
                      setOpen(false)
                    }}
                    disabled={!selectedRange?.from}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}