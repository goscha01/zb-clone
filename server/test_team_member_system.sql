-- Test script to verify team member system is working

-- 1. Check if team_members table has the required columns
DESCRIBE team_members;

-- 2. Check if the new tables exist
SHOW TABLES LIKE 'team_member_%';

-- 3. Insert a test team member
INSERT INTO team_members (
  user_id, 
  first_name, 
  last_name, 
  email, 
  phone, 
  username, 
  password, 
  role, 
  skills, 
  hourly_rate, 
  status, 
  is_active
) VALUES (
  1, -- Replace with actual user_id
  'Test',
  'Member',
  'test@example.com',
  '555-1234',
  'testmember',
  '$2b$10$test.hash.here', -- This should be a proper bcrypt hash
  'Cleaner',
  '["cleaning", "organizing"]',
  25.00,
  'active',
  1
);

-- 4. Check if the team member was created
SELECT id, first_name, last_name, username, role, status FROM team_members WHERE username = 'testmember';

-- 5. Create a test job assignment
INSERT INTO jobs (
  user_id,
  customer_id,
  service_id,
  team_member_id,
  scheduled_date,
  status,
  notes
) VALUES (
  1, -- Replace with actual user_id
  1, -- Replace with actual customer_id
  1, -- Replace with actual service_id
  (SELECT id FROM team_members WHERE username = 'testmember'),
  NOW(),
  'pending',
  'Test job assignment'
);

-- 6. Check if the job was assigned
SELECT 
  j.id,
  j.scheduled_date,
  j.status,
  tm.first_name,
  tm.last_name,
  c.first_name as customer_first_name,
  c.last_name as customer_last_name
FROM jobs j
LEFT JOIN team_members tm ON j.team_member_id = tm.id
LEFT JOIN customers c ON j.customer_id = c.id
WHERE j.team_member_id = (SELECT id FROM team_members WHERE username = 'testmember'); 