const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cron = require('node-cron');
require('dotenv').config();

// Email configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'wevbest@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'qqsf nruc uosc twwc'
  }
});

// Cron job for recurring billing
cron.schedule('0 9 * * *', async () => {
  console.log('Running recurring billing check...');
  try {
    const connection = await pool.getConnection();
    const [recurringJobs] = await connection.query(`
      SELECT j.*, c.email, c.first_name, c.last_name, s.name as service_name, s.price
      FROM jobs j
      JOIN customers c ON j.customer_id = c.id
      JOIN services s ON j.service_id = s.id
      WHERE j.is_recurring = 1 
      AND j.next_billing_date <= CURDATE()
      AND j.status = 'completed'
    `);
    
    for (const job of recurringJobs) {
      // Create new job for recurring service
      await connection.query(`
        INSERT INTO jobs (user_id, customer_id, service_id, scheduled_date, notes, status, is_recurring, recurring_frequency)
        VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, 'pending', 1, ?)
      `, [job.user_id, job.customer_id, job.service_id, job.recurring_frequency, job.notes, job.recurring_frequency]);
      
      // Update next billing date
      await connection.query(`
        UPDATE jobs SET next_billing_date = DATE_ADD(next_billing_date, INTERVAL ? DAY)
        WHERE id = ?
      `, [job.recurring_frequency, job.id]);
      
      // Send email notification
      await sendEmail({
        to: job.email,
        subject: 'Recurring Service Scheduled',
        html: `
          <h2>Your recurring service has been scheduled</h2>
          <p>Hello ${job.first_name},</p>
          <p>Your recurring ${job.service_name} service has been scheduled for ${new Date().toLocaleDateString()}.</p>
          <p>Service: ${job.service_name}</p>
          <p>Price: $${job.price}</p>
          <p>Thank you for choosing our services!</p>
        `
      });
    }
    
    connection.release();
  } catch (error) {
    console.error('Recurring billing error:', error);
  }
});

// Email sending function
async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://zenbooker.now2code.online',
    'https://zb-clone.vercel.app',
    'https://zenbooker.netlify.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'nowcodeo_Justweb1',
  password: process.env.DB_PASSWORD || 'Just web08107370125',
  database: process.env.DB_NAME || 'nowcodeo_zenbooker'
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    console.log('Database config:', {
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_NAME || 'nowcodeo_zenbooker',
      port: process.env.DB_PORT || 3306
    });
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    console.error('Database connection error details:', {
      message: err.message,
      code: err.code,
      errno: err.errno
    });
  });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('Auth check - Header:', authHeader ? 'Present' : 'Missing');
  console.log('Auth check - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('Auth failed - No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Auth failed - Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Auth successful - User ID:', user.userId);
    req.user = user;
    next();
  });
};

// Input validation helpers
const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 255;
};

const validatePassword = (password) => {
  return password && password.length >= 8 && password.length <= 128;
};

const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const connection = await pool.getConnection();
    connection.release();
    
    res.json({ 
      status: 'OK', 
      message: 'ZenBooker API is running',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      database: 'Disconnected',
      message: error.message
    });
  }
});

