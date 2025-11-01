# Git Workflow Guide - Airbnb Clone Project

This document outlines the git-flow workflow we follow for this project.

## Branch Strategy

### Main Branches
- **`airbnb-v2`** - Main development branch (default)
- **`main`** - Production-ready code (legacy, not actively used)

### Supporting Branches

#### Feature Branches
- **Naming**: `feature/<phase>-<brief-description>`
- **Purpose**: Develop new features or enhancements
- **Lifetime**: Temporary, deleted after merge
- **Branch from**: `airbnb-v2`
- **Merge into**: `airbnb-v2`

**Examples**:
- `feature/phase1-security-logging-docs`
- `feature/phase2-reviews-system`
- `feature/phase3-payment-integration`

#### Bugfix Branches
- **Naming**: `bugfix/<issue-description>`
- **Purpose**: Fix bugs found in development
- **Branch from**: `airbnb-v2`
- **Merge into**: `airbnb-v2`

**Examples**:
- `bugfix/fix-booking-date-validation`
- `bugfix/cors-origin-parsing`

#### Hotfix Branches
- **Naming**: `hotfix/<critical-fix>`
- **Purpose**: Emergency fixes for production
- **Branch from**: `airbnb-v2` (or `main` if in production)
- **Merge into**: Both `airbnb-v2` and `main`

#### Release Branches
- **Naming**: `release/v<major>.<minor>.<patch>`
- **Purpose**: Prepare for production release
- **Branch from**: `airbnb-v2`
- **Merge into**: `main` and back to `airbnb-v2`

**Examples**:
- `release/v1.0.0`
- `release/v1.1.0`

## Commit Message Convention

We follow **Conventional Commits** specification.

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes
- **ci**: CI/CD configuration changes

### Examples

**Feature commit**:
```bash
git commit -m "feat: add user profile management API

- Add GET /api/users/profile endpoint
- Add PATCH /api/users/profile endpoint
- Add avatar upload functionality
- Implement password change endpoint

Closes #123"
```

**Fix commit**:
```bash
git commit -m "fix: resolve booking date overlap validation

The booking overlap check was not accounting for same-day
check-in/check-out. Updated logic to properly handle edge cases.

Fixes #456"
```

**Documentation commit**:
```bash
git commit -m "docs: update API documentation for auth endpoints

- Add authentication examples
- Document error responses
- Update Swagger schemas"
```

## Workflow Steps

### 1. Starting New Work

```bash
# Update local main branch
git checkout airbnb-v2
git pull origin airbnb-v2

# Create feature branch
git checkout -b feature/phase2-reviews-system
```

### 2. Making Changes

```bash
# Make your changes
# Stage related changes together
git add <files>

# Commit with conventional message
git commit -m "feat: implement reviews API endpoints

- Add POST /api/reviews endpoint
- Add GET /api/reviews endpoint
- Add review validation schemas
- Add review service layer

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Keeping Branch Updated

```bash
# Regularly sync with main branch
git checkout airbnb-v2
git pull origin airbnb-v2
git checkout feature/phase2-reviews-system
git rebase airbnb-v2
```

### 4. Pushing Changes

```bash
# Push feature branch to remote
git push -u origin feature/phase2-reviews-system

# For subsequent pushes
git push
```

### 5. Creating Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select base: `airbnb-v2`, compare: `feature/phase2-reviews-system`
4. Fill in PR template:
   - **Title**: Clear, descriptive (follows commit convention)
   - **Description**: What, why, how
   - **Screenshots**: If UI changes
   - **Testing**: How to test
   - **Checklist**: All items checked

### 6. After PR Approval

```bash
# Squash and merge via GitHub UI
# Delete feature branch after merge

