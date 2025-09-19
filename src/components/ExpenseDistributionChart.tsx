import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { ExpenseItem, Category } from '@/hooks/useBookkeeping';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseDistributionChartProps {
  expenses: ExpenseItem[];
  categories: Category[];
  isPrivate?: boolean;
}

export const ExpenseDistributionChart = ({ expenses, categories, isPrivate = false }: ExpenseDistributionChartProps) => {
  // Group expenses by category
  const categoryTotals = categories
    .filter(cat => cat.type === 'expense')
    .map(category => {
      const total = expenses
        .filter(expense => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        category,
        total,
      };
    })
    .filter(item => item.total > 0);

  const chartData = isPrivate 
    ? categoryTotals.map(() => 100) // Equal segments when private
    : categoryTotals.map(item => item.total);

  // Resolve theme tokens
  const cssHsl = (name: string, fallback: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v ? `hsl(${v})` : fallback;
  };
  const bg = cssHsl('--background', 'hsl(0 0% 100%)');
  const legendColor = cssHsl('--foreground', 'hsl(210 10% 15%)');
  const popover = cssHsl('--popover', 'hsl(0 0% 100%)');
  const popoverFg = cssHsl('--popover-foreground', legendColor);
  const border = cssHsl('--border', 'hsl(214 32% 91%)');

  const data = {
    labels: categoryTotals.map(item => isPrivate ? '••••••' : item.category.name),
    datasets: [
      {
        data: chartData,
        backgroundColor: categoryTotals.map(item => item.category.color),
        borderColor: bg,
        borderWidth: 4,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 500,
          },
          color: legendColor,
        },
      },
      tooltip: {
        backgroundColor: popover,
        titleColor: popoverFg,
        bodyColor: popoverFg,
        borderColor: border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed;
            const percentage = ((value / categoryTotals.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1);
            return `Amount: ₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  if (categoryTotals.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Expense Distribution</h3>
              <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Category breakdown</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-48 sm:h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No expenses to display</p>
              <p className="text-sm text-muted-foreground mt-1">Add some expenses to see the distribution</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Expense Distribution</h3>
            <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Category breakdown</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 sm:h-64 relative">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};