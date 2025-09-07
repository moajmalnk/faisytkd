import { useState } from 'react';
import { useBookkeeping } from '@/hooks/useBookkeeping';
import { CollectionsList } from '@/components/CollectionsList';
import { PaymentsList } from '@/components/PaymentsList';
import { IncomeList } from '@/components/IncomeList';
import { ExpenseList } from '@/components/ExpenseList';
import { AccountsOverview } from '@/components/AccountsOverview';
import { AccountsChart } from '@/components/AccountsChart';
import { IncomeVsExpenseChart } from '@/components/IncomeVsExpenseChart';
import { ExpenseDistributionChart } from '@/components/ExpenseDistributionChart';
import { BookkeepingSkeleton } from '@/components/BookkeepingSkeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, TrendingDown, Wallet, DollarSign, Target, Percent } from 'lucide-react';

const Index = () => {
  const {
    data,
    totals,
    analytics,
    isLoading,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    addPayItem,
    updatePayItem,
    deletePayItem,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    updateAccount,
  } = useBookkeeping();

  const [isPrivate, setIsPrivate] = useState(false);
  const netBalance = totals.collect - totals.pay;

  const formatAmount = (amount: number) => {
    if (isPrivate) return '••••••';
    return `₹${amount.toLocaleString()}`;
  };

  if (isLoading) {
    return <BookkeepingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Bookkeeping Dashboard</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your collections, payments, and accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <PrivacyToggle isPrivate={isPrivate} onToggle={() => setIsPrivate(!isPrivate)} />
            <ThemeToggle />
          </div>
        </div>

        {/* Financial Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <DollarSign className={`h-4 w-4 ${analytics.profit >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${analytics.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatAmount(analytics.profit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-success">{formatAmount(totals.income)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
              <TrendingDown className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-danger">{formatAmount(totals.expense)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
              <Percent className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-warning">
                {isPrivate ? '••••••' : `${analytics.expenseRatio.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {isPrivate ? '••••••' : `${analytics.profitMargin.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Collect</CardTitle>
              <Calculator className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-info">{formatAmount(totals.collect)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Pay</CardTitle>
              <TrendingDown className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-danger">{formatAmount(totals.pay)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Funds</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{formatAmount(totals.accounts)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className={`h-4 w-4 ${(totals.accounts + totals.collect - totals.pay) >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${(totals.accounts + totals.collect - totals.pay) >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatAmount(totals.accounts + totals.collect - totals.pay)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CollectionsList
            items={data.collect}
            total={totals.collect}
            onAdd={addCollectItem}
            onUpdate={updateCollectItem}
            onDelete={deleteCollectItem}
            isPrivate={isPrivate}
          />

          <PaymentsList
            items={data.pay}
            total={totals.pay}
            onAdd={addPayItem}
            onUpdate={updatePayItem}
            onDelete={deletePayItem}
            isPrivate={isPrivate}
          />
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <IncomeList
            items={data.income}
            total={totals.income}
            onAdd={addIncomeItem}
            onUpdate={updateIncomeItem}
            onDelete={deleteIncomeItem}
            isPrivate={isPrivate}
          />

          <ExpenseList
            items={data.expense}
            total={totals.expense}
            onAdd={addExpenseItem}
            onUpdate={updateExpenseItem}
            onDelete={deleteExpenseItem}
            isPrivate={isPrivate}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <IncomeVsExpenseChart 
            totalIncome={totals.income} 
            totalExpense={totals.expense} 
            isPrivate={isPrivate} 
          />
          
          <ExpenseDistributionChart 
            expenses={data.expense} 
            isPrivate={isPrivate} 
          />
        </div>

        {/* Accounts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountsOverview
            accounts={data.accounts}
            total={totals.accounts}
            onUpdate={updateAccount}
            isPrivate={isPrivate}
          />

          <AccountsChart accounts={data.accounts} isPrivate={isPrivate} />
        </div>
      </div>
    </div>
  );
};

export default Index;
