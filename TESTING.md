# HRIS Testing Guide

## Overview

The HRIS application includes comprehensive testing for both backend and frontend. This guide covers how to run tests, write new tests, and understand the testing infrastructure.

## Table of Contents

- [Quick Start](#quick-start)
- [Backend Tests](#backend-tests)
- [Frontend Tests](#frontend-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [Continuous Integration](#continuous-integration)

## Quick Start

### Run All Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Run Tests in Watch Mode

```bash
# Backend
cd backend
npm run test:watch

# Frontend
cd frontend
npm test  # Vitest runs in watch mode by default
```

### Generate Coverage Reports

```bash
# Backend
cd backend
npm run test:cov

# Frontend
cd frontend
npm run test:coverage
```

## Backend Tests

The backend uses **Jest** as the testing framework with NestJS testing utilities.

### Test Structure

```
backend/
├── src/
│   └── modules/
│       ├── auth/
│       │   └── auth.service.spec.ts          # Unit tests
│       └── employees/
│           └── employees.service.spec.ts     # Unit tests
├── test/
│   ├── auth.e2e-spec.ts                      # E2E tests
│   └── jest-e2e.json                         # E2E config
└── jest.config.js                             # Main config
```

### Available Test Commands

```bash
cd backend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test auth.service.spec.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should validate user"

# Run tests for a specific module
npm test modules/auth
```

### Backend Test Examples

#### Unit Test Example (Service)

```typescript
// employees.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesService],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all employees', async () => {
    const result = await service.findAll();
    expect(result).toBeInstanceOf(Array);
  });
});
```

#### E2E Test Example (API)

```typescript
// auth.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Authentication', () => {
  let app;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/api/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@hris.com', password: 'admin123' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Backend Testing Best Practices

1. **Mock External Dependencies**
   - Always mock database repositories
   - Mock external services (email, SMS, etc.)
   - Use Jest's mocking capabilities

2. **Test Business Logic**
   - Focus on service layer
   - Test edge cases and error handling
   - Validate data transformations

3. **E2E Tests for Critical Paths**
   - Authentication flow
   - CRUD operations
   - Permission checks

4. **Keep Tests Fast**
   - Unit tests should be < 100ms
   - E2E tests should be < 5 seconds
   - Use test databases or mocks

## Frontend Tests

The frontend uses **Vitest** with **React Testing Library**.

### Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.test.tsx           # Component tests
│   ├── pages/
│   │   └── Login.test.tsx            # Page tests
│   └── test/
│       └── setup.ts                  # Test setup
└── vitest.config.ts                  # Vitest config
```

### Available Test Commands

```bash
cd frontend

# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm test run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test Login.test.tsx

# Run tests matching a pattern
npm test -- --grep "login"

# Run all component tests
npm test components/
```

### Frontend Test Examples

#### Component Test Example

```typescript
// Layout.test.tsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Layout';

describe('Layout', () => {
  it('renders navigation items', () => {
    render(
      <BrowserRouter>
        <Layout>
          <div>Content</div>
        </Layout>
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });
});
```

#### User Interaction Test

```typescript
// Login.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

describe('Login', () => {
  it('allows user to type credentials', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });
});
```

### Frontend Testing Best Practices

1. **Test User Behavior**
   - Focus on what users see and do
   - Avoid testing implementation details
   - Use accessible queries (getByRole, getByLabelText)

2. **Mock API Calls**
   - Use MSW (Mock Service Worker) for API mocking
   - Mock React Query hooks when needed
   - Keep mocks simple and focused

3. **Test Accessibility**
   - Ensure elements are accessible
   - Use semantic HTML
   - Test keyboard navigation

4. **Snapshot Tests Sparingly**
   - Only for stable components
   - Review snapshot changes carefully
   - Keep snapshots small

## Test Coverage

### View Coverage Reports

#### Backend Coverage

```bash
cd backend
npm run test:cov
```

Opens HTML report in `backend/coverage/lcov-report/index.html`

#### Frontend Coverage

```bash
cd frontend
npm run test:coverage
```

Opens HTML report in `frontend/coverage/index.html`

### Coverage Goals

| Area | Goal | Current |
|------|------|---------|
| Backend Services | > 80% | Setup Complete |
| Backend Controllers | > 70% | Setup Complete |
| Frontend Components | > 70% | Setup Complete |
| Frontend Pages | > 60% | Setup Complete |

## Writing Tests

### Backend Test Template

```typescript
// feature.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeatureService } from './feature.service';
import { Entity } from '../../entities/entity.entity';

describe('FeatureService', () => {
  let service: FeatureService;
  let repository: any;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: getRepositoryToken(Entity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    repository = module.get(getRepositoryToken(Entity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of entities', async () => {
      const mockData = [{ id: '1', name: 'Test' }];
      mockRepository.find.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(result).toEqual(mockData);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
```

### Frontend Test Template

```typescript
// Feature.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Feature from './Feature';

// Mock dependencies
vi.mock('./dependency', () => ({
  useDependency: () => ({ data: 'mock' }),
}));

describe('Feature Component', () => {
  it('renders correctly', () => {
    render(<Feature />);
    expect(screen.getByText('Feature')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<Feature onClick={handleClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm test run
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Troubleshooting

### Backend Issues

**Problem:** Tests timeout
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

**Problem:** Database connection errors
```bash
# Use test database or mock repositories
# Configure test environment in jest.config.js
```

**Problem:** Module not found
```bash
# Clear Jest cache
npm test -- --clearCache
```

### Frontend Issues

**Problem:** Component not rendering
```bash
# Check if you're using BrowserRouter wrapper
# Ensure all providers are wrapped correctly
```

**Problem:** Can't find element
```bash
# Use screen.debug() to see rendered HTML
# Check query selectors (getByRole, getByLabelText)
```

**Problem:** Async tests failing
```bash
# Use waitFor from @testing-library/react
# Check if promises are resolved
```

## Testing Checklist

Before committing code, ensure:

- [ ] All tests pass (`npm test`)
- [ ] New features have tests
- [ ] Coverage doesn't decrease
- [ ] Tests are meaningful (not just for coverage)
- [ ] Mocks are properly cleaned up
- [ ] No skipped tests (`.skip`)
- [ ] No focused tests (`.only`)

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Best Practices
- [Testing Best Practices](https://testingjavascript.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Example Test Runs

### Successful Backend Test Run

```bash
$ npm test

 PASS  src/modules/auth/auth.service.spec.ts
 PASS  src/modules/employees/employees.service.spec.ts

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        3.245 s
```

### Successful Frontend Test Run

```bash
$ npm test run

 ✓ src/components/Layout.test.tsx (5)
 ✓ src/pages/Login.test.tsx (5)

Test Files  2 passed (2)
Tests  10 passed (10)
Duration  1.24s
```

## Next Steps

1. **Increase Coverage** - Add tests for untested files
2. **E2E Tests** - Add more end-to-end scenarios
3. **Performance Tests** - Add load testing
4. **Visual Regression** - Add screenshot comparison
5. **Integration Tests** - Add more API integration tests

## Support

For testing questions or issues:
- Check this documentation
- Review example test files
- Open a GitHub issue
- Consult team members

Happy testing! 🧪
