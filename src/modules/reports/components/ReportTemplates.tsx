import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Search,
  Star,
  StarOff,
  Play,
  Settings
} from 'lucide-react';
import { formatNumber } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces baseadas na estrutura do projeto
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'technical' | 'financial' | 'operational' | 'custom';
  version: string;
  author: string;
  isPublic: boolean;
  isFavorite: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  previewImage?: string;
  supportedFormats: string[];
  estimatedTime: number; // em minutos
  complexity: 'low' | 'medium' | 'high';
  tags: string[];
  configuration: {
    dataSource: string[];
    parameters: TemplateParameter[];
    visualizations: string[];
    customizable: boolean;
  };
  metrics: {
    avgGenerationTime: number;
    successRate: number;
    usageCount: number;
    rating: number;
  };
}

interface TemplateParameter {
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  description: string;
}

interface TemplateProps {
  onSelectTemplate: (template: ReportTemplate) => void;
}

// Mock data
const mockTemplates: ReportTemplate[] = [
  {
    id: 'exec-summary',
    name: 'Resumo Executivo',
    description: 'Painel executivo com KPIs principais, tendências e insights estratégicos para tomada de decisão',
    category: 'executive',
    version: '2.1.0',
    author: 'Sistema',
    isPublic: true,
    isFavorite: true,
    downloadCount: 1247,
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    supportedFormats: ['pdf', 'excel', 'powerpoint'],
    estimatedTime: 5,
    complexity: 'medium',
    tags: ['kpi', 'executivo', 'estratégico', 'mensal'],
    configuration: {
      dataSource: ['analytics', 'financial', 'operational'],
      parameters: [
        { name: 'period', type: 'select', required: true, options: ['monthly', 'quarterly'], defaultValue: 'monthly', description: 'Período do relatório' },
        { name: 'includeForecasting', type: 'boolean', required: false, defaultValue: true, description: 'Incluir projeções' }
      ],
      visualizations: ['charts', 'tables', 'gauges'],
      customizable: true
    },
    metrics: {
      avgGenerationTime: 4.2,
      successRate: 98.5,
      usageCount: 342,
      rating: 4.8
    }
  },
  {
    id: 'perf-daily',
    name: 'Performance Diária',
    description: 'Monitoramento técnico detalhado com métricas de performance, disponibilidade e alertas críticos',
    category: 'technical',
    version: '1.5.2',
    author: 'DevOps Team',
    isPublic: true,
    isFavorite: false,
    downloadCount: 856,
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    supportedFormats: ['pdf', 'excel', 'json'],
    estimatedTime: 2,
    complexity: 'low',
    tags: ['performance', 'monitoring', 'devops', 'diário'],
    configuration: {
      dataSource: ['monitoring', 'logs', 'metrics'],
      parameters: [
        { name: 'includeAlerts', type: 'boolean', required: false, defaultValue: true, description: 'Incluir alertas críticos' },
        { name: 'timeRange', type: 'select', required: true, options: ['24h', '48h', '7d'], defaultValue: '24h', description: 'Período de análise' }
      ],
      visualizations: ['timeseries', 'heatmaps', 'alerts'],
      customizable: true
    },
    metrics: {
      avgGenerationTime: 1.8,
      successRate: 99.2,
      usageCount: 156,
      rating: 4.6
    }
  },
  {
    id: 'financial-monthly',
    name: 'Análise Financeira Mensal',
    description: 'Relatório financeiro completo com P&L, fluxo de caixa, análise de custos e indicadores de rentabilidade',
    category: 'financial',
    version: '3.0.1',
    author: 'Finance Team',
    isPublic: true,
    isFavorite: true,
    downloadCount: 623,
    createdAt: new Date(Date.now() - 86400000 * 120),
    updatedAt: new Date(Date.now() - 86400000 * 14),
    supportedFormats: ['excel', 'pdf'],
    estimatedTime: 8,
    complexity: 'high',
    tags: ['financeiro', 'p&l', 'custos', 'mensal'],
    configuration: {
      dataSource: ['financial', 'accounting', 'budget'],
      parameters: [
        { name: 'includeForecast', type: 'boolean', required: false, defaultValue: false, description: 'Incluir previsões' },
        { name: 'detailLevel', type: 'select', required: true, options: ['summary', 'detailed', 'full'], defaultValue: 'detailed', description: 'Nível de detalhamento' },
        { name: 'currency', type: 'select', required: true, options: ['BRL', 'USD', 'EUR'], defaultValue: 'BRL', description: 'Moeda' }
      ],
      visualizations: ['charts', 'tables', 'waterfall'],
      customizable: true
    },
    metrics: {
      avgGenerationTime: 7.3,
      successRate: 96.8,
      usageCount: 89,
      rating: 4.9
    }
  },
  {
    id: 'user-analytics',
    name: 'Analytics de Usuários',
    description: 'Comportamento de usuários, jornadas, conversões e segmentação avançada com insights acionáveis',
    category: 'operational',
    version: '2.3.0',
    author: 'Product Team',
    isPublic: true,
    isFavorite: false,
    downloadCount: 445,
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    supportedFormats: ['pdf', 'excel', 'csv'],
    estimatedTime: 6,
    complexity: 'medium',
    tags: ['analytics', 'usuários', 'conversão', 'segmentação'],
    configuration: {
      dataSource: ['analytics', 'events', 'user_data'],
      parameters: [
        { name: 'includeSegmentation', type: 'boolean', required: false, defaultValue: true, description: 'Incluir análise de segmentos' },
        { name: 'conversionFunnels', type: 'boolean', required: false, defaultValue: true, description: 'Incluir funis de conversão' }
      ],
      visualizations: ['funnels', 'cohorts', 'heatmaps', 'charts'],
      customizable: true
    },
    metrics: {
      avgGenerationTime: 5.7,
      successRate: 97.1,
      usageCount: 234,
      rating: 4.7
    }
  },
  {
    id: 'custom-basic',
    name: 'Template Personalizado',
    description: 'Template básico personalizável para criação de relatórios específicos com estrutura flexível',
    category: 'custom',
    version: '1.0.0',
    author: 'current-user',
    isPublic: false,
    isFavorite: false,
    downloadCount: 23,
    createdAt: new Date(Date.now() - 86400000 * 15),
    updatedAt: new Date(Date.now() - 86400000 * 3),
    supportedFormats: ['pdf', 'excel', 'csv', 'json'],
    estimatedTime: 3,
    complexity: 'low',
    tags: ['personalizado', 'flexível', 'básico'],
    configuration: {
      dataSource: ['custom'],
      parameters: [
        { name: 'title', type: 'text', required: true, defaultValue: 'Relatório Personalizado', description: 'Título do relatório' },
        { name: 'sections', type: 'number', required: true, defaultValue: 3, description: 'Número de seções' }
      ],
      visualizations: ['custom'],
      customizable: true
    },
    metrics: {
      avgGenerationTime: 2.1,
      successRate: 94.2,
      usageCount: 8,
      rating: 4.0
    }
  }
];

