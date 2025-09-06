import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import { Accounts } from '@/hooks/useBookkeeping';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AccountsChartProps {
  accounts: Accounts;
}

export const AccountsChart = ({ accounts }: AccountsChartProps) => {
  const data = {
    labels: ['Cash', 'Kotak Bank', 'Federal Bank', 'Credit Card'],
    datasets: [
      {
        data: [accounts.cash, accounts.kotak, accounts.federal, accounts.creditCard],
        backgroundColor: [
          'hsl(142 76% 36%)', // success
          'hsl(217 91% 52%)', // primary
          'hsl(217 91% 62%)', // primary lighter
          'hsl(25 95% 53%)',  // warning
        ],
        borderColor: [
          'hsl(142 76% 36%)',
          'hsl(217 91% 52%)',
          'hsl(217 91% 62%)',
          'hsl(25 95% 53%)',
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
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            return `${context.label}: ₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Accounts Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};