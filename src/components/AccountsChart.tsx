import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, TrendingUp } from 'lucide-react';
import { Accounts } from '@/hooks/useBookkeeping';

ChartJS.register(ArcElement, Tooltip, Legend);

interface AccountsChartProps {
  accounts: Accounts;
  isPrivate?: boolean;
}

export const AccountsChart = ({ accounts, isPrivate = false }: AccountsChartProps) => {
  // Get account data and sort by amount (largest first)
  const accountEntries = Object.entries(accounts).map(([key, accountData]) => ({
    key,
    name: accountData.name,
    amount: accountData.amount,
    type: accountData.type,
  })).sort((a, b) => b.amount - a.amount);

  const chartData = isPrivate 
    ? accountEntries.map(() => 100) // Equal segments when private
    : accountEntries.map(account => account.amount);

  // Resolve theme tokens from CSS variables
  const cssHsl = (name: string, fallback: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v ? `hsl(${v})` : fallback;
  };

  const primary = cssHsl('--primary', 'hsl(217 91% 52%)');
  const success = cssHsl('--success', 'hsl(142 76% 36%)');
  const warning = cssHsl('--warning', 'hsl(25 95% 53%)');
  const foreground = cssHsl('--foreground', 'hsl(210 10% 15%)');
  const bg = cssHsl('--background', 'hsl(0 0% 100%)');
  const border = cssHsl('--border', 'hsl(214 32% 91%)');
  const popover = cssHsl('--popover', 'hsl(0 0% 100%)');
  const popoverFg = cssHsl('--popover-foreground', foreground);

  // Generate colors based on account type
  const getAccountColor = (type: string, index: number) => {
    const map: Record<string, string> = {
      cash: success,
      bank: primary,
      credit: warning,
    };
    if (!map[type]) {
      // fallback: rotate primary hue for variety
      const baseHue = 217;
      const hue = (baseHue + index * 28) % 360;
      return `hsl(${hue} 88% 55%)`;
    }
    return map[type];
  };

  const data = {
    labels: accountEntries.map(account => isPrivate ? '••••••' : account.name),
    datasets: [
      {
        data: chartData,
        backgroundColor: accountEntries.map((account, index) => 
          getAccountColor(account.type, index)
        ),
        borderColor: bg,
        borderWidth: 4,
        hoverBorderWidth: 4,
        hoverOffset: 8,
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
          pointStyle: 'circle',
          font: {
            size: 12,
            weight: 'normal',
          },
          color: foreground,
        },
      },
      tooltip: {
        backgroundColor: popover,
        titleColor: popoverFg,
        bodyColor: popoverFg,
        borderColor: border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `Amount: ₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  // Calculate total for display
  const totalAmount = accountEntries.reduce((sum, account) => sum + account.amount, 0);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className={`text-xl font-semibold text-foreground ${isPrivate ? 'privacy-blur' : ''}`}>
                Accounts Distribution
              </CardTitle>
              <p className={`text-sm text-muted-foreground mt-1 ${isPrivate ? 'privacy-blur' : ''}`}>
                Visual breakdown of your account balances
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{accountEntries.length} accounts</span>
            </div>
            <div className={`text-lg font-bold text-primary mt-1 ${isPrivate ? 'privacy-blur' : ''}`}>
              {`₹${totalAmount.toLocaleString()}`}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {accountEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <PieChart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Accounts Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Add some accounts to see the distribution chart. Your financial overview will appear here.
            </p>
          </div>
        ) : (
          <div className="h-48 sm:h-64">
            <Doughnut data={data} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};