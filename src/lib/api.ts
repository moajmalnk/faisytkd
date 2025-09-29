export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'https://kanakki.moajmalnk.com';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

// Accounts
export const AccountsAPI = {
  list: () => request<{ ok: boolean; items: Array<{ id: number; name: string; type: 'cash'|'bank'|'credit'; amount: number }> }>(`/accounts.php`),
  create: (data: { name: string; type: 'cash'|'bank'|'credit'; amount: number }) =>
    request<{ ok: boolean; id: number }>(`/accounts.php`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; type: 'cash'|'bank'|'credit'; amount: number }) =>
    request<{ ok: boolean }>(`/accounts.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ ok: boolean }>(`/accounts.php?id=${id}`, { method: 'DELETE' }),
};

// Categories
export const CategoriesAPI = {
  list: () => request<{ ok: boolean; items: Array<{ id: number; name: string; type: 'income'|'expense'; color: string }> }>(`/categories.php`),
  create: (data: { name: string; type: 'income'|'expense'; color: string }) =>
    request<{ ok: boolean; id: number }>(`/categories.php`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; type: 'income'|'expense'; color: string }) =>
    request<{ ok: boolean }>(`/categories.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ ok: boolean }>(`/categories.php?id=${id}`, { method: 'DELETE' }),
};

// Transactions
export const TransactionsAPI = {
  list: () => request<{ ok: boolean; items: Array<{ 
    id: number; 
    kind: 'collect'|'pay'|'income'|'expense'; 
    category_id: number | null; 
    account_id: number | null; 
    amount: number; 
    note: string | null; 
    occurred_on: string; 
    completed: boolean;
    created_at: string 
  }> }>(`/transactions.php`),
  create: (data: { 
    kind: 'collect'|'pay'|'income'|'expense'; 
    category_id?: number | null; 
    account_id?: number | null; 
    amount: number; 
    note?: string | null; 
    occurred_on: string;
    completed?: boolean;
  }) =>
    request<{ ok: boolean; id: number }>(`/transactions.php`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { 
    kind: 'collect'|'pay'|'income'|'expense'; 
    category_id?: number | null; 
    account_id?: number | null; 
    amount: number; 
    note?: string | null; 
    occurred_on: string;
    completed?: boolean;
  }) =>
    request<{ ok: boolean }>(`/transactions.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ ok: boolean }>(`/transactions.php?id=${id}`, { method: 'DELETE' }),
};


