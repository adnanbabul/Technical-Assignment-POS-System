-- ============================================================================
-- Easy Fashion POS - Complete Database Schema
-- ============================================================================
-- This file contains the complete database schema for the Easy Fashion POS system.
-- You can run this file manually if you prefer not to use TypeORM auto-sync.
--
-- Usage:
--   1. Open this file in phpMyAdmin SQL tab or MySQL Workbench
--   2. Execute all statements
--   3. The database and all tables will be created
--   4. Default admin user will be created by backend on first run
--
-- Alternative: The backend automatically creates tables when synchronize: true
-- ============================================================================

-- Create database
CREATE DATABASE IF NOT EXISTS technical_assignment_pos_system
CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE technical_assignment_pos_system;

-- ============================================================================
-- Table: user
-- Stores system users (admin and cashier accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Table: category
-- Stores product categories (e.g., Chicken, Seafood, Pasta, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `category` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `image` VARCHAR(255) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Table: product
-- Stores products available for sale
-- ============================================================================
CREATE TABLE IF NOT EXISTS `product` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `categoryId` INT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `image` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  KEY `FK_product_category` (`categoryId`),
  CONSTRAINT `FK_product_category` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Table: customer
-- Stores customer information
-- ============================================================================
CREATE TABLE IF NOT EXISTS `customer` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `address` TEXT NULL,
  `email` TEXT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Table: sale
-- Stores sales transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sale` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `invoiceNumber` VARCHAR(255) NULL,
  `orderNumber` VARCHAR(255) NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `tax` DECIMAL(10,2) NOT NULL,
  `total` DECIMAL(10,2) NOT NULL,
  `createdAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `cashierId` INT NULL,
  `customerId` INT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sale_cashier` (`cashierId`),
  KEY `FK_sale_customer` (`customerId`),
  CONSTRAINT `FK_sale_cashier` FOREIGN KEY (`cashierId`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `FK_sale_customer` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Table: sale_item
-- Stores individual items in each sale
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sale_item` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quantity` INT NOT NULL,
  `unitPrice` DECIMAL(10,2) NOT NULL,
  `lineTotal` DECIMAL(10,2) NOT NULL,
  `saleId` INT NULL,
  `productId` INT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_sale_item_sale` (`saleId`),
  KEY `FK_sale_item_product` (`productId`),
  CONSTRAINT `FK_sale_item_sale` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_sale_item_product` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================================================
-- Verification Query
-- ============================================================================
SELECT 
    'Database schema created successfully!' as Status,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'technical_assignment_pos_system') as Tables_Created;

-- Show all tables
SHOW TABLES;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. Default admin user (admin@gmail.com / admin) will be created automatically
--    when you start the backend for the first time.
--
-- 2. Sample categories and products will be seeded automatically on first run.
--
-- 3. If you need to reset the database, use fresh-seed-reset.sql
--
-- 4. All foreign keys use appropriate ON DELETE actions:
--    - CASCADE: Deleting a sale deletes its items
--    - SET NULL: Deleting a user/product/customer keeps the sale record
--
-- 5. Timestamps are automatically managed by MySQL
-- ============================================================================
