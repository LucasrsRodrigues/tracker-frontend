import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEventsList } from '../hooks/useEventsList';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { EventFilters, TrackingEvent } from '../types/events.types';

interface EventsListProps {
  filters: EventFilters;
  onEventSelect?: (event: TrackingEvent) => void;
  onFilterUpdate?: (filters: Partial<EventFilters>) => void;
}

export function EventsList({ filters, onEventSelect, onFilterUpdate }: EventsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useEventsList(filters);

  const { ref: loadMoreRef } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetching: isFetchingNextPage,
  });

  const events = data?.pages.flatMap(page => page.events) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'business': return '💼';
      case 'integration': return '🔗';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'business': return 'bg-green-100 text-green-800';
      case 'integration': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickFilter = (key: keyof EventFilters, value: any) => {
    onFilterUpdate?.({ [key]: [value] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Erro ao carregar eventos. Tente novamente.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Lista de Eventos
          <Badge variant="outline">{totalCount.toLocaleString()}</Badge>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum evento encontrado</p>
            <p className="text-muted-foreground">
              Ajuste os filtros para encontrar os eventos desejados
            </p>
          </div>
        ) : (
          <>
            {/* Events Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <TableCell className="font-mono text-sm">
                        <div>
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={getCategoryColor(event.category)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickFilter('categories', event.category);
                          }}
                        >
                          {getCategoryIcon(event.category)} {event.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{event.action}</div>
                        {event.label && (
                          <div className="text-sm text-muted-foreground">{event.label}</div>
                        )}
                      </TableCell>

                      <TableCell>
                        {event.userId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 font-mono text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickFilter('userIds', event.userId);
                            }}
                          >
                            {event.userId.slice(-8)}
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickFilter('platforms', event.context.platform);
                            }}
                          >
                            {event.context.platform}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickFilter('devices', event.context.device.type);
                            }}
                          >
                            {event.context.device.type}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        {event.metadata?.duration ? (
                          <span className="font-mono text-sm">
                            {event.metadata.duration}ms
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEventSelect?.(event)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {event.traceId && (
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Correlação
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Filter className="h-4 w-4 mr-2" />
                              Filtrar Similares
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="text-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Carregando mais eventos...</span>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    Carregar Mais
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}