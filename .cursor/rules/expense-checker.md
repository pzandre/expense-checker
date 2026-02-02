# Expense Checker Project Rules

## Monorepo Structure

- `backend/` - Django API application
- `mobile/` - React Native Expo application
- Keep backend and mobile as separate, independent applications
- Shared configuration files (README, .gitignore) at root level

## Python/Django Standards

### Code Style
- Follow PEP8 strictly
- Use `ruff` for linting and formatting
- Maximum line length: 88 characters (Black default)
- Use type hints where appropriate
- Follow clean code principles: single responsibility, DRY, meaningful names

### Django Patterns
- Use Django REST Framework ViewSets for API endpoints
- Use ModelViewSet for CRUD operations
- Use serializers for data validation and transformation
- Keep views thin, business logic in models or service classes
- Use Django's built-in User model for authentication
- All API routes require authentication (except health check endpoints)

### Model Conventions
- Use descriptive model names (ExpenseCategory, not Category)
- Include `created_at` and `updated_at` timestamps where appropriate
- Use ForeignKey relationships with `on_delete` explicitly set
- Use DecimalField for monetary amounts with appropriate precision

### API Conventions
- RESTful URL patterns: `/api/{resource}/` for list, `/api/{resource}/{id}/` for detail
- Use HTTP status codes appropriately (200, 201, 400, 401, 404, 500)
- Return consistent JSON response formats
- Use query parameters for filtering (e.g., `?category=1&date_from=2024-01-01`)

## React Native/Expo Standards

### Code Style
- Use TypeScript for all files
- Follow React best practices: functional components, hooks
- Use Expo Router file-based routing
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Structure
- `app/` - Expo Router pages and layouts
- `components/` - Reusable UI components
- `services/` - API clients and external services
- Use kebab-case for file names (expense-form.tsx)
- Use PascalCase for component names (ExpenseForm)

### Component Patterns
- Use functional components with hooks
- Extract form logic into reusable form components
- Use Context API or Zustand for global state management
- Handle loading and error states consistently
- Use TypeScript interfaces for props and API responses

### API Integration
- Use axios for HTTP requests
- Store JWT tokens in expo-secure-store
- Implement token refresh on 401 errors
- Use interceptors for adding auth headers
- Handle network errors gracefully

### Chart Libraries
- Use `react-native-chart-kit` or `victory-native` for visualizations
- Keep chart components in `components/charts/`
- Make charts responsive and accessible
- Provide fallback UI when data is empty

## Authentication Flow

1. User logs in via `/api/auth/login/` with username/password
2. API returns JWT access token and refresh token
3. Mobile app stores tokens in secure storage
4. All subsequent requests include `Authorization: Bearer {token}` header
5. On 401 response, attempt token refresh using refresh token
6. If refresh fails, redirect to login

## Testing Approach

- Backend: Use Django's TestCase for unit and integration tests
- Mobile: Use Jest and React Native Testing Library for component tests
- Focus on critical paths: authentication, CRUD operations, data filtering

## Git Conventions

- Use descriptive commit messages
- Keep commits focused on single features/fixes
- Update README when adding new features or dependencies
