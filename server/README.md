# Zenbooker Backend Setup Guide

## Overview

This document provides step-by-step instructions for setting up the Zenbooker backend server. The backend is built with Node.js, Express.js, and MySQL, providing RESTful API endpoints for the Zenbooker application.

## Prerequisites

Before setting up the backend, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **MySQL** (version 8.0 or higher)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Navigate to the Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `express` - Web framework
- `mysql2` - MySQL client for Node.js
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 3. Database Setup

#### Create MySQL Database

1. Access your MySQL server:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE zenbooker;
   USE zenbooker;
   ```

3. Import the initial schema:
   ```bash
   mysql -u root -p zenbooker < database.sql
   ```

#### Run Database Migrations

Execute the migration script to add additional tables and columns:

```bash
node run-migration.js
```

This will create all necessary tables including:
- `users` - User accounts and authentication
- `jobs` - Service jobs and bookings
- `services` - Available services
- `customers` - Customer information
- `estimates` - Service estimates
- `invoices` - Billing and payments
- `team_members` - Team management
- `territories` - Service areas
- `coupons` - Discount codes

### 4. Environment Configuration

Create a `.env` file in the server directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=zenbooker

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

**Important Security Notes:**
- Use a strong, unique JWT_SECRET
- Never commit the `.env` file to version control
- Use environment-specific passwords for production

### 5. Start the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 5000).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Jobs Management
- `GET /api/jobs` - Retrieve jobs
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Services Management
- `GET /api/services` - Retrieve services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Customer Management
- `GET /api/customers` - Retrieve customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Team Management
- `GET /api/team-members` - Retrieve team members
- `POST /api/team-members` - Create new team member
- `PUT /api/team-members/:id` - Update team member
- `DELETE /api/team-members/:id` - Delete team member

### Estimates & Invoices
- `GET /api/estimates` - Retrieve estimates
- `POST /api/estimates` - Create new estimate
- `GET /api/invoices` - Retrieve invoices
- `POST /api/invoices` - Create new invoice

## Health Check

Verify the server is running correctly:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ZenBooker API is running",
  "database": "Connected",
  "timestamp": "2025-01-21T10:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Errors**
   - Verify `FRONTEND_URL` in `.env`
   - Check CORS configuration in `server.js`

3. **JWT Authentication Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration settings

4. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill existing process on port 5000

### Logs

Check server logs for detailed error information:
```bash
tail -f logs/app.log
```

## Production Deployment

### Recommended Setup

1. **Use a Process Manager**
   ```bash
   npm install -g pm2
   pm2 start server.js --name zenbooker-backend
   ```

2. **Set Up Reverse Proxy**
   - Configure Nginx or Apache
   - Set up SSL certificates
   - Configure domain routing

3. **Database Optimization**
   - Enable MySQL query caching
   - Set up database backups
   - Configure connection pooling

4. **Security Measures**
   - Use HTTPS only
   - Implement rate limiting
   - Set up firewall rules
   - Regular security updates

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=zenbooker
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

## Support

For technical support or questions regarding the backend setup, please contact your development team.

---

**Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team 