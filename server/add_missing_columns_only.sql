-- Add only missing columns to team_members table (safe approach)

-- Add is_active column if it doesn't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_active tinyint(1) DEFAULT 1;

-- Add last_login column if it doesn't exist  
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS last_login timestamp NULL DEFAULT NULL;

-- Add skills column if it doesn't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS skills longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(skills));

-- Add hourly_rate column if it doesn't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS hourly_rate decimal(10,2) DEFAULT NULL;

-- Add availability column if it doesn't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS availability longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(availability));

-- Add status column if it doesn't exist
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS status enum('active','inactive','pending') DEFAULT 'active';

-- Create team_member_sessions table if it doesn't exist
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

-- Create team_member_job_assignments table if it doesn't exist
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

-- Create team_member_notifications table if it doesn't exist
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