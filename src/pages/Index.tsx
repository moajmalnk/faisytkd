import { useBookkeeping } from '@/hooks/useBookkeeping';
import { CollectionsList } from '@/components/CollectionsList';
import { PaymentsList } from '@/components/PaymentsList';
import { AccountsOverview } from '@/components/AccountsOverview';
import { AccountsChart } from '@/components/AccountsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Index = () => {
  const {
    data,
    totals,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    addPayItem,
    updatePayItem,
    deletePayItem,
    updateAccount,
  } = useBookkeeping();

  const netBalance = totals.collect - totals.pay;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Bookkeeping Dashboard</h1>
          <p className="text-muted-foreground">Manage your collections, payments, and accounts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Collect</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">₹{totals.collect.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Pay</CardTitle>
              <TrendingDown className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">₹{totals.pay.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <Calculator className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                ₹{netBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Available</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">₹{totals.accounts.toLocaleString()}</div>
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
          />

          {/* Payments */}
          <PaymentsList
            items={data.pay}
            total={totals.pay}
            onAdd={addPayItem}
            onUpdate={updatePayItem}
            onDelete={deletePayItem}
          />
        </div>

        {/* Accounts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountsOverview
            accounts={data.accounts}
            total={totals.accounts}
            onUpdate={updateAccount}
          />

          <AccountsChart accounts={data.accounts} />
        </div>
      </div>
    </div>
  );
};

export default Index;