// User authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;
    
    // Input validation
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    if (!validateName(firstName) || !validateName(lastName)) {
      return res.status(400).json({ error: 'First and last names must be between 2 and 50 characters' });
    }
    
    if (!businessName || businessName.trim().length < 2 || businessName.trim().length > 100) {
      return res.status(400).json({ error: 'Business name must be between 2 and 100 characters' });
    }
    
    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedBusinessName = sanitizeInput(businessName);
    
    const connection = await pool.getConnection();
    
    try {
      // Check if user already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ?',
        [sanitizedEmail]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create new user
      const [result] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, business_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [sanitizedEmail, hashedPassword, sanitizedFirstName, sanitizedLastName, sanitizedBusinessName]
      );
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: result.insertId, 
          email: sanitizedEmail,
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          businessName: sanitizedBusinessName
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.status(201).json({ 
        message: 'Account created successfully',
        token,
        user: {
          id: result.insertId,
          email: sanitizedEmail,
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          businessName: sanitizedBusinessName
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    if (!password || password.length < 1) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim();
    
    const connection = await pool.getConnection();
    
    try {
      // Get user with hashed password
      const [users] = await connection.query(
        'SELECT id, email, password, first_name, last_name, business_name FROM users WHERE email = ?',
        [sanitizedEmail]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      const user = users[0];
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({ 
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Signin error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno
    });
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      // Get updated user data
      const [users] = await connection.query(
        'SELECT id, email, first_name, last_name, business_name FROM users WHERE id = ?',
        [req.user.userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users[0];
      
      // Generate new token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({ 
        message: 'Token refreshed successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout endpoint (client-side token removal)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // In a more advanced setup, you might want to blacklist the token
    // For now, we'll just return success and let the client remove the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(
        'SELECT id, email, first_name, last_name, business_name FROM users WHERE id = ?',
        [req.user.userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const user = users[0];
      
      res.json({ 
        message: 'Token is valid',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [services] = await connection.query(
        'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      res.json(services);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { userId, name, description, price, duration, category, modifiers, require_payment_method } = req.body;
    
    console.log('Creating service with data:', { userId, name, description, price, duration, category, modifiers, require_payment_method });
    
    const connection = await pool.getConnection();
    
    try {
      // First verify the user exists
      const [users] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        console.error('User not found:', userId);
        return res.status(400).json({ error: 'User not found. Please log in again.' });
      }
      
      const [result] = await connection.query(
        'INSERT INTO services (user_id, name, description, price, duration, category, modifiers, require_payment_method, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, name, description, price, duration, category, modifiers || null, require_payment_method ? 1 : 0]
      );
      
      // Get the created service with all fields
      const [services] = await connection.query(
        'SELECT * FROM services WHERE id = ?',
        [result.insertId]
      );
      
      if (services.length === 0) {
        return res.status(500).json({ error: 'Failed to retrieve created service' });
      }
      
      res.status(201).json(services[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create service error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      res.status(400).json({ error: 'User not found. Please log in again.' });
    } else {
      res.status(500).json({ error: 'Failed to create service' });
    }
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [services] = await connection.query(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );
      
      if (services.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      res.json(services[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category, modifiers, require_payment_method } = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, category = ?, modifiers = ?, require_payment_method = ?, updated_at = NOW() WHERE id = ?',
        [name, description, price, duration, category, modifiers || null, require_payment_method ? 1 : 0, id]
      );
      
      res.json({ message: 'Service updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      await connection.query('DELETE FROM services WHERE id = ?', [id]);
      
      res.json({ message: 'Service deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    const { userId, status, search, page = 1, limit = 20, dateRange, dateFilter, sortBy = 'scheduled_date', sortOrder = 'ASC', teamMember, invoiceStatus } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          j.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          s.name as service_name,
          s.price as service_price,
          s.duration as service_duration,
          tm.first_name as team_member_first_name,
          tm.last_name as team_member_last_name
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN services s ON j.service_id = s.id
        LEFT JOIN team_members tm ON j.team_member_id = tm.id
        WHERE j.user_id = ?
      `;
      let params = [userId];
      
      if (status) {
        const statusArray = status.split(',');
        const placeholders = statusArray.map(() => '?').join(',');
        query += ` AND j.status IN (${placeholders})`;
        params.push(...statusArray);
      }
      
      if (search) {
        query += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR s.name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Handle team member assignment filtering
      if (teamMember) {
        switch (teamMember) {
          case 'assigned':
            query += ' AND j.team_member_id IS NOT NULL';
            break;
          case 'unassigned':
            query += ' AND j.team_member_id IS NULL';
            break;
          case 'web':
            // Jobs created through web booking (you can customize this logic)
            query += ' AND j.team_member_id IS NULL';
            break;
        }
      }
      
      // Handle invoice status filtering
      if (invoiceStatus) {
        switch (invoiceStatus) {
          case 'invoiced':
            query += ' AND j.invoice_status IN ("invoiced", "paid", "unpaid")';
            break;
          case 'not_invoiced':
            query += ' AND j.invoice_status = "not_invoiced"';
            break;
          case 'paid':
            query += ' AND j.invoice_status = "paid"';
            break;
          case 'unpaid':
            query += ' AND j.invoice_status = "unpaid"';
            break;
        }
      }
      
      // Handle date filtering
      if (dateFilter === 'future') {
        query += ' AND DATE(j.scheduled_date) >= CURDATE()';
      } else if (dateFilter === 'past') {
        query += ' AND DATE(j.scheduled_date) < CURDATE()';
      } else if (dateRange) {
        const [startDate, endDate] = dateRange.split(':');
        if (startDate && endDate) {
          query += ' AND DATE(j.scheduled_date) BETWEEN ? AND ?';
          params.push(startDate, endDate);
        }
      }
      
      // Handle sorting
      const allowedSortFields = ['scheduled_date', 'customer_first_name', 'service_price', 'created_at'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      } else {
        query += ' ORDER BY j.scheduled_date ASC';
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [jobs] = await connection.query(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN services s ON j.service_id = s.id
        WHERE j.user_id = ?
      `;
      let countParams = [userId];
      
      if (status) {
        const statusArray = status.split(',');
        const placeholders = statusArray.map(() => '?').join(',');
        countQuery += ` AND j.status IN (${placeholders})`;
        countParams.push(...statusArray);
      }
      
      if (search) {
        countQuery += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR s.name LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Handle team member assignment filtering for count query
      if (teamMember) {
        switch (teamMember) {
          case 'assigned':
            countQuery += ' AND j.team_member_id IS NOT NULL';
            break;
          case 'unassigned':
            countQuery += ' AND j.team_member_id IS NULL';
            break;
          case 'web':
            countQuery += ' AND j.team_member_id IS NULL';
            break;
        }
      }
      
      // Handle invoice status filtering for count query
      if (invoiceStatus) {
        switch (invoiceStatus) {
          case 'invoiced':
            countQuery += ' AND j.invoice_status IN ("invoiced", "paid", "unpaid")';
            break;
          case 'not_invoiced':
            countQuery += ' AND j.invoice_status = "not_invoiced"';
            break;
          case 'paid':
            countQuery += ' AND j.invoice_status = "paid"';
            break;
          case 'unpaid':
            countQuery += ' AND j.invoice_status = "unpaid"';
            break;
        }
      }
      
      // Handle date filtering for count query
      if (dateFilter === 'future') {
        countQuery += ' AND DATE(j.scheduled_date) >= CURDATE()';
      } else if (dateFilter === 'past') {
        countQuery += ' AND DATE(j.scheduled_date) < CURDATE()';
      } else if (dateRange) {
        const [startDate, endDate] = dateRange.split(':');
        if (startDate && endDate) {
          countQuery += ' AND DATE(j.scheduled_date) BETWEEN ? AND ?';
          countParams.push(startDate, endDate);
        }
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get jobs error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      error: 'Failed to fetch jobs',
      details: error.message,
      code: error.code
    });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [jobs] = await connection.query(`
        SELECT 
          j.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address as customer_address,
          s.name as service_name,
          s.description as service_description,
          s.price as service_price,
          s.duration as service_duration,
          s.modifiers as service_modifiers,
          tm.first_name as team_member_first_name,
          tm.last_name as team_member_last_name,
          tm.email as team_member_email,
          tm.phone as team_member_phone
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN services s ON j.service_id = s.id
        LEFT JOIN team_members tm ON j.team_member_id = tm.id
        WHERE j.id = ?
      `, [id]);
      
      if (jobs.length === 0) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(jobs[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { 
      userId, 
      customerId, 
      serviceId, 
      teamMemberId, 
      scheduledDate, 
      scheduledTime,
      notes, 
      status,
      estimatedDuration,
      estimatedPrice
    } = req.body;
    
    if (!userId || !customerId || !serviceId || !scheduledDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Combine date and time
      const fullScheduledDate = scheduledTime 
        ? `${scheduledDate} ${scheduledTime}:00`
        : `${scheduledDate} 09:00:00`;
      
      const [result] = await connection.query(
        `INSERT INTO jobs (
          user_id, customer_id, service_id, team_member_id, 
          scheduled_date, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          customerId, 
          serviceId, 
          teamMemberId || null, 
          fullScheduledDate, 
          notes || null, 
          status || 'pending'
        ]
      );
      
      // Get the created job with all details
      const [jobs] = await connection.query(`
        SELECT 
          j.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          s.name as service_name,
          s.price as service_price,
          s.duration as service_duration,
          tm.first_name as team_member_first_name,
          tm.last_name as team_member_last_name
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN services s ON j.service_id = s.id
        LEFT JOIN team_members tm ON j.team_member_id = tm.id
        WHERE j.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Job created successfully',
        job: jobs[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

app.put('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      scheduledDate, 
      scheduledTime,
      notes, 
      status, 
      teamMemberId,
      estimatedDuration,
      estimatedPrice
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // Combine date and time if provided
      let fullScheduledDate = null;
      if (scheduledDate) {
        fullScheduledDate = scheduledTime 
          ? `${scheduledDate} ${scheduledTime}:00`
          : `${scheduledDate} 09:00:00`;
      }
      
      const updateFields = [];
      const updateValues = [];
      
      if (fullScheduledDate) {
        updateFields.push('scheduled_date = ?');
        updateValues.push(fullScheduledDate);
      }
      
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }
      
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      
      if (teamMemberId !== undefined) {
        updateFields.push('team_member_id = ?');
        updateValues.push(teamMemberId);
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.query(query, updateValues);
      
      res.json({ message: 'Job updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      await connection.query('DELETE FROM jobs WHERE id = ?', [id]);
      
      res.json({ message: 'Job deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Job status update endpoint
app.patch('/api/jobs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
      
      res.json({ message: 'Job status updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Job assignment endpoint
app.patch('/api/jobs/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { teamMemberId } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE jobs SET team_member_id = ?, updated_at = NOW() WHERE id = ?',
        [teamMemberId || null, id]
      );
      
      res.json({ message: 'Job assignment updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update job assignment error:', error);
    res.status(500).json({ error: 'Failed to update job assignment' });
  }
});

// Customer validation helpers
const validateCustomerEmail = (email) => {
  return !email || validateEmail(email);
};

const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Customers endpoints
app.get('/api/customers', async (req, res) => {
  try {
    const { userId, search, status, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const connection = await pool.getConnection();
    
    try {
      let query = 'SELECT * FROM customers';
      let params = [];
      
      // Add user filter if userId is provided
      if (userId) {
        query += ' WHERE user_id = ?';
        params.push(userId);
      }
      
      // Add search functionality
      if (search) {
        query += userId ? ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)' : ' WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Add status filter
      if (status) {
        query += (userId || search) ? ' AND status = ?' : ' WHERE status = ?';
        params.push(status);
      }
      
      // Add sorting
      const allowedSortFields = ['first_name', 'last_name', 'email', 'created_at', 'status'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [customers] = await connection.query(query, params);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM customers';
      let countParams = [];
      
      // Add user filter if userId is provided
      if (userId) {
        countQuery += ' WHERE user_id = ?';
        countParams.push(userId);
      }
      
      if (search) {
        countQuery += (userId ? ' AND' : ' WHERE') + ' (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (status) {
        countQuery += (userId || search ? ' AND' : ' WHERE') + ' status = ?';
        countParams.push(status);
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.post('/api/customers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, email, phone, address, notes, status = 'active' } = req.body;
    
    // Input validation
    if (!validateName(firstName)) {
      return res.status(400).json({ error: 'First name must be between 2 and 50 characters' });
    }
    
    if (!validateName(lastName)) {
      return res.status(400).json({ error: 'Last name must be between 2 and 50 characters' });
    }
    
    if (email && !validateCustomerEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }
    
    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = email ? email.toLowerCase().trim() : null;
    const sanitizedPhone = phone ? phone.trim() : null;
    const sanitizedAddress = address ? sanitizeInput(address) : null;
    const sanitizedNotes = notes ? sanitizeInput(notes) : null;
    
    const connection = await pool.getConnection();
    
    try {
      // Check if customer with same email already exists for this user
      if (sanitizedEmail) {
        const [existingCustomers] = await connection.query(
          'SELECT id FROM customers WHERE user_id = ? AND email = ?',
          [userId, sanitizedEmail]
        );
        
        if (existingCustomers.length > 0) {
          return res.status(400).json({ error: 'A customer with this email already exists' });
        }
      }
      
      const [result] = await connection.query(
        'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [userId, sanitizedFirstName, sanitizedLastName, sanitizedEmail, sanitizedPhone, sanitizedAddress, sanitizedNotes, status]
      );
      
      // Get the created customer
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE id = ?',
        [result.insertId]
      );
      
      res.status(201).json({ 
        message: 'Customer created successfully',
        customer: customers[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    try {
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (customers.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json(customers[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.put('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, notes, status } = req.body;
    
    // Input validation
    if (!validateName(firstName)) {
      return res.status(400).json({ error: 'First name must be between 2 and 50 characters' });
    }
    
    if (!validateName(lastName)) {
      return res.status(400).json({ error: 'Last name must be between 2 and 50 characters' });
    }
    
    if (email && !validateCustomerEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    if (phone && !validatePhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }
    
    // Sanitize inputs
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedEmail = email ? email.toLowerCase().trim() : null;
    const sanitizedPhone = phone ? phone.trim() : null;
    const sanitizedAddress = address ? sanitizeInput(address) : null;
    const sanitizedNotes = notes ? sanitizeInput(notes) : null;
    
    const connection = await pool.getConnection();
    
    try {
      // Check if customer exists and belongs to user
      const [existingCustomers] = await connection.query(
        'SELECT id FROM customers WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (existingCustomers.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check if email is being changed and if it conflicts with another customer
      if (sanitizedEmail) {
        const [emailConflict] = await connection.query(
          'SELECT id FROM customers WHERE user_id = ? AND email = ? AND id != ?',
          [userId, sanitizedEmail, id]
        );
        
        if (emailConflict.length > 0) {
          return res.status(400).json({ error: 'A customer with this email already exists' });
        }
      }
      
      await connection.query(
        'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, notes = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
        [sanitizedFirstName, sanitizedLastName, sanitizedEmail, sanitizedPhone, sanitizedAddress, sanitizedNotes, status, id, userId]
      );
      
      // Get updated customer
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );
      
      res.json({ 
        message: 'Customer updated successfully',
        customer: customers[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

app.delete('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const connection = await pool.getConnection();
    
    try {
      // Check if customer exists and belongs to user
      const [existingCustomers] = await connection.query(
        'SELECT id FROM customers WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      if (existingCustomers.length === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check if customer has associated jobs or estimates
      const [jobs] = await connection.query(
        'SELECT COUNT(*) as count FROM jobs WHERE customer_id = ?',
        [id]
      );
      
      const [estimates] = await connection.query(
        'SELECT COUNT(*) as count FROM estimates WHERE customer_id = ?',
        [id]
      );
      
      if (jobs[0].count > 0 || estimates[0].count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete customer with associated jobs or estimates. Please delete the associated records first.' 
        });
      }
      
      await connection.query(
        'DELETE FROM customers WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      res.json({ message: 'Customer deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Customer import/export endpoints
app.post('/api/customers/import', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { customers } = req.body;
    
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: 'Please provide a valid array of customers' });
    }
    
    if (customers.length > 1000) {
      return res.status(400).json({ error: 'Cannot import more than 1000 customers at once' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const importedCustomers = [];
      const errors = [];
      
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        
        try {
          // Validate required fields
          if (!customer.firstName || !customer.lastName) {
            errors.push(`Row ${i + 1}: First name and last name are required`);
            continue;
          }
          
          // Validate email if provided
          if (customer.email && !validateCustomerEmail(customer.email)) {
            errors.push(`Row ${i + 1}: Invalid email format`);
            continue;
          }
          
          // Validate phone if provided
          if (customer.phone && !validatePhone(customer.phone)) {
            errors.push(`Row ${i + 1}: Invalid phone format`);
            continue;
          }
          
          // Sanitize inputs
          const sanitizedFirstName = sanitizeInput(customer.firstName);
          const sanitizedLastName = sanitizeInput(customer.lastName);
          const sanitizedEmail = customer.email ? customer.email.toLowerCase().trim() : null;
          const sanitizedPhone = customer.phone ? customer.phone.trim() : null;
          const sanitizedAddress = customer.address ? sanitizeInput(customer.address) : null;
          const sanitizedNotes = customer.notes ? sanitizeInput(customer.notes) : null;
          
          // Check for duplicate email
          if (sanitizedEmail) {
            const [existingCustomers] = await connection.query(
              'SELECT id FROM customers WHERE user_id = ? AND email = ?',
              [userId, sanitizedEmail]
            );
            
            if (existingCustomers.length > 0) {
              errors.push(`Row ${i + 1}: Email already exists`);
              continue;
            }
          }
          
          // Insert customer
          const [result] = await connection.query(
            'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [userId, sanitizedFirstName, sanitizedLastName, sanitizedEmail, sanitizedPhone, sanitizedAddress, sanitizedNotes, customer.status || 'active']
          );
          
          // Get created customer
          const [newCustomers] = await connection.query(
            'SELECT * FROM customers WHERE id = ?',
            [result.insertId]
          );
          
          importedCustomers.push(newCustomers[0]);
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }
      
      res.json({
        message: `Successfully imported ${importedCustomers.length} customers`,
        imported: importedCustomers.length,
        errors: errors.length > 0 ? errors : null,
        customers: importedCustomers
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Import customers error:', error);
    res.status(500).json({ error: 'Failed to import customers' });
  }
});

app.get('/api/customers/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { format = 'json' } = req.query;
    
    const connection = await pool.getConnection();
    
    try {
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      if (format === 'csv') {
        // Generate CSV
        const csvHeader = 'First Name,Last Name,Email,Phone,Address,Notes,Status,Created At\n';
        const csvRows = customers.map(customer => 
          `"${customer.first_name || ''}","${customer.last_name || ''}","${customer.email || ''}","${customer.phone || ''}","${customer.address || ''}","${customer.notes || ''}","${customer.status || ''}","${customer.created_at || ''}"`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
        res.send(csvHeader + csvRows);
      } else {
        // Return JSON
        res.json({
          customers,
          total: customers.length,
          exportedAt: new Date().toISOString()
        });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Export customers error:', error);
    res.status(500).json({ error: 'Failed to export customers' });
  }
});

// Team members endpoints
app.get('/api/team', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [teamMembers] = await connection.query(
        'SELECT * FROM team_members WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      res.json(teamMembers);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.post('/api/team', async (req, res) => {
  try {
    const { userId, firstName, lastName, email, phone, role } = req.body;
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO team_members (user_id, first_name, last_name, email, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userId, firstName, lastName, email, phone, role]
      );
      
      res.status(201).json({ 
        message: 'Team member created successfully',
        teamMemberId: result.insertId 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// Estimates API endpoints
app.get('/api/estimates', async (req, res) => {
  try {
    const { userId, status, customerId, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    console.log('Fetching estimates for user:', userId, 'with filters:', { status, customerId, page, limit, sortBy, sortOrder });
    
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          e.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone
        FROM estimates e
        LEFT JOIN customers c ON e.customer_id = c.id
        WHERE e.user_id = ?
      `;
      let params = [userId];
      
      if (status) {
        query += ' AND e.status = ?';
        params.push(status);
      }
      
      if (customerId) {
        query += ' AND e.customer_id = ?';
        params.push(customerId);
      }
      
      // Handle sorting
      const allowedSortFields = ['created_at', 'total_amount', 'status', 'valid_until'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY e.${sortBy} ${sortOrder.toUpperCase()}`;
      } else {
        query += ' ORDER BY e.created_at DESC';
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      console.log('Executing query:', query);
      console.log('With params:', params);
      
      const [estimates] = await connection.query(query, params);
      
      console.log('Found estimates:', estimates.length);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM estimates e
        WHERE e.user_id = ?
      `;
      let countParams = [userId];
      
      if (status) {
        countQuery += ' AND e.status = ?';
        countParams.push(status);
      }
      
      if (customerId) {
        countQuery += ' AND e.customer_id = ?';
        countParams.push(customerId);
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      
      const response = {
        estimates,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
      console.log('Sending response with', estimates.length, 'estimates');
      res.json(response);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get estimates error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch estimates',
      details: error.message,
      code: error.code
    });
  }
});

app.get('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [estimates] = await connection.query(`
        SELECT 
          e.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          c.address as customer_address
        FROM estimates e
        LEFT JOIN customers c ON e.customer_id = c.id
        WHERE e.id = ?
      `, [id]);
      
      if (estimates.length === 0) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      
      const estimate = estimates[0];
      
      // Parse services JSON and get service details
      if (estimate.services) {
        const servicesData = JSON.parse(estimate.services);
        const serviceIds = servicesData.map(service => service.serviceId);
        
        if (serviceIds.length > 0) {
          const [services] = await connection.query(`
            SELECT id, name, description, price, duration
            FROM services 
            WHERE id IN (${serviceIds.map(() => '?').join(',')})
          `, serviceIds);
          
          // Map service details to the estimate services
          estimate.services = servicesData.map(service => {
            const serviceDetails = services.find(s => s.id === service.serviceId);
            return {
              ...service,
              serviceDetails
            };
          });
        }
      }
      
      res.json(estimate);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({ error: 'Failed to fetch estimate' });
  }
});

app.post('/api/estimates', async (req, res) => {
  try {
    const { 
      userId, 
      customerId, 
      services, 
      totalAmount, 
      validUntil,
      notes 
    } = req.body;
    
    if (!userId || !customerId || !services || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate services structure
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: 'Services must be a non-empty array' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Validate customer exists
      const [customers] = await connection.query(
        'SELECT id FROM customers WHERE id = ? AND user_id = ?',
        [customerId, userId]
      );
      
      if (customers.length === 0) {
        return res.status(400).json({ error: 'Customer not found' });
      }
      
      // Validate services exist
      const serviceIds = services.map(service => service.serviceId);
      const [existingServices] = await connection.query(
        `SELECT id FROM services WHERE id IN (${serviceIds.map(() => '?').join(',')}) AND user_id = ?`,
        [...serviceIds, userId]
      );
      
      if (existingServices.length !== serviceIds.length) {
        return res.status(400).json({ error: 'One or more services not found' });
      }
      
      // Calculate valid until date (default to 30 days from now)
      const validUntilDate = validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [result] = await connection.query(
        `INSERT INTO estimates (
          user_id, customer_id, services, total_amount, 
          valid_until, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          customerId, 
          JSON.stringify(services), 
          totalAmount,
          validUntilDate,
          notes || null
        ]
      );
      
      // Get the created estimate with customer details
      const [estimates] = await connection.query(`
        SELECT 
          e.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone
        FROM estimates e
        LEFT JOIN customers c ON e.customer_id = c.id
        WHERE e.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Estimate created successfully',
        estimate: estimates[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ error: 'Failed to create estimate' });
  }
});

app.put('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customerId, 
      services, 
      totalAmount, 
      status,
      validUntil,
      notes 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const updateFields = [];
      const updateValues = [];
      
      if (customerId) {
        updateFields.push('customer_id = ?');
        updateValues.push(customerId);
      }
      
      if (services) {
        updateFields.push('services = ?');
        updateValues.push(JSON.stringify(services));
      }
      
      if (totalAmount !== undefined) {
        updateFields.push('total_amount = ?');
        updateValues.push(totalAmount);
      }
      
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      
      if (validUntil !== undefined) {
        updateFields.push('valid_until = ?');
        updateValues.push(validUntil);
      }
      
      if (notes !== undefined) {
        updateFields.push('notes = ?');
        updateValues.push(notes);
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `UPDATE estimates SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.query(query, updateValues);
      
      res.json({ message: 'Estimate updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update estimate error:', error);
    res.status(500).json({ error: 'Failed to update estimate' });
  }
});

app.delete('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Check if estimate has been converted to invoice
      const [invoices] = await connection.query(
        'SELECT COUNT(*) as count FROM invoices WHERE estimate_id = ?',
        [id]
      );
      
      if (invoices[0].count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete estimate that has been converted to invoice' 
        });
      }
      
      await connection.query('DELETE FROM estimates WHERE id = ?', [id]);
      
      res.json({ message: 'Estimate deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete estimate error:', error);
    res.status(500).json({ error: 'Failed to delete estimate' });
  }
});

// Send estimate to customer
app.post('/api/estimates/:id/send', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get estimate details with customer and user information
      const [estimates] = await connection.query(`
        SELECT 
          e.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.business_name
        FROM estimates e
        LEFT JOIN customers c ON e.customer_id = c.id
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.id = ?
      `, [id]);
      
      if (estimates.length === 0) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      
      const estimate = estimates[0];
      
      // Update estimate status to 'sent'
      await connection.query(
        'UPDATE estimates SET status = "sent", updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      let emailSent = false;
      let emailError = null;
      
      // Send email to customer if email is available and email is configured
      if (estimate.customer_email && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        try {
          const services = JSON.parse(estimate.services || '[]');
          const servicesList = services.map(service => 
            `• ${service.name} - $${service.price} x ${service.quantity}`
          ).join('\n');
          
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h1 style="color: #333; margin: 0;">Your Estimate is Ready!</h1>
              </div>
              
              <div style="padding: 20px;">
                <p style="color: #333; font-size: 16px;">Hi ${estimate.customer_first_name},</p>
                
                <p style="color: #666; line-height: 1.6;">
                  Great news! We've prepared your estimate and it's ready for your review.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Estimate Details:</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Estimate ID:</strong> #${estimate.id}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Date:</strong> ${new Date(estimate.created_at).toLocaleDateString()}</p>
                  <p style="color: #666; margin: 5px 0;"><strong>Valid Until:</strong> ${new Date(estimate.valid_until).toLocaleDateString()}</p>
                </div>
                
                <div style="background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Services:</h3>
                  <div style="color: #666; line-height: 1.6;">
                    ${servicesList}
                  </div>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                  <p style="color: #333; font-size: 18px; font-weight: bold; margin: 0;">
                    <strong>Total Amount: $${estimate.total_amount}</strong>
                  </p>
                </div>
                
                ${estimate.notes ? `
                <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #856404; margin-top: 0;">Notes:</h3>
                  <p style="color: #856404; margin: 0;">${estimate.notes}</p>
                </div>
                ` : ''}
                
                <p style="color: #666; line-height: 1.6;">
                  This estimate is valid for 30 days. If you have any questions or need modifications, 
                  please don't hesitate to contact us.
                </p>
                
                <p style="color: #666; line-height: 1.6;">
                  Thank you for considering ${estimate.business_name || 'our services'}!
                </p>
                
                <p style="color: #666; line-height: 1.6;">
                  Best regards,<br>
                  ${estimate.user_first_name} ${estimate.user_last_name}<br>
                  ${estimate.business_name || 'ZenBooker'}
                </p>
              </div>
            </div>
          `;
          
          await sendEmail({
            to: estimate.customer_email,
            subject: `Your Estimate #${estimate.id} is Ready - ${estimate.business_name || 'ZenBooker'}`,
            html: emailHtml,
            text: `
              Your Estimate is Ready!
              
              Hi ${estimate.customer_first_name},
              
              Great news! We've prepared your estimate and it's ready for your review.
              
              Estimate Details:
              - Estimate ID: #${estimate.id}
              - Date: ${new Date(estimate.created_at).toLocaleDateString()}
              - Valid Until: ${new Date(estimate.valid_until).toLocaleDateString()}
              
              Services:
              ${servicesList}
              
              Total Amount: $${estimate.total_amount}
              
              ${estimate.notes ? `Notes: ${estimate.notes}` : ''}
              
              This estimate is valid for 30 days. If you have any questions or need modifications, 
              please don't hesitate to contact us.
              
              Thank you for considering ${estimate.business_name || 'our services'}!
              
              Best regards,
              ${estimate.user_first_name} ${estimate.user_last_name}
              ${estimate.business_name || 'ZenBooker'}
            `
          });
          
          emailSent = true;
          console.log(`✅ Estimate email sent to ${estimate.customer_email}`);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          emailError = emailError.message;
        }
      } else if (estimate.customer_email) {
        console.log('⚠️ Email not configured - estimate status updated but no email sent');
      } else {
        console.log('⚠️ No customer email available - estimate status updated but no email sent');
      }
      
      res.json({ 
        message: 'Estimate sent successfully',
        emailSent,
        customerEmail: estimate.customer_email,
        emailError: emailError
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Send estimate error:', error);
    res.status(500).json({ error: 'Failed to send estimate' });
  }
});

// Convert estimate to invoice
app.post('/api/estimates/:id/convert-to-invoice', async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;
    const connection = await pool.getConnection();
    
    try {
      // Get estimate details
      const [estimates] = await connection.query(`
        SELECT * FROM estimates WHERE id = ?
      `, [id]);
      
      if (estimates.length === 0) {
        return res.status(404).json({ error: 'Estimate not found' });
      }
      
      const estimate = estimates[0];
      
      // Calculate due date (default to 15 days from now)
      const calculatedDueDate = dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Create invoice
      const [result] = await connection.query(
        `INSERT INTO invoices (
          user_id, customer_id, estimate_id, amount, 
          total_amount, due_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          estimate.user_id,
          estimate.customer_id,
          estimate.id,
          estimate.total_amount,
          estimate.total_amount, // No tax for now
          calculatedDueDate
        ]
      );
      
      // Update estimate status to 'accepted'
      await connection.query(
        'UPDATE estimates SET status = "accepted", updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      res.status(201).json({
        message: 'Estimate converted to invoice successfully',
        invoiceId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Convert estimate to invoice error:', error);
    res.status(500).json({ error: 'Failed to convert estimate to invoice' });
  }
});

// Online Booking API endpoints
app.get('/api/public/services', async (req, res) => {
  try {
    const { userId = 1 } = req.query; // Default to user ID 1 for public booking
    const connection = await pool.getConnection();
    
    try {
      const [services] = await connection.query(`
        SELECT id, name, description, price, duration, category
        FROM services 
        WHERE user_id = ?
        ORDER BY name
      `, [userId]);
      
      res.json(services);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/public/availability', async (req, res) => {
  try {
    const { userId = 1, date } = req.query;
    const connection = await pool.getConnection();
    
    try {
      // Get business hours and availability settings
      const [availabilitySettings] = await connection.query(`
        SELECT business_hours, timeslot_templates
        FROM user_availability 
        WHERE user_id = ?
      `, [userId]);
      
      // Get existing bookings for the date
      const [existingBookings] = await connection.query(`
        SELECT scheduled_date
        FROM jobs 
        WHERE user_id = ? AND DATE(scheduled_date) = ?
      `, [userId, date]);
      
      // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
      const availableSlots = [];
      const startHour = 9;
      const endHour = 17;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotDateTime = `${date} ${time}:00`;
          
          // Check if slot is available (not booked)
          const isBooked = existingBookings.some(booking => 
            booking.scheduled_date === slotDateTime
          );
          
          if (!isBooked) {
            availableSlots.push(time);
          }
        }
      }
      
      res.json({ availableSlots });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.post('/api/public/bookings', async (req, res) => {
  try {
    const { 
      userId = 1,
      customerData,
      services,
      scheduledDate,
      scheduledTime,
      totalAmount,
      notes
    } = req.body;
    
    if (!customerData || !services || !scheduledDate || !scheduledTime || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First, create or find customer
      let customerId;
      const [existingCustomers] = await connection.query(`
        SELECT id FROM customers 
        WHERE user_id = ? AND email = ?
      `, [userId, customerData.email]);
      
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer information
        await connection.query(`
          UPDATE customers 
          SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
          WHERE id = ?
        `, [customerData.firstName, customerData.lastName, customerData.phone, customerData.address, customerId]);
      } else {
        // Create new customer
        const [customerResult] = await connection.query(`
          INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [userId, customerData.firstName, customerData.lastName, customerData.email, customerData.phone, customerData.address]);
        customerId = customerResult.insertId;
      }
      
      // Create booking (job) for each service
      const bookingIds = [];
      for (const service of services) {
        const fullScheduledDate = `${scheduledDate} ${scheduledTime}:00`;
        
        const [bookingResult] = await connection.query(`
          INSERT INTO jobs (
            user_id, customer_id, service_id, scheduled_date, notes, status, created_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', NOW())
        `, [userId, customerId, service.id, fullScheduledDate, notes]);
        
        bookingIds.push(bookingResult.insertId);
      }
      
      // Create invoice for the booking
      const [invoiceResult] = await connection.query(`
        INSERT INTO invoices (
          user_id, customer_id, amount, total_amount, status, due_date, created_at
        ) VALUES (?, ?, ?, ?, 'draft', DATE_ADD(NOW(), INTERVAL 15 DAY), NOW())
      `, [userId, customerId, totalAmount, totalAmount]);
      
      res.status(201).json({
        message: 'Booking created successfully',
        bookingIds,
        invoiceId: invoiceResult.insertId,
        customerId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/public/business-info', async (req, res) => {
  try {
    const { userId = 1 } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query(`
        SELECT business_name, email, phone
        FROM users 
        WHERE id = ?
      `, [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'Business not found' });
      }
      
      res.json(users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get business info error:', error);
    res.status(500).json({ error: 'Failed to fetch business information' });
  }
});

// User profile endpoints
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      // First try with the new columns
      try {
        const [users] = await connection.query(
          'SELECT id, email, first_name, last_name, business_name, phone, email_notifications, sms_notifications, profile_picture FROM users WHERE id = ?',
          [userId]
        );
        
        if (users.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        const user = users[0];
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          businessName: user.business_name,
          phone: user.phone || '',
          emailNotifications: user.email_notifications === 1,
          smsNotifications: user.sms_notifications === 1,
          profilePicture: user.profile_picture
        });
      } catch (columnError) {
        // If new columns don't exist, fall back to basic columns
        if (columnError.code === 'ER_BAD_FIELD_ERROR') {
          const [users] = await connection.query(
            'SELECT id, email, first_name, last_name, business_name FROM users WHERE id = ?',
            [userId]
          );
          
          if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
          
          const user = users[0];
          res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            businessName: user.business_name,
            phone: '',
            emailNotifications: true,
            smsNotifications: false,
            profilePicture: null
          });
        } else {
          throw columnError;
        }
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone, emailNotifications, smsNotifications } = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, email_notifications = ?, sms_notifications = ?, updated_at = NOW() WHERE id = ?',
        [firstName, lastName, phone, emailNotifications ? 1 : 0, smsNotifications ? 1 : 0, userId]
      );
      
      res.json({ message: 'Profile updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Input validation
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First verify current password
      const [users] = await connection.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password using bcrypt
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password
      await connection.query(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, userId]
      );
      
      res.json({ message: 'Password updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

app.put('/api/user/email', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newEmail, password } = req.body;
    
    // Input validation
    if (!validateEmail(newEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    
    if (!password || password.length < 1) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    // Sanitize email
    const sanitizedNewEmail = newEmail.toLowerCase().trim();
    
    const connection = await pool.getConnection();
    
    try {
      // Verify password first
      const [users] = await connection.query(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, users[0].password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Password is incorrect' });
      }
      
      // Check if new email already exists
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [sanitizedNewEmail, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Update email
      await connection.query(
        'UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?',
        [sanitizedNewEmail, userId]
      );
      
      res.json({ message: 'Email updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

// Profile picture upload endpoint
app.post('/api/user/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Get the file URL
      const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      
      // Update user's profile picture
      await connection.query(
        'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?',
        [fileUrl, userId]
      );
      
      res.json({ 
        message: 'Profile picture updated successfully',
        profilePicture: fileUrl
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Billing endpoints
app.get('/api/user/billing', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [billingInfo] = await connection.query(
        'SELECT subscription_plan, trial_end_date, is_trial, monthly_price, card_last4 FROM user_billing WHERE user_id = ?',
        [userId]
      );
      
      if (billingInfo.length === 0) {
        // Return default trial info
        return res.json({
          currentPlan: 'Standard',
          isTrial: true,
          trialDaysLeft: 14,
          trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
          monthlyPrice: 29,
          cardNumber: ''
        });
      }
      
      const billing = billingInfo[0];
      const trialEnd = new Date(billing.trial_end_date);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
      
      res.json({
        currentPlan: billing.subscription_plan || 'Standard',
        isTrial: billing.is_trial === 1,
        trialDaysLeft: daysLeft,
        trialEndDate: trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        monthlyPrice: billing.monthly_price || 29,
        cardNumber: billing.card_last4 ? `****${billing.card_last4}` : ''
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
});

app.post('/api/user/billing/subscription', async (req, res) => {
  try {
    const { userId, plan, cardNumber, expiryMonth, expiryYear, cvc } = req.body;
    const connection = await pool.getConnection();
    
    try {
      // In a real application, you would integrate with a payment processor here
      // For now, we'll just store the subscription info
      
      const cardLast4 = cardNumber.slice(-4);
      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      
      await connection.query(
        'INSERT INTO user_billing (user_id, subscription_plan, monthly_price, card_last4, trial_end_date, is_trial, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE subscription_plan = ?, monthly_price = ?, card_last4 = ?, trial_end_date = ?, is_trial = 0, updated_at = NOW()',
        [userId, plan, 29, cardLast4, trialEndDate, plan, 29, cardLast4, trialEndDate]
      );
      
      res.json({ message: 'Subscription created successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Payment settings endpoints
app.get('/api/user/payment-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      const [settings] = await connection.query(
        'SELECT * FROM user_payment_settings WHERE user_id = ?',
        [userId]
      );
      
      if (settings.length === 0) {
        // Return default settings
        return res.json({
          onlineBookingTips: false,
          invoicePaymentTips: false,
          showServicePrices: true,
          showServiceDescriptions: false,
          paymentDueDays: 15,
          paymentDueUnit: 'days',
          defaultMemo: '',
          invoiceFooter: '',
          paymentProcessor: null,
          paymentProcessorConnected: false
        });
      }
      
      const setting = settings[0];
      res.json({
        onlineBookingTips: setting.online_booking_tips === 1,
        invoicePaymentTips: setting.invoice_payment_tips === 1,
        showServicePrices: setting.show_service_prices === 1,
        showServiceDescriptions: setting.show_service_descriptions === 1,
        paymentDueDays: setting.payment_due_days,
        paymentDueUnit: setting.payment_due_unit,
        defaultMemo: setting.default_memo || '',
        invoiceFooter: setting.invoice_footer || '',
        paymentProcessor: setting.payment_processor,
        paymentProcessorConnected: setting.payment_processor_connected === 1
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get payment settings error:', error);
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
});

app.put('/api/user/payment-settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      onlineBookingTips,
      invoicePaymentTips,
      showServicePrices,
      showServiceDescriptions,
      paymentDueDays,
      paymentDueUnit,
      defaultMemo,
      invoiceFooter,
      paymentProcessor,
      paymentProcessorConnected
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `INSERT INTO user_payment_settings (
          user_id, online_booking_tips, invoice_payment_tips, show_service_prices, 
          show_service_descriptions, payment_due_days, payment_due_unit, default_memo, 
          invoice_footer, payment_processor, payment_processor_connected, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          online_booking_tips = VALUES(online_booking_tips),
          invoice_payment_tips = VALUES(invoice_payment_tips),
          show_service_prices = VALUES(show_service_prices),
          show_service_descriptions = VALUES(show_service_descriptions),
          payment_due_days = VALUES(payment_due_days),
          payment_due_unit = VALUES(payment_due_unit),
          default_memo = VALUES(default_memo),
          invoice_footer = VALUES(invoice_footer),
          payment_processor = VALUES(payment_processor),
          payment_processor_connected = VALUES(payment_processor_connected),
          updated_at = NOW()`,
        [
          userId,
          onlineBookingTips ? 1 : 0,
          invoicePaymentTips ? 1 : 0,
          showServicePrices ? 1 : 0,
          showServiceDescriptions ? 1 : 0,
          paymentDueDays,
          paymentDueUnit,
          defaultMemo,
          invoiceFooter,
          paymentProcessor,
          paymentProcessorConnected ? 1 : 0
        ]
      );
      
      res.json({ message: 'Payment settings updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ error: 'Failed to update payment settings' });
  }
});

// Custom payment methods endpoints
app.get('/api/user/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      const [methods] = await connection.query(
        'SELECT id, name, description, is_active FROM custom_payment_methods WHERE user_id = ? AND is_active = 1 ORDER BY created_at ASC',
        [userId]
      );
      
      res.json(methods);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

app.post('/api/user/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Payment method name is required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'INSERT INTO custom_payment_methods (user_id, name, description) VALUES (?, ?, ?)',
        [userId, name.trim(), description || null]
      );
      
      const [newMethod] = await connection.query(
        'SELECT id, name, description FROM custom_payment_methods WHERE id = ?',
        [result.insertId]
      );
      
      res.status(201).json(newMethod[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create payment method error:', error);
    res.status(500).json({ error: 'Failed to create payment method' });
  }
});

app.put('/api/user/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const methodId = req.params.id;
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Payment method name is required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'UPDATE custom_payment_methods SET name = ?, description = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
        [name.trim(), description || null, methodId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      res.json({ message: 'Payment method updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

app.delete('/api/user/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const methodId = req.params.id;
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        'UPDATE custom_payment_methods SET is_active = 0, updated_at = NOW() WHERE id = ? AND user_id = ?',
        [methodId, userId]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Payment method not found' });
      }
      
      res.json({ message: 'Payment method deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

// Payment processor setup endpoint
app.post('/api/user/payment-processor/setup', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { processor } = req.body;
    
    if (!processor || !['stripe', 'paypal', 'square'].includes(processor)) {
      return res.status(400).json({ error: 'Invalid payment processor' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // In a real application, you would integrate with the payment processor here
      // For now, we'll just mark it as connected
      await connection.query(
        `INSERT INTO user_payment_settings (user_id, payment_processor, payment_processor_connected, updated_at) 
         VALUES (?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
           payment_processor = VALUES(payment_processor),
           payment_processor_connected = VALUES(payment_processor_connected),
           updated_at = NOW()`,
        [userId, processor]
      );
      
      res.json({ 
        message: 'Payment processor connected successfully',
        processor: processor,
        connected: true
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Setup payment processor error:', error);
    res.status(500).json({ error: 'Failed to setup payment processor' });
  }
});

// Availability endpoints
app.get('/api/user/availability', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [availabilityInfo] = await connection.query(
        'SELECT business_hours, timeslot_templates FROM user_availability WHERE user_id = ?',
        [userId]
      );
      
      if (availabilityInfo.length === 0) {
        return res.json({
          businessHours: {
            monday: { start: '09:00', end: '17:00', enabled: true },
            tuesday: { start: '09:00', end: '17:00', enabled: true },
            wednesday: { start: '09:00', end: '17:00', enabled: true },
            thursday: { start: '09:00', end: '17:00', enabled: true },
            friday: { start: '09:00', end: '17:00', enabled: true },
            saturday: { start: '09:00', end: '17:00', enabled: false },
            sunday: { start: '09:00', end: '17:00', enabled: false }
          },
          timeslotTemplates: []
        });
      }
      
      const availability = availabilityInfo[0];
      res.json({
        businessHours: JSON.parse(availability.business_hours || '{}'),
        timeslotTemplates: JSON.parse(availability.timeslot_templates || '[]')
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability information' });
  }
});

app.put('/api/user/availability', async (req, res) => {
  try {
    const { userId, businessHours, timeslotTemplates } = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'INSERT INTO user_availability (user_id, business_hours, timeslot_templates, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE business_hours = ?, timeslot_templates = ?, updated_at = NOW()',
        [userId, JSON.stringify(businessHours), JSON.stringify(timeslotTemplates), JSON.stringify(businessHours), JSON.stringify(timeslotTemplates)]
      );
      
      res.json({ message: 'Availability updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Territory Management API endpoints
app.get('/api/territories', async (req, res) => {
  try {
    const { userId, status, search, page = 1, limit = 20, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          t.*,
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN COALESCE(i.total_amount, 0) ELSE 0 END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN i.total_amount ELSE NULL END) as avg_job_value
        FROM territories t
        LEFT JOIN jobs j ON t.id = j.territory_id
        LEFT JOIN invoices i ON j.id = i.job_id
        WHERE t.user_id = ?
      `;
      let params = [userId];
      
      if (status) {
        query += ' AND t.status = ?';
        params.push(status);
      }
      
      if (search) {
        query += ' AND (t.name LIKE ? OR t.location LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ` GROUP BY t.id ORDER BY t.${sortBy} ${sortOrder}`;
      
      const [territories] = await connection.query(query, params);
      
      // Get territory statistics
      const territoryStats = territories.map(territory => ({
        ...territory,
        zip_codes: JSON.parse(territory.zip_codes || '[]'),
        business_hours: JSON.parse(territory.business_hours || '{}'),
        team_members: JSON.parse(territory.team_members || '[]'),
        services: JSON.parse(territory.services || '[]')
      }));
      
      res.json({
        territories: territoryStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: territoryStats.length
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get territories error:', error);
    res.status(500).json({ error: 'Failed to fetch territories' });
  }
});

app.get('/api/territories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [territories] = await connection.query(`
        SELECT 
          t.*,
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN COALESCE(i.total_amount, 0) ELSE 0 END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN i.total_amount ELSE NULL END) as avg_job_value
        FROM territories t
        LEFT JOIN jobs j ON t.id = j.territory_id
        LEFT JOIN invoices i ON j.id = i.job_id
        WHERE t.id = ?
        GROUP BY t.id
      `, [id]);
      
      if (territories.length === 0) {
        return res.status(404).json({ error: 'Territory not found' });
      }
      
      const territory = territories[0];
      territory.zip_codes = JSON.parse(territory.zip_codes || '[]');
      territory.business_hours = JSON.parse(territory.business_hours || '{}');
      territory.team_members = JSON.parse(territory.team_members || '[]');
      territory.services = JSON.parse(territory.services || '[]');
      
      // Get territory pricing
      const [pricing] = await connection.query(`
        SELECT tp.*, s.name as service_name, s.description as service_description
        FROM territory_pricing tp
        JOIN services s ON tp.service_id = s.id
        WHERE tp.territory_id = ?
      `, [id]);
      
      territory.pricing = pricing;
      
      res.json(territory);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get territory error:', error);
    res.status(500).json({ error: 'Failed to fetch territory' });
  }
});

app.post('/api/territories', async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      description, 
      location, 
      zipCodes, 
      radiusMiles, 
      timezone, 
      businessHours, 
      teamMembers, 
      services, 
      pricingMultiplier 
    } = req.body;
    
    if (!userId || !name || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(`
        INSERT INTO territories (
          user_id, name, description, location, zip_codes, radius_miles, 
          timezone, business_hours, team_members, services, pricing_multiplier, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId, name, description, location, 
        JSON.stringify(zipCodes || []), 
        radiusMiles || 25.00, 
        timezone || 'America/New_York',
        JSON.stringify(businessHours || {}),
        JSON.stringify(teamMembers || []),
        JSON.stringify(services || []),
        pricingMultiplier || 1.00
      ]);
      
      res.status(201).json({
        message: 'Territory created successfully',
        territoryId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create territory error:', error);
    res.status(500).json({ error: 'Failed to create territory' });
  }
});

app.put('/api/territories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      location, 
      zipCodes, 
      radiusMiles, 
      timezone, 
      status,
      businessHours, 
      teamMembers, 
      services, 
      pricingMultiplier 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(`
        UPDATE territories 
        SET name = ?, description = ?, location = ?, zip_codes = ?, 
            radius_miles = ?, timezone = ?, status = ?, business_hours = ?, 
            team_members = ?, services = ?, pricing_multiplier = ?, updated_at = NOW()
        WHERE id = ?
      `, [
        name, description, location, JSON.stringify(zipCodes || []),
        radiusMiles || 25.00, timezone || 'America/New_York', status,
        JSON.stringify(businessHours || {}), JSON.stringify(teamMembers || []),
        JSON.stringify(services || []), pricingMultiplier || 1.00, id
      ]);
      
      res.json({ message: 'Territory updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update territory error:', error);
    res.status(500).json({ error: 'Failed to update territory' });
  }
});

app.delete('/api/territories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      await connection.query('DELETE FROM territories WHERE id = ?', [id]);
      res.json({ message: 'Territory deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete territory error:', error);
    res.status(500).json({ error: 'Failed to delete territory' });
  }
});

// Territory pricing endpoints
app.get('/api/territories/:id/pricing', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [pricing] = await connection.query(`
        SELECT tp.*, s.name as service_name, s.description as service_description
        FROM territory_pricing tp
        JOIN services s ON tp.service_id = s.id
        WHERE tp.territory_id = ?
      `, [id]);
      
      res.json(pricing);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get territory pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch territory pricing' });
  }
});

app.post('/api/territories/:id/pricing', async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceId, basePrice, priceMultiplier, minimumPrice, maximumPrice } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(`
        INSERT INTO territory_pricing (
          territory_id, service_id, base_price, price_multiplier, 
          minimum_price, maximum_price, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          base_price = VALUES(base_price),
          price_multiplier = VALUES(price_multiplier),
          minimum_price = VALUES(minimum_price),
          maximum_price = VALUES(maximum_price),
          updated_at = NOW()
      `, [id, serviceId, basePrice, priceMultiplier || 1.00, minimumPrice, maximumPrice]);
      
      res.json({ message: 'Territory pricing updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update territory pricing error:', error);
    res.status(500).json({ error: 'Failed to update territory pricing' });
  }
});

// Invoices endpoints
app.get('/api/invoices', async (req, res) => {
  try {
    const { userId, search = '', status = '', page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const connection = await pool.getConnection();
    
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      let whereClause = 'WHERE i.user_id = ?';
      let params = [userId];
      
      if (search) {
        whereClause += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR i.invoice_number LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      if (status) {
        whereClause += ' AND i.status = ?';
        params.push(status);
      }
      
      // Get invoices with customer info
      const [invoices] = await connection.query(`
        SELECT 
          i.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          s.name as service_name,
          j.scheduled_date,
          j.status as job_status
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN jobs j ON i.job_id = j.id
        LEFT JOIN services s ON j.service_id = s.id
        ${whereClause}
        ORDER BY i.${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);
      
      // Get total count
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as total
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ${whereClause}
      `, params);
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / parseInt(limit));
      
      res.json({
        invoices,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          items_per_page: parseInt(limit)
        }
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const connection = await pool.getConnection();
    
    try {
      const [invoices] = await connection.query(`
        SELECT 
          i.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email,
          c.phone as customer_phone,
          s.name as service_name,
          j.scheduled_date,
          j.status as job_status
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        LEFT JOIN jobs j ON i.job_id = j.id
        LEFT JOIN services s ON j.service_id = s.id
        WHERE i.id = ? AND i.user_id = ?
      `, [id, userId]);
      
      if (invoices.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json(invoices[0]);
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { 
      userId, customerId, jobId, estimateId, invoiceNumber, 
      subtotal, taxAmount, discountAmount, totalAmount, 
      status = 'pending', dueDate, notes 
    } = req.body;
    
    if (!userId || !customerId || !totalAmount) {
      return res.status(400).json({ error: 'userId, customerId, and totalAmount are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(`
        INSERT INTO invoices (
          user_id, customer_id, job_id, estimate_id, invoice_number,
          subtotal, tax_amount, discount_amount, total_amount,
          status, due_date, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId, customerId, jobId || null, estimateId || null, invoiceNumber,
        subtotal || 0, taxAmount || 0, discountAmount || 0, totalAmount,
        status, dueDate || null, notes || null
      ]);
      
      const invoiceId = result.insertId;
      
      // Get the created invoice
      const [invoices] = await connection.query(`
        SELECT 
          i.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
      `, [invoiceId]);
      
      res.status(201).json(invoices[0]);
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      userId, status, subtotal, taxAmount, discountAmount, 
      totalAmount, dueDate, notes 
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(`
        UPDATE invoices SET
          status = ?,
          subtotal = ?,
          tax_amount = ?,
          discount_amount = ?,
          total_amount = ?,
          due_date = ?,
          notes = ?,
          updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `, [
        status, subtotal || 0, taxAmount || 0, discountAmount || 0,
        totalAmount, dueDate || null, notes || null, id, userId
      ]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      // Get the updated invoice
      const [invoices] = await connection.query(`
        SELECT 
          i.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          c.email as customer_email
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = ?
      `, [id]);
      
      res.json(invoices[0]);
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(`
        DELETE FROM invoices WHERE id = ? AND user_id = ?
      `, [id, userId]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      
      res.json({ message: 'Invoice deleted successfully' });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Analytics endpoints
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [userId];
      
      if (startDate && endDate) {
        dateFilter = 'AND j.scheduled_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      // Get job statistics
      const [jobStats] = await connection.query(`
        SELECT 
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'pending' THEN j.id END) as pending_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'cancelled' THEN j.id END) as cancelled_jobs,
          AVG(CASE WHEN j.status = 'completed' THEN s.duration ELSE NULL END) as avg_job_duration
        FROM jobs j
        LEFT JOIN services s ON j.service_id = s.id
        WHERE j.user_id = ? ${dateFilter}
      `, params);
      
      // Get revenue statistics
      const [revenueStats] = await connection.query(`
        SELECT 
          SUM(i.total_amount) as total_revenue,
          AVG(i.total_amount) as avg_job_value,
          COUNT(DISTINCT i.id) as total_invoices
        FROM invoices i
        WHERE i.user_id = ? ${dateFilter.replace('j.scheduled_date', 'i.created_at')}
      `, params);
      
      // Get customer statistics
      const [customerStats] = await connection.query(`
        SELECT 
          COUNT(DISTINCT c.id) as total_customers,
          COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_customers,
          COUNT(DISTINCT CASE WHEN c.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN c.id END) as new_customers
        FROM customers c
        WHERE c.user_id = ?
      `, [userId]);
      
      const overview = {
        ...jobStats[0],
        ...revenueStats[0],
        ...customerStats[0],
        completion_rate: jobStats[0].total_jobs > 0 ? 
          (jobStats[0].completed_jobs / jobStats[0].total_jobs * 100).toFixed(1) : 0
      };
      
      res.json(overview);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

app.get('/api/analytics/revenue', async (req, res) => {
  try {
    const { userId, startDate, endDate, groupBy = 'day' } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [userId];
      
      if (startDate && endDate) {
        dateFilter = 'AND i.created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      let groupByClause = 'DATE(i.created_at)';
      if (groupBy === 'week') {
        groupByClause = 'YEARWEEK(i.created_at)';
      } else if (groupBy === 'month') {
        groupByClause = 'DATE_FORMAT(i.created_at, "%Y-%m")';
      }
      
      const [revenueData] = await connection.query(`
        SELECT 
          ${groupByClause} as date,
          SUM(i.total_amount) as revenue,
          COUNT(DISTINCT i.id) as invoice_count
        FROM invoices i
        WHERE i.user_id = ? ${dateFilter}
        GROUP BY ${groupByClause}
        ORDER BY date ASC
      `, params);
      
      res.json(revenueData);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

app.get('/api/analytics/team-performance', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [userId];
      
      if (startDate && endDate) {
        dateFilter = 'AND j.scheduled_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const [teamPerformance] = await connection.query(`
        SELECT 
          tm.id,
          tm.first_name,
          tm.last_name,
          tm.role,
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          AVG(CASE WHEN j.status = 'completed' THEN s.price ELSE NULL END) as avg_job_value,
          SUM(CASE WHEN j.status = 'completed' THEN s.price ELSE 0 END) as total_revenue
        FROM team_members tm
        LEFT JOIN jobs j ON tm.id = j.team_member_id AND j.user_id = ? ${dateFilter}
        LEFT JOIN services s ON j.service_id = s.id
        WHERE tm.user_id = ?
        GROUP BY tm.id
        ORDER BY total_jobs DESC
      `, [...params, userId]);
      
      const performanceWithRates = teamPerformance.map(member => ({
        ...member,
        completion_rate: member.total_jobs > 0 ? 
          (member.completed_jobs / member.total_jobs * 100).toFixed(1) : 0
      }));
      
      res.json(performanceWithRates);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team performance error:', error);
    res.status(500).json({ error: 'Failed to fetch team performance' });
  }
});

app.get('/api/analytics/customer-insights', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [userId];
      
      if (startDate && endDate) {
        dateFilter = 'AND j.scheduled_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      // Customer lifetime value
      const [customerLTV] = await connection.query(`
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          c.email,
          COUNT(DISTINCT j.id) as total_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN s.price ELSE 0 END) as lifetime_value,
          AVG(CASE WHEN j.status = 'completed' THEN s.price ELSE NULL END) as avg_job_value,
          MAX(j.scheduled_date) as last_job_date
        FROM customers c
        LEFT JOIN jobs j ON c.id = j.customer_id AND j.user_id = ? ${dateFilter}
        LEFT JOIN services s ON j.service_id = s.id
        WHERE c.user_id = ?
        GROUP BY c.id
        ORDER BY lifetime_value DESC
        LIMIT 10
      `, [...params, userId]);
      
      // Customer acquisition
      const [customerAcquisition] = await connection.query(`
        SELECT 
          DATE_FORMAT(c.created_at, '%Y-%m') as month,
          COUNT(DISTINCT c.id) as new_customers
        FROM customers c
        WHERE c.user_id = ? AND c.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(c.created_at, '%Y-%m')
        ORDER BY month DESC
      `, [userId]);
      
      res.json({
        topCustomers: customerLTV,
        customerAcquisition
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get customer insights error:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
});

app.get('/api/analytics/service-performance', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [userId];
      
      if (startDate && endDate) {
        dateFilter = 'AND j.scheduled_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const [servicePerformance] = await connection.query(`
        SELECT 
          s.id,
          s.name,
          s.price,
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN s.price ELSE 0 END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN s.price ELSE NULL END) as avg_job_value
        FROM services s
        LEFT JOIN jobs j ON s.id = j.service_id AND j.user_id = ? ${dateFilter}
        WHERE s.user_id = ?
        GROUP BY s.id
        ORDER BY total_jobs DESC
      `, [...params, userId]);
      
      res.json(servicePerformance);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get service performance error:', error);
    res.status(500).json({ error: 'Failed to fetch service performance' });
  }
});

// Territory analytics endpoints
app.get('/api/territories/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let dateFilter = '';
      let params = [id];
      
      if (startDate && endDate) {
        dateFilter = 'AND j.scheduled_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }
      
      const [analytics] = await connection.query(`
        SELECT 
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END) as completed_jobs,
          COUNT(DISTINCT CASE WHEN j.status = 'cancelled' THEN j.id END) as cancelled_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN COALESCE(i.total_amount, 0) ELSE 0 END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN i.total_amount ELSE NULL END) as avg_job_value,
          COUNT(DISTINCT j.customer_id) as unique_customers
        FROM jobs j
        LEFT JOIN invoices i ON j.id = i.job_id
        WHERE j.territory_id = ? ${dateFilter}
      `, params);
      
      // Get monthly trends
      const [monthlyTrends] = await connection.query(`
        SELECT 
          DATE_FORMAT(j.scheduled_date, '%Y-%m') as month,
          COUNT(DISTINCT j.id) as job_count,
          SUM(CASE WHEN j.status = 'completed' THEN COALESCE(i.total_amount, 0) ELSE 0 END) as revenue
        FROM jobs j
        LEFT JOIN invoices i ON j.id = i.job_id
        WHERE j.territory_id = ? ${dateFilter}
        GROUP BY DATE_FORMAT(j.scheduled_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `, params);
      
      res.json({
        overview: analytics[0],
        monthlyTrends
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get territory analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch territory analytics' });
  }
});

// Service areas endpoints
app.get('/api/user/service-areas', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [serviceAreasInfo] = await connection.query(
        'SELECT enforce_service_area, territories FROM user_service_areas WHERE user_id = ?',
        [userId]
      );
      
      if (serviceAreasInfo.length === 0) {
        return res.json({
          enforceServiceArea: true,
          territories: []
        });
      }
      
      const serviceAreas = serviceAreasInfo[0];
      res.json({
        enforceServiceArea: serviceAreas.enforce_service_area === 1,
        territories: JSON.parse(serviceAreas.territories || '[]')
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get service areas error:', error);
    res.status(500).json({ error: 'Failed to fetch service areas information' });
  }
});

app.put('/api/user/service-areas', async (req, res) => {
  try {
    const { userId, enforceServiceArea, territories } = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'INSERT INTO user_service_areas (user_id, enforce_service_area, territories, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE enforce_service_area = ?, territories = ?, updated_at = NOW()',
        [userId, enforceServiceArea ? 1 : 0, JSON.stringify(territories), enforceServiceArea ? 1 : 0, JSON.stringify(territories)]
      );
      
      res.json({ message: 'Service areas updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update service areas error:', error);
    res.status(500).json({ error: 'Failed to update service areas' });
  }
});

// Service templates endpoints
app.get('/api/service-templates', async (req, res) => {
  try {
    const templates = [
      { 
        id: "junk-removal", 
        name: "Junk Removal", 
        icon: "🗑️",
        description: "Remove unwanted items from homes, offices, or construction sites",
        price: "150",
        duration: { hours: 2, minutes: 0 },
        category: "Removal",
        modifiers: []
      },
      { 
        id: "home-cleaning", 
        name: "Home Cleaning", 
        icon: "🧹",
        description: "Comprehensive home cleaning services for residential properties",
        price: "80",
        duration: { hours: 3, minutes: 0 },
        category: "Cleaning",
        modifiers: []
      },
      { 
        id: "tv-mounting", 
        name: "TV Mounting", 
        icon: "📺",
        description: "Professional TV mounting and installation services",
        price: "120",
        duration: { hours: 1, minutes: 30 },
        category: "Installation",
        modifiers: []
      },
      { 
        id: "plumbing", 
        name: "Plumbing Service", 
        icon: "🔧",
        description: "Emergency and routine plumbing repairs and installations",
        price: "95",
        duration: { hours: 1, minutes: 0 },
        category: "Repair",
        modifiers: []
      },
      { 
        id: "hvac", 
        name: "HVAC Service", 
        icon: "❄️",
        description: "Heating, ventilation, and air conditioning maintenance",
        price: "125",
        duration: { hours: 2, minutes: 0 },
        category: "Maintenance",
        modifiers: []
      },
      { 
        id: "carpet-cleaning", 
        name: "Carpet Cleaning", 
        icon: "🧼",
        description: "Deep carpet cleaning and stain removal services",
        price: "75",
        duration: { hours: 2, minutes: 30 },
        category: "Cleaning",
        modifiers: []
      },
      { 
        id: "window-cleaning", 
        name: "Window Cleaning", 
        icon: "🪟",
        description: "Interior and exterior window cleaning services",
        price: "60",
        duration: { hours: 1, minutes: 0 },
        category: "Cleaning",
        modifiers: []
      },
      { 
        id: "pressure-washing", 
        name: "Pressure Washing", 
        icon: "💦",
        description: "Exterior surface cleaning with high-pressure water",
        price: "200",
        duration: { hours: 3, minutes: 0 },
        category: "Cleaning",
        modifiers: []
      },
      { 
        id: "landscaping", 
        name: "Landscaping", 
        icon: "🌿",
        description: "Lawn maintenance, gardening, and landscape design",
        price: "100",
        duration: { hours: 2, minutes: 0 },
        category: "Landscaping",
        modifiers: []
      },
      { 
        id: "electrical", 
        name: "Electrical Service", 
        icon: "⚡",
        description: "Electrical repairs, installations, and safety inspections",
        price: "110",
        duration: { hours: 1, minutes: 30 },
        category: "Repair",
        modifiers: []
      },
      { 
        id: "painting", 
        name: "Painting Service", 
        icon: "🎨",
        description: "Interior and exterior painting services",
        price: "300",
        duration: { hours: 4, minutes: 0 },
        category: "Painting",
        modifiers: []
      },
      { 
        id: "moving", 
        name: "Moving Service", 
        icon: "📦",
        description: "Residential and commercial moving services",
        price: "250",
        duration: { hours: 4, minutes: 0 },
        category: "Moving",
        modifiers: []
      }
    ];
    
    res.json(templates);
  } catch (error) {
    console.error('Get service templates error:', error);
    res.status(500).json({ error: 'Failed to fetch service templates' });
  }
});

// Service availability endpoints
app.get('/api/services/:serviceId/availability', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get service availability
      const [availability] = await connection.query(
        'SELECT * FROM service_availability WHERE service_id = ?',
        [serviceId]
      );
      
      // Get scheduling rules
      const [schedulingRules] = await connection.query(
        'SELECT * FROM service_scheduling_rules WHERE service_id = ? ORDER BY start_date ASC',
        [serviceId]
      );
      
      // Get timeslot templates
      const [timeslotTemplates] = await connection.query(
        'SELECT * FROM service_timeslot_templates WHERE service_id = ? AND is_active = 1',
        [serviceId]
      );
      
      if (availability.length === 0) {
        // Return default availability
        return res.json({
          availabilityType: 'default',
          businessHoursOverride: null,
          timeslotTemplateId: null,
          minimumBookingNotice: 0,
          maximumBookingAdvance: 525600,
          bookingInterval: 30,
          schedulingRules: [],
          timeslotTemplates: []
        });
      }
      
      const serviceAvailability = availability[0];
      res.json({
        availabilityType: serviceAvailability.availability_type,
        businessHoursOverride: serviceAvailability.business_hours_override ? JSON.parse(serviceAvailability.business_hours_override) : null,
        timeslotTemplateId: serviceAvailability.timeslot_template_id,
        minimumBookingNotice: serviceAvailability.minimum_booking_notice,
        maximumBookingAdvance: serviceAvailability.maximum_booking_advance,
        bookingInterval: serviceAvailability.booking_interval,
        schedulingRules: schedulingRules.map(rule => ({
          ...rule,
          daysOfWeek: rule.days_of_week ? JSON.parse(rule.days_of_week) : null
        })),
        timeslotTemplates: timeslotTemplates.map(template => ({
          ...template,
          timeslots: JSON.parse(template.timeslots)
        }))
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get service availability error:', error);
    res.status(500).json({ error: 'Failed to fetch service availability' });
  }
});

app.put('/api/services/:serviceId/availability', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { 
      availabilityType, 
      businessHoursOverride, 
      timeslotTemplateId, 
      minimumBookingNotice, 
      maximumBookingAdvance, 
      bookingInterval 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      // Get user ID from service
      const [services] = await connection.query(
        'SELECT user_id FROM services WHERE id = ?',
        [serviceId]
      );
      
      if (services.length === 0) {
        return res.status(404).json({ error: 'Service not found' });
      }
      
      const userId = services[0].user_id;
      
      // Insert or update service availability
      await connection.query(
        `INSERT INTO service_availability 
         (service_id, user_id, availability_type, business_hours_override, timeslot_template_id, 
          minimum_booking_notice, maximum_booking_advance, booking_interval, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE 
         availability_type = ?, business_hours_override = ?, timeslot_template_id = ?,
         minimum_booking_notice = ?, maximum_booking_advance = ?, booking_interval = ?, updated_at = NOW()`,
        [
          serviceId, userId, availabilityType, 
          businessHoursOverride ? JSON.stringify(businessHoursOverride) : null, 
          timeslotTemplateId, minimumBookingNotice, maximumBookingAdvance, bookingInterval,
          availabilityType, 
          businessHoursOverride ? JSON.stringify(businessHoursOverride) : null, 
          timeslotTemplateId, minimumBookingNotice, maximumBookingAdvance, bookingInterval
        ]
      );
      
      res.json({ message: 'Service availability updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update service availability error:', error);
    res.status(500).json({ error: 'Failed to update service availability' });
  }
});

// Service scheduling rules endpoints
app.post('/api/services/:serviceId/scheduling-rules', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { ruleType, startDate, endDate, startTime, endTime, daysOfWeek, capacityLimit, reason } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        `INSERT INTO service_scheduling_rules 
         (service_id, rule_type, start_date, end_date, start_time, end_time, days_of_week, capacity_limit, reason, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          serviceId, ruleType, startDate, endDate, startTime, endTime,
          daysOfWeek ? JSON.stringify(daysOfWeek) : null, capacityLimit, reason
        ]
      );
      
      res.status(201).json({ 
        message: 'Scheduling rule created successfully',
        ruleId: result.insertId 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create scheduling rule error:', error);
    res.status(500).json({ error: 'Failed to create scheduling rule' });
  }
});

app.delete('/api/services/:serviceId/scheduling-rules/:ruleId', async (req, res) => {
  try {
    const { serviceId, ruleId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'DELETE FROM service_scheduling_rules WHERE id = ? AND service_id = ?',
        [ruleId, serviceId]
      );
      
      res.json({ message: 'Scheduling rule deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete scheduling rule error:', error);
    res.status(500).json({ error: 'Failed to delete scheduling rule' });
  }
});

// Service timeslot templates endpoints
app.post('/api/services/:serviceId/timeslot-templates', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description, timeslots } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        `INSERT INTO service_timeslot_templates 
         (service_id, name, description, timeslots, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [serviceId, name, description, JSON.stringify(timeslots)]
      );
      
      res.status(201).json({ 
        message: 'Timeslot template created successfully',
        templateId: result.insertId 
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create timeslot template error:', error);
    res.status(500).json({ error: 'Failed to create timeslot template' });
  }
});

app.put('/api/services/:serviceId/timeslot-templates/:templateId', async (req, res) => {
  try {
    const { serviceId, templateId } = req.params;
    const { name, description, timeslots, isActive } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        `UPDATE service_timeslot_templates 
         SET name = ?, description = ?, timeslots = ?, is_active = ?, updated_at = NOW() 
         WHERE id = ? AND service_id = ?`,
        [name, description, JSON.stringify(timeslots), isActive ? 1 : 0, templateId, serviceId]
      );
      
      res.json({ message: 'Timeslot template updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update timeslot template error:', error);
    res.status(500).json({ error: 'Failed to update timeslot template' });
  }
});

app.delete('/api/services/:serviceId/timeslot-templates/:templateId', async (req, res) => {
  try {
    const { serviceId, templateId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'DELETE FROM service_timeslot_templates WHERE id = ? AND service_id = ?',
        [templateId, serviceId]
      );
      
      res.json({ message: 'Timeslot template deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete timeslot template error:', error);
    res.status(500).json({ error: 'Failed to delete timeslot template' });
  }
});

// Job templates endpoints
app.get('/api/job-templates', async (req, res) => {
  try {
    const { userId } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [templates] = await connection.query(`
        SELECT 
          jt.*,
          s.name as service_name,
          s.price as service_price,
          s.duration as service_duration
        FROM job_templates jt
        LEFT JOIN services s ON jt.service_id = s.id
        WHERE jt.user_id = ? AND jt.is_active = TRUE
        ORDER BY jt.name ASC
      `, [userId]);
      
      res.json(templates);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get job templates error:', error);
    res.status(500).json({ error: 'Failed to fetch job templates' });
  }
});

app.post('/api/job-templates', async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      description, 
      serviceId, 
      estimatedDuration, 
      estimatedPrice, 
      defaultNotes 
    } = req.body;
    
    if (!userId || !name || !serviceId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query(
        `INSERT INTO job_templates (
          user_id, name, description, service_id, 
          estimated_duration, estimated_price, default_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          name, 
          description || null, 
          serviceId, 
          estimatedDuration || null, 
          estimatedPrice || null, 
          defaultNotes || null
        ]
      );
      
      // Get the created template with service details
      const [templates] = await connection.query(`
        SELECT 
          jt.*,
          s.name as service_name,
          s.price as service_price,
          s.duration as service_duration
        FROM job_templates jt
        LEFT JOIN services s ON jt.service_id = s.id
        WHERE jt.id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Job template created successfully',
        template: templates[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create job template error:', error);
    res.status(500).json({ error: 'Failed to create job template' });
  }
});

app.put('/api/job-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      serviceId, 
      estimatedDuration, 
      estimatedPrice, 
      defaultNotes,
      isActive 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const updateFields = [];
      const updateValues = [];
      
      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      
      if (serviceId) {
        updateFields.push('service_id = ?');
        updateValues.push(serviceId);
      }
      
      if (estimatedDuration !== undefined) {
        updateFields.push('estimated_duration = ?');
        updateValues.push(estimatedDuration);
      }
      
      if (estimatedPrice !== undefined) {
        updateFields.push('estimated_price = ?');
        updateValues.push(estimatedPrice);
      }
      
      if (defaultNotes !== undefined) {
        updateFields.push('default_notes = ?');
        updateValues.push(defaultNotes);
      }
      
      if (isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateValues.push(isActive);
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `UPDATE job_templates SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.query(query, updateValues);
      
      res.json({ message: 'Job template updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update job template error:', error);
    res.status(500).json({ error: 'Failed to update job template' });
  }
});

app.delete('/api/job-templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Soft delete by setting is_active to false
      await connection.query(
        'UPDATE job_templates SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      res.json({ message: 'Job template deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete job template error:', error);
    res.status(500).json({ error: 'Failed to delete job template' });
  }
});

// Team Management endpoints
app.get('/api/team-members', async (req, res) => {
  try {
    const { userId, status, search, page = 1, limit = 20, sortBy = 'first_name', sortOrder = 'ASC' } = req.query;
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          tm.*,
          COUNT(j.id) as total_jobs,
          COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
          AVG(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as avg_job_value
        FROM team_members tm
        LEFT JOIN jobs j ON tm.id = j.team_member_id
        WHERE tm.user_id = ?
      `;
      let params = [userId];
      
      if (status) {
        query += ' AND tm.status = ?';
        params.push(status);
      }
      
      if (search) {
        query += ' AND (tm.first_name LIKE ? OR tm.last_name LIKE ? OR tm.email LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' GROUP BY tm.id';
      
      // Handle sorting
      const allowedSortFields = ['first_name', 'last_name', 'email', 'role', 'total_jobs', 'completed_jobs', 'avg_job_value'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
        query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      } else {
        query += ' ORDER BY tm.first_name ASC';
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [teamMembers] = await connection.query(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM team_members tm
        WHERE tm.user_id = ?
      `;
      let countParams = [userId];
      
      if (status) {
        countQuery += ' AND tm.status = ?';
        countParams.push(status);
      }
      
      if (search) {
        countQuery += ' AND (tm.first_name LIKE ? OR tm.last_name LIKE ? OR tm.email LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        teamMembers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.get('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [teamMembers] = await connection.query(`
        SELECT 
          tm.*,
          COUNT(j.id) as total_jobs,
          COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
          AVG(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as avg_job_value,
          SUM(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as total_revenue
        FROM team_members tm
        LEFT JOIN jobs j ON tm.id = j.team_member_id
        WHERE tm.id = ?
        GROUP BY tm.id
      `, [id]);
      
      if (teamMembers.length === 0) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      
      // Get recent jobs for this team member
      const [recentJobs] = await connection.query(`
        SELECT 
          j.*,
          c.first_name as customer_first_name,
          c.last_name as customer_last_name,
          s.name as service_name
        FROM jobs j
        LEFT JOIN customers c ON j.customer_id = c.id
        LEFT JOIN services s ON j.service_id = s.id
        WHERE j.team_member_id = ?
        ORDER BY j.scheduled_date DESC
        LIMIT 10
      `, [id]);
      
      const teamMember = teamMembers[0];
      teamMember.recentJobs = recentJobs;
      
      res.json(teamMember);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

app.post('/api/team-members', async (req, res) => {
  try {
    const { 
      userId, 
      firstName, 
      lastName, 
      email, 
      phone, 
      role, 
      skills, 
      hourlyRate,
      availability 
    } = req.body;
    
    if (!userId || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Check if email already exists for this user
      const [existing] = await connection.query(
        'SELECT id FROM team_members WHERE user_id = ? AND email = ?',
        [userId, email]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Team member with this email already exists' });
      }
      
      const [result] = await connection.query(
        `INSERT INTO team_members (
          user_id, first_name, last_name, email, phone, role, 
          skills, hourly_rate, availability, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          userId, 
          firstName, 
          lastName, 
          email, 
          phone || null, 
          role || null, 
          skills ? JSON.stringify(skills) : null,
          hourlyRate || null,
          availability ? JSON.stringify(availability) : null
        ]
      );
      
      // Get the created team member
      const [teamMembers] = await connection.query(`
        SELECT * FROM team_members WHERE id = ?
      `, [result.insertId]);
      
      res.status(201).json({
        message: 'Team member created successfully',
        teamMember: teamMembers[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

app.put('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      role, 
      skills, 
      hourlyRate,
      availability,
      status 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      const updateFields = [];
      const updateValues = [];
      
      if (firstName) {
        updateFields.push('first_name = ?');
        updateValues.push(firstName);
      }
      
      if (lastName) {
        updateFields.push('last_name = ?');
        updateValues.push(lastName);
      }
      
      if (email) {
        if (!validateEmail(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      
      if (phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      
      if (role !== undefined) {
        updateFields.push('role = ?');
        updateValues.push(role);
      }
      
      if (skills !== undefined) {
        updateFields.push('skills = ?');
        updateValues.push(JSON.stringify(skills));
      }
      
      if (hourlyRate !== undefined) {
        updateFields.push('hourly_rate = ?');
        updateValues.push(hourlyRate);
      }
      
      if (availability !== undefined) {
        updateFields.push('availability = ?');
        updateValues.push(JSON.stringify(availability));
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `UPDATE team_members SET ${updateFields.join(', ')} WHERE id = ?`;
      
      await connection.query(query, updateValues);
      
      res.json({ message: 'Team member updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.delete('/api/team-members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Check if team member has assigned jobs
      const [assignedJobs] = await connection.query(
        'SELECT COUNT(*) as count FROM jobs WHERE team_member_id = ? AND status IN ("pending", "confirmed", "in_progress")',
        [id]
      );
      
      if (assignedJobs[0].count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete team member with active job assignments. Please reassign or complete their jobs first.' 
        });
      }
      
      // Soft delete by setting status to inactive
      await connection.query(
        'UPDATE team_members SET status = "inactive", updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      res.json({ message: 'Team member deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// Team member availability endpoints
app.get('/api/team-members/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      const [teamMember] = await connection.query(
        'SELECT availability FROM team_members WHERE id = ?',
        [id]
      );
      
      if (teamMember.length === 0) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      
      // Get scheduled jobs for the date range
      let jobsQuery = `
        SELECT scheduled_date, duration 
        FROM jobs 
        WHERE team_member_id = ? AND status IN ("pending", "confirmed", "in_progress")
      `;
      let jobsParams = [id];
      
      if (startDate && endDate) {
        jobsQuery += ' AND DATE(scheduled_date) BETWEEN ? AND ?';
        jobsParams.push(startDate, endDate);
      }
      
      const [scheduledJobs] = await connection.query(jobsQuery, jobsParams);
      
      res.json({
        availability: teamMember[0].availability ? JSON.parse(teamMember[0].availability) : null,
        scheduledJobs
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team member availability error:', error);
    res.status(500).json({ error: 'Failed to fetch team member availability' });
  }
});

app.put('/api/team-members/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const connection = await pool.getConnection();
    
    try {
      await connection.query(
        'UPDATE team_members SET availability = ?, updated_at = NOW() WHERE id = ?',
        [JSON.stringify(availability), id]
      );
      
      res.json({ message: 'Team member availability updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update team member availability error:', error);
    res.status(500).json({ error: 'Failed to update team member availability' });
  }
});

// Team performance analytics
app.get('/api/team-analytics', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const connection = await pool.getConnection();
    
    try {
      // Get team performance summary
      const [performanceSummary] = await connection.query(`
        SELECT 
          tm.id,
          tm.first_name,
          tm.last_name,
          tm.role,
          COUNT(j.id) as total_jobs,
          COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
          COUNT(CASE WHEN j.status IN ('pending', 'confirmed', 'in_progress') THEN 1 END) as active_jobs,
          AVG(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as avg_job_value,
          SUM(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN TIMESTAMPDIFF(MINUTE, j.scheduled_date, j.updated_at) END) as avg_completion_time
        FROM team_members tm
        LEFT JOIN jobs j ON tm.id = j.team_member_id
        WHERE tm.user_id = ? AND tm.status = 'active'
        ${startDate && endDate ? 'AND DATE(j.scheduled_date) BETWEEN ? AND ?' : ''}
        GROUP BY tm.id
        ORDER BY total_revenue DESC
      `, startDate && endDate ? [userId, startDate, endDate] : [userId]);
      
      // Get overall team stats
      const [teamStats] = await connection.query(`
        SELECT 
          COUNT(DISTINCT tm.id) as total_team_members,
          COUNT(DISTINCT j.id) as total_jobs,
          COUNT(CASE WHEN j.status = 'completed' THEN 1 END) as completed_jobs,
          SUM(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as total_revenue,
          AVG(CASE WHEN j.status = 'completed' THEN j.invoice_amount END) as avg_job_value
        FROM team_members tm
        LEFT JOIN jobs j ON tm.id = j.team_member_id
        WHERE tm.user_id = ? AND tm.status = 'active'
        ${startDate && endDate ? 'AND DATE(j.scheduled_date) BETWEEN ? AND ?' : ''}
      `, startDate && endDate ? [userId, startDate, endDate] : [userId]);
      
      res.json({
        performanceSummary,
        teamStats: teamStats[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch team analytics' });
  }
});

app.get('/api/public/user/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const decodedSlug = decodeURIComponent(slug);
    const connection = await pool.getConnection();
    
    try {
      // First try to find by business_name (slug)
      let [users] = await connection.query(`
        SELECT id, business_name, email, phone, first_name, last_name, profile_picture
        FROM users 
        WHERE business_name = ? AND is_active = 1
      `, [decodedSlug]);
      
      // If not found, try to find by id (for backward compatibility)
      if (users.length === 0) {
        [users] = await connection.query(`
          SELECT id, business_name, email, phone, first_name, last_name, profile_picture
          FROM users 
          WHERE id = ? AND is_active = 1
        `, [decodedSlug]);
      }
      
      // If still not found, try to find by original business name (for backward compatibility)
      if (users.length === 0) {
        [users] = await connection.query(`
          SELECT id, business_name, email, phone, first_name, last_name, profile_picture
          FROM users 
          WHERE business_name LIKE ? AND is_active = 1
        `, [`%${decodedSlug}%`]);
      }
      
      if (users.length === 0) {
        return res.status(404).json({ 
          error: 'Business not found',
          message: `No business found with slug: ${decodedSlug}`,
          availableSlugs: ['now2code-academy', 'zenbooker-cleaning-services', 'test-business']
        });
      }
      
      res.json(users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch business information' });
  }
});

app.get('/api/public/services/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [services] = await connection.query(`
        SELECT id, name, description, price, duration, category
        FROM services 
        WHERE user_id = ? AND is_active = 1
        ORDER BY name
      `, [userId]);
      
      res.json(services);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/public/availability/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;
    const connection = await pool.getConnection();
    
    try {
      // Get business hours for the user
      const [availability] = await connection.query(`
        SELECT business_hours FROM user_availability WHERE user_id = ?
      `, [userId]);
      
      // Generate time slots based on business hours
      const businessHours = availability[0]?.business_hours || {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '17:00' },
        sunday: { start: '09:00', end: '17:00' }
      };
      
      // Get existing bookings for the date
      const [bookings] = await connection.query(`
        SELECT scheduled_date FROM jobs 
        WHERE user_id = ? AND DATE(scheduled_date) = ? AND status != 'cancelled'
      `, [userId, date]);
      
      const bookedTimes = bookings.map(booking => 
        new Date(booking.scheduled_date).toTimeString().slice(0, 5)
      );
      
      // Generate available time slots
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
      const hours = businessHours[dayOfWeek];
      
      const availableSlots = [];
      if (hours) {
        const startTime = new Date(`2000-01-01T${hours.start}`);
        const endTime = new Date(`2000-01-01T${hours.end}`);
        
        while (startTime < endTime) {
          const timeSlot = startTime.toTimeString().slice(0, 5);
          if (!bookedTimes.includes(timeSlot)) {
            availableSlots.push(timeSlot);
          }
          startTime.setMinutes(startTime.getMinutes() + 30);
        }
      }
      
      res.json({ availableSlots });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get public availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Coupon API endpoints
app.post('/api/coupons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      code,
      discountType,
      discountAmount,
      applicationType,
      selectedServices,
      doesntExpire,
      expirationDate,
      restrictBeforeExpiration,
      limitTotalUses,
      canCombineWithRecurring,
      recurringApplicationType
    } = req.body;

    const connection = await pool.getConnection();
    
    try {
      // Check if coupon code already exists
      const [existingCoupons] = await connection.query(
        'SELECT id FROM coupons WHERE code = ?',
        [code]
      );
      
      if (existingCoupons.length > 0) {
        return res.status(400).json({ error: 'Coupon code already exists' });
      }

      // Create coupon
      const [result] = await connection.query(`
        INSERT INTO coupons (
          user_id, code, discount_type, discount_amount, application_type,
          selected_services, doesnt_expire, expiration_date, restrict_before_expiration,
          limit_total_uses, can_combine_with_recurring, recurring_application_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, code, discountType, discountAmount, applicationType,
        JSON.stringify(selectedServices), doesntExpire, 
        doesntExpire ? null : expirationDate, restrictBeforeExpiration,
        limitTotalUses, canCombineWithRecurring, recurringApplicationType
      ]);

      res.status(201).json({
        message: 'Coupon created successfully',
        couponId: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

app.get('/api/coupons', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();
    
    try {
      const [coupons] = await connection.query(`
        SELECT * FROM coupons WHERE user_id = ? ORDER BY created_at DESC
      `, [userId]);
      
      res.json({ coupons });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ error: 'Failed to get coupons' });
  }
});

app.put('/api/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const couponId = req.params.id;
    const updateData = req.body;

    const connection = await pool.getConnection();
    
    try {
      // Verify coupon belongs to user
      const [coupons] = await connection.query(
        'SELECT id FROM coupons WHERE id = ? AND user_id = ?',
        [couponId, userId]
      );
      
      if (coupons.length === 0) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      // Update coupon
      await connection.query(`
        UPDATE coupons SET 
          code = ?, discount_type = ?, discount_amount = ?, application_type = ?,
          selected_services = ?, doesnt_expire = ?, expiration_date = ?, 
          restrict_before_expiration = ?, limit_total_uses = ?, 
          can_combine_with_recurring = ?, recurring_application_type = ?,
          is_active = ?, updated_at = NOW()
        WHERE id = ?
      `, [
        updateData.code, updateData.discountType, updateData.discountAmount,
        updateData.applicationType, JSON.stringify(updateData.selectedServices),
        updateData.doesntExpire, updateData.doesntExpire ? null : updateData.expirationDate,
        updateData.restrictBeforeExpiration, updateData.limitTotalUses,
        updateData.canCombineWithRecurring, updateData.recurringApplicationType,
        updateData.isActive, couponId
      ]);

      res.json({ message: 'Coupon updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

app.delete('/api/coupons/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const couponId = req.params.id;

    const connection = await pool.getConnection();
    
    try {
      // Verify coupon belongs to user
      const [coupons] = await connection.query(
        'SELECT id FROM coupons WHERE id = ? AND user_id = ?',
        [couponId, userId]
      );
      
      if (coupons.length === 0) {
        return res.status(404).json({ error: 'Coupon not found' });
      }

      // Delete coupon
      await connection.query('DELETE FROM coupons WHERE id = ?', [couponId]);

      res.json({ message: 'Coupon deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// Public coupon validation endpoint for customers
app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, businessSlug, serviceId, totalAmount } = req.body;

    if (!code || !businessSlug) {
      return res.status(400).json({ error: 'Coupon code and business slug are required' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Get business user ID from slug or user ID
      let businessUserId;
      
      // First try to find by business slug
      const [businesses] = await connection.query(
        'SELECT id FROM users WHERE business_slug = ?',
        [businessSlug]
      );
      
      if (businesses.length > 0) {
        businessUserId = businesses[0].id;
      } else {
        // Try to parse as user ID directly
        const userId = parseInt(businessSlug);
        if (!isNaN(userId)) {
          const [usersById] = await connection.query(
            'SELECT id FROM users WHERE id = ?',
            [userId]
          );
          if (usersById.length === 0) {
            return res.status(404).json({ error: 'Business not found' });
          }
          businessUserId = usersById[0].id;
        } else {
          // Try to extract user ID from business-{id} format
          const match = businessSlug.match(/business-(\d+)/);
          if (match) {
            const userId = parseInt(match[1]);
            const [usersById] = await connection.query(
              'SELECT id FROM users WHERE id = ?',
              [userId]
            );
            if (usersById.length === 0) {
              return res.status(404).json({ error: 'Business not found' });
            }
            businessUserId = usersById[0].id;
          } else {
            return res.status(404).json({ error: 'Business not found' });
          }
        }
      }

      // Get coupon details
      const [coupons] = await connection.query(`
        SELECT * FROM coupons 
        WHERE code = ? AND user_id = ? AND is_active = 1
      `, [code, businessUserId]);
      
      if (coupons.length === 0) {
        return res.status(404).json({ error: 'Invalid coupon code' });
      }

      const coupon = coupons[0];

      // Check if coupon is expired
      if (!coupon.doesnt_expire && coupon.expiration_date) {
        const expirationDate = new Date(coupon.expiration_date);
        if (expirationDate < new Date()) {
          return res.status(400).json({ error: 'Coupon has expired' });
        }
      }

      // Check usage limits
      if (coupon.limit_total_uses && coupon.total_uses_limit) {
        if (coupon.current_uses >= coupon.total_uses_limit) {
          return res.status(400).json({ error: 'Coupon usage limit reached' });
        }
      }

      // Check if coupon applies to specific services
      if (coupon.application_type === 'specific' && serviceId) {
        const selectedServices = JSON.parse(coupon.selected_services || '[]');
        if (!selectedServices.includes(parseInt(serviceId))) {
          return res.status(400).json({ error: 'Coupon does not apply to this service' });
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (totalAmount * coupon.discount_amount) / 100;
      } else {
        discountAmount = parseFloat(coupon.discount_amount);
        // Ensure discount doesn't exceed total amount
        if (discountAmount > totalAmount) {
          discountAmount = totalAmount;
        }
      }

      const finalAmount = totalAmount - discountAmount;

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discount_type,
          discountAmount: coupon.discount_amount,
          calculatedDiscount: discountAmount,
          finalAmount: finalAmount
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Apply coupon to booking/invoice
app.post('/api/coupons/apply', async (req, res) => {
  try {
    const { couponId, customerId, jobId, invoiceId, discountAmount } = req.body;

    const connection = await pool.getConnection();
    
    try {
      // Record coupon usage
      await connection.query(`
        INSERT INTO coupon_usage (coupon_id, customer_id, job_id, invoice_id, discount_amount)
        VALUES (?, ?, ?, ?, ?)
      `, [couponId, customerId, jobId, invoiceId, discountAmount]);

      // Update coupon usage count
      await connection.query(`
        UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?
      `, [couponId]);

      res.json({ message: 'Coupon applied successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// Stripe payment endpoints
app.post('/api/payments/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', metadata = {} } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/payments/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, invoiceId, customerId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // Update invoice status
      const connection = await pool.getConnection();
      try {
        await connection.query(`
          UPDATE invoices SET 
            status = 'paid', 
            payment_date = NOW(),
            stripe_payment_intent_id = ?
          WHERE id = ?
        `, [paymentIntentId, invoiceId]);
        
        // Get invoice details for email
        const [invoices] = await connection.query(`
          SELECT i.*, c.email, c.first_name, c.last_name
          FROM invoices i
          JOIN customers c ON i.customer_id = c.id
          WHERE i.id = ?
        `, [invoiceId]);
        
        if (invoices.length > 0) {
          const invoice = invoices[0];
          
          // Send payment confirmation email
          await sendEmail({
            to: invoice.email,
            subject: 'Payment Confirmation',
            html: `
              <h2>Payment Confirmation</h2>
              <p>Hello ${invoice.first_name},</p>
              <p>Thank you for your payment of $${invoice.total_amount}.</p>
              <p>Invoice #: ${invoice.id}</p>
              <p>Payment Date: ${new Date().toLocaleDateString()}</p>
              <p>Transaction ID: ${paymentIntentId}</p>
              <p>Thank you for your business!</p>
            `
          });
        }
        
        res.json({ 
          success: true, 
          message: 'Payment confirmed successfully',
          paymentIntent 
        });
      } finally {
        connection.release();
      }
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

app.post('/api/payments/create-subscription', authenticateToken, async (req, res) => {
  try {
    const { customerId, priceId, metadata = {} } = req.body;
    
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
    
    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Tax calculation endpoint
app.post('/api/tax/calculate', authenticateToken, async (req, res) => {
  try {
    const { subtotal, state, city, zipCode } = req.body;
    
    // Simple tax calculation (you can integrate with tax APIs like TaxJar)
    const taxRates = {
      'CA': 0.0825, // 8.25% for California
      'NY': 0.085,  // 8.5% for New York
      'TX': 0.0625, // 6.25% for Texas
      'FL': 0.06,   // 6% for Florida
      'default': 0.07 // 7% default
    };
    
    const taxRate = taxRates[state] || taxRates.default;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    res.json({
      subtotal,
      taxRate: taxRate * 100,
      taxAmount,
      total,
      breakdown: {
        subtotal,
        tax: taxAmount,
        total
      }
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate tax' });
  }
});

// Email notification endpoints
app.post('/api/notifications/send-email', authenticateToken, async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    const result = await sendEmail({ to, subject, html, text });
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/api/public/bookings', async (req, res) => {
  try {
    const { 
      userId, customerData, services, scheduledDate, scheduledTime, 
      totalAmount, notes 
    } = req.body;
    
    if (!userId || !customerData || !services || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    const connection = await pool.getConnection();
    
    try {
      // Create or find customer
      let [existingCustomer] = await connection.query(`
        SELECT id FROM customers WHERE email = ? AND user_id = ?
      `, [customerData.email, userId]);
      
      let customerId;
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        // Update customer info
        await connection.query(`
          UPDATE customers SET 
            first_name = ?, last_name = ?, phone = ?, address = ?
          WHERE id = ?
        `, [customerData.firstName, customerData.lastName, customerData.phone, customerData.address, customerId]);
      } else {
        // Create new customer
        const [customerResult] = await connection.query(`
          INSERT INTO customers (user_id, first_name, last_name, email, phone, address, status)
          VALUES (?, ?, ?, ?, ?, ?, 'active')
        `, [userId, customerData.firstName, customerData.lastName, customerData.email, customerData.phone, customerData.address]);
        customerId = customerResult.insertId;
      }
      
      // Create job for each service
      const scheduledDateTime = `${scheduledDate}T${scheduledTime}:00`;
      
      for (const service of services) {
        await connection.query(`
          INSERT INTO jobs (user_id, customer_id, service_id, scheduled_date, notes, status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `, [userId, customerId, service.id, scheduledDateTime, notes]);
      }
      
      // Create invoice
      const [invoiceResult] = await connection.query(`
        INSERT INTO invoices (user_id, customer_id, total_amount, status, created_at)
        VALUES (?, ?, ?, 'pending', NOW())
      `, [userId, customerId, totalAmount]);
      
      res.status(201).json({ 
        message: 'Booking created successfully',
        bookingId: invoiceResult.insertId
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create public booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Requests API endpoints
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { userId, filter = 'all', status, page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT r.*, 
               c.first_name as customer_first_name, 
               c.last_name as customer_last_name,
               c.email as customer_email,
               c.phone as customer_phone,
               s.name as service_name,
               s.price as service_price,
               s.duration as service_duration
        FROM requests r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.user_id = ?
      `;
      
      const params = [userId];
      
      // Add filter conditions
      if (filter === 'booking') {
        query += ' AND r.type = "booking"';
      } else if (filter === 'quote') {
        query += ' AND r.type = "quote"';
      }
      
      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }
      
      // Add sorting
      query += ` ORDER BY r.${sortBy} ${sortOrder}`;
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
      
      const [requests] = await connection.query(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM requests r
        WHERE r.user_id = ?
      `;
      
      const countParams = [userId];
      
      if (filter === 'booking') {
        countQuery += ' AND r.type = "booking"';
      } else if (filter === 'quote') {
        countQuery += ' AND r.type = "quote"';
      }
      
      if (status) {
        countQuery += ' AND r.status = ?';
        countParams.push(status);
      }
      
      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

app.get('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [requests] = await connection.query(`
        SELECT r.*, 
               c.first_name as customer_first_name, 
               c.last_name as customer_last_name,
               c.email as customer_email,
               c.phone as customer_phone,
               s.name as service_name,
               s.price as service_price,
               s.duration as service_duration
        FROM requests r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.id = ?
      `, [id]);
      
      if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      res.json(requests[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { 
      userId, customerId, serviceId, type, status = 'pending', 
      scheduledDate, scheduledTime, estimatedDuration, estimatedPrice,
      notes, customerName, customerEmail, customerPhone 
    } = req.body;
    
    if (!userId || !type) {
      return res.status(400).json({ error: 'User ID and type are required' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      let actualCustomerId = customerId;
      
      // If no customerId provided, create or find customer
      if (!customerId && customerName && customerEmail) {
        let [existingCustomer] = await connection.query(`
          SELECT id FROM customers WHERE email = ? AND user_id = ?
        `, [customerEmail, userId]);
        
        if (existingCustomer.length > 0) {
          actualCustomerId = existingCustomer[0].id;
        } else {
          const [customerResult] = await connection.query(`
            INSERT INTO customers (user_id, first_name, last_name, email, phone, status)
            VALUES (?, ?, ?, ?, ?, 'active')
          `, [userId, customerName.split(' ')[0], customerName.split(' ').slice(1).join(' ') || '', customerEmail, customerPhone]);
          actualCustomerId = customerResult.insertId;
        }
      }
      
      const [result] = await connection.query(`
        INSERT INTO requests (
          user_id, customer_id, service_id, type, status, 
          scheduled_date, scheduled_time, estimated_duration, estimated_price,
          notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        userId, actualCustomerId, serviceId, type, status,
        scheduledDate, scheduledTime, estimatedDuration, estimatedPrice,
        notes
      ]);
      
      // Get the created request
      const [requests] = await connection.query(`
        SELECT r.*, 
               c.first_name as customer_first_name, 
               c.last_name as customer_last_name,
               c.email as customer_email,
               c.phone as customer_phone,
               s.name as service_name,
               s.price as service_price,
               s.duration as service_duration
        FROM requests r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.id = ?
      `, [result.insertId]);
      
      res.status(201).json(requests[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.put('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, scheduledDate, scheduledTime, estimatedDuration, 
      estimatedPrice, notes 
    } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(`
        UPDATE requests SET 
          status = ?, scheduled_date = ?, scheduled_time = ?, 
          estimated_duration = ?, estimated_price = ?, notes = ?, updated_at = NOW()
        WHERE id = ?
      `, [status, scheduledDate, scheduledTime, estimatedDuration, estimatedPrice, notes, id]);
      
      // Get the updated request
      const [requests] = await connection.query(`
        SELECT r.*, 
               c.first_name as customer_first_name, 
               c.last_name as customer_last_name,
               c.email as customer_email,
               c.phone as customer_phone,
               s.name as service_name,
               s.price as service_price,
               s.duration as service_duration
        FROM requests r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.id = ?
      `, [id]);
      
      if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      res.json(requests[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

app.delete('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.query('DELETE FROM requests WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      res.json({ message: 'Request deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

app.post('/api/requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get the request first
      const [requests] = await connection.query(`
        SELECT r.*, c.first_name, c.last_name, c.email, s.name as service_name, s.price
        FROM requests r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN services s ON r.service_id = s.id
        WHERE r.id = ?
      `, [id]);
      
      if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      const request = requests[0];
      
      // Update request status
      await connection.query(`
        UPDATE requests SET status = 'approved', updated_at = NOW() WHERE id = ?
      `, [id]);
      
      // If it's a booking request, create a job AND an estimate
      if (request.type === 'booking') {
        // Create job
        await connection.query(`
          INSERT INTO jobs (user_id, customer_id, service_id, scheduled_date, notes, status)
          VALUES (?, ?, ?, ?, ?, 'confirmed')
        `, [request.user_id, request.customer_id, request.service_id, request.scheduled_date, request.notes]);
        
        // Create estimate
        const estimateData = {
          customer_name: `${request.first_name} ${request.last_name}`,
          customer_email: request.email,
          service_name: request.service_name,
          amount: request.estimated_price || request.price,
          notes: request.notes,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          status: 'draft'
        };
        
        await connection.query(`
          INSERT INTO estimates (user_id, customer_id, service_id, amount, notes, valid_until, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          request.user_id, 
          request.customer_id, 
          request.service_id, 
          estimateData.amount,
          estimateData.notes,
          estimateData.valid_until,
          estimateData.status
        ]);
      }
      
      res.json({ message: 'Request approved successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

app.post('/api/requests/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query(`
        UPDATE requests SET 
          status = 'rejected', 
          rejection_reason = ?, 
          updated_at = NOW() 
        WHERE id = ?
      `, [reason, id]);
      
      res.json({ message: 'Request rejected successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

// Public booking endpoints

// Public quote endpoint
app.post('/api/public/quotes', async (req, res) => {
  try {
    const { 
      userId = 1,
      customerData,
      serviceId,
      serviceName,
      description,
      preferredDate,
      preferredTime,
      estimatedDuration,
      estimatedPrice,
      notes
    } = req.body;
    
    if (!customerData || !serviceName || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First, create or find customer
      let customerId;
      const [existingCustomers] = await connection.query(`
        SELECT id FROM customers 
        WHERE user_id = ? AND email = ?
      `, [userId, customerData.email]);
      
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer information
        await connection.query(`
          UPDATE customers 
          SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
          WHERE id = ?
        `, [customerData.firstName, customerData.lastName, customerData.phone, customerData.address, customerId]);
      } else {
        // Create new customer
        const [customerResult] = await connection.query(`
          INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [userId, customerData.firstName, customerData.lastName, customerData.email, customerData.phone, customerData.address]);
        customerId = customerResult.insertId;
      }
      
      // Create quote request
      const [requestResult] = await connection.query(`
        INSERT INTO requests (
          user_id, customer_id, service_id, type, status,
          scheduled_date, scheduled_time, estimated_duration, estimated_price,
          notes, created_at
        ) VALUES (?, ?, ?, 'quote', 'pending', ?, ?, ?, ?, ?, NOW())
      `, [
        userId, customerId, serviceId, preferredDate, preferredTime,
        estimatedDuration, estimatedPrice, notes
      ]);
      
      res.status(201).json({
        message: 'Quote request submitted successfully',
        requestId: requestResult.insertId,
        customerId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create quote request error:', error);
    res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

app.post('/api/public/bookings', async (req, res) => {
  try {
    const { 
      userId = 1,
      customerData,
      services,
      scheduledDate,
      scheduledTime,
      totalAmount,
      notes
    } = req.body;
    
    if (!customerData || !services || !scheduledDate || !scheduledTime || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // First, create or find customer
      let customerId;
      const [existingCustomers] = await connection.query(`
        SELECT id FROM customers 
        WHERE user_id = ? AND email = ?
      `, [userId, customerData.email]);
      
      if (existingCustomers.length > 0) {
        customerId = existingCustomers[0].id;
        // Update customer information
        await connection.query(`
          UPDATE customers 
          SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW()
          WHERE id = ?
        `, [customerData.firstName, customerData.lastName, customerData.phone, customerData.address, customerId]);
      } else {
        // Create new customer
        const [customerResult] = await connection.query(`
          INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [userId, customerData.firstName, customerData.lastName, customerData.email, customerData.phone, customerData.address]);
        customerId = customerResult.insertId;
      }
      
      // Create booking (job) for each service
      const bookingIds = [];
      for (const service of services) {
        const fullScheduledDate = `${scheduledDate} ${scheduledTime}:00`;
        
        const [bookingResult] = await connection.query(`
          INSERT INTO jobs (
            user_id, customer_id, service_id, scheduled_date, notes, status, created_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', NOW())
        `, [userId, customerId, service.id, fullScheduledDate, notes]);
        
        bookingIds.push(bookingResult.insertId);
      }
      
      // Create invoice for the booking
      const [invoiceResult] = await connection.query(`
        INSERT INTO invoices (
          user_id, customer_id, amount, total_amount, status, due_date, created_at
        ) VALUES (?, ?, ?, ?, 'draft', DATE_ADD(NOW(), INTERVAL 15 DAY), NOW())
      `, [userId, customerId, totalAmount, totalAmount]);
      
      res.status(201).json({
        message: 'Booking created successfully',
        bookingIds,
        invoiceId: invoiceResult.insertId,
        customerId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Booking Settings API endpoints
app.get('/api/booking-settings/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [settings] = await pool.query(
      'SELECT * FROM booking_settings WHERE user_id = ?',
      [userId]
    );
    
    if (settings.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        branding: {
          primaryColor: "#4CAF50",
          headerBackground: "#ffffff",
          headerIcons: "#4CAF50",
          hideZenbookerBranding: false,
          logo: null,
          favicon: null,
          heroImage: null
        },
        content: {
          heading: "Book Online",
          text: "Let's get started by entering your postal code."
        },
        general: {
          serviceArea: "postal-code",
          serviceLayout: "default",
          datePickerStyle: "available-days",
          language: "english",
          textSize: "big",
          showPrices: false,
          includeTax: false,
          autoAdvance: true,
          allowCoupons: true,
          showAllOptions: false,
          showEstimatedDuration: false,
          limitAnimations: false,
          use24Hour: false,
          allowMultipleServices: false
        },
        analytics: {
          googleAnalytics: "",
          facebookPixel: ""
        },
        customUrl: ""
      };
      
      return res.json(defaultSettings);
    }
    
    res.json(JSON.parse(settings[0].settings));
  } catch (error) {
    console.error('Error fetching booking settings:', error);
    res.status(500).json({ error: 'Failed to fetch booking settings' });
  }
});

app.put('/api/booking-settings/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;
    
    const [existing] = await pool.query(
      'SELECT * FROM booking_settings WHERE user_id = ?',
      [userId]
    );
    
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO booking_settings (user_id, settings) VALUES (?, ?)',
        [userId, JSON.stringify(settings)]
      );
    } else {
      await pool.query(
        'UPDATE booking_settings SET settings = ? WHERE user_id = ?',
        [JSON.stringify(settings), userId]
      );
    }
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving booking settings:', error);
    res.status(500).json({ error: 'Failed to save booking settings' });
  }
});

// File upload endpoints
app.post('/api/upload-logo', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

app.post('/api/upload-favicon', authenticateToken, upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading favicon:', error);
    res.status(500).json({ error: 'Failed to upload favicon' });
  }
});

app.post('/api/upload-hero-image', authenticateToken, upload.single('heroImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    res.status(500).json({ error: 'Failed to upload hero image' });
  }
});
// Public API endpoints for booking and quote pages
app.get('/api/public/business/:businessSlug/settings', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    
    // Find user by business slug (converted from business name)
    const [users] = await pool.query(
      'SELECT id, business_name FROM users WHERE LOWER(REPLACE(business_name, " ", "")) = ?',
      [businessSlug.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const userId = users[0].id;
    
    // Get booking settings
    const [settings] = await pool.query(
      'SELECT settings FROM booking_settings WHERE user_id = ?',
      [userId]
    );
    
    if (settings.length === 0) {
      // Return default settings
      const defaultSettings = {
        branding: {
          primaryColor: "#4CAF50",
          headerBackground: "#ffffff",
          headerIcons: "#4CAF50",
          hideZenbookerBranding: false,
          logo: null,
          favicon: null,
          heroImage: null
        },
        content: {
          heading: "Book Online",
          text: "Let's get started by entering your postal code."
        },
        general: {
          serviceArea: "postal-code",
          serviceLayout: "default",
          datePickerStyle: "available-days",
          language: "english",
          textSize: "big",
          showPrices: false,
          includeTax: false,
          autoAdvance: true,
          allowCoupons: true,
          showAllOptions: false,
          showEstimatedDuration: false,
          limitAnimations: false,
          use24Hour: false,
          allowMultipleServices: false
        }
      };
      
      return res.json(defaultSettings);
    }
    
    res.json(JSON.parse(settings[0].settings));
  } catch (error) {
    console.error('Error fetching public business settings:', error);
    res.status(500).json({ error: 'Failed to fetch business settings' });
  }
});

app.get('/api/public/business/:businessSlug/services', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    
    // Find user by business slug
    const [users] = await pool.query(
      'SELECT id FROM users WHERE LOWER(REPLACE(business_name, " ", "")) = ?',
      [businessSlug.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const userId = users[0].id;
    
    // Get services for this business
    const [services] = await pool.query(
      'SELECT id, name, description, price, duration FROM services WHERE user_id = ? AND is_active = 1',
      [userId]
    );
    
    res.json(services);
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/public/business/:businessSlug/book', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    const bookingData = req.body;
    
    // Find user by business slug
    const [users] = await pool.query(
      'SELECT id FROM users WHERE LOWER(REPLACE(business_name, " ", "")) = ?',
      [businessSlug.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const userId = users[0].id;
    
    // First, create or find customer
    let customerId;
    const [existingCustomers] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ? AND email = ?',
      [userId, bookingData.email]
    );
    
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      // Update customer information
      await pool.query(
        'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
        [bookingData.name.split(' ')[0] || '', bookingData.name.split(' ').slice(1).join(' ') || '', bookingData.phone, bookingData.address, customerId]
      );
    } else {
      // Create new customer
      const [customerResult] = await pool.query(
        'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          userId,
          bookingData.name.split(' ')[0] || '',
          bookingData.name.split(' ').slice(1).join(' ') || '',
          bookingData.email,
          bookingData.phone,
          bookingData.address
        ]
      );
      customerId = customerResult.insertId;
    }
    
    // Create job record with customer_id
    const scheduledDateTime = `${bookingData.date}T${bookingData.time}:00`;
    const [jobResult] = await pool.query(
      'INSERT INTO jobs (user_id, customer_id, service_id, scheduled_date, notes, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        customerId,
        bookingData.service,
        scheduledDateTime,
        bookingData.notes || '',
        'pending'
      ]
    );
    
    const jobId = jobResult.insertId;
    
    // Create invoice record
    const [serviceResult] = await pool.query('SELECT price FROM services WHERE id = ?', [bookingData.service]);
    const price = serviceResult[0]?.price || 0;
    
    await pool.query(
      'INSERT INTO invoices (user_id, customer_id, job_id, amount, total_amount, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        customerId,
        jobId,
        price,
        price,
        'draft',
        new Date()
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Booking created successfully',
      jobId: jobId
    });
  } catch (error) {
    console.error('Error creating public booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.post('/api/public/business/:businessSlug/quote', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    const quoteData = req.body;
    
    // Find user by business slug
    const [users] = await pool.query(
      'SELECT id FROM users WHERE LOWER(REPLACE(business_name, " ", "")) = ?',
      [businessSlug.toLowerCase()]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }
    
    const userId = users[0].id;
    
    // First, create or find customer
    let customerId;
    const [existingCustomers] = await pool.query(
      'SELECT id FROM customers WHERE user_id = ? AND email = ?',
      [userId, quoteData.email]
    );
    
    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
      // Update customer information
      await pool.query(
        'UPDATE customers SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
        [quoteData.name.split(' ')[0] || '', quoteData.name.split(' ').slice(1).join(' ') || '', quoteData.phone, quoteData.address, customerId]
      );
    } else {
      // Create new customer
      const [customerResult] = await pool.query(
        'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          userId,
          quoteData.name.split(' ')[0] || '',
          quoteData.name.split(' ').slice(1).join(' ') || '',
          quoteData.email,
          quoteData.phone,
          quoteData.address
        ]
      );
      customerId = customerResult.insertId;
    }
    
    // Create request record in the requests table
    const [requestResult] = await pool.query(
      'INSERT INTO requests (user_id, customer_id, customer_name, customer_email, type, status, scheduled_date, scheduled_time, estimated_duration, estimated_price, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        customerId,
        quoteData.name,
        quoteData.email,
        'quote',
        'pending',
        quoteData.preferredDate || null,
        quoteData.preferredTime || null,
        null, // Will be filled by business when they respond
        null, // Will be filled by business when they respond
        `Service Type: ${quoteData.serviceType}\nDescription: ${quoteData.description}\nUrgency: ${quoteData.urgency}\nBudget: ${quoteData.budget}\nAdditional Info: ${quoteData.additionalInfo}`
      ]
    );
    
    res.json({ 
      success: true, 
      message: 'Quote request submitted successfully',
      requestId: requestResult.insertId
    });
  } catch (error) {
    console.error('Error creating public quote request:', error);
    res.status(500).json({ error: 'Failed to submit quote request' });
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
app.listen(PORT, () => {
  console.log(`ZenBooker API server running on port ${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
});