export function ReportTemplates({ onSelectTemplate }: TemplateProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>(mockTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'technical': return <Settings className="h-5 w-5 text-blue-600" />;
      case 'financial': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'operational': return <BarChart3 className="h-5 w-5 text-orange-600" />;
      case 'custom': return <FileText className="h-5 w-5 text-gray-600" />;
      default: return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      executive: 'Executivo',
      technical: 'Técnico',
      financial: 'Financeiro',
      operational: 'Operacional',
      custom: 'Personalizado'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    const labels = {
      low: 'Simples',
      medium: 'Médio',
      high: 'Complexo'
    };
    return labels[complexity as keyof typeof labels] || complexity;
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => prev.map(t =>
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handlePreviewTemplate = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleUseTemplate = (template: ReportTemplate) => {
    onSelectTemplate(template);
  };

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    const duplicated: ReportTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      author: 'current-user',
      isPublic: false,
      isFavorite: false,
      downloadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      metrics: {
        avgGenerationTime: template.metrics.avgGenerationTime,
        successRate: 0,
        usageCount: 0,
        rating: 0
      }
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFavorites = !showOnlyFavorites || template.isFavorite;

    return matchesCategory && matchesComplexity && matchesSearch && matchesFavorites;
  });

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.floor(rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
              }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates de Relatórios</h2>
          <p className="text-muted-foreground">
            Escolha um template pré-configurado ou crie o seu próprio
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="executive">Executivo</SelectItem>
            <SelectItem value="technical">Técnico</SelectItem>
            <SelectItem value="financial">Financeiro</SelectItem>
            <SelectItem value="operational">Operacional</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Complexidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Simples</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="high">Complexo</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showOnlyFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <Star className={`h-4 w-4 mr-2 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          Favoritos
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(template.category)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        v{template.version}
                      </Badge>
                      <Badge className={getComplexityColor(template.complexity)}>
                        {getComplexityLabel(template.complexity)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(template.id)}
                >
                  {template.isFavorite ? (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>~{template.estimatedTime}min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-3 w-3" />
                    <span>{formatNumber(template.downloadCount)}</span>
                  </div>
                </div>

                {renderStarRating(template.metrics.rating)}

                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Usar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      {template.author === 'current-user' && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Visualização detalhada do template
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Categoria</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(previewTemplate.category)}
                    <span>{getCategoryLabel(previewTemplate.category)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Complexidade</h4>
                  <Badge className={getComplexityColor(previewTemplate.complexity)} size="sm">
                    {getComplexityLabel(previewTemplate.complexity)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tempo Estimado</h4>
                  <p className="font-medium">~{previewTemplate.estimatedTime} minutos</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-medium mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description}
                </p>
              </div>

              {/* Configuration */}
              <div>
                <h4 className="text-sm font-medium mb-3">Configuração</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Fontes de Dados</h5>
                    <div className="flex flex-wrap gap-1">
                      {previewTemplate.configuration.dataSource.map((source) => (
                        <Badge key={source} variant="outline" className="text-xs">
                          {source}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Formatos Suportados</h5>
                    <div className="flex flex-wrap gap-1">
                      {previewTemplate.supportedFormats.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs uppercase">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameters */}
              {previewTemplate.configuration.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Parâmetros Configuráveis</h4>
                  <div className="space-y-2">
                    {previewTemplate.configuration.parameters.map((param) => (
                      <div key={param.name} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="text-sm font-medium">{param.name}</div>
                          <div className="text-xs text-muted-foreground">{param.description}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <h4 className="text-sm font-medium mb-3">Métricas de Performance</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">Tempo Médio</div>
                    <div className="text-lg font-bold">
                      {previewTemplate.metrics.avgGenerationTime.toFixed(1)}min
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                    <div className="text-lg font-bold">
                      {previewTemplate.metrics.successRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">Usos</div>
                    <div className="text-lg font-bold">
                      {formatNumber(previewTemplate.metrics.usageCount)}
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-sm text-muted-foreground">Avaliação</div>
                    <div className="text-lg font-bold">
                      {previewTemplate.metrics.rating.toFixed(1)}★
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setIsPreviewDialogOpen(false);
                }}>
                  <Play className="h-4 w-4 mr-2" />
                  Usar Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}