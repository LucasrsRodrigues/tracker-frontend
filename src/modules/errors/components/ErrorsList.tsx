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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  X,
  GitMerge,
  Tag,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useErrorGroups } from '../hooks/useErrorsData';
import { useErrorGroupActions } from '../hooks/useErrorGrouping';
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll';
import { formatNumber, formatDistanceToNow } from '@/utils/formatters';
import type { ErrorFilters, ErrorGroup } from '../types/errors.types';

interface ErrorsListProps {
  filters: ErrorFilters;
  onGroupSelect?: (group: ErrorGroup) => void;
}

export function ErrorsList({ filters, onGroupSelect }: ErrorsListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
  } = useErrorGroups(filters);

  const { updateStatus, mergeGroups } = useErrorGroupActions();
  const { ref: loadMoreRef } = useInfiniteScroll({
    hasNextPage,
    fetchNextPage,
    isFetching: isFetchingNextPage,
  });

  const errorGroups = data?.pages.flatMap(page => page.groups) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="destructive">Novo</Badge>;
      case 'investigating': return <Badge className="bg-yellow-100 text-yellow-800">Investigando</Badge>;
      case 'resolved': return <Badge className="bg-green-100 text-green-800">Resolvido</Badge>;
      case 'ignored': return <Badge variant="outline">Ignorado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusUpdate = (groupId: string, status: string) => {
    updateStatus.mutate({ groupId, status });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Erros</CardTitle>
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
          <CardTitle>Lista de Erros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Erro ao carregar dados. Tente novamente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Lista de Grupos de Erro
          <Badge variant="outline">{errorGroups.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errorGroups.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Nenhum erro encontrado</p>
            <p className="text-muted-foreground">
              Perfeito! Não há erros no período selecionado.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Erro</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ocorrências</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Última Vez</TableHead>
                    <TableHead>Tendência</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onGroupSelect?.(group)}
                    >
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium truncate mb-1">
                            {group.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {group.message}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {group.type}
                            </Badge>
                            {group.affectedVersions.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                v{group.affectedVersions[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getSeverityColor(group.severity)}>
                          {group.severity}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(group.status)}
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{formatNumber(group.count)}</div>
                        <div className="text-xs text-muted-foreground">
                          eventos
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{formatNumber(group.userCount)}</div>
                        <div className="text-xs text-muted-foreground">
                          usuários
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          {formatDistanceToNow(new Date(group.lastSeen), { addSuffix: true })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Primeira: {formatDistanceToNow(new Date(group.firstSeen), { addSuffix: true })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(group.trend)}
                          <span className="text-sm capitalize">{group.trend}</span>
                        </div>
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
                            <DropdownMenuItem onClick={() => onGroupSelect?.(group)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(group.id, 'investigating')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Marcar como Investigando
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(group.id, 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Resolvido
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(group.id, 'ignored')}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Ignorar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <GitMerge className="h-4 w-4 mr-2" />
                              Mesclar com Outro
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Tag className="h-4 w-4 mr-2" />
                              Adicionar Tags
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {hasNextPage && (
              <div ref={loadMoreRef} className="text-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                    <span>Carregando mais erros...</span>
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