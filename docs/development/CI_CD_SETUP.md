# CI/CD Setup Guide

## Overview

This project uses GitHub Actions for continuous integration and deployment with strict quality gates to ensure code quality and test coverage.

## Pipeline Architecture

### Workflow: `.github/workflows/ci.yml`

The CI/CD pipeline consists of 4 jobs that run sequentially:

```
┌─────────────┐     ┌─────────────┐
│    Test     │     │    Lint     │
│  Coverage   │     │ Type Check  │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
          ┌──────▼──────┐
          │    Build    │
          │ Verification│
          └──────┬──────┘
                 │
          ┌──────▼──────┐
          │ Deployment  │
          │    Gate     │
          └─────────────┘
```

## Jobs Breakdown

### 1. Test & Coverage Job

**Purpose**: Run all unit tests with coverage enforcement

**Key Features**:

- Runs on Ubuntu with MongoDB 7.0 service
- Executes: `pnpm run test:coverage`
- **Enforces coverage thresholds**:
  - Lines: ≥ 80%
  - Functions: ≥ 80%
  - Branches: ≥ 75%
  - Statements: ≥ 80%
- Uploads coverage to Codecov (optional)
- Archives coverage reports for 30 days

**Failure Conditions**:

- Any test fails
- Coverage below thresholds
- MongoDB connection issues

### 2. Lint & Type Check Job

**Purpose**: Ensure code quality and type safety

**Checks**:

- TypeScript type checking (`tsc --noEmit`)
- Prettier formatting validation
- Code style consistency

**Runs in parallel with**: Test job

### 3. Build Verification Job

**Purpose**: Verify the project builds successfully

**Dependencies**: Requires `test` and `lint` jobs to pass

**Actions**:

- Install dependencies
- Run build command
- Verify no build errors

### 4. Deployment Gate Job

**Purpose**: Final check before deployment

**Dependencies**: All previous jobs must pass

**Conditions**:

- Only runs on `airbnb-v2` or `main` branches
- Requires all jobs to succeed
- Provides deployment readiness summary

## Coverage Requirements

### Thresholds (Enforced in CI)

| Metric     | Threshold | Configured In         |
| ---------- | --------- | --------------------- |
| Lines      | 80%       | `vitest.config.ts:25` |
| Functions  | 80%       | `vitest.config.ts:26` |
| Branches   | 75%       | `vitest.config.ts:27` |
| Statements | 80%       | `vitest.config.ts:28` |

### Current Coverage Status

✅ **All thresholds met**

```
Service Coverage:
├─ Booking Service: 21 tests (~95% coverage)
├─ Listing Service: 30 tests (~90% coverage)
├─ Auth Service: 22 tests (~95% coverage)
└─ Favorite Service: 25 tests (~95% coverage)

Overall: 98 tests, ~90% coverage
```

## Deployment Blocking Rules

### CI Will Block Deployment If:

1. ❌ **Any test fails**
   - All 98 unit tests must pass
   - No exceptions

2. ❌ **Coverage drops below thresholds**
   - Lines < 80%
   - Functions < 80%
   - Branches < 75%
   - Statements < 80%

3. ❌ **Build fails**
   - TypeScript compilation errors
   - Build script errors

4. ❌ **Lint/Type errors**
   - TypeScript type errors
   - Prettier formatting issues

## Branch Protection Rules (Recommended)

To enforce CI checks on GitHub, configure branch protection:

### Settings → Branches → Add Rule

**Branch name pattern**: `airbnb-v2` or `main`

**Required status checks**:

- ✅ `Test & Coverage`
- ✅ `Lint & Type Check`
- ✅ `Build Verification`
- ✅ `Deployment Gate`

**Additional settings**:

- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

### Steps to Configure:

1. Go to: `https://github.com/YOUR_USERNAME/airbnb-clone/settings/branches`
2. Click "Add rule"
3. Enter branch name pattern: `airbnb-v2`
4. Enable: "Require status checks to pass before merging"
5. Search and select the 4 required checks
6. Click "Create"

## Running CI Locally

### Run Full CI Suite Locally

```bash
# Navigate to server directory
cd server

# Install dependencies
pnpm install

# Run tests with coverage
pnpm run test:coverage

# Type check
npx tsc --noEmit

# Format check
npx prettier --check "src/**/*.{js,ts,json}"

# Build
pnpm run build
```

### Quick Coverage Check

```bash
cd server
pnpm run test:coverage
```

Coverage report will be in `server/coverage/index.html`

## Environment Variables (CI)

The CI pipeline uses these environment variables:

```yaml
MONGODB_URI: mongodb://localhost:27017/airbnb-clone-test
JWT_SECRET: test-jwt-secret-key-for-ci
NODE_ENV: test
```

**Note**: These are test-only credentials, not production secrets.

## Codecov Integration (Optional)

To enable Codecov coverage reporting:

1. Sign up at [codecov.io](https://codecov.io)
2. Add repository to Codecov
3. Get the upload token
4. Add to GitHub Secrets:
   - Settings → Secrets → Actions → New repository secret
   - Name: `CODECOV_TOKEN`
   - Value: Your token from Codecov

The pipeline will automatically upload coverage reports.

## Troubleshooting

### Tests Failing in CI but Pass Locally

**Possible causes**:

- MongoDB version mismatch
- Environment variables not set
- Race conditions in parallel tests

**Solution**:

```bash
# Use same MongoDB version
docker run -p 27017:27017 mongo:7.0

# Set env vars
export MONGODB_URI=mongodb://localhost:27017/airbnb-clone-test
export JWT_SECRET=test-jwt-secret-key-for-ci
export NODE_ENV=test

# Run tests
pnpm run test:coverage
```

### Coverage Below Threshold

**Check which files need tests**:

```bash
pnpm run test:coverage
# Review coverage/index.html
```

**Add tests for uncovered code**:

- Focus on services with < 80% coverage
- Prioritize critical business logic
- See `docs/testing/TESTING_PLAN.md`

### Build Failing

**Common issues**:

- TypeScript errors: `npx tsc --noEmit`
- Missing dependencies: `pnpm install`
- Outdated lockfile: `pnpm install --frozen-lockfile`

## CI Workflow Triggers

### Automatic Triggers

- **Push** to `airbnb-v2` or `main` branches
- **Pull Request** to `airbnb-v2` or `main` branches

### Manual Trigger

Go to: Actions → CI/CD Pipeline → Run workflow

## Performance

**Typical CI Run Time**:

- Test & Coverage: ~25-30 seconds
- Lint & Type Check: ~10-15 seconds
- Build: ~5-10 seconds
- **Total: ~1-2 minutes**

## Artifacts

**Coverage Reports**:

- Stored for 30 days
- Download from Actions → Workflow run → Artifacts
- HTML, JSON, LCOV formats available

## Next Steps

1. ✅ Configure branch protection rules (see above)
2. ⚠️ (Optional) Set up Codecov for coverage tracking
3. ⚠️ (Optional) Add integration test job
4. ⚠️ (Optional) Add deployment job for staging/production

## References

- Test Plan: `docs/testing/TESTING_PLAN.md`
- Test Summary: `docs/testing/TESTING_SUMMARY.md`
- Vitest Config: `server/vitest.config.ts`
- CI Workflow: `.github/workflows/ci.yml`

---

**Last Updated**: 2025-11-01
**Status**: ✅ Active and enforcing quality gates
