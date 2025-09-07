import { useState, useEffect } from 'react';

export interface CollectItem {
  id: string;
  name: string;
  amount: number;
}

export interface PayItem {
  id: string;
  name: string;
  amount: number;
}

export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface Accounts {
  cash: number;
  kotak: number;
  federal: number;
  creditCard: number;
}

export interface BookkeepingData {
  collect: CollectItem[];
  pay: PayItem[];
  accounts: Accounts;
  income: IncomeItem[];
  expense: ExpenseItem[];
}

const initialData: BookkeepingData = {
  collect: [
    { id: '1', name: 'CODO 129310', amount: 10000 },
    { id: '2', name: 'Ashif', amount: 3800 },
    { id: '3', name: 'Kunjani', amount: 1500 },
    { id: '4', name: 'Kunjaka', amount: 680 },
    { id: '5', name: 'Sathyabalan', amount: 740 },
    { id: '6', name: 'Nabeel', amount: 2930 },
    { id: '7', name: 'Ajmal P', amount: 345 },
    { id: '8', name: 'Fahis', amount: 500 },
    { id: '9', name: 'Kasargod', amount: 5000 },
  ],
  pay: [
    { id: '1', name: 'Uppappa', amount: 40000 },
    { id: '2', name: 'College', amount: 10000 },
  ],
  accounts: {
    cash: 15740,
    kotak: 94337.83,
    federal: 60791,
    creditCard: 24836.04,
  },
  income: [
    { id: '1', name: 'Freelance Project', amount: 12000 },
    { id: '2', name: 'Investment Return', amount: 5000 },
  ],
  expense: [
    { id: '1', name: 'Groceries', amount: 2500 },
    { id: '2', name: 'Travel', amount: 6000 },
  ],
};

export const useBookkeeping = () => {
  const [data, setData] = useState<BookkeepingData>(initialData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const saved = localStorage.getItem('bookkeeping-data');
      if (saved) {
        try {
          setData(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading data:', error);
          setData(initialData);
        }
      }
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('bookkeeping-data', JSON.stringify(data));
  }, [data]);

  const addCollectItem = (name: string, amount: number) => {
    const newItem: CollectItem = {
      id: Date.now().toString(),
      name,
      amount,
    };
    setData(prev => ({
      ...prev,
      collect: [...prev.collect, newItem],
    }));
  };

  const updateCollectItem = (id: string, name: string, amount: number) => {
    setData(prev => ({
      ...prev,
      collect: prev.collect.map(item =>
        item.id === id ? { ...item, name, amount } : item
      ),
    }));
  };

  const deleteCollectItem = (id: string) => {
    setData(prev => ({
      ...prev,
      collect: prev.collect.filter(item => item.id !== id),
    }));
  };

  const addPayItem = (name: string, amount: number) => {
    const newItem: PayItem = {
      id: Date.now().toString(),
      name,
      amount,
    };
    setData(prev => ({
      ...prev,
      pay: [...prev.pay, newItem],
    }));
  };

  const updatePayItem = (id: string, name: string, amount: number) => {
    setData(prev => ({
      ...prev,
      pay: prev.pay.map(item =>
        item.id === id ? { ...item, name, amount } : item
      ),
    }));
  };

  const deletePayItem = (id: string) => {
    setData(prev => ({
      ...prev,
      pay: prev.pay.filter(item => item.id !== id),
    }));
  };

  const updateAccount = (account: keyof Accounts, amount: number) => {
    setData(prev => ({
      ...prev,
      accounts: {
        ...prev.accounts,
        [account]: amount,
      },
    }));
  };

  const addIncomeItem = (name: string, amount: number) => {
    const newItem: IncomeItem = {
      id: Date.now().toString(),
      name,
      amount,
    };
    setData(prev => ({
      ...prev,
      income: [...prev.income, newItem],
    }));
  };

  const updateIncomeItem = (id: string, name: string, amount: number) => {
    setData(prev => ({
      ...prev,
      income: prev.income.map(item =>
        item.id === id ? { ...item, name, amount } : item
      ),
    }));
  };

  const deleteIncomeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      income: prev.income.filter(item => item.id !== id),
    }));
  };

  const addExpenseItem = (name: string, amount: number) => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name,
      amount,
    };
    setData(prev => ({
      ...prev,
      expense: [...prev.expense, newItem],
    }));
  };

  const updateExpenseItem = (id: string, name: string, amount: number) => {
    setData(prev => ({
      ...prev,
      expense: prev.expense.map(item =>
        item.id === id ? { ...item, name, amount } : item
      ),
    }));
  };

  const deleteExpenseItem = (id: string) => {
    setData(prev => ({
      ...prev,
      expense: prev.expense.filter(item => item.id !== id),
    }));
  };

  const totals = {
    collect: data.collect.reduce((sum, item) => sum + item.amount, 0),
    pay: data.pay.reduce((sum, item) => sum + item.amount, 0),
    accounts: Object.values(data.accounts).reduce((sum, amount) => sum + amount, 0),
    income: data.income.reduce((sum, item) => sum + item.amount, 0),
    expense: data.expense.reduce((sum, item) => sum + item.amount, 0),
  };

  const analytics = {
    profit: totals.income - totals.expense,
    expenseRatio: totals.income > 0 ? (totals.expense / totals.income) * 100 : 0,
    profitMargin: totals.income > 0 ? ((totals.income - totals.expense) / totals.income) * 100 : 0,
  };

  return {
    data,
    totals,
    analytics,
    isLoading,
    addCollectItem,
    updateCollectItem,
    deleteCollectItem,
    addPayItem,
    updatePayItem,
    deletePayItem,
    addIncomeItem,
    updateIncomeItem,
    deleteIncomeItem,
    addExpenseItem,
    updateExpenseItem,
    deleteExpenseItem,
    updateAccount,
  };
};