import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { ExpenseItem } from '@/hooks/useBookkeeping';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseDistributionChartProps {
  expenses: ExpenseItem[];
  isPrivate?: boolean;
}

export const ExpenseDistributionChart = ({ expenses, isPrivate = false }: ExpenseDistributionChartProps) => {
  const chartData = isPrivate 
    ? expenses.map(() => 100) // Equal segments when private
    : expenses.map(expense => expense.amount);

  const colors = [
    'hsl(0 84% 60%)',    // danger
    'hsl(25 95% 53%)',   // warning
    'hsl(142 76% 36%)',  // success
    'hsl(217 91% 52%)',  // primary
    'hsl(270 95% 60%)',  // purple
    'hsl(346 87% 43%)',  // pink
    'hsl(24 74% 58%)',   // orange
    'hsl(173 58% 39%)',  // teal
  ];

  const data = {
    labels: expenses.map(expense => expense.name),
    datasets: [
      {
        data: chartData,
        backgroundColor: colors.slice(0, expenses.length),
        borderColor: colors.slice(0, expenses.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (isPrivate) {
              return `${context.label}: ••••••`;
            }
            const value = context.parsed;
            return `${context.label}: ₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Expense Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">
            No expenses to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Expense Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};