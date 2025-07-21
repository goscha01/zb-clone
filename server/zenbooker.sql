-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2025 at 12:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zenbooker`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_settings`
--

CREATE TABLE `booking_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`settings`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_settings`
--

INSERT INTO `booking_settings` (`id`, `user_id`, `settings`, `created_at`, `updated_at`) VALUES
(1, 3, '{\"branding\":{\"primaryColor\":\"#4CAF50\",\"headerBackground\":\"#ffffff\",\"headerIcons\":\"#4CAF50\",\"hideZenbookerBranding\":false,\"logo\":\"/uploads/profile-1752911023422-621424681.png\",\"favicon\":null,\"heroImage\":null},\"content\":{\"heading\":\"Book Online\",\"text\":\"Let\'s get started by entering your postal code.\"},\"general\":{\"serviceArea\":\"postal-code\",\"serviceLayout\":\"default\",\"datePickerStyle\":\"available-days\",\"language\":\"english\",\"textSize\":\"big\",\"showPrices\":false,\"includeTax\":false,\"autoAdvance\":true,\"allowCoupons\":true,\"showAllOptions\":false,\"showEstimatedDuration\":false,\"limitAnimations\":false,\"use24Hour\":false,\"allowMultipleServices\":false},\"analytics\":{\"googleAnalytics\":\"\",\"facebookPixel\":\"\"},\"customUrl\":\"\"}', '2025-07-19 07:25:58', '2025-07-19 07:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `application_type` enum('all','specific') DEFAULT 'all',
  `selected_services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`selected_services`)),
  `doesnt_expire` tinyint(1) DEFAULT 0,
  `expiration_date` date DEFAULT NULL,
  `restrict_before_expiration` tinyint(1) DEFAULT 0,
  `limit_total_uses` tinyint(1) DEFAULT 0,
  `total_uses_limit` int(11) DEFAULT NULL,
  `current_uses` int(11) DEFAULT 0,
  `can_combine_with_recurring` tinyint(1) DEFAULT 0,
  `recurring_application_type` enum('all','first') DEFAULT 'all',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `user_id`, `code`, `discount_type`, `discount_amount`, `application_type`, `selected_services`, `doesnt_expire`, `expiration_date`, `restrict_before_expiration`, `limit_total_uses`, `total_uses_limit`, `current_uses`, `can_combine_with_recurring`, `recurring_application_type`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 3, 'COUPON-QURP0M', 'fixed', 10.00, 'specific', '[1]', 1, NULL, 0, 1, NULL, 0, 0, 'first', 1, '2025-07-19 21:38:52', '2025-07-19 21:38:52'),
(2, 3, 'TEST50', 'percentage', 50.00, 'all', '[]', 1, NULL, 0, 0, NULL, 0, 0, 'all', 1, '2025-07-19 21:56:46', '2025-07-19 22:11:42');

-- --------------------------------------------------------

--
-- Table structure for table `coupon_usage`
--

CREATE TABLE `coupon_usage` (
  `id` int(11) NOT NULL,
  `coupon_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `discount_amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `address`, `notes`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'OLAMILEKAN', 'AJAJA', 'ajajaolamilekan7@gmail.com', '09030844572', '146 NITEL JUNCTION 146 Nitel Junction State', NULL, 'active', '2025-07-15 02:01:46', '2025-07-18 23:42:25'),
(2, 3, 'John', 'Doe', 'john.doe@example.com', '+1234567890', '123 Main Street', 'VIP customer - prefers morning appointments', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(3, 3, 'Jane', 'Smith', 'jane.smith@email.com', '+1987654321', '456 Oak Avenue', 'Regular cleaning customer', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(4, 3, 'Mike', 'Johnson', 'mike.j@business.com', '+1555123456', '789 Pine Road', 'New customer - interested in deep cleaning', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(5, 3, 'Sarah', 'Williams', 'sarah.w@test.com', '+1444333222', '321 Elm Street', 'Referred by Jane Smith', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(6, 3, 'David', 'Brown', 'david.brown@mail.com', '+1777888999', '654 Maple Drive', 'Commercial client - office cleaning', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(7, 3, 'Lisa', 'Davis', 'lisa.davis@company.com', '+1666777888', '987 Cedar Lane', 'Weekly maintenance customer', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(8, 3, 'Robert', 'Wilson', 'robert.w@enterprise.com', '+1888999000', '147 Birch Court', 'One-time deep cleaning request', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(9, 3, 'Emily', 'Taylor', 'emily.t@corp.com', '+1999000111', '258 Spruce Way', 'Regular customer - every 2 weeks', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(10, 3, 'James', 'Anderson', 'james.a@firm.com', '+1222333444', '369 Willow Place', 'New construction cleanup', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(11, 3, 'Amanda', 'Thomas', 'amanda.t@agency.com', '+1111222333', '741 Aspen Circle', 'Move-out cleaning specialist', 'active', '2025-07-15 02:06:54', '2025-07-15 02:06:54'),
(12, 1, 'Adeniyi', 'Adejuwon', 'adeniyiadejuwon0@gmail.com', '08107370125', '6 opposite school gate, iworoko rd, osekita', NULL, 'active', '2025-07-18 21:34:20', '2025-07-18 21:34:20'),
(13, 1, 'OLAMILEKAN', 'AJAJA', 'ajajaolamilekan7@gmail.com', '09030844572', '146 NITEL JUNCTION 146 Nitel Junction State', NULL, 'active', '2025-07-18 21:36:23', '2025-07-18 21:36:23'),
(14, 3, 'Adeniyi', 'Adejuwon', 'adeniyiadejuwon0@gmail.com', '08107370125', '6 opposite school gate, iworoko rd, osekita', NULL, 'active', '2025-07-19 02:52:27', '2025-07-19 21:28:33'),
(15, 4, 'John', 'Smith', 'john.smith@email.com', '+1 (555) 123-4567', '123 Main Street, City, State 12345', NULL, 'active', '2025-07-19 21:04:53', '2025-07-19 21:04:53'),
(16, 4, 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1 (555) 234-5678', '456 Oak Avenue, City, State 12345', NULL, 'active', '2025-07-19 21:04:53', '2025-07-19 21:04:53'),
(17, 4, 'Michael', 'Davis', 'michael.davis@email.com', '+1 (555) 345-6789', '789 Pine Road, City, State 12345', NULL, 'active', '2025-07-19 21:04:53', '2025-07-19 21:04:53'),
(18, 4, 'Emily', 'Wilson', 'emily.wilson@email.com', '+1 (555) 456-7890', '321 Elm Street, City, State 12345', NULL, 'active', '2025-07-19 21:04:53', '2025-07-19 21:04:53'),
(19, 4, 'David', 'Brown', 'david.brown@email.com', '+1 (555) 567-8901', '654 Maple Drive, City, State 12345', NULL, 'active', '2025-07-19 21:04:53', '2025-07-19 21:04:53'),
(20, 3, 'Adeniyi', 'Adejuwon', 'adeniyiadejuwon@gmail.com', '08107370125', '6 opposite school gate, iworoko rd, osekita', NULL, 'active', '2025-07-19 22:20:41', '2025-07-19 22:20:41');

-- --------------------------------------------------------

--
-- Table structure for table `custom_payment_methods`
--

CREATE TABLE `custom_payment_methods` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_payment_methods`
--

INSERT INTO `custom_payment_methods` (`id`, `user_id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 3, 'Cash', 'Pay with cash upon service completion', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(2, 3, 'Check', 'Pay with check mailed to business address', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(3, 2, 'Cash', 'Pay with cash upon service completion', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(4, 2, 'Check', 'Pay with check mailed to business address', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(5, 1, 'Cash', 'Pay with cash upon service completion', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(6, 1, 'Check', 'Pay with check mailed to business address', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(7, 4, 'Cash', 'Pay with cash upon service completion', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46'),
(8, 4, 'Check', 'Pay with check mailed to business address', 1, '2025-07-16 02:17:46', '2025-07-16 02:17:46');

-- --------------------------------------------------------

--
-- Table structure for table `estimates`
--

CREATE TABLE `estimates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`services`)),
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','sent','accepted','rejected') DEFAULT 'pending',
  `valid_until` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimates`
--

INSERT INTO `estimates` (`id`, `user_id`, `customer_id`, `services`, `total_amount`, `status`, `valid_until`, `notes`, `created_at`, `updated_at`) VALUES
(1, 3, 1, '[{\"serviceId\":1,\"name\":\"Home Cleaning\",\"price\":\"100.00\",\"quantity\":1,\"description\":\"Sample service\"}]', 100.00, 'sent', '2025-08-17', 'Sample estimate for testing', '2025-07-18 11:45:52', '2025-07-19 00:10:54'),
(2, 3, 1, '[{\"serviceId\":1,\"name\":\"Home Cleaning\",\"price\":\"100.00\",\"quantity\":2,\"description\":\"Sample service\"}]', 200.00, 'pending', '2025-08-02', 'Second sample estimate', '2025-07-18 11:45:52', '2025-07-19 02:40:18'),
(3, 3, 1, '[{\"serviceId\":1,\"name\":\"Home Cleaning\",\"price\":\"100.00\",\"quantity\":3,\"description\":\"Sample service\"}]', 300.00, 'accepted', '2025-07-25', 'Accepted estimate', '2025-07-18 11:45:52', '2025-07-19 00:42:24');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `estimate_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tax_amount` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('draft','sent','paid','overdue','cancelled') DEFAULT 'draft',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `customer_id`, `job_id`, `estimate_id`, `amount`, `tax_amount`, `total_amount`, `status`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 3, 1, NULL, 3, 300.00, 0.00, 300.00, 'draft', '2025-08-02', '2025-07-18 20:43:43', '2025-07-18 20:43:43'),
(2, 3, 1, NULL, 3, 300.00, 0.00, 300.00, 'draft', '2025-08-02', '2025-07-18 20:43:52', '2025-07-18 20:43:52'),
(3, 1, 12, NULL, NULL, 150.00, 0.00, 150.00, 'draft', '2025-08-02', '2025-07-18 21:34:20', '2025-07-18 21:34:20'),
(4, 1, 13, NULL, NULL, 95.00, 0.00, 95.00, 'draft', '2025-08-02', '2025-07-18 21:36:23', '2025-07-18 21:36:23'),
(5, 3, 1, NULL, NULL, 95.00, 0.00, 95.00, 'draft', '2025-08-03', '2025-07-18 23:42:25', '2025-07-18 23:42:25'),
(6, 3, 1, NULL, 3, 300.00, 0.00, 300.00, 'draft', '2025-08-03', '2025-07-19 00:42:24', '2025-07-19 00:42:24'),
(7, 3, 14, NULL, NULL, 95.00, 0.00, 95.00, 'draft', '2025-08-03', '2025-07-19 02:52:27', '2025-07-19 02:52:27'),
(8, 3, 14, 8, NULL, 95.00, 0.00, 95.00, 'draft', '2025-07-19', '2025-07-19 18:53:24', '2025-07-19 18:53:24');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `team_member_id` int(11) DEFAULT NULL,
  `territory_id` int(11) DEFAULT NULL,
  `scheduled_date` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','in_progress','completed','cancelled') DEFAULT 'pending',
  `invoice_status` enum('not_invoiced','invoiced','paid','unpaid') DEFAULT 'not_invoiced',
  `invoice_id` int(11) DEFAULT NULL,
  `invoice_amount` decimal(10,2) DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_recurring` tinyint(1) DEFAULT 0 COMMENT 'Whether this job is recurring',
  `recurring_frequency` int(11) DEFAULT 30 COMMENT 'Recurring frequency in days',
  `next_billing_date` date DEFAULT NULL COMMENT 'Next billing date for recurring jobs',
  `stripe_payment_intent_id` varchar(255) DEFAULT NULL COMMENT 'Stripe payment intent ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `user_id`, `customer_id`, `service_id`, `team_member_id`, `territory_id`, `scheduled_date`, `notes`, `status`, `invoice_status`, `invoice_id`, `invoice_amount`, `invoice_date`, `payment_date`, `created_at`, `updated_at`, `is_recurring`, `recurring_frequency`, `next_billing_date`, `stripe_payment_intent_id`) VALUES
