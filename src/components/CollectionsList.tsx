import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Plus, Check } from 'lucide-react';
import { CollectItem, Account } from '@/hooks/useBookkeeping';

interface CollectionsListProps {
  items: CollectItem[];
  total: number;
  accounts: Account[];
  onAdd: (name: string, amount: number, accountId: string) => void;
  onUpdate: (id: string, name: string, amount: number) => void;
  onDelete: (id: string) => void;
  onMarkCompleted: (id: string, accountId: string) => void;
  isPrivate?: boolean;
}

export const CollectionsList = ({ items, total, accounts, onAdd, onUpdate, onDelete, onMarkCompleted, isPrivate = false }: CollectionsListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<CollectItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<CollectItem | null>(null);
  const [formData, setFormData] = useState({ name: '', amount: '' });
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [addSelectedAccountId, setAddSelectedAccountId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    if (editItem) {
      onUpdate(editItem.id, formData.name, amount);
      setEditItem(null);
    } else {
      onAdd(formData.name, amount, addSelectedAccountId);
      setIsAddOpen(false);
    }
    setFormData({ name: '', amount: '' });
    setAddSelectedAccountId('');
  };

  const openEdit = (item: CollectItem) => {
    setEditItem(item);
    setFormData({ name: item.name, amount: item.amount.toString() });
  };

  const handleDeleteConfirm = () => {
    if (deleteItem) {
      onDelete(deleteItem.id);
      setDeleteItem(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Filter out completed items for display
  const activeItems = items.filter(item => !item.completed);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-success/10">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          </div>
          <div>
            <CardTitle className={`text-success text-base sm:text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>To Collect</CardTitle>
            <p className={`text-xs sm:text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Pending collections</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground shadow-md w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Collection Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Record a new collection to track</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection Name</label>
                <Input
                  placeholder="e.g., Client Payment"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Account</label>
                <Select value={addSelectedAccountId} onValueChange={setAddSelectedAccountId}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              account.type === 'cash' ? 'bg-green-500' :
                              account.type === 'bank' ? 'bg-blue-500' :
                              'bg-orange-500'
                            }`} />
                            <span>{account.name} ₹{account.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={!addSelectedAccountId} className="w-full h-11 bg-success hover:bg-success/90 text-success-foreground">
                Add Collection Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
          {activeItems.map((item) => (
            <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-200 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-semibold text-foreground truncate ${isPrivate ? 'privacy-blur' : ''}`}>{item.name}</p>
                <div className="mt-1 sm:mt-2">
                  <p className={`text-base sm:text-lg font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(item.amount)}</p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-success/20 hover:bg-success/10 hover:border-success/30"
                      title="Mark as Completed"
                      onClick={() => setSelectedAccountId('')}
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
                      <AlertDialogDescription>
                        Select the account where you want to add the collection amount of {formatCurrency(item.amount)} for "{item.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-3 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Account</label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                      account.type === 'cash' ? 'bg-green-500' :
                                      account.type === 'bank' ? 'bg-blue-500' :
                                      'bg-orange-500'
                                    }`} />
                                    <span>{account.name} ₹{account.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          if (selectedAccountId) {
                            onMarkCompleted(item.id, selectedAccountId);
                          }
                        }}
                        disabled={!selectedAccountId}
                        className="bg-success text-success-foreground hover:bg-success/90"
                      >
                        Mark as Completed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-success/20 hover:bg-success/10 hover:border-success/30"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"  
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Collection Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.name}" ({formatCurrency(item.amount)})? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(item.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {activeItems.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">No pending collections</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">All collections are up to date</p>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20 gap-2 sm:gap-0">
            <div>
              <span className="text-sm sm:text-base font-semibold text-foreground">Total to Collect</span>
              <p className={`text-xs sm:text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>{activeItems.length} pending collection{activeItems.length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-xl sm:text-2xl font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Collection Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Update collection details</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Collection Name</label>
                <Input
                  placeholder="e.g., Client Payment"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 bg-success hover:bg-success/90 text-success-foreground">
                Update Collection Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};