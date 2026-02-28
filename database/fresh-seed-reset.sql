-- Fresh Database Reset Script
-- This will delete all data from all tables to allow fresh seeding

USE technical_assignment_pos_system;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables (delete all data)
TRUNCATE TABLE sale_item;
TRUNCATE TABLE sale;
TRUNCATE TABLE product;
TRUNCATE TABLE category;
TRUNCATE TABLE customer;
TRUNCATE TABLE user;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify tables are empty
SELECT 'Products' as Table_Name, COUNT(*) as Row_Count FROM product
UNION ALL
SELECT 'Categories', COUNT(*) FROM category
UNION ALL
SELECT 'Users', COUNT(*) FROM user
UNION ALL
SELECT 'Sales', COUNT(*) FROM sale
UNION ALL
SELECT 'Sale Items', COUNT(*) FROM sale_item
UNION ALL
SELECT 'Customers', COUNT(*) FROM customer;

-- Show message
SELECT 'Database has been reset. Restart the backend to auto-seed with fresh data.' as Status;
