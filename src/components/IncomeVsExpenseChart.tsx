import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IncomeVsExpenseChartProps {
  totalIncome: number;
  totalExpense: number;
  isPrivate?: boolean;
}

export const IncomeVsExpenseChart = ({ totalIncome, totalExpense, isPrivate = false }: IncomeVsExpenseChartProps) => {
  const chartData = isPrivate 
    ? [100, 100] // Equal bars when private
    : [totalIncome, totalExpense];

  const netAmount = totalIncome - totalExpense;
  const isPositive = netAmount >= 0;

  // Resolve theme tokens to actual CSS color strings
  const getCssHsl = (name: string) => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value ? `hsl(${value})` : undefined;
  };

  const successStart = getCssHsl('--success');
  const successEnd = getCssHsl('--success-foreground') || successStart;
  const dangerStart = getCssHsl('--destructive');
  const dangerEnd = getCssHsl('--destructive-foreground') || dangerStart;
  const gridColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()})`;
  const tickColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim()})`;
  const tooltipBg = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--popover').trim()})`;
  const tooltipBorder = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()})`;
  const tooltipText = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--popover-foreground').trim()})`;

  const data = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: chartData,
        backgroundColor: (context: any) => {
          const { ctx, chartArea, dataIndex } = context.chart;
          if (!chartArea) return dataIndex === 0 ? successStart : dangerStart;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          if (dataIndex === 0) {
            gradient.addColorStop(0, successStart || 'hsl(142 76% 36%)');
            gradient.addColorStop(1, successEnd || 'hsl(142 76% 46%)');
          } else {
            gradient.addColorStop(0, dangerStart || 'hsl(0 84% 60%)');
            gradient.addColorStop(1, dangerEnd || 'hsl(0 84% 70%)');
          }
          return gradient;
        },
        borderColor: (context: any) => {
          const { dataIndex } = context.chart;
          return dataIndex === 0
            ? (successStart || 'hsl(142 76% 36%)')
            : (dangerStart || 'hsl(0 84% 60%)');
        },
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 64,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutCubic',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `Amount: ₹${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 500,
          },
          color: tickColor,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: tickColor,
          callback: function(value: any) {
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Income vs Expense</h3>
              <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Financial overview</p>
            </div>
          </div>
          {!isPrivate && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-danger'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {isPositive ? '+' : ''}₹{Math.abs(netAmount).toLocaleString()}
              </p>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 sm:h-64 relative">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};