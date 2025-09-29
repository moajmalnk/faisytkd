import { useState, useEffect, useCallback } from 'react';
import { AccountsAPI, CategoriesAPI, TransactionsAPI } from '@/lib/api';
import { bookkeepingNotifications } from '@/lib/notifications';
import { useNotificationSettings } from '@/components/NotificationSettings';
import { toast } from '@/hooks/use-toast';

export interface CollectItem {
  id: string;
  name: string;
  amount: number;
  completed: boolean;
  accountId?: string;
}

export interface PayItem {
  id: string;
  name: string;
  amount: number;
  completed: boolean;
  accountId?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  accountId?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  accountId?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  amount: number;
}

export interface AccountData {
  amount: number;
  name: string;
  type: 'cash' | 'bank' | 'credit';
  id: string;
}

export interface Accounts {
  [key: string]: AccountData;
}

export interface BookkeepingData {
  collect: CollectItem[];
  pay: PayItem[];
  accounts: Accounts;
  income: IncomeItem[];
  expense: ExpenseItem[];
  categories: Category[];
}

const initialData: BookkeepingData = {
  collect: [
    { id: '1', name: 'Bro', amount: 10000, completed: false },
    { id: '2', name: 'Ashif', amount: 3800, completed: false },
    { id: '3', name: 'Kunjani', amount: 1500, completed: false },
    { id: '4', name: 'Kunjaka', amount: 680, completed: false },
    { id: '5', name: 'Sathyabalan', amount: 740, completed: false },
    { id: '6', name: 'Nabeel', amount: 2930, completed: false },
    { id: '7', name: 'Ajmal P', amount: 345, completed: false },
    { id: '8', name: 'Fahis', amount: 500, completed: false },
    { id: '9', name: 'Kasargod', amount: 5000, completed: false },
    { id: '10', name: 'CODO', amount: 129310, completed: false },
    { id: '11', name: 'Skillmount', amount: 21000, completed: false },
  ],
  pay: [
    { id: '1', name: 'Uppappa', amount: 40000, completed: false },
    { id: '2', name: 'College', amount: 10000, completed: false },
    { id: '3', name: 'CODO', amount: 173737, completed: false },
  ],
  accounts: {
    cash: { amount: 15740, name: 'Cash', type: 'cash', id: '1' },
    kotak: { amount: 94337.83, name: 'Kotak Bank', type: 'bank', id: '2' },
    federal: { amount: 60791, name: 'Federal Bank', type: 'bank', id: '3' },
    creditcard: { amount: 24836.04, name: 'Credit Card', type: 'credit', id: '4' },
  },
  income: [
    { id: '1', name: 'Freelance Project', amount: 12000, categoryId: 'inc-1', date: '2024-01-15' },
    { id: '2', name: 'Investment Return', amount: 5000, categoryId: 'inc-2', date: '2024-01-20' },
  ],
  expense: [
    { id: '1', name: 'Groceries', amount: 2500, categoryId: 'exp-1', date: '2024-01-18' },
    { id: '2', name: 'Travel', amount: 6000, categoryId: 'exp-2', date: '2024-01-22' },
  ],
  categories: [
    { id: 'inc-1', name: 'Freelance', type: 'income', color: 'hsl(142 76% 36%)' },
    { id: 'inc-2', name: 'Investment', type: 'income', color: 'hsl(142 76% 36%)' },
    { id: 'inc-3', name: 'Salary', type: 'income', color: 'hsl(142 76% 36%)' },
    { id: 'exp-1', name: 'Food & Dining', type: 'expense', color: 'hsl(0 84% 60%)' },
    { id: 'exp-2', name: 'Transportation', type: 'expense', color: 'hsl(0 84% 60%)' },
    { id: 'exp-3', name: 'Utilities', type: 'expense', color: 'hsl(0 84% 60%)' },
    { id: 'exp-4', name: 'Entertainment', type: 'expense', color: 'hsl(0 84% 60%)' },
  ],
};