# Update local
git checkout airbnb-v2
git pull origin airbnb-v2
git branch -d feature/phase2-reviews-system
```

## Best Practices

### Commits
- ✅ Make atomic commits (one logical change per commit)
- ✅ Write descriptive commit messages
- ✅ Commit related changes together
- ✅ Test before committing
- ❌ Don't commit commented-out code
- ❌ Don't commit debug statements
- ❌ Don't mix unrelated changes

### Branches
- ✅ Create branch for each feature/fix
- ✅ Keep branches short-lived
- ✅ Rebase regularly to avoid conflicts
- ✅ Delete branches after merge
- ❌ Don't work directly on `airbnb-v2`
- ❌ Don't commit directly to `main`

### Pull Requests
- ✅ Keep PRs focused and small
- ✅ Write clear descriptions
- ✅ Respond to review comments
- ✅ Ensure CI passes
- ❌ Don't submit WIP PRs (use draft if needed)
- ❌ Don't force-push after review starts

## Phase-Based Development

For this project, we organize work by phases:

### Phase 1: Foundation & Security ✅ COMPLETE
Branch: `feature/phase1-security-logging-docs`
- Security middleware (helmet, rate limiting, sanitization)
- Logging infrastructure (Winston, Morgan)
- Documentation (Swagger, README)
- Graceful shutdown

### Phase 2: Critical Features
Branch: `feature/phase2-critical-features`
- Reviews & ratings system
- User profile management
- Image upload system

### Phase 3: Advanced Features
Branch: `feature/phase3-advanced-features`
- Payment integration (Stripe)
- Enhanced search & filters
- Email notifications

### Phase 4: Testing & Quality
Branch: `feature/phase4-testing-quality`
- Expand test coverage
- Frontend testing
- E2E tests

### Phase 5: Polish & Optimization
Branch: `feature/phase5-polish-optimization`
- Performance optimization
- UX improvements
- Accessibility
- SEO

### Phase 6: Deployment
Branch: `feature/phase6-deployment`
- Production deployment
- Monitoring setup
- Final testing

### Phase 7: Portfolio Presentation
Branch: `feature/phase7-portfolio`
- Documentation polish
- Demo materials
- Portfolio integration

## Commit Grouping Strategy

Group related changes into logical commits:

**Example from Phase 1**:
1. `fix: update .gitignore files` - Security fix
2. `feat: add security dependencies` - Dependencies
3. `feat: implement Winston logger` - New utility
4. `feat: implement security middleware` - Core feature
5. `refactor: replace console.log with logger` - Code improvement
6. `feat: add Swagger documentation` - Documentation feature
7. `docs: update .env.example` - Configuration docs
8. `docs: create comprehensive README` - Project docs
9. `docs: add PROGRESS tracking` - Process docs

## Emergency Procedures

### Reverting a Commit
```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>
```

### Fixing Last Commit Message
```bash
# Before pushing
git commit --amend -m "new message"

# If already pushed (avoid if possible)
git commit --amend -m "new message"
git push --force-with-lease
```

### Recovering Deleted Branch
```bash
# Find commit hash
git reflog

# Recreate branch
git checkout -b feature/recovered-branch <commit-hash>
```

## Tools & Commands

### Useful Git Commands
```bash
# View commit history
git log --oneline --graph --decorate

# View changes in working directory
git diff

# View staged changes
git diff --cached

# View changes in a commit
git show <commit-hash>

# Search commits
git log --grep="search term"

# View file history
git log --follow <file>

# Undo unstaged changes
git restore <file>

# Unstage file
git restore --staged <file>

# Clean untracked files
git clean -fd
```

### Git Aliases (Optional)
Add to `~/.gitconfig`:
```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = restore --staged
    last = log -1 HEAD
    visual = log --oneline --graph --decorate --all
    amend = commit --amend --no-edit
```

## Questions?

- Check existing commits for examples
- Review PROGRESS.md for current focus
- Consult this document for workflow
- Ask before force-pushing or rebasing shared branches

---

**Remember**: Good git hygiene makes collaboration easier and project history clearer!
