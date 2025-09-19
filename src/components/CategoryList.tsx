import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Plus, Tag } from 'lucide-react';
import { Category } from '@/hooks/useBookkeeping';

interface CategoryListProps {
  categories: Category[];
  onAdd: (name: string, type: 'income' | 'expense', color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  isPrivate?: boolean;
}

const colorOptions = [
  { value: 'hsl(142 76% 36%)', label: 'Green', preview: 'bg-green-600' },
  { value: 'hsl(0 84% 60%)', label: 'Red', preview: 'bg-red-500' },
  { value: 'hsl(221 83% 53%)', label: 'Blue', preview: 'bg-blue-600' },
  { value: 'hsl(38 92% 50%)', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'hsl(262 83% 58%)', label: 'Purple', preview: 'bg-purple-600' },
  { value: 'hsl(47 96% 53%)', label: 'Yellow', preview: 'bg-yellow-500' },
  { value: 'hsl(200 98% 39%)', label: 'Cyan', preview: 'bg-cyan-600' },
  { value: 'hsl(330 81% 60%)', label: 'Pink', preview: 'bg-pink-500' },
];

export const CategoryList = ({ categories, onAdd, onUpdate, onDelete, isPrivate = false }: CategoryListProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'income' as 'income' | 'expense', color: 'hsl(142 76% 36%)' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.color) return;

    if (editCategory) {
      onUpdate(editCategory.id, formData.name, formData.color);
      setEditCategory(null);
    } else {
      onAdd(formData.name, formData.type, formData.color);
      setIsAddOpen(false);
    }
    setFormData({ name: '', type: 'income', color: 'hsl(142 76% 36%)' });
  };

  const openEdit = (category: Category) => {
    setEditCategory(category);
    setFormData({ name: category.name, type: category.type, color: category.color });
  };

  const handleDeleteConfirm = () => {
    if (deleteCategory) {
      onDelete(deleteCategory.id);
      setDeleteCategory(null);
    }
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className={`text-primary text-lg font-semibold ${isPrivate ? 'privacy-blur' : ''}`}>Categories</CardTitle>
            <p className={`text-sm text-muted-foreground ${isPrivate ? 'privacy-blur' : ''}`}>Organize your transactions</p>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add Category</DialogTitle>
              <p className="text-sm text-muted-foreground">Create a new transaction category</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  placeholder="e.g., Freelance, Groceries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <h4 className="text-sm font-semibold text-success">Income Categories</h4>
              <span className="text-xs text-muted-foreground">({incomeCategories.length})</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {incomeCategories.map((category) => (
                <div key={category.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-success/5 to-success/10 border border-success/20 rounded-xl hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-semibold text-foreground truncate">{category.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(category)}
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
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{category.name}" category? This will remove the category from all associated income/expense items. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(category.id)}
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
              {incomeCategories.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-success/10 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No income categories yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create categories to organize your income</p>
                </div>
              )}
            </div>
          </div>

          {/* Expense Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger"></div>
              <h4 className="text-sm font-semibold text-danger">Expense Categories</h4>
              <span className="text-xs text-muted-foreground">({expenseCategories.length})</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {expenseCategories.map((category) => (
                <div key={category.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-danger/5 to-danger/10 border border-danger/20 rounded-xl hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className="w-5 h-5 rounded-full shadow-sm flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-semibold text-foreground truncate">{category.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(category)}
                      className="h-9 w-9 p-0 border-danger/20 hover:bg-danger/10 hover:border-danger/30"
                    >
                      <Edit2 className="h-4 w-4 text-danger" />
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
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{category.name}" category? This will remove the category from all associated income/expense items. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(category.id)}
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
              {expenseCategories.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-danger/10 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-danger" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">No expense categories yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Create categories to organize your expenses</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Category</DialogTitle>
              <p className="text-sm text-muted-foreground">Update category details</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  placeholder="e.g., Freelance, Groceries"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground">
                Update Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
