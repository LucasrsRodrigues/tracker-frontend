import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  X,
  Save,
  TestTube,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import type { AlertRule, AlertCondition, AlertMetric } from '../types/alerts.types';

interface AlertConfigurationProps {
  rule?: AlertRule;
  onSave?: (rule: Partial<AlertRule>) => void;
  onCancel?: () => void;
}

export function AlertConfiguration({ rule, onSave, onCancel }: AlertConfigurationProps) {
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    name: rule?.name || '',
    description: rule?.description || '',
    enabled: rule?.enabled ?? true,
    metric: rule?.metric || {
      type: 'system',
      name: '',
      aggregation: 'avg',
    },
    conditions: rule?.conditions || [{
      id: '1',
      operator: 'gt',
      threshold: 0,
    }],
    evaluationWindow: rule?.evaluationWindow || 300,
    frequency: rule?.frequency || 60,
    severity: rule?.severity || 'medium',
    channels: rule?.channels || [],
    tags: rule?.tags || [],
    ...rule,
  });

  const [newTag, setNewTag] = useState('');

  const metricTypes = [
    { value: 'system', label: 'Sistema' },
    { value: 'business', label: 'Negócio' },
    { value: 'error', label: 'Erro' },
    { value: 'performance', label: 'Performance' },
    { value: 'custom', label: 'Customizado' },
  ];

  const aggregations = [
    { value: 'sum', label: 'Soma' },
    { value: 'avg', label: 'Média' },
    { value: 'min', label: 'Mínimo' },
    { value: 'max', label: 'Máximo' },
    { value: 'count', label: 'Contagem' },
    { value: 'rate', label: 'Taxa' },
  ];

  const operators = [
    { value: 'gt', label: '>' },
    { value: 'gte', label: '>=' },
    { value: 'lt', label: '<' },
    { value: 'lte', label: '<=' },
    { value: 'eq', label: '=' },
    { value: 'neq', label: '!=' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Baixo', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-800' },
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMetric = (field: keyof AlertMetric, value: any) => {
    setFormData(prev => ({
      ...prev,
      metric: { ...prev.metric!, [field]: value }
    }));
  };

  const addCondition = () => {
    const newCondition: AlertCondition = {
      id: Date.now().toString(),
      operator: 'gt',
      threshold: 0,
    };
    updateFormData('conditions', [...(formData.conditions || []), newCondition]);
  };

  const updateCondition = (id: string, field: keyof AlertCondition, value: any) => {
    const updatedConditions = formData.conditions?.map(condition =>
      condition.id === id ? { ...condition, [field]: value } : condition
    );
    updateFormData('conditions', updatedConditions);
  };

  const removeCondition = (id: string) => {
    const updatedConditions = formData.conditions?.filter(condition => condition.id !== id);
    updateFormData('conditions', updatedConditions);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateFormData('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags?.filter(t => t !== tag));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const handleTest = () => {
    // Test the rule configuration
    console.log('Testing rule:', formData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {rule ? 'Editar Regra de Alerta' : 'Nova Regra de Alerta'}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTest}>
            <TestTube className="h-4 w-4 mr-2" />
            Testar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="metric">Métrica</TabsTrigger>
            <TabsTrigger value="conditions">Condições</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Regra</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Ex: Alto uso de CPU"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severidade</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value) => updateFormData('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={level.color}>{level.label}</Badge>
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
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Descreva quando este alerta deve ser disparado..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => updateFormData('enabled', checked)}
                />
                <Label>Regra ativa</Label>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Adicionar tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metric" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Métrica</Label>
                  <Select
                    value={formData.metric?.type}
                    onValueChange={(value) => updateMetric('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {metricTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Agregação</Label>
                  <Select
                    value={formData.metric?.aggregation}
                    onValueChange={(value) => updateMetric('aggregation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aggregations.map(agg => (
                        <SelectItem key={agg.value} value={agg.value}>
                          {agg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome da Métrica</Label>
                <Input
                  value={formData.metric?.name}
                  onChange={(e) => updateMetric('name', e.target.value)}
                  placeholder="Ex: cpu_usage, error_rate, response_time"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Janela de Avaliação (segundos)</Label>
                  <Input
                    type="number"
                    value={formData.evaluationWindow}
                    onChange={(e) => updateFormData('evaluationWindow', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frequência de Verificação (segundos)</Label>
                  <Input
                    type="number"
                    value={formData.frequency}
                    onChange={(e) => updateFormData('frequency', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conditions" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Condições de Alerta</Label>
                <Button size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Condição
                </Button>
              </div>

              {formData.conditions?.map((condition, index) => (
                <div key={condition.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Condição {index + 1}</span>
                    {formData.conditions!.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Operador</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Limite</Label>
                      <Input
                        type="number"
                        value={condition.threshold}
                        onChange={(e) => updateCondition(condition.id, 'threshold', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input
                        value={condition.unit || ''}
                        onChange={(e) => updateCondition(condition.id, 'unit', e.target.value)}
                        placeholder="%, ms, MB, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Duração Mínima (segundos)</Label>
                    <Input
                      type="number"
                      value={condition.duration || ''}
                      onChange={(e) => updateCondition(condition.id, 'duration', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Tempo que a condição deve persistir"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-4">Canais de Notificação</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os canais de notificação na seção de canais e depois selecione aqui quais usar para esta regra.
                </p>
                {/* Channel selection would go here */}
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-4">Regras de Supressão</h3>
                <p className="text-sm text-muted-foreground">
                  Configure quando este alerta deve ser suprimido (ex: fora do horário comercial, durante manutenção, etc.)
                </p>
                {/* Suppression rules would go here */}
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-4">Template de Mensagem</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um template personalizado para as mensagens deste alerta.
                </p>
                {/* Template selection would go here */}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}