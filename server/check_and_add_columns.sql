-- Check and add missing columns to team_members table

-- Check if username column exists, if not add it
SELECT COUNT(*) INTO @username_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'username';

SET @sql = IF(@username_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN username varchar(100) UNIQUE DEFAULT NULL',
  'SELECT "username column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if password column exists, if not add it
SELECT COUNT(*) INTO @password_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'password';

SET @sql = IF(@password_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN password varchar(255) DEFAULT NULL',
  'SELECT "password column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if is_active column exists, if not add it
SELECT COUNT(*) INTO @is_active_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'is_active';

SET @sql = IF(@is_active_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN is_active tinyint(1) DEFAULT 1',
  'SELECT "is_active column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if last_login column exists, if not add it
SELECT COUNT(*) INTO @last_login_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'last_login';

SET @sql = IF(@last_login_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN last_login timestamp NULL DEFAULT NULL',
  'SELECT "last_login column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if skills column exists, if not add it
SELECT COUNT(*) INTO @skills_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'skills';

SET @sql = IF(@skills_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN skills longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(skills))',
  'SELECT "skills column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if hourly_rate column exists, if not add it
SELECT COUNT(*) INTO @hourly_rate_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'hourly_rate';

SET @sql = IF(@hourly_rate_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN hourly_rate decimal(10,2) DEFAULT NULL',
  'SELECT "hourly_rate column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if availability column exists, if not add it
SELECT COUNT(*) INTO @availability_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'availability';

SET @sql = IF(@availability_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN availability longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(availability))',
  'SELECT "availability column already exists" as message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if status column exists, if not add it
SELECT COUNT(*) INTO @status_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'team_members' 
AND COLUMN_NAME = 'status';

SET @sql = IF(@status_exists = 0, 
  'ALTER TABLE team_members ADD COLUMN status enum(\'active\',\'inactive\',\'pending\') DEFAULT \'active\'',
  'SELECT "status column already exists" as message'
);
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