-- Add location columns to customers table
ALTER TABLE `customers` 
ADD COLUMN `city` varchar(100) DEFAULT NULL AFTER `address`,
ADD COLUMN `state` varchar(10) DEFAULT NULL AFTER `city`,
ADD COLUMN `zip_code` varchar(20) DEFAULT NULL AFTER `state`;

-- Add indexes for better performance
ALTER TABLE `customers` 
ADD INDEX `idx_customers_city` (`city`),
ADD INDEX `idx_customers_state` (`state`),
ADD INDEX `idx_customers_zip_code` (`zip_code`); 