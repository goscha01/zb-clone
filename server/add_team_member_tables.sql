-- Add team member authentication tables to existing database

-- Update team_members table with new fields (only if they don't exist)
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'username') = 0,
  'ALTER TABLE team_members ADD COLUMN username varchar(100) UNIQUE DEFAULT NULL',
  'SELECT "username column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'password') = 0,
  'ALTER TABLE team_members ADD COLUMN password varchar(255) DEFAULT NULL',
  'SELECT "password column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'is_active') = 0,
  'ALTER TABLE team_members ADD COLUMN is_active tinyint(1) DEFAULT 1',
  'SELECT "is_active column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'is_verified') = 0,
  'ALTER TABLE team_members ADD COLUMN is_verified tinyint(1) DEFAULT 0',
  'SELECT "is_verified column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'verification_token') = 0,
  'ALTER TABLE team_members ADD COLUMN verification_token varchar(255) DEFAULT NULL',
  'SELECT "verification_token column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'reset_token') = 0,
  'ALTER TABLE team_members ADD COLUMN reset_token varchar(255) DEFAULT NULL',
  'SELECT "reset_token column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'reset_token_expires') = 0,
  'ALTER TABLE team_members ADD COLUMN reset_token_expires timestamp NULL DEFAULT NULL',
  'SELECT "reset_token_expires column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'last_login') = 0,
  'ALTER TABLE team_members ADD COLUMN last_login timestamp NULL DEFAULT NULL',
  'SELECT "last_login column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'skills') = 0,
  'ALTER TABLE team_members ADD COLUMN skills longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(skills))',
  'SELECT "skills column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'hourly_rate') = 0,
  'ALTER TABLE team_members ADD COLUMN hourly_rate decimal(10,2) DEFAULT NULL',
  'SELECT "hourly_rate column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'availability') = 0,
  'ALTER TABLE team_members ADD COLUMN availability longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(availability))',
  'SELECT "availability column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'profile_picture') = 0,
  'ALTER TABLE team_members ADD COLUMN profile_picture varchar(500) DEFAULT NULL',
  'SELECT "profile_picture column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'status') = 0,
  'ALTER TABLE team_members ADD COLUMN status enum(\'active\',\'inactive\',\'pending\') DEFAULT \'active\'',
  'SELECT "status column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'team_members' 
   AND COLUMN_NAME = 'permissions') = 0,
  'ALTER TABLE team_members ADD COLUMN permissions longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(permissions))',
  'SELECT "permissions column already exists" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create team_member_sessions table
CREATE TABLE IF NOT EXISTS team_member_sessions (
  id int(11) NOT NULL AUTO_INCREMENT,
  team_member_id int(11) NOT NULL,
  session_token varchar(255) NOT NULL,
  device_info text DEFAULT NULL,
  ip_address varchar(45) DEFAULT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_team_member_sessions_team_member_id (team_member_id),
  CONSTRAINT team_member_sessions_ibfk_1 FOREIGN KEY (team_member_id) REFERENCES team_members (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create team_member_job_assignments table
CREATE TABLE IF NOT EXISTS team_member_job_assignments (
  id int(11) NOT NULL AUTO_INCREMENT,
  team_member_id int(11) NOT NULL,
  job_id int(11) NOT NULL,
  assigned_by int(11) NOT NULL,
  assigned_at timestamp NOT NULL DEFAULT current_timestamp(),
  status enum('assigned','accepted','started','completed','declined') DEFAULT 'assigned',
  notes text DEFAULT NULL,
  started_at timestamp NULL DEFAULT NULL,
  completed_at timestamp NULL DEFAULT NULL,
  rating int(1) DEFAULT NULL,
  feedback text DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_team_member_job_assignments_team_member_id (team_member_id),
  KEY idx_team_member_job_assignments_job_id (job_id),
  CONSTRAINT team_member_job_assignments_ibfk_1 FOREIGN KEY (team_member_id) REFERENCES team_members (id) ON DELETE CASCADE,
  CONSTRAINT team_member_job_assignments_ibfk_2 FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
  CONSTRAINT team_member_job_assignments_ibfk_3 FOREIGN KEY (assigned_by) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create team_member_notifications table
CREATE TABLE IF NOT EXISTS team_member_notifications (
  id int(11) NOT NULL AUTO_INCREMENT,
  team_member_id int(11) NOT NULL,
  type enum('job_assigned','job_reminder','job_completed','system','payment') NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  data longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(data)),
  is_read tinyint(1) DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY idx_team_member_notifications_team_member_id (team_member_id),
  CONSTRAINT team_member_notifications_ibfk_1 FOREIGN KEY (team_member_id) REFERENCES team_members (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 