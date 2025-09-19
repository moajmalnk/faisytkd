import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, Plus, Check } from 'lucide-react';
import { PayItem } from '@/hooks/useBookkeeping';

interface PaymentsListProps {
  items: PayItem[];
  total: number;
  onAdd: (name: string, amount: number) => void;
  onUpdate: (id: string, name: string, amount: number) => void;
  onDelete: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  isPrivate?: boolean;
}

export const PaymentsList = ({ items, total, onAdd, onUpdate, onDelete, onMarkCompleted, isPrivate = false }: PaymentsListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PayItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PayItem | null>(null);
  const [formData, setFormData] = useState({ name: '', amount: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    if (editItem) {
      onUpdate(editItem.id, formData.name, amount);
      setEditItem(null);
    } else {
      onAdd(formData.name, amount);
      setIsAddOpen(false);
    }
    setFormData({ name: '', amount: '' });
  };

  const openEdit = (item: PayItem) => {
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
          <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
          </div>
          <div>
            <CardTitle className={`text-warning text-base sm:text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>To Pay</CardTitle>
            <p className={`text-xs sm:text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Pending payments</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground shadow-md w-full sm:w-auto text-xs sm:text-sm">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Payment Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Record a new payment to track</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Name</label>
                <Input
                  placeholder="e.g., Rent Payment"
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
              <Button type="submit" className="w-full h-11 bg-warning hover:bg-warning/90 text-warning-foreground">
                Add Payment Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
          {activeItems.map((item) => (
            <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-warning/5 to-warning/10 border border-warning/20 rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-200 gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p className={`text-sm sm:text-base font-semibold text-foreground truncate ${isPrivate ? 'privacy-blur' : ''}`}>{item.name}</p>
                <div className="mt-1 sm:mt-2">
                  <p className={`text-base sm:text-lg font-bold text-warning ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(item.amount)}</p>
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
                    >
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark as Completed</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to mark "{item.name}" ({formatCurrency(item.amount)}) as completed? This will remove it from the pending payments list.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onMarkCompleted(item.id)}
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
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0 border-warning/20 hover:bg-warning/10 hover:border-warning/30"
                >
                  <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
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
                      <AlertDialogTitle>Delete Payment Entry</AlertDialogTitle>
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
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-warning/10 flex items-center justify-center">
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">No pending payments</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">All payments are up to date</p>
            </div>
          )}
        </div>
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg border border-warning/20 gap-2 sm:gap-0">
            <div>
              <span className="text-sm sm:text-base font-semibold text-foreground">Total to Pay</span>
              <p className={`text-xs sm:text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>{activeItems.length} pending payment{activeItems.length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-xl sm:text-2xl font-bold text-warning ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Payment Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Update payment details</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Name</label>
                <Input
                  placeholder="e.g., Rent Payment"
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
              <Button type="submit" className="w-full h-11 bg-warning hover:bg-warning/90 text-warning-foreground">
                Update Payment Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};