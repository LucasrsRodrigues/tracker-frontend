import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Settings, Globe,
  Shield, HardDrive, FileSpreadsheet,
  Package,
  Eye
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatNumber } from '@/utils/formatters';

// Interfaces para opções de exportação
interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: any;
  maxSize: number; // MB
  features: string[];
  popular: boolean;
  restrictions?: string[];
}

interface ExportConfiguration {
  format: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  compression: boolean;
  watermark: boolean;
  customWatermark?: string;
  includedSections: string[];
  styling: {
    theme: 'light' | 'dark' | 'corporate' | 'custom';
    colorScheme: string;
    fontSize: number;
    margins: number;
  };
  security: {
    passwordProtected: boolean;
    password?: string;
    allowPrinting: boolean;
    allowCopying: boolean;
    allowEditing: boolean;
  };
  distribution: {
    autoEmail: boolean;
    recipients: string[];
    ftpUpload: boolean;
    cloudStorage: boolean;
    webhook?: string;
  };
  scheduling: {
    enabled: boolean;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    startDate?: Date;
    endDate?: Date;
  };
}

interface ExportPreset {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'technical' | 'sharing' | 'archival';
  configuration: ExportConfiguration;
  usageCount: number;
}

// Mock data
const exportFormats: ExportFormat[] = [
  {
    id: 'pdf',
    name: 'PDF',
    extension: 'pdf',
    description: 'Formato universal para relatórios executivos e apresentações',
    icon: FileText,
    maxSize: 50,
    features: ['Preserva formatação', 'Suporte a gráficos', 'Segurança avançada', 'Multiplataforma'],
    popular: true
  },
  {
    id: 'excel',
    name: 'Excel',
    extension: 'xlsx',
    description: 'Planilhas interativas com dados editáveis e fórmulas',
    icon: FileSpreadsheet,
    maxSize: 100,
    features: ['Dados editáveis', 'Fórmulas dinâmicas', 'Múltiplas abas', 'Gráficos interativos'],
    popular: true
  },
  {
    id: 'powerpoint',
    name: 'PowerPoint',
    extension: 'pptx',
    description: 'Apresentações profissionais para reuniões executivas',
    icon: FileText,
    maxSize: 75,
    features: ['Slides dinâmicos', 'Animações', 'Templates executivos', 'Notas de apresentação'],
    popular: false
  },
  {
    id: 'csv',
    name: 'CSV',
    extension: 'csv',
    description: 'Dados tabulares simples para análise e importação',
    icon: FileText,
    maxSize: 200,
    features: ['Dados puros', 'Compatibilidade universal', 'Baixo tamanho', 'Processamento rápido'],
    popular: false
  },
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    description: 'Estrutura de dados para integração com APIs e sistemas',
    icon: Package,
    maxSize: 150,
    features: ['Estrutura hierárquica', 'APIs REST', 'Processamento automático', 'Metadados inclusos'],
    popular: false
  },
  {
    id: 'html',
    name: 'HTML',
    extension: 'html',
    description: 'Relatórios web interativos com navegação e filtros',
    icon: Globe,
    maxSize: 25,
    features: ['Interatividade', 'Responsivo', 'Filtros dinâmicos', 'Compartilhamento web'],
    popular: false,
    restrictions: ['Requer servidor web para funcionalidades completas']
  }
];

