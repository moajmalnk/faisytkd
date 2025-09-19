-- Simple Production Database Setup for NKBook
-- Run this script step by step in your production MySQL database

-- First, create the tables
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('income','expense') NOT NULL,
  color VARCHAR(32) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_type (type),
  INDEX idx_categories_name (name)
);

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('cash','bank','credit') NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_accounts_type (type),
  INDEX idx_accounts_name (name),
  INDEX idx_accounts_amount (amount)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('collect','pay','income','expense') NOT NULL,
  category_id INT NULL,
  account_id INT NULL,
  amount DECIMAL(12,2) NOT NULL,
  note VARCHAR(255),
  occurred_on DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (category_id),
  INDEX (account_id),
  INDEX idx_transactions_occurred_on (occurred_on),
  INDEX idx_transactions_kind (kind),
  INDEX idx_transactions_completed (completed),
  CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_transactions_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Insert sample categories
INSERT IGNORE INTO categories (id, name, type, color) VALUES
(1, 'Salary', 'income', '#10b981'),
(2, 'Freelance', 'income', '#06d6a0'),
(3, 'Investment', 'income', '#118ab2'),
(4, 'Food & Dining', 'expense', '#ef4444'),
(5, 'Transportation', 'expense', '#f97316'),
(6, 'Entertainment', 'expense', '#8b5cf6'),
(7, 'Utilities', 'expense', '#6b7280'),
(8, 'Healthcare', 'expense', '#ec4899'),
(9, 'Shopping', 'expense', '#f59e0b'),
(10, 'Education', 'expense', '#3b82f6');

-- Insert sample accounts
INSERT IGNORE INTO accounts (id, name, type, amount) VALUES
(1, 'Cash Wallet', 'cash', 5000.00),
(2, 'Primary Bank', 'bank', 50000.00),
(3, 'Savings Account', 'bank', 100000.00),
(4, 'Credit Card', 'credit', -15000.00);

-- Insert sample transactions
INSERT IGNORE INTO transactions (id, kind, category_id, account_id, amount, note, occurred_on, completed) VALUES
(1, 'income', 1, 2, 45000.00, 'Monthly salary', '2024-01-01', TRUE),
(2, 'expense', 4, 1, 500.00, 'Grocery shopping', '2024-01-02', TRUE),
(3, 'expense', 5, 1, 200.00, 'Bus fare', '2024-01-03', TRUE),
(4, 'income', 2, 2, 15000.00, 'Freelance project', '2024-01-05', TRUE),
(5, 'expense', 6, 4, 1200.00, 'Movie and dinner', '2024-01-07', TRUE),
(6, 'expense', 7, 2, 3000.00, 'Electricity bill', '2024-01-10', TRUE),
(7, 'collect', NULL, 1, 32323212113.00, 'dfdf', '2024-01-15', FALSE),
(8, 'collect', NULL, 1, 323.00, 'sdsd', '2024-01-16', FALSE),
(9, 'pay', NULL, 4, 5353453.00, 'sdsd', '2024-01-18', FALSE),
(10, 'pay', NULL, 4, 40000.00, 'Uppappa', '2024-01-20', FALSE);

-- Verify the setup (run this separately to check)
SELECT 'Setup completed!' as status;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as account_count FROM accounts;
SELECT COUNT(*) as transaction_count FROM transactions;
