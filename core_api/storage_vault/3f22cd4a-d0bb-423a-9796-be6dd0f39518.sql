
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    balance DECIMAL(10,2)
);

INSERT INTO customers (id, name, balance) VALUES
(1, 'TechCorp', 1540.50),
(2, 'BioHealth', 8900.00);