const exportPresets: ExportPreset[] = [
  {
    id: 'executive-pdf',
    name: 'Executivo - PDF',
    description: 'Relatório executivo em PDF com alta qualidade e marca d\'água corporativa',
    category: 'executive',
    configuration: {
      format: 'pdf',
      quality: 'high',
      compression: false,
      watermark: true,
      customWatermark: 'CONFIDENCIAL',
      includedSections: ['summary', 'charts', 'insights', 'recommendations'],
      styling: {
        theme: 'corporate',
        colorScheme: 'blue',
        fontSize: 12,
        margins: 20
      },
      security: {
        passwordProtected: true,
        allowPrinting: false,
        allowCopying: false,
        allowEditing: false
      },
      distribution: {
        autoEmail: true,
        recipients: ['diretoria@empresa.com'],
        ftpUpload: false,
        cloudStorage: true
      },
      scheduling: {
        enabled: false,
        frequency: 'once'
      }
    },
    usageCount: 342
  },
  {
    id: 'data-excel',
    name: 'Análise - Excel',
    description: 'Planilha Excel com dados detalhados e fórmulas para análise',
    category: 'technical',
    configuration: {
      format: 'excel',
      quality: 'medium',
      compression: true,
      watermark: false,
      includedSections: ['data', 'charts', 'calculations', 'raw_data'],
      styling: {
        theme: 'light',
        colorScheme: 'green',
        fontSize: 10,
        margins: 15
      },
      security: {
        passwordProtected: false,
        allowPrinting: true,
        allowCopying: true,
        allowEditing: true
      },
      distribution: {
        autoEmail: false,
        recipients: [],
        ftpUpload: false,
        cloudStorage: false
      },
      scheduling: {
        enabled: false,
        frequency: 'once'
      }
    },
    usageCount: 156
  },
  {
    id: 'sharing-web',
    name: 'Compartilhamento - Web',
    description: 'Relatório HTML interativo para compartilhamento público',
    category: 'sharing',
    configuration: {
      format: 'html',
      quality: 'medium',
      compression: true,
      watermark: false,
      includedSections: ['summary', 'charts', 'interactive'],
      styling: {
        theme: 'light',
        colorScheme: 'blue',
        fontSize: 14,
        margins: 10
      },
      security: {
        passwordProtected: false,
        allowPrinting: true,
        allowCopying: true,
        allowEditing: false
      },
      distribution: {
        autoEmail: false,
        recipients: [],
        ftpUpload: false,
        cloudStorage: true
      },
      scheduling: {
        enabled: false,
        frequency: 'once'
      }
    },
    usageCount: 89
  }
];

