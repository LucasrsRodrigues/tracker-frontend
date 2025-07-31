import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  FileText,
  Mail,
  MessageSquare,
  Code,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Eye,
  Play,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AlertTemplate, TemplateVariable } from '../types/alerts.types';

const TEMPLATE_VARIABLES = [
  { name: 'alert.name', description: 'Nome da regra de alerta', type: 'string' },
  { name: 'alert.severity', description: 'Severidade do alerta', type: 'string' },
  { name: 'alert.message', description: 'Mensagem do alerta', type: 'string' },
  { name: 'alert.value', description: 'Valor atual da métrica', type: 'number' },
  { name: 'alert.threshold', description: 'Valor limite configurado', type: 'number' },
  { name: 'alert.timestamp', description: 'Data/hora do alerta', type: 'date' },
  { name: 'alert.duration', description: 'Duração do alerta', type: 'string' },
  { name: 'alert.tags', description: 'Tags associadas', type: 'string' },
  { name: 'system.hostname', description: 'Nome do servidor', type: 'string' },
  { name: 'system.environment', description: 'Ambiente (prod, staging, etc)', type: 'string' },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'default-email',
    name: 'Email Padrão',
    subject: 'Alerta: {{alert.name}} - {{alert.severity}}',
    body: `Olá,

Um alerta foi disparado no sistema:

🚨 **{{alert.name}}**
📊 Severidade: {{alert.severity}}
📝 Descrição: {{alert.message}}
📈 Valor atual: {{alert.value}}
⚠️ Limite: {{alert.threshold}}
🕐 Disparado em: {{alert.timestamp}}
🏷️ Tags: {{alert.tags}}

Ambiente: {{system.environment}}
Servidor: {{system.hostname}}

Por favor, verifique o sistema e tome as ações necessárias.

---
Sistema de Monitoramento`,
    format: 'text' as const,
    variables: TEMPLATE_VARIABLES.slice(0, 8),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'slack-simple',
    name: 'Slack Simples',
    subject: '',
    body: `🚨 *{{alert.name}}*
Severidade: \`{{alert.severity}}\`
Valor: {{alert.value}} (limite: {{alert.threshold}})
Ambiente: {{system.environment}}`,
    format: 'markdown' as const,
    variables: TEMPLATE_VARIABLES.slice(0, 6),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export function AlertTemplates() {
  const [templates, setTemplates] = useState<AlertTemplate[]>(DEFAULT_TEMPLATES);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AlertTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<AlertTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<AlertTemplate>>({
    name: '',
    subject: '',
    body: '',
    format: 'text',
    variables: [],
  });

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      format: 'text',
      variables: [],
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: AlertTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsCreateDialogOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.body) return;

    const templateData: AlertTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      subject: formData.subject || '',
      body: formData.body,
      format: formData.format || 'text',
      variables: formData.variables || [],
      createdAt: editingTemplate?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? templateData : t));
    } else {
      setTemplates(prev => [...prev, templateData]);
    }

    setIsCreateDialogOpen(false);
    setEditingTemplate(null);
    setFormData({});
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleDuplicateTemplate = (template: AlertTemplate) => {
    const duplicated: AlertTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const handlePreviewTemplate = (template: AlertTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'html': return <Code className="h-4 w-4" />;
      case 'markdown': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      text: 'bg-gray-100 text-gray-800',
      html: 'bg-orange-100 text-orange-800',
      markdown: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={colors[format as keyof typeof colors] || colors.text}>
        {format.toUpperCase()}
      </Badge>
    );
  };

  const renderPreview = (template: AlertTemplate) => {
    // Mock data for preview
    const mockData = {
      'alert.name': 'High Error Rate API',
      'alert.severity': 'critical',
      'alert.message': 'Taxa de erro acima do limite aceitável',
      'alert.value': '15.2%',
      'alert.threshold': '5%',
      'alert.timestamp': new Date().toLocaleString('pt-BR'),
      'alert.duration': '5 minutos',
      'alert.tags': 'api, production, critical',
      'system.hostname': 'api-server-01',
      'system.environment': 'production',
    };

    const processTemplate = (text: string) => {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        return mockData[key.trim() as keyof typeof mockData] || match;
      });
    };

    return {
      subject: processTemplate(template.subject),
      body: processTemplate(template.body),
    };
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.body || '';
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}{{${variable}}}${after}`;

      setFormData(prev => ({ ...prev, body: newText }));

      // Focus and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Templates de Notificação</h2>
          <p className="text-muted-foreground">
            Personalize o formato das mensagens de alerta
          </p>
        </div>
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Templates Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Formato</TableHead>
                <TableHead>Variáveis</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFormatIcon(template.format)}
                      <span className="font-medium">{template.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getFormatBadge(template.format)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {template.variables.length} variáveis
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Crie templates personalizados para suas notificações de alerta
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6">
            {/* Form */}
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Template</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Alerta Crítico Email"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, format: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto Simples</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Assunto (Opcional)</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Alerta: {{alert.name}}"
                  value={formData.subject || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="template-body">Corpo da Mensagem</Label>
                <Textarea
                  id="template-body"
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Digite sua mensagem aqui. Use {{variavel}} para inserir dados dinâmicos."
                  value={formData.body || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
                </Button>
              </div>
            </div>

            {/* Variables Panel */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Variáveis Disponíveis</h4>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <div
                      key={variable.name}
                      className="p-2 border rounded-md cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => insertVariable(variable.name)}
                    >
                      <div className="font-mono text-xs text-blue-600">
                        {`{{${variable.name}}}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {variable.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Visualização com dados de exemplo
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              {previewTemplate.subject && (
                <div>
                  <Label>Assunto:</Label>
                  <div className="p-3 bg-muted rounded-md font-medium">
                    {renderPreview(previewTemplate).subject}
                  </div>
                </div>
              )}

              <div>
                <Label>Conteúdo:</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {renderPreview(previewTemplate).body}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}