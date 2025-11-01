# Airbnb Clone

A full-stack Airbnb clone built with React, Express, MongoDB, and TypeScript.

https://github.com/Youssef548/airbnb-clone/assets/84735296/c420c96d-9168-424c-a886-26f80da1f584

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers (MongoDB + Server + Client)
./dev.sh
```

**Servers:**

- 🔧 Backend API: http://localhost:3000
- 🌐 Frontend: http://localhost:5173
- 🗄️ MongoDB: localhost:27017

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs) directory:

- **[Development Guide](./docs/development/CLAUDE_GUIDE.md)** - Setup, architecture, and development workflow
- **[Testing Plan](./docs/testing/TESTING_PLAN.md)** - Comprehensive testing strategy
- **[Testing Summary](./docs/testing/TESTING_SUMMARY.md)** - Current test coverage and results
- **[Known Bugs](./docs/bugs/BUGS_FOUND.md)** - Documented issues and fixes

## 🧪 Testing

```bash
# Run all unit tests (73 tests)
cd server && pnpm run test:unit

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

**Current Status**: ✅ 73/73 tests passing (~90% coverage)

## 🛠️ Tech Stack

### Frontend

- React 18 + TypeScript
- Vite (build tool)
- Zustand (state management)
- React Hook Form + Zod (validation)
- Tailwind CSS

### Backend

- Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Zod (validation)

### Testing

- Vitest (test runner)
- Supertest (API testing)
- 73 unit tests with ~90% coverage

### DevOps

- pnpm (package manager)
- Docker (MongoDB)
- Husky + lint-staged (pre-commit hooks)
- Prettier (code formatting)

## 📁 Project Structure

```
airbnb-clone/
├── client/          # React frontend
├── server/          # Express backend
├── docs/            # 📚 Documentation
│   ├── development/ # Development guides
│   ├── testing/     # Testing docs
│   └── bugs/        # Bug reports
└── dev.sh           # Quick start script
```

## 🔐 Environment Variables

### Server (.env)

```env
PORT=3000
DATABASE_URL=mongodb://admin:secret@localhost:27017/airbnb?authSource=admin
TEST_DATABASE_URL=mongodb://admin:secret@localhost:27017/airbnb-test?authSource=admin
JWT_SECRET=your-secret-key
```

### Client (.env)

```env
VITE_BACKEND_URL=http://localhost:3000/api/
VITE_APP_CLODINARY_CLOUD_NAME=your-cloudinary-name
```

## 🤝 Contributing

1. Create feature branch following git-flow
2. Write tests for new features
3. Run `pnpm run format` before committing
4. Ensure all tests pass
5. Create PR with descriptive title

## 📄 License

This project is for educational purposes.
