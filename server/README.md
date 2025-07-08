# ZenBooker Backend API

A consolidated Express.js backend for the ZenBooker application following a single-file structure pattern.

## Features

- **Single File Structure**: All API endpoints and logic contained in `server.js`
- **MySQL Database**: Uses MySQL2 for database operations
- **RESTful API**: Complete CRUD operations for all entities
- **CORS Enabled**: Cross-origin requests supported
- **Environment Configuration**: Uses dotenv for configuration

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Services
- `GET /api/services` - Get all services for a user
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service

### Jobs
- `GET /api/jobs` - Get all jobs for a user
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/:id` - Update a job

### Customers
- `GET /api/customers` - Get all customers for a user
- `POST /api/customers` - Create a new customer

### Team Members
- `GET /api/team` - Get all team members for a user
- `POST /api/team` - Create a new team member

### Estimates
- `GET /api/estimates` - Get all estimates for a user
- `POST /api/estimates` - Create a new estimate

### Health Check
- `GET /api/health` - API health status

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Create a MySQL database
   - Import the schema from `database.sql`
   - Create a `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=zenbooker
   DB_PORT=3306
   PORT=5000
   ```

3. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Schema

The application uses the following main tables:
- `users` - User accounts and business information
- `services` - Services offered by the business
- `customers` - Customer information
- `team_members` - Team member information
- `jobs` - Job bookings and scheduling
- `estimates` - Service estimates
- `invoices` - Billing and invoicing
- `territories` - Service areas and territories

## API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": {...}
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Development Notes

- All database operations use parameterized queries to prevent SQL injection
- Error handling is implemented for all endpoints
- The server includes CORS middleware for frontend integration
- Database connections are properly managed and closed after each operation 