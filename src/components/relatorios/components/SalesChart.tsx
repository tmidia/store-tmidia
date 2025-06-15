
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const chartConfig = {
  vendas: { label: "Vendas", color: "#3b82f6" },
  receita: { label: "Receita", color: "#10b981" }
};

interface ChartData {
  date: string;
  vendas: number;
  receita: number;
}

interface SalesChartProps {
  chartData: ChartData[];
  isLoading: boolean;
}

export const SalesChart = ({ chartData, isLoading }: SalesChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução das Vendas</CardTitle>
        <CardDescription>Vendas e receita por dia no período selecionado</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill={chartConfig.vendas.color} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