export function ExportOptions() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(exportFormats[0]);
  const [configuration, setConfiguration] = useState<ExportConfiguration>(exportPresets[0].configuration);
  const [selectedPreset, setSelectedPreset] = useState<string>('executive-pdf');
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [customRecipients, setCustomRecipients] = useState('');

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    setConfiguration(prev => ({ ...prev, format: format.id }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = exportPresets.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setConfiguration(preset.configuration);
      const format = exportFormats.find(f => f.id === preset.configuration.format);
      if (format) setSelectedFormat(format);
    }
  };

  const handleConfigUpdate = (section: keyof ExportConfiguration, updates: any) => {
    setConfiguration(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], ...updates }
        : updates
    }));
  };

  const handleExport = () => {
    console.log('Exporting with configuration:', configuration);
    // Implementar lógica de exportação
  };

  const handlePreview = () => {
    setIsPreviewDialogOpen(true);
  };

  const getQualityDescription = (quality: string) => {
    const descriptions = {
      low: 'Menor tamanho, qualidade básica',
      medium: 'Equilibrio entre tamanho e qualidade',
      high: 'Alta qualidade, arquivos maiores',
      ultra: 'Máxima qualidade, arquivos grandes'
    };
    return descriptions[quality as keyof typeof descriptions] || quality;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'executive': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'technical': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'sharing': return <Globe className="h-4 w-4 text-green-600" />;
      case 'archival': return <HardDrive className="h-4 w-4 text-gray-600" />;
      default: return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const estimatedFileSize = () => {
    const baseSize = selectedFormat.id === 'pdf' ? 2.5 :
      selectedFormat.id === 'excel' ? 1.8 :
        selectedFormat.id === 'powerpoint' ? 3.2 :
          selectedFormat.id === 'csv' ? 0.3 :
            selectedFormat.id === 'json' ? 0.5 : 1.2;

    const qualityMultiplier = configuration.quality === 'ultra' ? 1.8 :
      configuration.quality === 'high' ? 1.4 :
        configuration.quality === 'medium' ? 1.0 : 0.6;

    const compressionMultiplier = configuration.compression ? 0.7 : 1.0;

    return (baseSize * qualityMultiplier * compressionMultiplier).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Opções de Exportação</h2>
          <p className="text-muted-foreground">
            Configure formatos, qualidade e distribuição dos seus relatórios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Format Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formatos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <div
                    key={format.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFormat.id === format.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                      }`}
                    onClick={() => handleFormatSelect(format)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{format.name}</span>
                          {format.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Max: {format.maxSize}MB</span>
                          <span>•</span>
                          <span>{format.features.length} recursos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de Exportação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quality" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="quality">Qualidade</TabsTrigger>
                <TabsTrigger value="styling">Estilo</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="distribution">Distribuição</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
              </TabsList>

              <TabsContent value="quality" className="space-y-4 mt-4">
                <div>
                  <Label>Qualidade de Exportação</Label>
                  <Select
                    value={configuration.quality}
                    onValueChange={(value) => handleConfigUpdate('quality', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa - {getQualityDescription('low')}</SelectItem>
                      <SelectItem value="medium">Média - {getQualityDescription('medium')}</SelectItem>
                      <SelectItem value="high">Alta - {getQualityDescription('high')}</SelectItem>
                      <SelectItem value="ultra">Ultra - {getQualityDescription('ultra')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compressão</Label>
                    <p className="text-sm text-muted-foreground">Reduz o tamanho do arquivo</p>
                  </div>
                  <Switch
                    checked={configuration.compression}
                    onCheckedChange={(checked) => handleConfigUpdate('compression', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marca d'água</Label>
                      <p className="text-sm text-muted-foreground">Adiciona marca d'água corporativa</p>
                    </div>
                    <Switch
                      checked={configuration.watermark}
                      onCheckedChange={(checked) => handleConfigUpdate('watermark', checked)}
                    />
                  </div>
                  {configuration.watermark && (
                    <Input
                      placeholder="Texto da marca d'água"
                      value={configuration.customWatermark || ''}
                      onChange={(e) => handleConfigUpdate('customWatermark', e.target.value)}
                    />
                  )}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tamanho Estimado:</span>
                    <Badge variant="outline">{estimatedFileSize()} MB</Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="styling" className="space-y-4 mt-4">
                <div>
                  <Label>Tema</Label>
                  <Select
                    value={configuration.styling.theme}
                    onValueChange={(value) => handleConfigUpdate('styling', { theme: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="corporate">Corporativo</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Esquema de Cores</Label>
                  <Select
                    value={configuration.styling.colorScheme}
                    onValueChange={(value) => handleConfigUpdate('styling', { colorScheme: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                      <SelectItem value="gray">Cinza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tamanho da Fonte: {configuration.styling.fontSize}pt</Label>
                  <Slider
                    value={[configuration.styling.fontSize]}
                    onValueChange={(value) => handleConfigUpdate('styling', { fontSize: value[0] })}
                    min={8}
                    max={18}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Margens: {configuration.styling.margins}mm</Label>
                  <Slider
                    value={[configuration.styling.margins]}
                    onValueChange={(value) => handleConfigUpdate('styling', { margins: value[0] })}
                    min={5}
                    max={40}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-4">
                {selectedFormat.id === 'pdf' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Proteger com Senha</Label>
                          <p className="text-sm text-muted-foreground">Requer senha para abrir</p>
                        </div>
                        <Switch
                          checked={configuration.security.passwordProtected}
                          onCheckedChange={(checked) => handleConfigUpdate('security', { passwordProtected: checked })}
                        />
                      </div>
                      {configuration.security.passwordProtected && (
                        <Input
                          type="password"
                          placeholder="Digite a senha"
                          value={configuration.security.password || ''}
                          onChange={(e) => handleConfigUpdate('security', { password: e.target.value })}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Impressão</Label>
                        <p className="text-sm text-muted-foreground">Usuários podem imprimir o documento</p>
                      </div>
                      <Switch
                        checked={configuration.security.allowPrinting}
                        onCheckedChange={(checked) => handleConfigUpdate('security', { allowPrinting: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Cópia</Label>
                        <p className="text-sm text-muted-foreground">Usuários podem copiar texto</p>
                      </div>
                      <Switch
                        checked={configuration.security.allowCopying}
                        onCheckedChange={(checked) => handleConfigUpdate('security', { allowCopying: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Permitir Edição</Label>
                        <p className="text-sm text-muted-foreground">Usuários podem editar o documento</p>
                      </div>
                      <Switch
                        checked={configuration.security.allowEditing}
                        onCheckedChange={(checked) => handleConfigUpdate('security', { allowEditing: checked })}
                      />
                    </div>
                  </>
                )}

                {selectedFormat.id !== 'pdf' && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Opções de segurança disponíveis apenas para PDF</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="distribution" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Envio Automático por Email</Label>
                      <p className="text-sm text-muted-foreground">Envia automaticamente após geração</p>
                    </div>
                    <Switch
                      checked={configuration.distribution.autoEmail}
                      onCheckedChange={(checked) => handleConfigUpdate('distribution', { autoEmail: checked })}
                    />
                  </div>
                  {configuration.distribution.autoEmail && (
                    <Textarea
                      placeholder="email1@empresa.com, email2@empresa.com"
                      value={customRecipients}
                      onChange={(e) => {
                        setCustomRecipients(e.target.value);
                        const recipients = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                        handleConfigUpdate('distribution', { recipients });
                      }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Upload para Nuvem</Label>
                    <p className="text-sm text-muted-foreground">Salva automaticamente no armazenamento</p>
                  </div>
                  <Switch
                    checked={configuration.distribution.cloudStorage}
                    onCheckedChange={(checked) => handleConfigUpdate('distribution', { cloudStorage: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Upload FTP</Label>
                    <p className="text-sm text-muted-foreground">Envia para servidor FTP configurado</p>
                  </div>
                  <Switch
                    checked={configuration.distribution.ftpUpload}
                    onCheckedChange={(checked) => handleConfigUpdate('distribution', { ftpUpload: checked })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="presets" className="space-y-4 mt-4">
                <div>
                  <Label>Presets Pré-configurados</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configurações otimizadas para diferentes cenários
                  </p>
                </div>

                <div className="space-y-3">
                  {exportPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPreset === preset.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                        }`}
                      onClick={() => handlePresetSelect(preset.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getCategoryIcon(preset.category)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{preset.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatNumber(preset.usageCount)} usos
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {preset.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Selected Format Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <selectedFormat.icon className="h-5 w-5" />
            Recursos do {selectedFormat.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {selectedFormat.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
          {selectedFormat.restrictions && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800">Restrições:</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {selectedFormat.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{restriction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview da Configuração</DialogTitle>
            <DialogDescription>
              Resumo das configurações de exportação selecionadas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Formato</h4>
                <div className="flex items-center gap-2 mt-1">
                  <selectedFormat.icon className="h-4 w-4" />
                  <span className="font-medium">{selectedFormat.name}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Qualidade</h4>
                <span className="font-medium capitalize">{configuration.quality}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Tamanho Estimado</h4>
                <span className="font-medium">{estimatedFileSize()} MB</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Compressão</h4>
                <Badge variant={configuration.compression ? "default" : "outline"}>
                  {configuration.compression ? 'Ativada' : 'Desativada'}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Configurações de Segurança</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Protegido por senha:</span>
                  <Badge variant={configuration.security.passwordProtected ? "default" : "outline"}>
                    {configuration.security.passwordProtected ? 'Sim' : 'Não'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Permite impressão:</span>
                  <Badge variant={configuration.security.allowPrinting ? "default" : "outline"}>
                    {configuration.security.allowPrinting ? 'Sim' : 'Não'}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Distribuição</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Email automático:</span>
                  <Badge variant={configuration.distribution.autoEmail ? "default" : "outline"}>
                    {configuration.distribution.autoEmail ? 'Ativado' : 'Desativado'}
                  </Badge>
                </div>
                {configuration.distribution.autoEmail && configuration.distribution.recipients.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">
                      Destinatários: {configuration.distribution.recipients.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setIsPreviewDialogOpen(false);
                handleExport();
              }}>
                <Download className="h-4 w-4 mr-2" />
                Confirmar Exportação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}