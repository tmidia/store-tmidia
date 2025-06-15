
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateFiltersProps {
  dateFrom: Date;
  dateTo: Date;
  appliedDateFrom: Date;
  appliedDateTo: Date;
  totalVendas?: number;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
  onSearch: () => void;
  onExportToPDF: () => void;
  hasData: boolean;
}

export const DateFilters = ({
  dateFrom,
  dateTo,
  appliedDateFrom,
  appliedDateTo,
  totalVendas,
  onDateFromChange,
  onDateToChange,
  onSearch,
  onExportToPDF,
  hasData
}: DateFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Período de Análise
        </CardTitle>
        <CardDescription>
          Selecione o período desejado e clique em "Buscar" para aplicar os filtros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Data Inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={(date) => date && onDateFromChange(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2 w-full sm:w-auto">
            <label className="text-sm font-medium">Data Final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                  {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={(date) => date && onDateToChange(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={onSearch} className="w-full sm:w-auto flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar
          </Button>

          <Button 
            onClick={onExportToPDF} 
            variant="outline" 
            className="w-full sm:w-auto flex items-center gap-2"
            disabled={!hasData}
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>

        {appliedDateFrom && appliedDateTo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Período aplicado:</strong> {format(appliedDateFrom, 'dd/MM/yyyy', { locale: ptBR })} até {format(appliedDateTo, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            {totalVendas !== undefined && (
              <p className="text-xs text-blue-600 mt-1">
                Encontradas {totalVendas} vendas no período
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
