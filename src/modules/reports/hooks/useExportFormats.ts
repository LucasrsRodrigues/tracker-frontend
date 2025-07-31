import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsService } from '../../../services/reports.service';
import type { OutputFormat } from '../types/reports.types';

export function useExportFormats() {
  const [exportProgress, setExportProgress] = useState<Record<string, number>>({});
  const [isExporting, setIsExporting] = useState<Record<string, boolean>>({});

  const exportReport = useMutation({
    mutationFn: async ({
      reportId,
      format,
      configuration
    }: {
      reportId?: string;
      format: OutputFormat['type'];
      configuration?: any;
    }) => {
      const exportId = `${reportId || 'preview'}-${format}-${Date.now()}`;

      setIsExporting(prev => ({ ...prev, [exportId]: true }));
      setExportProgress(prev => ({ ...prev, [exportId]: 0 }));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => ({
          ...prev,
          [exportId]: Math.min((prev[exportId] || 0) + Math.random() * 15, 90)
        }));
      }, 500);

      try {
        const result = await reportsService.exportReport(reportId, format, configuration);

        clearInterval(progressInterval);
        setExportProgress(prev => ({ ...prev, [exportId]: 100 }));

        // Download the file
        const url = window.URL.createObjectURL(new Blob([result.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, exportId };
      } catch (error) {
        clearInterval(progressInterval);
        return { success: false, error, exportId };
      } finally {
        setTimeout(() => {
          setIsExporting(prev => ({ ...prev, [exportId]: false }));
          setExportProgress(prev => ({ ...prev, [exportId]: 0 }));
        }, 2000);
      }
    },
  });

  const getAvailableFormats = useCallback((reportType?: string): OutputFormat[] => {
    const allFormats: OutputFormat[] = [
      {
        type: 'pdf',
        name: 'PDF',
        description: 'Relatório executivo com formatação completa',
        features: ['Gráficos', 'Tabelas', 'Branding', 'Print-ready'],
        maxSize: 50,
        compression: true,
      },
      {
        type: 'excel',
        name: 'Excel',
        description: 'Planilha com dados e gráficos interativos',
        features: ['Múltiplas abas', 'Fórmulas', 'Gráficos', 'Pivot tables'],
        maxSize: 100,
        compression: true,
      },
      {
        type: 'csv',
        name: 'CSV',
        description: 'Dados tabulares para análise externa',
        features: ['Dados raw', 'Compatibilidade universal', 'Leveza'],
        maxSize: 200,
        compression: true,
      },
      {
        type: 'json',
        name: 'JSON',
        description: 'Dados estruturados para integração',
        features: ['API-friendly', 'Estrutura preservada', 'Metadados'],
        maxSize: 50,
        compression: true,
      },
      {
        type: 'html',
        name: 'HTML',
        description: 'Relatório web interativo',
        features: ['Interativo', 'Responsivo', 'Compartilhável'],
        maxSize: 25,
        compression: false,
      },
      {
        type: 'powerpoint',
        name: 'PowerPoint',
        description: 'Apresentação executiva',
        features: ['Slides', 'Gráficos', 'Templates', 'Apresentação'],
        maxSize: 75,
        compression: true,
      },
    ];

    // Filter formats based on report type if needed
    return allFormats;
  }, []);

  return {
    exportReport,
    exportProgress,
    isExporting,
    getAvailableFormats,
  };
}