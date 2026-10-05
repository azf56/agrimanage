-- ==============================================================================
-- سامانه جامع مدیریت هوشمند باغات پسته (AgriManage Pistachio)
-- ساختار کامل پایگاه داده MySQL جهت ایمپورت مستقیم در phpMyAdmin هاست cPanel
-- نسخه: 2.0 (پشتیبانی کامل از وب، اپلیکیشن موبایل، ثبت آفلاین و سینک دلتا)
-- فرمت کانوکشن: utf8mb4 / utf8mb4_persian_ci
-- ==============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+03:30";

-- ایجاد دیتابیس در صورت نیاز (روی هاست cPanel معمولاً دیتابیس از پنل ساخته می‌شود)
-- CREATE DATABASE IF NOT EXISTS `agrimanage_pistachio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_persian_ci;
-- USE `agrimanage_pistachio`;

-- --------------------------------------------------------
-- ۱. جدول کاربران و احراز هویت (Users & RBAC)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('admin', 'operator', 'expert', 'farmer', 'lab') NOT NULL DEFAULT 'farmer',
  `owner_id` VARCHAR(36) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_role` (`role`),
  KEY `idx_user_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- درج کاربران اولیه سامانه
INSERT INTO `users` (`id`, `username`, `password`, `name`, `role`, `owner_id`) VALUES
('1', 'admin', '123', 'مدیر کل سامانه باغات پسته', 'admin', NULL),
('2', 'operator1', '123', 'مهندس رمضانی (اپراتور سامانه)', 'operator', NULL),
('3', 'expert1', '123', 'دکتر کریمی (متخصص گیاه‌پزشکی پسته)', 'expert', NULL),
('101', '09131234567', '123', 'حاج علی رضایی (باغدار)', 'farmer', '1')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- --------------------------------------------------------
-- ۲. جدول مالکان و بهره‌برداران باغات (Owners / Farmers)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `owners` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `national_id` VARCHAR(15) DEFAULT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_owner_mobile` (`mobile`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۳. جدول منابع آب و چاه موتورها (Water Sources)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `water_sources` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `well_depth` DECIMAL(6,2) DEFAULT NULL,
  `flow_rate` VARCHAR(100) DEFAULT NULL,
  `water_ec` VARCHAR(20) DEFAULT NULL,
  `water_ph` VARCHAR(20) DEFAULT NULL,
  `water_sar` VARCHAR(20) DEFAULT NULL,
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۴. جدول قطعات و باغات پسته (Lands / Orchards)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lands` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `title` VARCHAR(200) DEFAULT NULL,
  `area_hectares` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `owner_id` VARCHAR(36) NOT NULL,
  `water_source_id` VARCHAR(36) DEFAULT NULL,
  `pistachio_rootstock` VARCHAR(150) NOT NULL DEFAULT 'اکبری روی پایه بادامی',
  `planting_year` INT(4) DEFAULT 1385,
  `irrigation_system` VARCHAR(100) NOT NULL DEFAULT 'قطره‌ای تحت فشار',
  `irrigation_period` VARCHAR(60) NOT NULL DEFAULT '۲۴ روزه',
  `latitude` DECIMAL(10,7) DEFAULT NULL,
  `longitude` DECIMAL(10,7) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_land_owner` (`owner_id`),
  KEY `idx_land_water` (`water_source_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۵. جدول پایش و بازدید میدانی باغات (Field Inspections / IPM Visits)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `visits` (
  `id` VARCHAR(36) NOT NULL,
  `land_id` VARCHAR(36) NOT NULL,
  `visit_date` VARCHAR(12) NOT NULL,
  `crop_year_status` VARCHAR(60) DEFAULT NULL,
  `growth_stage` VARCHAR(100) DEFAULT NULL,
  `psyllid` VARCHAR(150) DEFAULT NULL,
  `psylla_density` VARCHAR(60) DEFAULT NULL,
  `mite_status` VARCHAR(150) DEFAULT NULL,
  `stinkbug_status` VARCHAR(150) DEFAULT NULL,
  `aphid_status` VARCHAR(150) DEFAULT NULL,
  `leafminer_status` VARCHAR(150) DEFAULT NULL,
  `other_pests` VARCHAR(255) DEFAULT NULL,
  `gummosis` VARCHAR(150) DEFAULT NULL,
  `dieback` VARCHAR(150) DEFAULT NULL,
  `alternaria_status` VARCHAR(150) DEFAULT NULL,
  `botrytis_status` VARCHAR(150) DEFAULT NULL,
  `root_rot_status` VARCHAR(150) DEFAULT NULL,
  `canker_status` VARCHAR(150) DEFAULT NULL,
  `salinity_injury` VARCHAR(150) DEFAULT NULL,
  `sunburn_status` VARCHAR(150) DEFAULT NULL,
  `wind_damage` VARCHAR(150) DEFAULT NULL,
  `tree_vigor` VARCHAR(100) DEFAULT NULL,
  `fruit_load` VARCHAR(100) DEFAULT NULL,
  `early_splitting` VARCHAR(100) DEFAULT NULL,
  `blanking_rate` VARCHAR(100) DEFAULT NULL,
  `irrigation_status` VARCHAR(150) DEFAULT NULL,
  `soil_moisture` VARCHAR(100) DEFAULT NULL,
  `nutrient_deficiency` VARCHAR(255) DEFAULT NULL,
  `weed_status` VARCHAR(150) DEFAULT NULL,
  `temperature` DECIMAL(4,1) DEFAULT NULL,
  `humidity` DECIMAL(4,1) DEFAULT NULL,
  `wind_speed` DECIMAL(4,1) DEFAULT NULL,
  `weather_condition` VARCHAR(60) DEFAULT NULL,
  `visit_duration_min` INT(4) DEFAULT 45,
  `photos_taken` INT(4) DEFAULT 0,
  `ipm_applied` TEXT DEFAULT NULL,
  `lab_sample_taken` TINYINT(1) DEFAULT 0,
  `next_visit_date` VARCHAR(12) DEFAULT NULL,
  `private_note` TEXT DEFAULT NULL,
  `expert_recommendation` TEXT DEFAULT NULL,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `converted_to_task_id` VARCHAR(36) DEFAULT NULL,
  `converted_at` VARCHAR(12) DEFAULT NULL,
  `created_offline` TINYINT(1) NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_visit_land` (`land_id`),
  KEY `idx_visit_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۶. جدول دستورالعمل‌ها و وظایف مصوب باغبانی (Tasks & Directives)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` VARCHAR(36) NOT NULL,
  `land_id` VARCHAR(36) NOT NULL,
  `visit_id` VARCHAR(36) DEFAULT NULL,
  `source_recommendation` TEXT DEFAULT NULL,
  `visit_date` VARCHAR(12) DEFAULT NULL,
  `category` ENUM('pest_control', 'nutrition', 'agronomy') NOT NULL DEFAULT 'pest_control',
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `due_date` VARCHAR(12) DEFAULT NULL,
  `created_by` VARCHAR(36) DEFAULT NULL,
  `created_by_name` VARCHAR(150) DEFAULT NULL,
  `created_at` VARCHAR(12) DEFAULT NULL,
  `farmer_done` TINYINT(1) NOT NULL DEFAULT 0,
  `farmer_done_at` VARCHAR(12) DEFAULT NULL,
  `farmer_note` TEXT DEFAULT NULL,
  `is_confirmed` TINYINT(1) NOT NULL DEFAULT 0,
  `confirmed_by` VARCHAR(36) DEFAULT NULL,
  `confirmed_by_name` VARCHAR(150) DEFAULT NULL,
  `confirmed_at` VARCHAR(12) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_task_land` (`land_id`),
  KEY `idx_task_visit` (`visit_id`),
  KEY `idx_task_status` (`farmer_done`, `is_confirmed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۷. جدول آنالیزهای تخصصی آب، خاک و برگ (Lab Analyses)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lab_analyses` (
  `id` VARCHAR(36) NOT NULL,
  `land_id` VARCHAR(36) NOT NULL,
  `analysis_date` VARCHAR(12) NOT NULL,
  `soil_ec` DECIMAL(5,2) DEFAULT NULL,
  `soil_ph` DECIMAL(4,2) DEFAULT NULL,
  `soil_texture` VARCHAR(100) DEFAULT NULL,
  `soil_tnv` DECIMAL(5,2) DEFAULT NULL,
  `soil_oc` DECIMAL(5,2) DEFAULT NULL,
  `soil_sar` DECIMAL(5,2) DEFAULT NULL,
  `leaf_n` DECIMAL(5,2) DEFAULT NULL,
  `leaf_p` DECIMAL(5,2) DEFAULT NULL,
  `leaf_ref_k` DECIMAL(5,2) DEFAULT NULL,
  `leaf_fe` DECIMAL(6,2) DEFAULT NULL,
  `leaf_zn` DECIMAL(6,2) DEFAULT NULL,
  `leaf_b` DECIMAL(6,2) DEFAULT NULL,
  `leaf_interpretation` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_lab_land` (`land_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۸. جدول پیام‌ها و مکاتبات باغدار و کارشناس (Messages)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(36) NOT NULL,
  `owner_id` VARCHAR(36) NOT NULL,
  `sender_role` ENUM('farmer', 'expert', 'admin', 'operator') NOT NULL,
  `sender_id` VARCHAR(36) NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `text` TEXT NOT NULL,
  `created_at` VARCHAR(25) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_msg_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۹. جدول تعاریف و واژگان پایه باغبانی (Lookups & Vocabularies)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lookups` (
  `id` VARCHAR(50) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `scientific_name` VARCHAR(150) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `recommended_stage` VARCHAR(100) DEFAULT NULL,
  `tag` VARCHAR(60) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT(4) DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lookup_cat` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

-- --------------------------------------------------------
-- ۱۰. جدول لاگ همگام‌سازی موبایل و سرور (Sync Logs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sync_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `device_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(36) DEFAULT NULL,
  `sync_type` ENUM('push', 'pull', 'full') NOT NULL,
  `records_synced` INT(5) NOT NULL DEFAULT 0,
  `client_time` VARCHAR(30) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_persian_ci;

COMMIT;
