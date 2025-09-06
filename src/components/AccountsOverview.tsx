import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Wallet, CreditCard, Building2, Banknote } from 'lucide-react';
import { Accounts } from '@/hooks/useBookkeeping';

interface AccountsOverviewProps {
  accounts: Accounts;
  total: number;
  onUpdate: (account: keyof Accounts, amount: number) => void;
}

export const AccountsOverview = ({ accounts, total, onUpdate }: AccountsOverviewProps) => {
  const [editAccount, setEditAccount] = useState<keyof Accounts | null>(null);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    onUpdate(editAccount, parsedAmount);
    setEditAccount(null);
    setAmount('');
  };

  const openEdit = (account: keyof Accounts) => {
    setEditAccount(account);
    setAmount(accounts[account].toString());
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const accountConfig = {
    cash: { label: 'Cash', icon: Banknote, color: 'text-success' },
    kotak: { label: 'Kotak Bank', icon: Building2, color: 'text-primary' },
    federal: { label: 'Federal Bank', icon: Building2, color: 'text-primary' },
    creditCard: { label: 'Credit Card', icon: CreditCard, color: 'text-warning' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Accounts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(accounts).map(([key, value]) => {
            const account = key as keyof Accounts;
            const config = accountConfig[account];
            const Icon = config.icon;
            
            return (
              <div key={account} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <p className={`text-lg font-bold ${config.color}`}>
                      {formatCurrency(value)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(account)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Available:</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Edit {editAccount && accountConfig[editAccount].label} Balance
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button type="submit" className="w-full">Update Balance</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};