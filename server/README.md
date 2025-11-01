# 🏠 Airbnb Clone - Backend API

A production-ready RESTful API for an Airbnb clone application, built with Node.js, Express, TypeScript, and MongoDB. Features comprehensive authentication, listings management, booking system, and favorites functionality.

[![Build Status](https://github.com/yourusername/airbnb-clone/workflows/CI/badge.svg)](https://github.com/yourusername/airbnb-clone/actions)
[![Test Coverage](https://codecov.io/gh/yourusername/airbnb-clone/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/airbnb-clone)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- 🔐 **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Guest/Host)
  - Password hashing with bcrypt
  - Secure session management

- 🏡 **Listings Management**
  - Create, read, update, and delete listings
  - Advanced filtering (location, dates, capacity, category)
  - Image upload support (Cloudinary integration)
  - Availability checking against bookings

- 📅 **Booking System**
  - Create and manage reservations
  - Date conflict detection
  - Automatic price calculation
  - Cancellation functionality
  - Separate views for guests and hosts

- ❤️ **Favorites**
  - Add/remove listings to favorites
  - Retrieve user's favorite listings
  - Real-time updates

### Production Features
- 🛡️ **Enterprise-Grade Security**
  - Helmet.js security headers
  - Rate limiting (general + auth-specific)
  - NoSQL injection protection
  - CORS with origin whitelist
  - Request size limits
  - Input validation with Zod schemas

- 📊 **Monitoring & Logging**
  - Winston logger with file rotation
  - Morgan HTTP request logging
  - Health check endpoint
  - Error tracking ready (Sentry integration)
  - Graceful shutdown handling

- 📚 **Documentation**
  - Swagger/OpenAPI 3.0 documentation
  - Interactive API explorer
  - Comprehensive endpoint descriptions

- ✅ **Testing**
  - 98 unit tests (90%+ coverage)
  - Integration tests for all endpoints
  - Automated test database setup
  - CI/CD pipeline with GitHub Actions

## 🛠️ Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs

### Libraries & Tools
- **Validation**: Zod schemas
- **Logging**: Winston + Morgan
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize
- **Documentation**: Swagger UI Express + swagger-jsdoc
- **Testing**: Vitest + Supertest
- **Build Tools**: tsx, TypeScript compiler
- **Package Manager**: pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- MongoDB instance (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/airbnb-clone.git
   cd airbnb-clone/server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#environment-variables))

4. **Start MongoDB**
   ```bash
   # Using Docker Compose (from server directory)
   sudo docker-compose up -d

   # Or use your local MongoDB instance
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   The API will be available at `http://localhost:3000`

6. **Access API Documentation**
   Open `http://localhost:3000/api-docs` in your browser

## 📖 API Documentation

### Interactive Documentation
Visit `http://localhost:3000/api-docs` for the full Swagger UI documentation.

### Quick Reference

#### Authentication Endpoints
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user (protected)
```

#### Listings Endpoints
```http
GET    /api/listings/        # Get all listings (with filters)
GET    /api/listings/:id     # Get single listing
POST   /api/listings/        # Create listing (host only)
DELETE /api/listings/:id     # Delete listing (owner only)
```

#### Bookings Endpoints
```http
GET    /api/booking/         # Get user's bookings
POST   /api/booking/         # Create booking
DELETE /api/booking/:id      # Cancel booking
```

#### Favorites Endpoints
```http
GET    /api/favorites/       # Get user's favorites
POST   /api/favorites/:id    # Add to favorites
DELETE /api/favorites/:id    # Remove from favorites
```

#### System Endpoints
```http
GET    /health               # Health check
GET    /api-docs             # API documentation
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── swagger.ts   # Swagger/OpenAPI config
│   ├── controllers/     # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── favorite.controller.ts
│   │   └── listing.controller.ts
│   ├── middleware/      # Custom middleware
│   │   ├── auth.middleware.ts       # JWT authentication
│   │   ├── error.middleware.ts      # Error handling
│   │   ├── rbac.middleware.ts       # Role-based access
│   │   └── validationFactory.middleware.ts
│   ├── models/          # Mongoose models
│   │   ├── User.model.ts
│   │   ├── Listing.model.ts
│   │   └── Booking.model.ts
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── listing.route.ts
│   │   ├── booking.route.ts
│   │   └── favorite.route.ts
│   ├── schemas/         # Zod validation schemas
│   │   ├── auth.schema.ts
│   │   ├── listing.schema.ts
│   │   └── booking.schema.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   ├── listing.service.ts
│   │   ├── booking.service.ts
│   │   └── favorite.service.ts
│   ├── utils/           # Utility functions
│   │   ├── error.ts     # Custom error classes
│   │   └── logger.ts    # Winston logger config
│   ├── types/           # TypeScript types
│   │   └── express.d.ts
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── tests/               # Test files
│   ├── unit/            # Unit tests (98 tests)
│   ├── integration/     # Integration tests
│   └── helpers/         # Test utilities
├── logs/                # Log files (gitignored)
├── .env.example         # Environment variables template
├── .gitignore
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Docker configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file in the server directory. See `.env.example` for all available options.

### Required Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/airbnb
TEST_DATABASE_URL=mongodb://localhost:27017/airbnb-test

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# CORS (JSON array format)
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

### Optional Variables (for advanced features)
```env
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Stripe Payments
STRIPE_SECRET_KEY=your-stripe-secret-key

# Redis Caching
REDIS_URL=your-redis-url

# Sentry Error Tracking
SENTRY_DSN=your-sentry-dsn
```

## 📜 Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:integration # Run integration tests only
pnpm test:coverage    # Run tests with coverage report
pnpm test:watch       # Run tests in watch mode
pnpm test:ui          # Open Vitest UI

# Build
pnpm build            # Build for production

# Docker
sudo docker-compose up -d      # Start MongoDB + app in Docker
sudo docker-compose down        # Stop Docker containers
sudo docker-compose logs -f app # View app logs
```

## ✅ Testing

### Test Coverage
- **Total Tests**: 98
- **Coverage**: 90%+ (lines, functions, branches)
- **Test Types**: Unit + Integration

### Running Tests

```bash
# All tests
pnpm test

# Unit tests only (service layer)
pnpm test:unit

# Integration tests (API endpoints)
pnpm test:integration

# With coverage report
pnpm test:coverage

# Watch mode for TDD
pnpm test:watch
```

### Test Structure
```
tests/
├── unit/
│   └── services/          # Service layer tests
│       ├── auth.service.test.ts (22 tests)
│       ├── booking.service.test.ts (17 tests)
│       ├── favorite.service.test.ts (25 tests)
│       └── listing.service.test.ts (14 tests)
├── integration/
│   ├── auth/              # Auth endpoint tests
│   ├── booking/           # Booking endpoint tests
│   ├── listing/           # Listing endpoint tests
│   └── favorite/          # Favorite endpoint tests
└── helpers/
    └── testHelpers.ts     # Test utilities
```

## 🚢 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   pnpm add -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables from `.env.example`

4. **Configure MongoDB Atlas**
   - Create a cluster on MongoDB Atlas
   - Whitelist Vercel IP addresses
   - Update `DATABASE_URL` in Vercel environment variables

### Docker Deployment

```bash
# Build image
docker build -t airbnb-clone-api .

# Run container
docker run -p 3000:3000 --env-file .env airbnb-clone-api
```

## 🛡️ Security

This API implements enterprise-grade security practices:

### Implemented Security Measures
- ✅ **Helmet.js**: Security headers (XSS, CSP, HSTS)
- ✅ **Rate Limiting**: 100 requests/15min (5 for auth endpoints)
- ✅ **NoSQL Injection Protection**: Input sanitization
- ✅ **CORS**: Origin whitelist validation
- ✅ **Request Size Limits**: 10MB max body size
- ✅ **Input Validation**: Zod schemas on all inputs
- ✅ **Password Security**: Bcrypt hashing (10 rounds)
- ✅ **JWT**: Secure token-based authentication
- ✅ **RBAC**: Role-based access control
- ✅ **Graceful Shutdown**: Proper cleanup on exit

### Security Best Practices
- Keep dependencies updated
- Use environment variables for secrets
- Enable HTTPS in production
- Regularly audit with `npm audit`
- Monitor logs for suspicious activity
- Implement rate limiting per user (not just IP)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and descriptive

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For issues, questions, or contributions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/airbnb-clone/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/airbnb-clone/discussions)
- **Email**: support@airbnb-clone.com

---

**Built with ❤️ using TypeScript, Express, and MongoDB**

🌟 Star this repo if you find it helpful!
