import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  AlertTriangle,
  Settings,
  FileText,
  Monitor
} from 'lucide-react';

const quickActions = [
  {
    id: 'analytics',
    title: 'Ver Analytics',
    description: 'Análise detalhada de métricas',
    icon: BarChart3,
    path: '/analytics',
    color: 'text-blue-600',
  },
  {
    id: 'user-journey',
    title: 'Jornada do Usuário',
    description: 'Mapear comportamento dos usuários',
    icon: Users,
    path: '/user-journey',
    color: 'text-green-600',
  },
  {
    id: 'monitoring',
    title: 'Monitoramento',
    description: 'Status em tempo real',
    icon: Monitor,
    path: '/monitoring',
    color: 'text-purple-600',
  },
  {
    id: 'errors',
    title: 'Tracking de Erros',
    description: 'Análise de erros e problemas',
    icon: AlertTriangle,
    path: '/errors',
    color: 'text-red-600',
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Gerar relatórios executivos',
    icon: FileText,
    path: '/reports',
    color: 'text-orange-600',
  },
  {
    id: 'alerts',
    title: 'Configurar Alertas',
    description: 'Gerenciar notificações',
    icon: Settings,
    path: '/alerts',
    color: 'text-gray-600',
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="flex flex-col h-auto p-4 hover:shadow-md transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <IconComponent className={`h-6 w-6 mb-2 ${action.color}`} />
                <span className="font-medium text-sm mb-1">{action.title}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {action.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}