-- Insert categories
INSERT INTO categories (name, type, color) VALUES
('Freelance', 'income', 'hsl(142 76% 36%)'),
('Investment', 'income', 'hsl(142 76% 36%)'),
('Salary', 'income', 'hsl(142 76% 36%)'),
('Food & Dining', 'expense', 'hsl(0 84% 60%)'),
('Transportation', 'expense', 'hsl(0 84% 60%)'),
('Utilities', 'expense', 'hsl(0 84% 60%)'),
('Entertainment', 'expense', 'hsl(0 84% 60%)');

-- Insert accounts
INSERT INTO accounts (name, type, amount) VALUES
('Cash', 'cash', 15740.00),
('Kotak Bank', 'bank', 94337.83),
('Federal Bank', 'bank', 60791.00),
('Credit Card', 'credit', 24836.04);

-- Insert collect transactions
INSERT INTO transactions (kind, amount, note, occurred_on) VALUES
('collect', 10000.00, 'Bro', '2024-01-01'),
('collect', 3800.00, 'Ashif', '2024-01-01'),
('collect', 1500.00, 'Kunjani', '2024-01-01'),
('collect', 680.00, 'Kunjaka', '2024-01-01'),
('collect', 740.00, 'Sathyabalan', '2024-01-01'),
('collect', 2930.00, 'Nabeel', '2024-01-01'),
('collect', 345.00, 'Ajmal P', '2024-01-01'),
('collect', 500.00, 'Fahis', '2024-01-01'),
('collect', 5000.00, 'Kasargod', '2024-01-01'),
('collect', 129310.00, 'CODO', '2024-01-01'),
('collect', 21000.00, 'Skillmount', '2024-01-01');

-- Insert pay transactions
INSERT INTO transactions (kind, amount, note, occurred_on) VALUES
('pay', 40000.00, 'Uppappa', '2024-01-01'),
('pay', 10000.00, 'College', '2024-01-01'),
('pay', 173737.00, 'CODO', '2024-01-01');

-- Insert income transactions (assuming category IDs 1=Freelance, 2=Investment)
INSERT INTO transactions (kind, category_id, amount, note, occurred_on) VALUES
('income', 1, 12000.00, 'Freelance Project', '2024-01-15'),
('income', 2, 5000.00, 'Investment Return', '2024-01-20');

-- Insert expense transactions (assuming category IDs 4=Food & Dining, 5=Transportation)
INSERT INTO transactions (kind, category_id, amount, note, occurred_on) VALUES
('expense', 4, 2500.00, 'Groceries', '2024-01-18'),
('expense', 5, 6000.00, 'Travel', '2024-01-22');