export const useBookkeeping = () => {
  const [data, setData] = useState<BookkeepingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState<{
    [key: string]: boolean;
  }>({});


  // Helper function for optimistic updates with rollback
  const optimisticUpdate = useCallback(async <T>(
    operationKey: string,
    optimisticUpdateFn: () => void,
    apiCall: () => Promise<T>,
    successCallback?: (result: T) => void,
    errorMessage?: string
  ) => {
    setOperationLoading(prev => ({ ...prev, [operationKey]: true }));
    
    try {
      // Apply optimistic update immediately
      optimisticUpdateFn();
      
      // Perform API call
      const result = await apiCall();
      
      // Success callback if provided
      if (successCallback) {
        successCallback(result);
      }
      
      // Show success toast
      toast({
        title: "Success",
        description: "Operation completed successfully",
        variant: "default",
      });
      
      return result;
    } catch (error) {
      console.error(`${operationKey} failed:`, error);
      
      // Show error toast
      toast({
        title: "Error",
        description: errorMessage || "Operation failed. Please try again.",
        variant: "destructive",
      });
      
      // Reload data to ensure consistency
      await loadData();
      
      throw error;
    } finally {
      setOperationLoading(prev => ({ ...prev, [operationKey]: false }));
    }
  }, []);

  // Reload data function
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Start with local defaults
      let next = { ...initialData } as BookkeepingData;

      // Fetch categories, accounts, and transactions from backend
      const [catsRes, accRes, transRes] = await Promise.all([
        CategoriesAPI.list(),
        AccountsAPI.list(),
        TransactionsAPI.list(),
      ]);

      if (catsRes?.ok) {
        next.categories = catsRes.items.map(c => ({
          id: String(c.id),
          name: c.name,
          type: c.type,
          color: c.color,
        }));
      }

      if (accRes?.ok) {
        const accounts: Accounts = {};
        accRes.items.forEach(a => {
          const key = a.name.toLowerCase().replace(/\s+/g, '');
          accounts[key] = { amount: a.amount, name: a.name, type: a.type, id: String(a.id) };
        });
        next.accounts = accounts;
      }

      if (transRes?.ok) {
        next.collect = transRes.items
          .filter(t => t.kind === 'collect')
          .map(t => ({
            id: String(t.id),
            name: t.note || 'Collect Item',
            amount: t.amount,
            completed: t.completed || false,
          }));

        next.pay = transRes.items
          .filter(t => t.kind === 'pay')
          .map(t => ({
            id: String(t.id),
            name: t.note || 'Pay Item',
            amount: t.amount,
            completed: t.completed || false,
          }));

        next.income = transRes.items
          .filter(t => t.kind === 'income')
          .map(t => ({
            id: String(t.id),
            name: t.note || 'Income Item',
            amount: t.amount,
            categoryId: t.category_id ? String(t.category_id) : '',
            date: t.occurred_on,
            accountId: t.account_id ? String(t.account_id) : '',
          }));

        next.expense = transRes.items
          .filter(t => t.kind === 'expense')
          .map(t => ({
            id: String(t.id),
            name: t.note || 'Expense Item',
            amount: t.amount,
            categoryId: t.category_id ? String(t.category_id) : '',
            date: t.occurred_on,
            accountId: t.account_id ? String(t.account_id) : '',
          }));
      }

      setData(next);
    } catch (e) {
      console.error('Load failed, using local data', e);
      setData(initialData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem('bookkeeping-data', JSON.stringify(data));
  }, [data]);

  const addCollectItem = async (name: string, amount: number, accountId: string) => {
    try {
      const res = await TransactionsAPI.create({
        kind: 'collect',
        amount,
        note: name,
        account_id: accountId ? Number(accountId) : null,
        occurred_on: new Date().toISOString().split('T')[0],
      });
      
      const newItem: CollectItem = {
        id: String(res.id ?? Date.now()),
        name,
        amount,
        completed: false,
      };
      setData(prev => {
        // Decrease the selected account balance when adding to collect
        const numericAmount = Number(amount) || 0;
        let accountKey = Object.keys(prev.accounts).find(k => String(prev.accounts[k].id) === String(accountId));
        if (!accountKey && prev.accounts[accountId as keyof Accounts]) {
          accountKey = accountId as keyof Accounts as string;
        }
        const updatedAccounts = { ...prev.accounts };
        if (accountKey) {
          updatedAccounts[accountKey] = {
            ...updatedAccounts[accountKey],
            amount: Math.max(0, (updatedAccounts[accountKey].amount || 0) - numericAmount),
          } as AccountData;
        }
        return {
          ...prev,
          collect: [...prev.collect, newItem],
          accounts: updatedAccounts,
        };
      });
    } catch (e) {
      console.error('addCollectItem failed', e);
    }
  };

  const updateCollectItem = async (id: string, name: string, amount: number) => {
    try {
      await TransactionsAPI.update(Number(id), {
        kind: 'collect',
        amount,
        note: name,
        occurred_on: new Date().toISOString().split('T')[0],
      });
      
      setData(prev => ({
        ...prev,
        collect: prev.collect.map(item =>
          item.id === id ? { ...item, name, amount } : item
        ),
      }));
    } catch (e) {
      console.error('updateCollectItem failed', e);
    }
  };

  const deleteCollectItem = async (id: string) => {
    try {
      await TransactionsAPI.delete(Number(id));
      setData(prev => ({
        ...prev,
        collect: prev.collect.filter(item => item.id !== id),
      }));
    } catch (e) {
      console.error('deleteCollectItem failed', e);
    }
  };

  const addPayItem = async (name: string, amount: number, accountId: string) => {
    try {
      const res = await TransactionsAPI.create({
        kind: 'pay',
        amount,
        note: name,
        account_id: accountId ? Number(accountId) : null,
        occurred_on: new Date().toISOString().split('T')[0],
      });
      
      const newItem: PayItem = {
        id: String(res.id ?? Date.now()),
        name,
        amount,
        completed: false,
      };
      setData(prev => {
        // Increase the selected account balance when adding to pay
        const numericAmount = Number(amount) || 0;
        let accountKey = Object.keys(prev.accounts).find(k => String(prev.accounts[k].id) === String(accountId));
        if (!accountKey && prev.accounts[accountId as keyof Accounts]) {
          accountKey = accountId as keyof Accounts as string;
        }
        const updatedAccounts = { ...prev.accounts };
        if (accountKey) {
          updatedAccounts[accountKey] = {
            ...updatedAccounts[accountKey],
            amount: (updatedAccounts[accountKey].amount || 0) + numericAmount,
          } as AccountData;
        }
        return {
          ...prev,
          pay: [...prev.pay, newItem],
          accounts: updatedAccounts,
        };
      });
    } catch (e) {
      console.error('addPayItem failed', e);
    }
  };

  const updatePayItem = async (id: string, name: string, amount: number) => {
    try {
      await TransactionsAPI.update(Number(id), {
        kind: 'pay',
        amount,
        note: name,
        occurred_on: new Date().toISOString().split('T')[0],
      });
      
      setData(prev => ({
        ...prev,
        pay: prev.pay.map(item =>
          item.id === id ? { ...item, name, amount } : item
        ),
      }));
    } catch (e) {
      console.error('updatePayItem failed', e);
    }
  };

  const deletePayItem = async (id: string) => {
    try {
      await TransactionsAPI.delete(Number(id));
      setData(prev => ({
        ...prev,
        pay: prev.pay.filter(item => item.id !== id),
      }));
    } catch (e) {
      console.error('deletePayItem failed', e);
    }
  };

  const markCollectItemAsCompleted = async (id: string, accountId: string) => {
    return optimisticUpdate(
      'markCollectCompleted',
      () => {
        // Mark as completed immediately
        setData(prev => ({
          ...prev,
          collect: prev.collect.map(item =>
            item.id === id ? { ...item, completed: true, accountId } : item
          ),
        }));
      },
      async () => {
        // API call
        const item = data.collect.find(i => i.id === id);
        if (item) {
          await TransactionsAPI.update(Number(id), {
            kind: 'income', // Change from 'collect' to 'income' when completed
            amount: item.amount,
            note: item.name,
            account_id: accountId ? Number(accountId) : null,
            occurred_on: new Date().toISOString().split('T')[0],
            completed: true,
          });
        }
        
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();

        // Send notification
        try {
          const item = data.collect.find(i => i.id === id);
          if (item) {
            await bookkeepingNotifications.notifyTransactionAdded('income', item.amount, 'Collection Completed');
          }
        } catch (notificationError) {
          console.warn('Failed to send collection completion notification:', notificationError);
        }
      },
      'Failed to mark collection as completed'
    );
  };

  const markPayItemAsCompleted = async (id: string, accountId: string) => {
    return optimisticUpdate(
      'markPayCompleted',
      () => {
        // Mark as completed immediately
        setData(prev => ({
          ...prev,
          pay: prev.pay.map(item =>
            item.id === id ? { ...item, completed: true, accountId } : item
          ),
        }));
      },
      async () => {
        // API call
        const item = data.pay.find(i => i.id === id);
        if (item) {
          await TransactionsAPI.update(Number(id), {
            kind: 'expense', // Change from 'pay' to 'expense' when completed
            amount: item.amount,
            note: item.name,
            account_id: accountId ? Number(accountId) : null,
            occurred_on: new Date().toISOString().split('T')[0],
            completed: true,
          });
        }
        
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();

        // Send notification
        try {
          const item = data.pay.find(i => i.id === id);
          if (item) {
            await bookkeepingNotifications.notifyTransactionAdded('expense', item.amount, 'Payment Completed');
          }
        } catch (notificationError) {
          console.warn('Failed to send payment completion notification:', notificationError);
        }
      },
      'Failed to mark payment as completed'
    );
  };

  const updateAccount = async (account: keyof Accounts, amount: number) => {
    try {
      // Get the account ID from the account data
      const accountData = data.accounts[account];
      if (!accountData || !accountData.id) {
        console.error('Account not found or missing ID:', account);
        return;
      }

      // Update the account via API
      await AccountsAPI.update(parseInt(accountData.id), {
        name: accountData.name,
        type: accountData.type,
        amount: amount
      });

      // Update local state only after successful API call
      setData(prev => ({
        ...prev,
        accounts: {
          ...prev.accounts,
          [account]: {
            ...prev.accounts[account],
            amount,
          },
        },
      }));

      toast({
        title: "Account Updated",
        description: `${accountData.name} balance updated successfully.`,
      });
    } catch (error) {
      console.error('Failed to update account:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update account balance. Please try again.",
        variant: "destructive",
      });
    }
  };


  const addIncomeItem = async (name: string, amount: number, categoryId: string, date: string, accountId: string) => {
    return optimisticUpdate(
      'addIncome',
      () => {
        // Optimistic update - add item immediately
        const tempId = `temp_${Date.now()}`;
        const newItem: IncomeItem = {
          id: tempId,
          name,
          amount,
          categoryId,
          date,
          accountId,
        };
        
        setData(prev => ({
          ...prev,
          income: [...prev.income, newItem],
        }));

      },
      async () => {
        // API call
        const res = await TransactionsAPI.create({
          kind: 'income',
          amount,
          note: name,
          category_id: categoryId ? Number(categoryId) : null,
          account_id: accountId ? Number(accountId) : null,
          occurred_on: date,
        });
        
        return res;
      },
      async (result) => {
        // Success callback - update with real ID
        setData(prev => ({
          ...prev,
          income: prev.income.map(item => 
            item.id.startsWith('temp_') ? { ...item, id: String(result.id) } : item
          ),
        }));

        // Reload data to sync with backend account balances
        await loadData();

        // Send notification
        try {
          const category = data.categories.find(c => c.id === categoryId);
          await bookkeepingNotifications.notifyTransactionAdded('income', amount, category?.name || 'Uncategorized');
        } catch (notificationError) {
          console.warn('Failed to send income notification:', notificationError);
        }
      },
      'Failed to add income item'
    );
  };

  const updateIncomeItem = async (id: string, name: string, amount: number, categoryId: string, date: string, accountId: string) => {
    return optimisticUpdate(
      'updateIncome',
      () => {
        // Update the item immediately
        setData(prev => ({
          ...prev,
          income: prev.income.map(item =>
            item.id === id ? { ...item, name, amount, categoryId, date, accountId } : item
          ),
        }));
      },
      async () => {
        // API call
        await TransactionsAPI.update(Number(id), {
          kind: 'income',
          amount,
          note: name,
          category_id: categoryId ? Number(categoryId) : null,
          account_id: accountId ? Number(accountId) : null,
          occurred_on: date,
        });
        
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();
      },
      'Failed to update income item'
    );
  };

  const deleteIncomeItem = async (id: string) => {
    return optimisticUpdate(
      'deleteIncome',
      () => {
        // Optimistic update - remove item immediately
        setData(prev => ({
          ...prev,
          income: prev.income.filter(item => item.id !== id),
        }));
      },
      async () => {
        // API call
        await TransactionsAPI.delete(Number(id));
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();
      },
      'Failed to delete income item'
    );
  };

  const addExpenseItem = async (name: string, amount: number, categoryId: string, date: string, accountId: string) => {
    return optimisticUpdate(
      'addExpense',
      () => {
        // Optimistic update - add item immediately
        const tempId = `temp_${Date.now()}`;
        const newItem: ExpenseItem = {
          id: tempId,
          name,
          amount,
          categoryId,
          date,
          accountId,
        };
        
        setData(prev => ({
          ...prev,
          expense: [...prev.expense, newItem],
        }));

      },
      async () => {
        // API call
        const res = await TransactionsAPI.create({
          kind: 'expense',
          amount,
          note: name,
          category_id: categoryId ? Number(categoryId) : null,
          account_id: accountId ? Number(accountId) : null,
          occurred_on: date,
        });
        
        return res;
      },
      async (result) => {
        // Success callback - update with real ID
        setData(prev => ({
          ...prev,
          expense: prev.expense.map(item => 
            item.id.startsWith('temp_') ? { ...item, id: String(result.id) } : item
          ),
        }));

        // Reload data to sync with backend account balances
        await loadData();

        // Send notification
        try {
          const category = data.categories.find(c => c.id === categoryId);
          await bookkeepingNotifications.notifyTransactionAdded('expense', amount, category?.name || 'Uncategorized');
        } catch (notificationError) {
          console.warn('Failed to send expense notification:', notificationError);
        }
      },
      'Failed to add expense item'
    );
  };

  const updateExpenseItem = async (id: string, name: string, amount: number, categoryId: string, date: string, accountId: string) => {
    return optimisticUpdate(
      'updateExpense',
      () => {
        // Update the item immediately
        setData(prev => ({
          ...prev,
          expense: prev.expense.map(item =>
            item.id === id ? { ...item, name, amount, categoryId, date, accountId } : item
          ),
        }));
      },
      async () => {
        // API call
        await TransactionsAPI.update(Number(id), {
          kind: 'expense',
          amount,
          note: name,
          category_id: categoryId ? Number(categoryId) : null,
          account_id: accountId ? Number(accountId) : null,
          occurred_on: date,
        });
        
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();
      },
      'Failed to update expense item'
    );
  };

  const deleteExpenseItem = async (id: string) => {
    return optimisticUpdate(
      'deleteExpense',
      () => {
        // Optimistic update - remove item immediately
        setData(prev => ({
          ...prev,
          expense: prev.expense.filter(item => item.id !== id),
        }));
      },
      async () => {
        // API call
        await TransactionsAPI.delete(Number(id));
        return { id };
      },
      async () => {
        // Success callback - reload data to sync with backend account balances
        await loadData();
      },
      'Failed to delete expense item'
    );
  };

  const addCategory = async (name: string, type: 'income' | 'expense', color: string) => {
    try {
      const res = await CategoriesAPI.create({ name, type, color });
      const id = String(res.id ?? Date.now());
      const newCategory: Category = { id, name, type, color };
      setData(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    } catch (e) {
      console.error('addCategory failed', e);
    }
  };

  const updateCategory = async (id: string, name: string, color: string) => {
    try {
      const cat = data.categories.find(c => c.id === id);
      if (cat) await CategoriesAPI.update(Number(id), { name, type: cat.type, color });
      setData(prev => ({
        ...prev,
        categories: prev.categories.map(category =>
          category.id === id ? { ...category, name, color } : category
        ),
      }));
    } catch (e) {
      console.error('updateCategory failed', e);
    }
  };

  const deleteCategory = async (id: string) => {
    try { await CategoriesAPI.delete(Number(id)); } catch {}
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category.id !== id),
      income: prev.income.map(item => item.categoryId === id ? { ...item, categoryId: '' } : item),
      expense: prev.expense.map(item => item.categoryId === id ? { ...item, categoryId: '' } : item),
    }));
  };

  const totals = {
    collect: data.collect.filter(item => !item.completed).reduce((sum, item) => sum + item.amount, 0),
    pay: data.pay.filter(item => !item.completed).reduce((sum, item) => sum + item.amount, 0),
    accounts: Object.values(data.accounts).reduce((sum, account) => sum + account.amount, 0),
    income: data.income.reduce((sum, item) => sum + item.amount, 0),
    expense: data.expense.reduce((sum, item) => sum + item.amount, 0),
  };

  const analytics = {
    profit: totals.income - totals.expense,
    expenseRatio: totals.income > 0 ? (totals.expense / totals.income) * 100 : 0,
    profitMargin: totals.income > 0 ? ((totals.income - totals.expense) / totals.income) * 100 : 0,
    // Positive number representing loss, 0 when not in loss
    loss: Math.max(0, totals.expense - totals.income),
    // Cash position after pending obligations (to collect / to pay)
    netCashAfterObligations: totals.accounts + totals.collect - totals.pay,
  };

  const addAccount = async (name: string, type: 'cash' | 'bank' | 'credit', amount: number) => {
    try { 
      const res = await AccountsAPI.create({ name, type, amount });
      const accountKey = name.toLowerCase().replace(/\s+/g, '');
      setData(prev => ({
        ...prev,
        accounts: {
          ...prev.accounts,
          [accountKey]: { amount, name, type, id: String(res.id) },
        },
      }));
    } catch (e) {
      console.error('addAccount failed', e);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      // try to find a matching row by name
      const acc = Object.values(data.accounts).find(a => a.name.toLowerCase().replace(/\s+/g, '') === accountId);
      if (acc) {
        const list = await AccountsAPI.list();
        const row = list.items.find(i => i.name === acc.name);
        if (row) await AccountsAPI.delete(row.id);
      }
    } catch {}
    setData(prev => {
      const newAccounts = { ...prev.accounts };
      delete newAccounts[accountId];
      return {
        ...prev,
        accounts: newAccounts,
      };
    });
  };

  return {
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
  };
};