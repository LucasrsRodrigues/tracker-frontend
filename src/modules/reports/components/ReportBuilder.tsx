import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  X,
  Save,
  Eye,
  Settings,
  BarChart3,
  Table,
  Calendar,
  Mail
} from 'lucide-react';
import { useReportBuilder } from '../hooks/useReportBuilder';
import { useState } from 'react';

export function ReportBuilder() {
  const {
    reportConfig,
    setReportConfig,
    updateConfiguration,
    addMetric,
    removeMetric,
    addVisualization,
    removeVisualization,
    validateConfiguration,
    saveReport,
    previewReport,
  } = useReportBuilder();

  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');

  const reportTypes = [
    { id: 'executive', name: 'Relatório Executivo', description: 'KPIs e métricas de alto nível' },
    { id: 'operational', name: 'Relatório Operacional', description: 'Métricas operacionais detalhadas' },
    { id: 'analytical', name: 'Relatório Analítico', description: 'Análises aprofundadas e insights' },
    { id: 'compliance', name: 'Relatório de Compliance', description: 'Métricas de conformidade e SLA' },
    { id: 'custom', name: 'Relatório Customizado', description: 'Configuração completamente personalizada' },
  ];

  const metricTemplates = [
    { id: 'total_events', name: 'Total de Eventos', dataSource: 'events', aggregation: 'count' },
    { id: 'unique_users', name: 'Usuários Únicos', dataSource: 'events', aggregation: 'distinct' },
    { id: 'error_rate', name: 'Taxa de Erro', dataSource: 'events', aggregation: 'avg' },
    { id: 'response_time', name: 'Tempo de Resposta', dataSource: 'performance', aggregation: 'avg' },
    { id: 'conversion_rate', name: 'Taxa de Conversão', dataSource: 'business', aggregation: 'avg' },
  ];

  const chartTypes = [
    { id: 'line', name: 'Linha', icon: '📈' },
    { id: 'bar', name: 'Barras', icon: '📊' },
    { id: 'pie', name: 'Pizza', icon: '🥧' },
    { id: 'area', name: 'Área', icon: '📊' },
    { id: 'funnel', name: 'Funil', icon: '🔽' },
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !reportConfig.tags?.includes(newTag.trim())) {
      setReportConfig(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setReportConfig(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const handleSave = async () => {
    const errors = validateConfiguration();
    if (errors.length > 0) {
      alert(`Erros de validação:\n${errors.join('\n')}`);
      return;
    }

    try {
      await saveReport.mutateAsync(reportConfig);
      alert('Relatório salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar relatório');
    }
  };

  const handlePreview = async () => {
    if (!reportConfig.configuration) return;

    try {
      await previewReport.mutateAsync(reportConfig.configuration);
    } catch (error) {
      alert('Erro ao gerar preview');
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {reportConfig.name || 'Novo Relatório'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview} disabled={previewReport.isPending}>
            <Eye className="h-4 w-4 mr-2" />
            {previewReport.isPending ? 'Gerando...' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={saveReport.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveReport.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizações</TabsTrigger>
            <TabsTrigger value="formatting">Formatação</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Relatório</Label>
                  <Input
                    id="name"
                    value={reportConfig.name}
                    onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Relatório Executivo Mensal"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Relatório</Label>
                  <Select
                    value={reportConfig.type?.id}
                    onValueChange={(value) => {
                      const type = reportTypes.find(t => t.id === value);
                      setReportConfig(prev => ({ ...prev, type: type as any }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div>
                            <div className="font-medium">{type.name}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito e conteúdo do relatório..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reportConfig.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4">
                <Label>Período dos Dados</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={reportConfig.configuration?.dateRange.type}
                      onValueChange={(value: 'fixed' | 'relative' | 'custom') =>
                        updateConfiguration({
                          dateRange: { ...reportConfig.configuration?.dateRange!, type: value }
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relative">Período Relativo</SelectItem>
                        <SelectItem value="fixed">Período Fixo</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportConfig.configuration?.dateRange.type === 'relative' && (
                    <>
                      <div className="space-y-2">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          value={reportConfig.configuration.dateRange.relative?.amount}
                          onChange={(e) => updateConfiguration({
                            dateRange: {
                              ...reportConfig.configuration?.dateRange!,
                              relative: {
                                ...reportConfig.configuration?.dateRange.relative!,
                                amount: parseInt(e.target.value)
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unidade</Label>
                        <Select
                          value={reportConfig.configuration.dateRange.relative?.unit}
                          onValueChange={(value: 'days' | 'weeks' | 'months' | 'quarters' | 'years') =>
                            updateConfiguration({
                              dateRange: {
                                ...reportConfig.configuration?.dateRange!,
                                relative: {
                                  ...reportConfig.configuration?.dateRange.relative!,
                                  unit: value
                                }
                              }
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Dias</SelectItem>
                            <SelectItem value="weeks">Semanas</SelectItem>
                            <SelectItem value="months">Meses</SelectItem>
                            <SelectItem value="quarters">Trimestres</SelectItem>
                            <SelectItem value="years">Anos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <div className="space-y-6">
              {/* Metrics Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Métricas</Label>
                  <Button size="sm" onClick={() => {
                    const newMetric = {
                      id: `metric_${Date.now()}`,
                      name: 'Nova Métrica',
                      dataSource: 'events',
                      aggregation: 'count' as const,
                      format: 'number' as const,
                    };
                    addMetric(newMetric);
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Métrica
                  </Button>
                </div>

                {/* Metric Templates */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metricTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start"
                      onClick={() => addMetric({
                        id: `${template.id}_${Date.now()}`,
                        name: template.name,
                        dataSource: template.dataSource,
                        aggregation: template.aggregation as any,
                        format: 'number',
                      })}
                    >
                      <span className="font-medium">{template.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {template.dataSource} • {template.aggregation}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* Configured Metrics */}
                <div className="space-y-3">
                  {reportConfig.configuration?.metrics?.map(metric => (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.dataSource} • {metric.aggregation} • {metric.format}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeMetric(metric.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>Visualizações</Label>
                <Button size="sm" onClick={() => {
                  const newViz = {
                    id: `viz_${Date.now()}`,
                    type: 'chart' as const,
                    title: 'Novo Gráfico',
                    chartType: 'line' as const,
                    dataSource: 'events',
                    metrics: [],
                    dimensions: [],
                    styling: {
                      width: 'full' as const,
                      height: 'medium' as const,
                    },
                  };
                  addVisualization(newViz);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Visualização
                </Button>
              </div>

              {/* Chart Type Templates */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {chartTypes.map(chart => (
                  <Button
                    key={chart.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => addVisualization({
                      id: `${chart.id}_${Date.now()}`,
                      type: 'chart',
                      title: `Gráfico ${chart.name}`,
                      chartType: chart.id as any,
                      dataSource: 'events',
                      metrics: [],
                      dimensions: [],
                      styling: {
                        width: 'full',
                        height: 'medium',
                      },
                    })}
                  >
                    <span className="text-2xl mb-2">{chart.icon}</span>
                    <span className="text-sm">{chart.name}</span>
                  </Button>
                ))}
              </div>

              {/* Configured Visualizations */}
              <div className="space-y-3">
                {reportConfig.configuration?.visualizations?.map(viz => (
                  <div key={viz.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{viz.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {viz.type} • {viz.chartType} • {viz.styling.width}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeVisualization(viz.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formatting" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <Label>Tema</Label>
                  <Select
                    value={reportConfig.configuration?.formatting?.theme}
                    onValueChange={(value) => updateConfiguration({
                      formatting: {
                        ...reportConfig.configuration?.formatting!,
                        theme: value as any,
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="corporate">Corporativo</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="branded">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page Settings */}
                <div className="space-y-4">
                  <Label>Configuração da Página</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      value={reportConfig.configuration?.formatting?.pageSettings.orientation}
                      onValueChange={(value) => updateConfiguration({
                        formatting: {
                          ...reportConfig.configuration?.formatting!,
                          pageSettings: {
                            ...reportConfig.configuration?.formatting!.pageSettings,
                            orientation: value as any,
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Retrato</SelectItem>
                        <SelectItem value="landscape">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={reportConfig.configuration?.formatting?.pageSettings.size}
                      onValueChange={(value) => updateConfiguration({
                        formatting: {
                          ...reportConfig.configuration?.formatting!,
                          pageSettings: {
                            ...reportConfig.configuration?.formatting!.pageSettings,
                            size: value as any,
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="letter">Letter</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Fonts */}
              <div className="space-y-4">
                <Label>Tipografia</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Título</Label>
                    <Select
                      value={reportConfig.configuration?.formatting?.fonts.heading}
                      onValueChange={(value) => updateConfiguration({
                        formatting: {
                          ...reportConfig.configuration?.formatting!,
                          fonts: {
                            ...reportConfig.configuration?.formatting!.fonts,
                            heading: value,
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Corpo</Label>
                    <Select
                      value={reportConfig.configuration?.formatting?.fonts.body}
                      onValueChange={(value) => updateConfiguration({
                        formatting: {
                          ...reportConfig.configuration?.formatting!,
                          fonts: {
                            ...reportConfig.configuration?.formatting!.fonts,
                            body: value,
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Monospace</Label>
                    <Select
                      value={reportConfig.configuration?.formatting?.fonts.monospace}
                      onValueChange={(value) => updateConfiguration({
                        formatting: {
                          ...reportConfig.configuration?.formatting!,
                          fonts: {
                            ...reportConfig.configuration?.formatting!.fonts,
                            monospace: value,
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Monaco">Monaco</SelectItem>
                        <SelectItem value="Consolas">Consolas</SelectItem>
                        <SelectItem value="Courier New">Courier New</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="mt-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>Destinatários</Label>

                <Button size="sm" onClick={() => {
                  // Add recipient logic
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Destinatário
                </Button>

                <div className="space-y-3">
                  {reportConfig.recipients?.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{recipient.destination}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {recipient.type}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setReportConfig(prev => ({
                            ...prev,
                            recipients: prev.recipients?.filter((_, i) => i !== index) || [],
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}