import { useState } from 'react';
import { analyticsService } from '../../../services/analytics.service';
import type { AnalyticsFilters, ExportFormat } from '../types/analytics.types';

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportData = async (
    format: ExportFormat['type'],
    filters: AnalyticsFilters,
    dataType: string
  ) => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simula progresso
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await analyticsService.exportData(format, filters, dataType);

      clearInterval(progressInterval);
      setExportProgress(100);

      // Download do arquivo
      const url = window.URL.createObjectURL(new Blob([result.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erro ao exportar:', error);
      return false;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return {
    exportData,
    isExporting,
    exportProgress,
  };
}