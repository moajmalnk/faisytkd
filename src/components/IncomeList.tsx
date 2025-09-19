import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { IncomeItem, Category } from '@/hooks/useBookkeeping';

interface IncomeListProps {
  items: IncomeItem[];
  total: number;
  categories: Category[];
  onAdd: (name: string, amount: number, categoryId: string, date: string) => void;
  onUpdate: (id: string, name: string, amount: number, categoryId: string, date: string) => void;
  onDelete: (id: string) => void;
  isPrivate?: boolean;
}

export const IncomeList = ({ items, total, categories, onAdd, onUpdate, onDelete, isPrivate = false }: IncomeListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<IncomeItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<IncomeItem | null>(null);
  const [formData, setFormData] = useState({ name: '', amount: '', categoryId: '', date: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount || !formData.categoryId || !formData.date) return;

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) return;

    if (editItem) {
      onUpdate(editItem.id, formData.name, amount, formData.categoryId, formData.date);
      setEditItem(null);
    } else {
      onAdd(formData.name, amount, formData.categoryId, formData.date);
      setIsAddOpen(false);
    }
    setFormData({ name: '', amount: '', categoryId: '', date: '' });
  };

  const openEdit = (item: IncomeItem) => {
    setEditItem(item);
    setFormData({ name: item.name, amount: item.amount.toString(), categoryId: item.categoryId, date: item.date });
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'hsl(0 0% 50%)';
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <Plus className="h-5 w-5 text-success" />
          </div>
          <div>
            <CardTitle className={`text-success text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Income</CardTitle>
            <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Track your earnings</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Income Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Record a new income transaction</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Name</label>
                <Input
                  placeholder="e.g., Freelance Project"
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
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date || getTodayDate()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11 bg-success hover:bg-success/90 text-success-foreground">
                Add Income Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-xl hover:shadow-md transition-all duration-200 gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                  />
                  <p className={`font-semibold text-foreground truncate ${isPrivate ? 'privacy-blur' : ''}`}>{item.name}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{getCategoryName(item.categoryId)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
                <div className="mt-2">
                  <p className={`text-lg font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(item.amount)}</p>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                  className="h-9 w-9 p-0 border-success/20 hover:bg-success/10 hover:border-success/30"
                >
                  <Edit2 className="h-4 w-4 text-success" />
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
                      <AlertDialogTitle>Delete Income Entry</AlertDialogTitle>
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
        </div>
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
            <div>
              <span className="font-semibold text-foreground">Total Income</span>
              <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>{items.length} transaction{items.length !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-2xl font-bold text-success ${isPrivate ? 'privacy-blur' : ''}`}>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Income Entry</DialogTitle>
              <p className="text-sm text-muted-foreground">Update income transaction details</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction Name</label>
                <Input
                  placeholder="e.g., Freelance Project"
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
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11 bg-success hover:bg-success/90 text-success-foreground">
                Update Income Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};