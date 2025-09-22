import { useState, useEffect } from 'react';
import { useBookkeeping } from '@/hooks/useBookkeeping';
import { useAuth } from '@/hooks/useAuth';
import { CollectionsList } from '@/components/CollectionsList';
import { PaymentsList } from '@/components/PaymentsList';
import { IncomeList } from '@/components/IncomeList';
import { ExpenseList } from '@/components/ExpenseList';
import { CategoryList } from '@/components/CategoryList';
import { AccountsOverview } from '@/components/AccountsOverview';
import { AccountsChart } from '@/components/AccountsChart';
import { IncomeVsExpenseChart } from '@/components/IncomeVsExpenseChart';
import { ExpenseDistributionChart } from '@/components/ExpenseDistributionChart';
import { BookkeepingSkeleton } from '@/components/BookkeepingSkeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { NotificationSettings } from '@/components/NotificationSettings';
import { PinScreen } from '@/components/PinScreen';
import { PatternScreen } from '@/components/PatternScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, TrendingDown, Wallet, DollarSign, Target, Percent, LogOut } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const Index = () => {
  const {
    data,
    totals,
    analytics,
    isLoading,
    operationLoading,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    markCollectItemAsCompleted,
    addPayItem,
    updatePayItem,
    deletePayItem,
    markPayItemAsCompleted,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    updateAccount,
    addAccount,
    deleteAccount,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useBookkeeping();

  const { 
    isAuthenticated, 
    login, 
    logout, 
    pinAttempts, 
    showPatternScreen, 
    incrementPinAttempts, 
    handlePatternCorrect 
  } = useAuth();
  const [isPrivate, setIsPrivate] = useState(() => {
    // Load privacy mode from localStorage on initialization
    const savedPrivacyMode = localStorage.getItem('privacy-mode');
    return savedPrivacyMode === 'true';
  });

  // Save privacy mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('privacy-mode', isPrivate.toString());
  }, [isPrivate]);
  
  const netBalance = totals.collect - totals.pay;

  if (isLoading) {
    return <BookkeepingSkeleton />;
  }

  if (!isAuthenticated) {
    if (showPatternScreen) {
      return <PatternScreen onPatternCorrect={handlePatternCorrect} />;
    }
    return (
      <PinScreen 
        onPinCorrect={login} 
        attempts={pinAttempts}
        onIncrementAttempts={incrementPinAttempts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 sm:mb-2 ${isPrivate ? 'privacy-blur' : ''}`}>NKBook Dashboard</h1>
            <p className={`text-muted-foreground text-xs sm:text-sm lg:text-base ${isPrivate ? 'privacy-blur' : ''}`}>Manage your collections, payments, and accounts</p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PrivacyToggle isPrivate={isPrivate} onToggle={() => setIsPrivate(!isPrivate)} />
            <ThemeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={logout}
              className="hover:bg-danger hover:text-danger-foreground h-8 w-8 sm:h-10 sm:w-10"
              title="Logout"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Financial Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Profit</CardTitle>
              <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 ${analytics.profit >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${analytics.profit >= 0 ? 'text-success' : 'text-danger'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {formatCurrency(analytics.profit)}
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Total Income</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.income)}</div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-6 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium ${isPrivate ? 'privacy-blur' : ''}`}>Total Expense</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-danger" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-lg sm:text-xl lg:text-2xl font-bold text-danger ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.expense)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Financial Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <Card className="p-2 sm:p-4 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Expense Ratio</CardTitle>
              <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-warning flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-warning ${isPrivate ? 'privacy-blur' : ''}`}>
                {`${analytics.expenseRatio.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Profit Margin</CardTitle>
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-primary ${isPrivate ? 'privacy-blur' : ''}`}>
                {`${analytics.profitMargin.toFixed(1)}%`}
              </div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6 col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>To Collect</CardTitle>
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-info flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-info ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.collect)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>To Pay</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-danger flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-danger ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.pay)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Available Funds</CardTitle>
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold text-primary ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(totals.accounts)}</div>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-4 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-0">
              <CardTitle className={`text-xs sm:text-sm font-medium truncate ${isPrivate ? 'privacy-blur' : ''}`}>Net Balance</CardTitle>
              <DollarSign className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${(totals.accounts + totals.collect - totals.pay) >= 0 ? 'text-success' : 'text-danger'}`} />
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className={`text-sm sm:text-lg lg:text-xl font-bold ${(totals.accounts + totals.collect - totals.pay) >= 0 ? 'text-success' : 'text-danger'} ${isPrivate ? 'privacy-blur' : ''}`}>
                {formatCurrency(totals.accounts + totals.collect - totals.pay)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collections & Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <CollectionsList
            items={data.collect}
            total={totals.collect}
            onAdd={addCollectItem}
            onUpdate={updateCollectItem}
            onDelete={deleteCollectItem}
            onMarkCompleted={markCollectItemAsCompleted}
            isPrivate={isPrivate}
          />

          <PaymentsList
            items={data.pay}
            total={totals.pay}
            onAdd={addPayItem}
            onUpdate={updatePayItem}
            onDelete={deletePayItem}
            onMarkCompleted={markPayItemAsCompleted}
            isPrivate={isPrivate}
          />
        </div>

        {/* Income & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <IncomeList
            items={data.income}
            total={totals.income}
            categories={data.categories}
            accounts={Object.entries(data.accounts).map(([key, account]) => ({
              id: account.id,
              name: account.name,
              type: account.type,
              amount: account.amount,
            }))}
            onAdd={addIncomeItem}
            onUpdate={updateIncomeItem}
            onDelete={deleteIncomeItem}
            isPrivate={isPrivate}
            isLoading={operationLoading.addIncome || operationLoading.updateIncome || operationLoading.deleteIncome}
          />

          <ExpenseList
            items={data.expense}
            total={totals.expense}
            categories={data.categories}
            accounts={Object.entries(data.accounts).map(([key, account]) => ({
              id: account.id,
              name: account.name,
              type: account.type,
              amount: account.amount,
            }))}
            onAdd={addExpenseItem}
            onUpdate={updateExpenseItem}
            onDelete={deleteExpenseItem}
            isPrivate={isPrivate}
            isLoading={operationLoading.addExpense || operationLoading.updateExpense || operationLoading.deleteExpense}
          />
        </div>

        {/* Categories Management */}
        <div className="mb-4 sm:mb-6">
          <CategoryList
            categories={data.categories}
            onAdd={addCategory}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
            isPrivate={isPrivate}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <IncomeVsExpenseChart 
            totalIncome={totals.income} 
            totalExpense={totals.expense} 
            isPrivate={isPrivate} 
          />
          
          <ExpenseDistributionChart 
            expenses={data.expense} 
            categories={data.categories}
            isPrivate={isPrivate} 
          />
        </div>

        {/* Accounts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <AccountsOverview
            accounts={data.accounts}
            total={totals.accounts}
            onUpdate={updateAccount}
            onAdd={addAccount}
            onDelete={deleteAccount}
            isPrivate={isPrivate}
          />

          <AccountsChart accounts={data.accounts} isPrivate={isPrivate} />
        </div>

        {/* Notification Settings Section */}
        <div className="mb-4 sm:mb-6">
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
};

export default Index;
