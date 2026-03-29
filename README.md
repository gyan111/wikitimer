# Wiki Timer

A Vue.js application for tracking Wikimedia events and deadlines.

## Prerequisites

Before installation, ensure you have the following installed:
- Node.js (v16 or higher)
- MariaDB
- Bun (optional, but recommended)

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd wiki-timer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a new MariaDB database
   - Create a table for timers:
   ```sql
   CREATE TABLE timers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     type VARCHAR(50) NOT NULL,
     name VARCHAR(255) NOT NULL,
     link VARCHAR(255) NOT NULL,
     time DATETIME NOT NULL,
     region VARCHAR(100) NOT NULL,
     country VARCHAR(100) NOT NULL,
     timeZone VARCHAR(50) NOT NULL,
     logo VARCHAR(255)
   );
   ```

4. Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name

   # Authentication
   JWT_SECRET=your_jwt_secret
   SESSION_COOKIE_SECRET=your_session_secret

   # Wikimedia OAuth (if using authentication)
   WIKI_CLIENT_ID=your_wiki_client_id
   WIKI_CLIENT_SECRET=your_wiki_client_secret

   # Application Settings
   PORT=3000
   CLIENT_URL=http://localhost:5173
   ```

## Running the Application

1. Start the frontend development server:
   ```bash
   npm run dev
   ```

2. Start the backend server (choose one):
   ```bash
   # Using Bun (recommended)
   npm run start:server

   # OR using Node.js
   npm run start
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run start:server` - Start backend server using Bun
- `npm run start` - Install dependencies, build frontend, and start Node.js server

## Authentication Setup

If you plan to use authentication features:

1. Create an OAuth2 application on Wikimedia:
   - Go to https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration
   - Set callback URL to: http://localhost:3000/auth/mediawiki/callback
   - Copy Client ID and Secret to your `.env` file

2. Ensure all authentication environment variables are set in `.env`

## Troubleshooting

### Common Issues

1. Database Connection Errors:
   - Verify MariaDB is running
   - Check database credentials in `.env`
   - Ensure database and tables are created

2. Port Conflicts:
   - Ensure ports 3000 and 5173 are available
   - Change ports in `.env` if needed

3. Authentication Issues:
   - Verify OAuth2 credentials
   - Check callback URL configuration
   - Clear browser cookies
   - Check server logs for specific errors

### Debug Logs

To enable detailed logging:
1. Set `DEBUG=true` in `.env`
2. Check browser console for frontend logs
3. Check terminal for backend logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.