(1, 3, 2, 6, NULL, NULL, '2025-07-18 09:00:00', NULL, 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-16 02:43:22', '2025-07-16 02:43:22', 0, 30, NULL, NULL),
(2, 3, 3, 6, NULL, NULL, '2025-07-09 09:00:00', NULL, 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-16 03:13:54', '2025-07-16 03:13:54', 0, 30, NULL, NULL),
(3, 1, 12, 5, NULL, NULL, '2025-07-19 12:30:00', '', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-18 21:34:20', '2025-07-18 21:34:20', 0, 30, NULL, NULL),
(4, 1, 13, 4, NULL, NULL, '2025-07-25 14:30:00', '', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-18 21:36:23', '2025-07-18 21:36:23', 0, 30, NULL, NULL),
(5, 3, 1, 6, NULL, NULL, '2025-07-20 14:30:00', '', 'confirmed', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-18 23:42:25', '2025-07-19 00:10:35', 0, 30, NULL, NULL),
(6, 3, 1, 1, NULL, NULL, '2025-01-15 00:00:00', 'Kitchen cleaning needed', 'confirmed', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 02:48:36', '2025-07-19 02:48:36', 0, 30, NULL, NULL),
(7, 3, 14, 6, NULL, NULL, '2025-07-20 14:30:00', '', 'in_progress', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 02:52:27', '2025-07-19 02:53:14', 0, 30, NULL, NULL),
(8, 3, 14, 6, NULL, NULL, '2025-07-21 13:00:00', '', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 18:53:24', '2025-07-19 18:53:24', 0, 30, NULL, NULL),
(9, 3, 2, 6, 1, NULL, '2025-07-25 09:00:00', 'Just web', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:00:39', '2025-07-19 21:00:39', 0, 30, NULL, NULL),
(10, 4, 15, 12, 6, NULL, '2025-07-20 09:00:00', 'Customer requested extra attention to kitchen area', 'confirmed', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:05:12', '2025-07-19 21:05:12', 0, 30, NULL, NULL),
(11, 4, 15, 13, 7, NULL, '2025-07-21 14:00:00', 'Moving out cleaning - 3 bedroom apartment', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:05:13', '2025-07-19 21:05:13', 0, 30, NULL, NULL),
(12, 4, 15, 14, 9, NULL, '2025-07-22 10:00:00', 'All windows including balcony doors', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:05:13', '2025-07-19 21:05:13', 0, 30, NULL, NULL),
(13, 4, 15, 15, 10, NULL, '2025-07-23 11:00:00', 'Living room and bedroom carpets', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:05:13', '2025-07-19 21:05:13', 0, 30, NULL, NULL),
(14, 4, 15, 16, 6, NULL, '2025-07-24 08:00:00', 'Complete move-out cleaning service', 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:05:13', '2025-07-19 21:05:13', 0, 30, NULL, NULL),
(15, 3, 3, 6, 4, NULL, '2025-07-12 13:00:00', NULL, 'pending', 'not_invoiced', NULL, NULL, NULL, NULL, '2025-07-19 21:08:27', '2025-07-19 21:08:27', 0, 30, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `job_templates`
--

CREATE TABLE `job_templates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `service_id` int(11) NOT NULL,
  `estimated_duration` int(11) DEFAULT NULL,
  `estimated_price` decimal(10,2) DEFAULT NULL,
  `default_notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `type` enum('booking','quote') NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` time DEFAULT NULL,
  `estimated_duration` varchar(50) DEFAULT NULL,
  `estimated_price` decimal(10,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `user_id`, `customer_id`, `customer_name`, `customer_email`, `service_id`, `type`, `status`, `scheduled_date`, `scheduled_time`, `estimated_duration`, `estimated_price`, `notes`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(5, 3, 1, 'OLAMILEKAN AJAJA', 'ajajaolamilekan7@gmail.com', 1, 'booking', 'approved', '2025-01-15', '09:00:00', '2 hours', 150.00, 'Kitchen cleaning needed', 'nothing', '2025-07-19 02:28:38', '2025-07-19 02:48:36'),
(6, 3, 1, 'OLAMILEKAN AJAJA', 'ajajaolamilekan7@gmail.com', 7, 'quote', 'approved', '2025-01-16', '14:00:00', '3 hours', 200.00, 'Deep cleaning quote requested', NULL, '2025-07-19 02:28:38', '2025-07-19 03:02:03'),
(7, 1, 1, 'OLAMILEKAN AJAJA', 'ajajaolamilekan7@gmail.com', 8, 'booking', 'approved', '2025-01-17', '10:00:00', '1.5 hours', 100.00, 'Regular maintenance', NULL, '2025-07-19 02:28:38', '2025-07-19 02:28:38'),
(8, 1, 1, 'OLAMILEKAN AJAJA', 'ajajaolamilekan7@gmail.com', 9, 'quote', 'rejected', '2025-01-18', '16:00:00', '4 hours', 300.00, 'Too expensive for customer', NULL, '2025-07-19 02:28:38', '2025-07-19 02:28:38'),
(9, 1, 1, NULL, NULL, 1, 'booking', 'pending', '2025-01-15', '09:00:00', '2 hours', 150.00, 'Kitchen cleaning needed', NULL, '2025-07-19 18:58:21', '2025-07-19 18:58:21'),
(10, 1, 1, NULL, NULL, 7, 'quote', 'pending', '2025-01-16', '14:00:00', '3 hours', 200.00, 'Deep cleaning quote requested', NULL, '2025-07-19 18:58:21', '2025-07-19 18:58:21'),
(11, 1, 1, NULL, NULL, 8, 'booking', 'approved', '2025-01-17', '10:00:00', '1.5 hours', 100.00, 'Regular maintenance', NULL, '2025-07-19 18:58:21', '2025-07-19 18:58:21'),
(12, 1, 1, NULL, NULL, 9, 'quote', 'rejected', '2025-01-18', '16:00:00', '4 hours', 300.00, 'Too expensive for customer', NULL, '2025-07-19 18:58:21', '2025-07-19 18:58:21'),
(13, 3, 14, 'Adeniyi Adejuwon', 'adeniyiadejuwon0@gmail.com', NULL, 'quote', 'approved', '2025-07-22', NULL, NULL, NULL, 'Service Type: 6\nDescription: I want to remake my toilet sink\nUrgency: normal\nBudget: under-500\nAdditional Info: ', NULL, '2025-07-19 21:28:33', '2025-07-19 21:28:51'),
(14, 3, 20, 'Adeniyi Adejuwon', 'adeniyiadejuwon@gmail.com', NULL, 'quote', 'approved', '2025-07-25', NULL, NULL, NULL, 'Service Type: custom\nDescription: some shit packing\nUrgency: normal\nBudget: 500-1000\nAdditional Info: ', NULL, '2025-07-19 22:20:41', '2025-07-19 22:21:32');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `modifiers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`modifiers`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `require_payment_method` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Whether the service is active and visible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `user_id`, `name`, `description`, `price`, `duration`, `category`, `modifiers`, `created_at`, `updated_at`, `require_payment_method`, `is_active`) VALUES
(1, 2, 'Home Cleaning', 'Comprehensive home cleaning services for residential properties', 100.00, 180, 'Cleaning', '[]', '2025-07-12 02:30:35', '2025-07-12 02:48:10', 0, 1),
(4, 1, 'Plumbing Service', 'Emergency and routine plumbing repairs and installations', 95.00, 60, 'Repair', '[]', '2025-07-15 01:12:20', '2025-07-15 01:16:37', 0, 1),
(5, 1, 'Carpet Cleaning', 'Deep carpet cleaning and stain removal services', 75.00, 150, 'Cleaning', '[]', '2025-07-15 01:29:47', '2025-07-15 01:29:47', 0, 1),
(6, 3, 'Plumbing Service', 'Emergency and routine plumbing repairs and installations', 95.00, 60, 'Repair', '[]', '2025-07-16 02:08:13', '2025-07-16 02:08:13', 0, 1),
(7, 1, 'Regular House Cleaning', 'Standard cleaning service for homes up to 2000 sq ft', 150.00, 120, 'cleaning', NULL, '2025-07-18 21:06:42', '2025-07-18 21:06:42', 0, 1),
(8, 1, 'Deep Cleaning', 'Comprehensive cleaning including hard-to-reach areas', 250.00, 180, 'cleaning', NULL, '2025-07-18 21:06:42', '2025-07-18 21:06:42', 0, 1),
(9, 1, 'Window Cleaning', 'Professional window and screen cleaning', 100.00, 60, 'cleaning', NULL, '2025-07-18 21:06:42', '2025-07-18 21:06:42', 0, 1),
(10, 1, 'Carpet Cleaning', 'Deep carpet cleaning and stain removal', 200.00, 90, 'cleaning', NULL, '2025-07-18 21:06:42', '2025-07-18 21:06:42', 0, 1),
(11, 1, 'Move-in/Move-out Cleaning', 'Complete cleaning for moving situations', 300.00, 240, 'cleaning', NULL, '2025-07-18 21:06:42', '2025-07-18 21:06:42', 0, 1),
(12, 4, 'Regular House Cleaning', 'Standard house cleaning service including dusting, vacuuming, and bathroom cleaning', 150.00, 120, 'Cleaning', NULL, '2025-07-19 19:03:43', '2025-07-19 19:03:43', 0, 1),
(13, 4, 'Deep Cleaning', 'Comprehensive deep cleaning service including baseboards, inside appliances, and detailed attention', 250.00, 180, 'Cleaning', NULL, '2025-07-19 19:03:43', '2025-07-19 19:03:43', 0, 1),
(14, 4, 'Window Cleaning', 'Professional window cleaning service for all windows in your home', 100.00, 60, 'Cleaning', NULL, '2025-07-19 19:03:43', '2025-07-19 19:03:43', 0, 1),
(15, 4, 'Carpet Cleaning', 'Deep carpet cleaning and stain removal service', 200.00, 90, 'Cleaning', NULL, '2025-07-19 19:03:43', '2025-07-19 19:03:43', 0, 1),
(16, 4, 'Move-in/Move-out Cleaning', 'Complete cleaning service for move-in or move-out situations', 300.00, 240, 'Cleaning', NULL, '2025-07-19 19:03:43', '2025-07-19 19:03:43', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `service_availability`
--

CREATE TABLE `service_availability` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `availability_type` enum('default','custom') DEFAULT 'default',
  `business_hours_override` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_hours_override`)),
  `timeslot_template_id` int(11) DEFAULT NULL,
  `minimum_booking_notice` int(11) DEFAULT 0,
  `maximum_booking_advance` int(11) DEFAULT 525600,
  `booking_interval` int(11) DEFAULT 30,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_availability`
--

INSERT INTO `service_availability` (`id`, `service_id`, `user_id`, `availability_type`, `business_hours_override`, `timeslot_template_id`, `minimum_booking_notice`, `maximum_booking_advance`, `booking_interval`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'custom', NULL, NULL, 0, 525600, 15, '2025-07-15 01:31:38', '2025-07-15 01:31:38'),
(2, 6, 3, 'custom', NULL, NULL, 300, 525600, 30, '2025-07-16 02:08:33', '2025-07-16 02:08:33');

-- --------------------------------------------------------

--
-- Table structure for table `service_scheduling_rules`
--

CREATE TABLE `service_scheduling_rules` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `rule_type` enum('blackout','special_hours','capacity_limit') NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `days_of_week` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days_of_week`)),
  `capacity_limit` int(11) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_timeslot_templates`
--

CREATE TABLE `service_timeslot_templates` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `timeslots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`timeslots`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `availability` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`availability`)),
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `user_id`, `first_name`, `last_name`, `email`, `phone`, `role`, `skills`, `hourly_rate`, `availability`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'John', 'Smith', 'john.smith@example.com', '(555) 123-4567', 'Senior Cleaner', '[\"Deep Cleaning\",\"Window Washing\",\"Carpet Cleaning\"]', 25.00, '{\"monday\":{\"start\":\"08:00\",\"end\":\"17:00\",\"available\":true},\"tuesday\":{\"start\":\"08:00\",\"end\":\"17:00\",\"available\":true},\"wednesday\":{\"start\":\"08:00\",\"end\":\"17:00\",\"available\":true},\"thursday\":{\"start\":\"08:00\",\"end\":\"17:00\",\"available\":true},\"friday\":{\"start\":\"08:00\",\"end\":\"17:00\",\"available\":true},\"saturday\":{\"start\":\"08:00\",\"end\":\"14:00\",\"available\":true},\"sunday\":{\"start\":\"08:00\",\"end\":\"14:00\",\"available\":false}}', 'active', '2025-07-16 03:35:20', '2025-07-16 03:35:20'),
(2, 3, 'Sarah', 'Johnson', 'sarah.johnson@example.com', '(555) 234-5678', 'Cleaning Specialist', '[\"Kitchen Deep Clean\",\"Bathroom Sanitization\",\"Eco-friendly Cleaning\"]', 22.50, '{\"monday\":{\"start\":\"09:00\",\"end\":\"18:00\",\"available\":true},\"tuesday\":{\"start\":\"09:00\",\"end\":\"18:00\",\"available\":true},\"wednesday\":{\"start\":\"09:00\",\"end\":\"18:00\",\"available\":true},\"thursday\":{\"start\":\"09:00\",\"end\":\"18:00\",\"available\":true},\"friday\":{\"start\":\"09:00\",\"end\":\"18:00\",\"available\":true},\"saturday\":{\"start\":\"09:00\",\"end\":\"15:00\",\"available\":false},\"sunday\":{\"start\":\"09:00\",\"end\":\"15:00\",\"available\":false}}', 'active', '2025-07-16 03:35:20', '2025-07-16 03:35:20'),
(3, 3, 'Mike', 'Davis', 'mike.davis@example.com', '(555) 345-6789', 'Team Lead', '[\"Project Management\",\"Quality Control\",\"Customer Service\"]', 30.00, '{\"monday\":{\"start\":\"07:00\",\"end\":\"16:00\",\"available\":true},\"tuesday\":{\"start\":\"07:00\",\"end\":\"16:00\",\"available\":true},\"wednesday\":{\"start\":\"07:00\",\"end\":\"16:00\",\"available\":true},\"thursday\":{\"start\":\"07:00\",\"end\":\"16:00\",\"available\":true},\"friday\":{\"start\":\"07:00\",\"end\":\"16:00\",\"available\":true},\"saturday\":{\"start\":\"07:00\",\"end\":\"13:00\",\"available\":true},\"sunday\":{\"start\":\"07:00\",\"end\":\"13:00\",\"available\":false}}', 'active', '2025-07-16 03:35:20', '2025-07-16 03:35:20'),
(4, 3, 'Adeniyi', 'Adejuwon', 'adeniyiadejuwon0@gmail.com', '08107370125', 'Dentist', '[\"Deep cleaning\"]', 200.00, '{\"monday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"tuesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"wednesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"thursday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"friday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":false},\"saturday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":false},\"sunday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":false}}', 'active', '2025-07-16 03:52:08', '2025-07-16 03:52:08'),
(5, 3, 'OLAMILEKAN', 'AJAJA', 'ajajaolamilekan7@gmail.com', '09030844572', 'Manager', '[\"killing\"]', 30.00, '{\"monday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"tuesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"wednesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"thursday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"friday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":true},\"saturday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":false},\"sunday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"available\":false}}', 'active', '2025-07-19 01:24:47', '2025-07-19 01:24:47'),
(6, 4, 'Mike', 'Johnson', 'mike.johnson@zenbooker.com', '+1 (555) 123-4567', 'Lead Cleaner', NULL, NULL, NULL, 'active', '2025-07-19 19:03:30', '2025-07-19 19:03:30'),
(7, 4, 'Sarah', 'Williams', 'sarah.williams@zenbooker.com', '+1 (555) 234-5678', 'House Cleaner', NULL, NULL, NULL, 'active', '2025-07-19 19:03:30', '2025-07-19 19:03:30'),
(8, 4, 'David', 'Brown', 'david.brown@zenbooker.com', '+1 (555) 345-6789', 'Deep Cleaner', NULL, NULL, NULL, 'active', '2025-07-19 19:03:30', '2025-07-19 19:03:30'),
(9, 4, 'Lisa', 'Davis', 'lisa.davis@zenbooker.com', '+1 (555) 456-7890', 'Window Cleaner', NULL, NULL, NULL, 'active', '2025-07-19 19:03:30', '2025-07-19 19:03:30'),
(10, 4, 'James', 'Wilson', 'james.wilson@zenbooker.com', '+1 (555) 567-8901', 'Carpet Cleaner', NULL, NULL, NULL, 'active', '2025-07-19 19:03:30', '2025-07-19 19:03:30');

-- --------------------------------------------------------

--
-- Table structure for table `territories`
--

CREATE TABLE `territories` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `zip_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`zip_codes`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location` varchar(255) DEFAULT NULL COMMENT 'City, State, Country',
  `radius_miles` decimal(5,2) DEFAULT 25.00 COMMENT 'Service radius in miles',
  `timezone` varchar(50) DEFAULT 'America/New_York' COMMENT 'Territory timezone',
  `status` enum('active','inactive','archived') DEFAULT 'active' COMMENT 'Territory status',
  `business_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Territory-specific business hours' CHECK (json_valid(`business_hours`)),
  `team_members` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of team member IDs assigned to this territory' CHECK (json_valid(`team_members`)),
  `services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array of service IDs available in this territory' CHECK (json_valid(`services`)),
  `pricing_multiplier` decimal(3,2) DEFAULT 1.00 COMMENT 'Price multiplier for this territory'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `territories`
--

INSERT INTO `territories` (`id`, `user_id`, `name`, `description`, `zip_codes`, `created_at`, `updated_at`, `location`, `radius_miles`, `timezone`, `status`, `business_hours`, `team_members`, `services`, `pricing_multiplier`) VALUES
(1, 3, 'Just web', '', '[]', '2025-07-18 22:07:49', '2025-07-18 22:07:49', 'john wesly area', 25.00, 'America/New_York', 'active', '{}', '[4,3]', '[6]', 2.00);

-- --------------------------------------------------------

--
-- Table structure for table `territory_pricing`
--

CREATE TABLE `territory_pricing` (
  `id` int(11) NOT NULL,
  `territory_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `price_multiplier` decimal(3,2) DEFAULT 1.00,
  `minimum_price` decimal(10,2) DEFAULT NULL,
  `maximum_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `profile_picture` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Whether the business is active and visible',
  `business_slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `business_name`, `phone`, `email_notifications`, `sms_notifications`, `profile_picture`, `created_at`, `updated_at`, `is_active`, `business_slug`) VALUES
(1, 'info@zenbooker.com', 'Just web1#', 'Adeniyi', 'Adejuwon', 'zenbooker-cleaning-services', '+1 (555) 123-4567', 1, 0, NULL, '2025-07-07 00:23:16', '2025-07-19 21:55:05', 1, 'business-1'),
(2, 'adeniyiadejuwon02@gmail.com', 'Just web1#', 'Adeniyi', 'Adejuwon', 'now2code-academy', '08107370125', 1, 1, 'http://localhost:5000/uploads/profile-1752286896710-197354963.png', '2025-07-12 01:37:30', '2025-07-19 21:55:05', 1, 'business-2'),
(3, 'adeniyiadejuwon022@gmail.com', '$2a$12$Npzhxu/y/Lu052Z3mNscReOAGE0zIYjfKGmZJjo8ftDdsizQLL8hu', 'Adeniyi', 'Adejuwon', 'now2code academy 1', NULL, 1, 0, NULL, '2025-07-15 01:50:29', '2025-07-19 21:55:05', 1, 'business-3'),
(4, 'test@zenbooker.com', '$2a$12$mJQ/GprnVPTaeoJKl5gip.1JF9Bclku5dIJ0zdZ48JUaYDEetpGZC', 'Test', 'User', 'now2codeacademy1', NULL, 1, 0, NULL, '2025-07-15 01:58:46', '2025-07-19 21:55:05', 1, 'business-4');

-- --------------------------------------------------------

--
-- Table structure for table `user_availability`
--

CREATE TABLE `user_availability` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `business_hours` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`business_hours`)),
  `timeslot_templates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`timeslot_templates`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_availability`
--

INSERT INTO `user_availability` (`id`, `user_id`, `business_hours`, `timeslot_templates`, `created_at`, `updated_at`) VALUES
(1, 1, '{\"monday\": {\"start\": \"09:00\", \"end\": \"17:00\"}, \"tuesday\": {\"start\": \"09:00\", \"end\": \"17:00\"}, \"wednesday\": {\"start\": \"09:00\", \"end\": \"17:00\"}, \"thursday\": {\"start\": \"09:00\", \"end\": \"17:00\"}, \"friday\": {\"start\": \"09:00\", \"end\": \"17:00\"}, \"saturday\": {\"start\": \"09:00\", \"end\": \"15:00\"}, \"sunday\": {\"start\": \"09:00\", \"end\": \"12:00\"}}', '{\"slot_duration\": 30, \"buffer_time\": 15}', '2025-07-18 21:06:42', '2025-07-18 21:06:42'),
(2, 3, '{\"monday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"tuesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"wednesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"thursday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"friday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"saturday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":false},\"sunday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":false}}', '[{\"days\":{\"Sunday\":{\"enabled\":false,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Monday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Tuesday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Wednesday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Thursday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Friday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Saturday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"}},\"timeslotType\":\"Fixed length\"}]', '2025-07-19 02:16:22', '2025-07-19 02:16:22'),
(3, 3, '{\"monday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"tuesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"wednesday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"thursday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"friday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"saturday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":true},\"sunday\":{\"start\":\"09:00\",\"end\":\"17:00\",\"enabled\":false}}', '[{\"days\":{\"Sunday\":{\"enabled\":false,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Monday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Tuesday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Wednesday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Thursday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Friday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"},\"Saturday\":{\"enabled\":true,\"startTime\":\"9:00 AM\",\"endTime\":\"6:00 PM\"}},\"timeslotType\":\"Fixed length\"}]', '2025-07-19 02:16:46', '2025-07-19 02:16:46');

-- --------------------------------------------------------

--
-- Table structure for table `user_billing`
--

CREATE TABLE `user_billing` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscription_plan` varchar(100) DEFAULT 'Standard',
  `monthly_price` decimal(10,2) DEFAULT 29.00,
  `card_last4` varchar(4) DEFAULT NULL,
  `trial_end_date` datetime DEFAULT NULL,
  `is_trial` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_branding`
--

CREATE TABLE `user_branding` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `show_logo_in_admin` tinyint(1) DEFAULT 0,
  `primary_color` varchar(7) DEFAULT '#4CAF50',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_payment_settings`
--

CREATE TABLE `user_payment_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `online_booking_tips` tinyint(1) DEFAULT 0,
  `invoice_payment_tips` tinyint(1) DEFAULT 0,
  `show_service_prices` tinyint(1) DEFAULT 1,
  `show_service_descriptions` tinyint(1) DEFAULT 0,
  `payment_due_days` int(11) DEFAULT 15,
  `payment_due_unit` enum('days','weeks','months') DEFAULT 'days',
  `default_memo` text DEFAULT NULL,
  `invoice_footer` text DEFAULT NULL,
  `payment_processor` varchar(50) DEFAULT NULL,
  `payment_processor_connected` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_service_areas`
--

CREATE TABLE `user_service_areas` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `enforce_service_area` tinyint(1) DEFAULT 1,
  `territories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`territories`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_settings`
--
ALTER TABLE `booking_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_settings` (`user_id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_user_code` (`user_id`,`code`),
  ADD KEY `idx_active_coupons` (`is_active`,`expiration_date`);

--
-- Indexes for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `idx_coupon_usage` (`coupon_id`,`customer_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customers_user_id` (`user_id`),
  ADD KEY `idx_customers_status` (`status`);

--
-- Indexes for table `custom_payment_methods`
--
ALTER TABLE `custom_payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `estimates`
--
ALTER TABLE `estimates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `idx_estimates_user_id` (`user_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `estimate_id` (`estimate_id`),
  ADD KEY `idx_invoices_user_id` (`user_id`),
  ADD KEY `idx_invoices_status` (`status`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_jobs_user_id` (`user_id`),
  ADD KEY `idx_jobs_status` (`status`),
  ADD KEY `idx_jobs_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_jobs_invoice_status` (`invoice_status`),
  ADD KEY `idx_jobs_team_member_id` (`team_member_id`),
  ADD KEY `idx_jobs_invoice_id` (`invoice_id`),
  ADD KEY `idx_jobs_territory_id` (`territory_id`),
  ADD KEY `idx_jobs_recurring` (`is_recurring`,`next_billing_date`);

--
-- Indexes for table `job_templates`
--
ALTER TABLE `job_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_job_templates_user_id` (`user_id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_service_id` (`service_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_services_user_id` (`user_id`),
  ADD KEY `idx_services_is_active` (`is_active`);

--
-- Indexes for table `service_availability`
--
ALTER TABLE `service_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service_availability_service_id` (`service_id`),
  ADD KEY `idx_service_availability_user_id` (`user_id`);

--
-- Indexes for table `service_scheduling_rules`
--
ALTER TABLE `service_scheduling_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service_scheduling_rules_service_id` (`service_id`);

--
-- Indexes for table `service_timeslot_templates`
--
ALTER TABLE `service_timeslot_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_service_timeslot_templates_service_id` (`service_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_team_members_status` (`status`),
  ADD KEY `idx_team_members_role` (`role`);

--
-- Indexes for table `territories`
--
ALTER TABLE `territories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `territory_pricing`
--
ALTER TABLE `territory_pricing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_territory_service` (`territory_id`,`service_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `business_slug` (`business_slug`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_business_name` (`business_name`),
  ADD KEY `idx_users_business_slug` (`business_slug`);

--
-- Indexes for table `user_availability`
--
ALTER TABLE `user_availability`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_availability_user_id` (`user_id`);

--
-- Indexes for table `user_billing`
--
ALTER TABLE `user_billing`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_branding`
--
ALTER TABLE `user_branding`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_branding_user_id` (`user_id`);

--
-- Indexes for table `user_payment_settings`
--
ALTER TABLE `user_payment_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_payment_settings` (`user_id`);

--
-- Indexes for table `user_service_areas`
--
ALTER TABLE `user_service_areas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_service_areas_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking_settings`
--
ALTER TABLE `booking_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `custom_payment_methods`
--
ALTER TABLE `custom_payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `estimates`
--
ALTER TABLE `estimates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `job_templates`
--
ALTER TABLE `job_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `service_availability`
--
ALTER TABLE `service_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_scheduling_rules`
--
ALTER TABLE `service_scheduling_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_timeslot_templates`
--
ALTER TABLE `service_timeslot_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `territories`
--
ALTER TABLE `territories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `territory_pricing`
--
ALTER TABLE `territory_pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_availability`
--
ALTER TABLE `user_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_billing`
--
ALTER TABLE `user_billing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_branding`
--
ALTER TABLE `user_branding`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_payment_settings`
--
ALTER TABLE `user_payment_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_service_areas`
--
ALTER TABLE `user_service_areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_settings`
--
ALTER TABLE `booking_settings`
  ADD CONSTRAINT `booking_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupons`
--
ALTER TABLE `coupons`
  ADD CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_3` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `coupon_usage_ibfk_4` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_payment_methods`
--
ALTER TABLE `custom_payment_methods`
  ADD CONSTRAINT `custom_payment_methods_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `estimates`
--
ALTER TABLE `estimates`
  ADD CONSTRAINT `estimates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `estimates_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_3` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_ibfk_4` FOREIGN KEY (`estimate_id`) REFERENCES `estimates` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `fk_jobs_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_jobs_territory` FOREIGN KEY (`territory_id`) REFERENCES `territories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jobs_ibfk_4` FOREIGN KEY (`team_member_id`) REFERENCES `team_members` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `job_templates`
--
ALTER TABLE `job_templates`
  ADD CONSTRAINT `job_templates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `job_templates_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `requests`
--
ALTER TABLE `requests`
  ADD CONSTRAINT `requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `requests_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `requests_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_availability`
--
ALTER TABLE `service_availability`
  ADD CONSTRAINT `service_availability_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `service_availability_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_scheduling_rules`
--
ALTER TABLE `service_scheduling_rules`
  ADD CONSTRAINT `service_scheduling_rules_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `service_timeslot_templates`
--
ALTER TABLE `service_timeslot_templates`
  ADD CONSTRAINT `service_timeslot_templates_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `team_members`
--
ALTER TABLE `team_members`
  ADD CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `territories`
--
ALTER TABLE `territories`
  ADD CONSTRAINT `territories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `territory_pricing`
--
ALTER TABLE `territory_pricing`
  ADD CONSTRAINT `territory_pricing_ibfk_1` FOREIGN KEY (`territory_id`) REFERENCES `territories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `territory_pricing_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_availability`
--
ALTER TABLE `user_availability`
  ADD CONSTRAINT `user_availability_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_billing`
--
ALTER TABLE `user_billing`
  ADD CONSTRAINT `user_billing_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_branding`
--
ALTER TABLE `user_branding`
  ADD CONSTRAINT `user_branding_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_payment_settings`
--
ALTER TABLE `user_payment_settings`
  ADD CONSTRAINT `user_payment_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_service_areas`
--
ALTER TABLE `user_service_areas`
  ADD CONSTRAINT `user_service_areas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
