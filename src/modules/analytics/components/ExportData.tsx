import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  FileImage
} from 'lucide-react';
import { useExport } from '../hooks/useExport';
import type { AnalyticsFilters, ExportFormat } from '../types/analytics.types';

interface ExportDataProps {
  filters: AnalyticsFilters;
}

const exportFormats: ExportFormat[] = [
  {
    type: 'csv',
    name: 'CSV',
    description: 'Para Excel e análise de dados',
    icon: 'FileSpreadsheet',
  },
  {
    type: 'json',
    name: 'JSON',
    description: 'Para integração com APIs',
    icon: 'FileJson',
  },
  {
    type: 'xlsx',
    name: 'Excel',
    description: 'Planilha completa com formatação',
    icon: 'FileSpreadsheet',
  },
  {
    type: 'pdf',
    name: 'PDF',
    description: 'Relatório executivo',
    icon: 'FileText',
  },
];

const getIcon = (iconName: string) => {
  const icons = {
    FileSpreadsheet,
    FileJson,
    FileText,
    FileImage,
  };
  return icons[iconName as keyof typeof icons] || FileText;
};

export function ExportData({ filters }: ExportDataProps) {
  const { exportData, isExporting, exportProgress } = useExport();

  const handleExport = async (format: ExportFormat['type']) => {
    const success = await exportData(format, filters, 'analytics');
    if (success) {
      // Pode adicionar notificação de sucesso aqui
    } else {
      // Pode adicionar notificação de erro aqui
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exportando...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {exportFormats.map((format) => {
            const IconComponent = getIcon(format.icon);
            return (
              <Button
                key={format.type}
                variant="outline"
                className="flex flex-col h-auto p-4 space-y-2"
                onClick={() => handleExport(format.type)}
                disabled={isExporting}
              >
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  <Badge variant="secondary">{format.name}</Badge>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {format.description}
                </p>
              </Button>
            );
          })}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Os dados exportados respeitam os filtros aplicados</p>
          <p>• Formato PDF inclui gráficos e visualizações</p>
          <p>• Arquivos Excel incluem múltiplas planilhas por categoria</p>
        </div>
      </CardContent>
    </Card>
  );
}