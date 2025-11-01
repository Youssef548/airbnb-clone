# Airbnb Clone - Documentation

Welcome to the Airbnb Clone documentation! This directory contains all project documentation organized by topic.

## 📁 Documentation Structure

```
docs/
├── README.md (you are here)
├── development/     # Development guides and setup
├── testing/         # Testing strategies and plans
└── bugs/           # Known issues and bug reports
```

## 📚 Quick Navigation

### Development Documentation

- **[Claude Guide](./development/CLAUDE_GUIDE.md)** - Comprehensive guide for Claude Code instances working on this project
  - Project architecture
  - Development commands
  - Git workflow best practices
  - Database schema
  - Authentication & authorization patterns

### Testing Documentation

- **[Testing Plan](./testing/TESTING_PLAN.md)** - Comprehensive testing strategy
  - Current test coverage (~90%)
  - Priority 1 critical tests (booking conflicts, date filtering)
  - Implementation roadmap
  - Coverage goals and metrics

### Bug Reports

- **[Known Bugs](./bugs/BUGS_FOUND.md)** - Documented bugs discovered through testing
  - Bug #1: Booking conflict detection - Adjacent bookings issue
  - Impact analysis and proposed fixes

## 🚀 Getting Started

1. **For Development**: Start with [Claude Guide](./development/CLAUDE_GUIDE.md)
2. **For Testing**: Read [Testing Plan](./testing/TESTING_PLAN.md)
3. **For Bug Fixes**: Check [Known Bugs](./bugs/BUGS_FOUND.md)

## 📊 Project Overview

**Tech Stack:**

- Frontend: React 18 + Vite + TypeScript + Zustand
- Backend: Express + TypeScript + MongoDB + Mongoose
- Testing: Vitest + Supertest
- Package Manager: pnpm

**Current Status:**

- ✅ 73 unit tests passing
- ✅ ~90% service layer coverage
- ✅ Critical business logic tested
- 🐛 1 known bug documented

## 🤝 Contributing

When adding new documentation:

1. Place files in the appropriate subdirectory
2. Update this README with links
3. Follow markdown best practices
4. Keep documentation up-to-date with code changes

## 📝 Documentation Standards

- Use clear, descriptive titles
- Include code examples where helpful
- Keep documentation synchronized with code
- Document bugs as they're discovered
- Update testing plans after implementation
