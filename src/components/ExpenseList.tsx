import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { ExpenseItem } from '@/hooks/useBookkeeping';

interface ExpenseListProps {
  items: ExpenseItem[];
  total: number;
  onAdd: (name: string, amount: number) => void;
  onUpdate: (id: string, name: string, amount: number) => void;
  onDelete: (id: string) => void;
  isPrivate?: boolean;
}

export const ExpenseList = ({ items, total, onAdd, onUpdate, onDelete, isPrivate = false }: ExpenseListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseItem | null>(null);
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

  const openEdit = (item: ExpenseItem) => {
    setEditItem(item);
    setFormData({ name: item.name, amount: item.amount.toString() });
  };

  const formatCurrency = (amount: number) => {
    if (isPrivate) return '••••••';
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-danger">Expenses</CardTitle>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <Button type="submit" className="w-full">Add Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/50 rounded-lg gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-danger font-semibold">{formatCurrency(item.amount)}</p>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Expenses:</span>
            <span className="text-lg font-bold text-danger">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <Button type="submit" className="w-full">Update Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};