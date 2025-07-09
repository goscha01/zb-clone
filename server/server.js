const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();
const serverless = require('serverless-http');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const createConnection = async () => {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'zenbooker',
      port: process.env.DB_PORT || 3306
    });
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      message: 'ZenBooker API is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// User authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;
    const connection = await createConnection();
    
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, first_name, last_name, business_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [email, password, firstName, lastName, businessName]
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await createConnection();
    
    const [users] = await connection.execute(
      'SELECT id, email, first_name, last_name, business_name FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessName: user.business_name
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await createConnection();
    
    const [services] = await connection.execute(
      'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    await connection.end();
    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { userId, name, description, price, duration, category } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO services (user_id, name, description, price, duration, category, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, name, description, price, duration, category]
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'Service created successfully',
      serviceId: result.insertId 
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category } = req.body;
    const connection = await createConnection();
    
    await connection.execute(
      'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, updated_at = NOW() WHERE id = ?',
      [name, description, price, duration, category, id]
    );
    
    await connection.end();
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await createConnection();
    
    await connection.execute('DELETE FROM services WHERE id = ?', [id]);
    
    await connection.end();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    const { userId, status } = req.query;
    const connection = await createConnection();
    
    let query = 'SELECT * FROM jobs WHERE user_id = ?';
    let params = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [jobs] = await connection.execute(query, params);
    
    await connection.end();
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { userId, customerId, serviceId, scheduledDate, notes, status } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO jobs (user_id, customer_id, service_id, scheduled_date, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, customerId, serviceId, scheduledDate, notes, status || 'pending']
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'Job created successfully',
      jobId: result.insertId 
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, notes, status } = req.body;
    const connection = await createConnection();
    
    await connection.execute(
      'UPDATE jobs SET scheduled_date = ?, notes = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [scheduledDate, notes, status, id]
    );
    
    await connection.end();
    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Customers endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await createConnection();
    
    const [customers] = await connection.execute(
      'SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    await connection.end();
    res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, address } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, firstName, lastName, email, phone, address]
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'Customer created successfully',
      customerId: result.insertId 
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Team members endpoints
app.get('/api/team', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await createConnection();
    
    const [teamMembers] = await connection.execute(
      'SELECT * FROM team_members WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    await connection.end();
    res.json(teamMembers);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.post('/api/team', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, role } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO team_members (user_id, first_name, last_name, email, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [userId, firstName, lastName, email, phone, role]
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'Team member created successfully',
      teamMemberId: result.insertId 
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Estimates endpoints
app.get('/api/estimates', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await createConnection();
    
    const [estimates] = await connection.execute(
      'SELECT * FROM estimates WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    await connection.end();
    res.json(estimates);
  } catch (error) {
    console.error('Get estimates error:', error);
    res.status(500).json({ error: 'Failed to fetch estimates' });
  }
});

app.post('/api/estimates', async (req, res) => {
  try {
    const { userId, customerId, services, totalAmount, status } = req.body;
    const connection = await createConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO estimates (user_id, customer_id, services, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, customerId, JSON.stringify(services), totalAmount, status || 'pending']
    );
    
    await connection.end();
    res.status(201).json({ 
      message: 'Estimate created successfully',
      estimateId: result.insertId 
    });
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ error: 'Failed to create estimate' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ZenBooker API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
} else {
  // Export for Vercel
  module.exports = serverless(app);
}