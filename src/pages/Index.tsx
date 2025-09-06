import { useState } from 'react';
import { useBookkeeping } from '@/hooks/useBookkeeping';
import { CollectionsList } from '@/components/CollectionsList';
import { PaymentsList } from '@/components/PaymentsList';
import { AccountsOverview } from '@/components/AccountsOverview';
import { AccountsChart } from '@/components/AccountsChart';
import { BookkeepingSkeleton } from '@/components/BookkeepingSkeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrivacyToggle } from '@/components/PrivacyToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Index = () => {
  const {
    data,
    totals,
    isLoading,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    addPayItem,
    updatePayItem,
    deletePayItem,
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Collect</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-success">{formatAmount(totals.collect)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Pay</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-warning">{formatAmount(totals.pay)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <Calculator className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatAmount(netBalance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Available</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{formatAmount(totals.accounts)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Collections */}
          <CollectionsList
            items={data.collect}
            total={totals.collect}
            onAdd={addCollectItem}
            onUpdate={updateCollectItem}
            onDelete={deleteCollectItem}
            isPrivate={isPrivate}
          />

          {/* Payments */}
          <PaymentsList
            items={data.pay}
            total={totals.pay}
            onAdd={addPayItem}
            onUpdate={updatePayItem}
            onDelete={deletePayItem}
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
