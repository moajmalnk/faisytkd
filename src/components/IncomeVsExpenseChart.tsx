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

  const data = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          'hsl(142 76% 36%)', // success
          'hsl(0 84% 60%)',   // danger
        ],
        borderColor: [
          'hsl(142 76% 36%)',
          'hsl(0 84% 60%)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (isPrivate) {
              return `${context.label}: ••••••`;
            }
            const value = context.parsed.y;
            return `${context.label}: ₹${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (isPrivate) return '••••••';
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Income vs Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};