import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Wallet, CreditCard, Building2, Banknote, Plus, Trash2 } from 'lucide-react';
import { Accounts } from '@/hooks/useBookkeeping';
import { formatCurrency } from '@/lib/utils';

interface AccountsOverviewProps {
  accounts: Accounts;
  total: number;
  onUpdate: (account: keyof Accounts, amount: number) => void;
  onAdd: (name: string, type: 'cash' | 'bank' | 'credit', amount: number) => void;
  onDelete: (account: keyof Accounts) => void;
  isPrivate?: boolean;
}

export const AccountsOverview = ({ accounts, total, onUpdate, onAdd, onDelete, isPrivate = false }: AccountsOverviewProps) => {
  const [editAccount, setEditAccount] = useState<keyof Accounts | null>(null);
  const [deleteAccount, setDeleteAccount] = useState<keyof Accounts | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [addFormData, setAddFormData] = useState({ name: '', type: 'bank' as 'cash' | 'bank' | 'credit', amount: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount || !amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return;

    onUpdate(editAccount, parsedAmount);
    setEditAccount(null);
    setAmount('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.amount) return;

    const parsedAmount = parseFloat(addFormData.amount);
    if (isNaN(parsedAmount)) return;

    onAdd(addFormData.name, addFormData.type, parsedAmount);
    setAddFormData({ name: '', type: 'bank', amount: '' });
    setIsAddOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteAccount) {
      onDelete(deleteAccount);
      setDeleteAccount(null);
    }
  };

  const openEdit = (account: keyof Accounts) => {
    setEditAccount(account);
    setAmount(accounts[account].amount.toString());
  };


  const getAccountConfig = (accountId: string, accountName: string, accountType?: 'cash' | 'bank' | 'credit') => {
    // Check if it's a predefined account
    const predefinedConfigs = {
      cash: { label: 'Cash', icon: Banknote, color: 'text-success', bgColor: 'from-success/5 to-success/10', borderColor: 'border-success/20' },
      kotak: { label: 'Kotak Bank', icon: Building2, color: 'text-primary', bgColor: 'from-primary/5 to-primary/10', borderColor: 'border-primary/20' },
      federal: { label: 'Federal Bank', icon: Building2, color: 'text-primary', bgColor: 'from-primary/5 to-primary/10', borderColor: 'border-primary/20' },
      creditcard: { label: 'Credit Card', icon: CreditCard, color: 'text-warning', bgColor: 'from-warning/5 to-warning/10', borderColor: 'border-warning/20' },
    };

    if (predefinedConfigs[accountId as keyof typeof predefinedConfigs]) {
      return predefinedConfigs[accountId as keyof typeof predefinedConfigs];
    }

    // For dynamically added accounts, determine config based on type or name
    const type = accountType || (accountName.toLowerCase().includes('credit') ? 'credit' : 
                                accountName.toLowerCase().includes('cash') ? 'cash' : 'bank');
    
    const typeConfigs = {
      cash: { icon: Banknote, color: 'text-success', bgColor: 'from-success/5 to-success/10', borderColor: 'border-success/20' },
      bank: { icon: Building2, color: 'text-primary', bgColor: 'from-primary/5 to-primary/10', borderColor: 'border-primary/20' },
      credit: { icon: CreditCard, color: 'text-warning', bgColor: 'from-warning/5 to-warning/10', borderColor: 'border-warning/20' },
    };

    return {
      label: accountName,
      ...typeConfigs[type],
    };
  };

  const accountTypeOptions = [
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-success' },
    { value: 'bank', label: 'Bank Account', icon: Building2, color: 'text-primary' },
    { value: 'credit', label: 'Credit Card', icon: CreditCard, color: 'text-warning' },
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className={`text-primary text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Accounts</CardTitle>
            <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Manage your financial accounts</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Account</DialogTitle>
              <p className="text-sm text-muted-foreground">Create a new financial account</p>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Name</label>
                <Input
                  placeholder="e.g., HDFC Bank, SBI"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Type</label>
                <Select value={addFormData.type} onValueChange={(value: 'cash' | 'bank' | 'credit') => setAddFormData({ ...addFormData, type: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`h-4 w-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Balance</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={addFormData.amount}
                  onChange={(e) => setAddFormData({ ...addFormData, amount: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(accounts).map(([key, accountData]) => {
            const account = key as keyof Accounts;
            const config = getAccountConfig(account as string, accountData.name, accountData.type);
            const Icon = config.icon;
            
            return (
              <div key={account} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl hover:shadow-md transition-all duration-200 gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm sm:text-base truncate text-foreground ${isPrivate ? 'privacy-blur' : ''}`}>{config.label}</p>
                    <p className={`text-base sm:text-lg font-bold ${config.color} ${isPrivate ? 'privacy-blur' : ''}`}>
                      {formatCurrency(accountData.amount)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(account)}
                    className="h-9 w-9 p-0 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Edit2 className="h-4 w-4 text-primary" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the "{config.label}" account? This will permanently remove the account and all its data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(account)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <div>
              <span className="font-semibold text-foreground">Total Available</span>
              <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>{Object.keys(accounts).length} account{Object.keys(accounts).length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-2xl font-bold text-primary ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit {editAccount && accounts[editAccount]?.name} Balance
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Update account balance</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Balance Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                Update Balance
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};