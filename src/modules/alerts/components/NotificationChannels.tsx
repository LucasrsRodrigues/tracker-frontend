import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Mail,
  MessageSquare,
  Webhook,
  Phone,
  Users,
  Hash,
  MoreHorizontal,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { NotificationChannel, ChannelConfig } from '../types/alerts.types';

const CHANNEL_TYPES = [
  { value: 'email', label: 'Email', icon: Mail, description: 'Enviar notificações por email' },
  { value: 'slack', label: 'Slack', icon: MessageSquare, description: 'Integração com Slack' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, description: 'HTTP webhook personalizado' },
  { value: 'sms', label: 'SMS', icon: Phone, description: 'Mensagens de texto' },
  { value: 'teams', label: 'Microsoft Teams', icon: Users, description: 'Integração com Teams' },
  { value: 'discord', label: 'Discord', icon: Hash, description: 'Integração com Discord' },
];

export function NotificationChannels() {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: '1',
      name: 'Equipe DevOps',
      type: 'email',
      config: { emails: ['devops@empresa.com', 'sre@empresa.com'] },
      enabled: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Canal Alertas',
      type: 'slack',
      config: {
        webhookUrl: 'https://hooks.slack.com/...',
        channel: '#alertas',
        username: 'AlertBot'
      },
      enabled: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-20'),
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [formData, setFormData] = useState<Partial<NotificationChannel>>({
    name: '',
    type: 'email',
    config: {},
    enabled: true,
  });

  const getChannelIcon = (type: string) => {
    const channelType = CHANNEL_TYPES.find(t => t.value === type);
    const Icon = channelType?.icon || Webhook;
    return <Icon className="h-4 w-4" />;
  };

  const getChannelTypeLabel = (type: string) => {
    return CHANNEL_TYPES.find(t => t.value === type)?.label || type;
  };

  const handleCreateChannel = () => {
    setEditingChannel(null);
    setFormData({
      name: '',
      type: 'email',
      config: {},
      enabled: true,
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditChannel = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setFormData(channel);
    setIsCreateDialogOpen(true);
  };

  const handleSaveChannel = () => {
    if (!formData.name || !formData.type) return;

    const channelData: NotificationChannel = {
      id: editingChannel?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type as any,
      config: formData.config || {},
      enabled: formData.enabled || true,
      createdAt: editingChannel?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (editingChannel) {
      setChannels(prev => prev.map(c => c.id === editingChannel.id ? channelData : c));
    } else {
      setChannels(prev => [...prev, channelData]);
    }

    setIsCreateDialogOpen(false);
    setEditingChannel(null);
    setFormData({});
  };

  const handleDeleteChannel = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
  };

  const handleTestChannel = async (channel: NotificationChannel) => {
    // Simular teste do canal
    console.log('Testing channel:', channel);
    // Aqui você implementaria a lógica real de teste
  };

  const renderChannelConfig = () => {
    if (!formData.type) return null;

    switch (formData.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emails">Endereços de Email</Label>
              <Textarea
                id="emails"
                placeholder="email1@empresa.com, email2@empresa.com"
                value={formData.config?.emails?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    emails: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                  }
                }))}
              />
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.slack.com/services/..."
                value={formData.config?.webhookUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, webhookUrl: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Input
                id="channel"
                placeholder="#alertas"
                value={formData.config?.channel || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, channel: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="username">Nome do Bot</Label>
              <Input
                id="username"
                placeholder="AlertBot"
                value={formData.config?.username || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, username: e.target.value }
                }))}
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url"
                placeholder="https://api.exemplo.com/webhooks/alertas"
                value={formData.config?.url || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, url: e.target.value }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="method">Método HTTP</Label>
              <Select
                value={formData.config?.method || 'POST'}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, method: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumbers">Números de Telefone</Label>
              <Textarea
                id="phoneNumbers"
                placeholder="+5511999999999, +5511888888888"
                value={formData.config?.phoneNumbers?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: {
                    ...prev.config,
                    phoneNumbers: e.target.value.split(',').map(phone => phone.trim()).filter(Boolean)
                  }
                }))}
              />
            </div>
          </div>
        );

      case 'teams':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamsWebhookUrl">Teams Webhook URL</Label>
              <Input
                id="teamsWebhookUrl"
                placeholder="https://outlook.office.com/webhook/..."
                value={formData.config?.teamsWebhookUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, teamsWebhookUrl: e.target.value }
                }))}
              />
            </div>
          </div>
        );

      case 'discord':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="discordWebhookUrl">Discord Webhook URL</Label>
              <Input
                id="discordWebhookUrl"
                placeholder="https://discord.com/api/webhooks/..."
                value={formData.config?.discordWebhookUrl || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  config: { ...prev.config, discordWebhookUrl: e.target.value }
                }))}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Canais de Notificação</h2>
          <p className="text-muted-foreground">
            Configure onde e como receber notificações de alertas
          </p>
        </div>
        <Button onClick={handleCreateChannel}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Canal
        </Button>
      </div>

      {/* Channels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Canais Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Configuração</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getChannelIcon(channel.type)}
                      <span className="font-medium">{channel.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getChannelTypeLabel(channel.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {channel.enabled ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {channel.type === 'email' && `${channel.config.emails?.length || 0} email(s)`}
                      {channel.type === 'slack' && channel.config.channel}
                      {channel.type === 'webhook' && channel.config.url}
                      {channel.type === 'sms' && `${channel.config.phoneNumbers?.length || 0} número(s)`}
                      {channel.type === 'teams' && 'Teams configurado'}
                      {channel.type === 'discord' && 'Discord configurado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {channel.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTestChannel(channel)}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Testar Canal
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditChannel(channel)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteChannel(channel.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? 'Editar Canal' : 'Novo Canal de Notificação'}
            </DialogTitle>
            <DialogDescription>
              Configure como e onde receber notificações de alertas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Canal</Label>
                <Input
                  id="name"
                  placeholder="Ex: Equipe DevOps"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    type: value as any,
                    config: {} // Reset config when type changes
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderChannelConfig()}

            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled">Canal ativo</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveChannel}>
                {editingChannel ? 'Salvar Alterações' : 'Criar Canal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}