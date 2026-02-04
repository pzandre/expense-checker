# Expense Checker

A monorepo expense tracking application for tracking moving expenses with metrics and predictions. Built with Django REST API backend and React Native Expo mobile app.

## Project Structure

```
expense-checker/
├── backend/          # Django REST API
├── mobile/           # React Native Expo app (Android/Desktop)
└── README.md
```

## Backend Setup

### Option 1: Docker (Recommended)

**Prerequisites:**
- Docker
- Docker Compose

**Quick Start:**

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your settings (optional - defaults are provided):
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
POSTGRES_DATABASE=expense_checker
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

4. Start the services:
```bash
docker-compose up -d
```

5. Create a superuser (for Django shell access):
```bash
docker-compose exec web python manage.py createsuperuser
```

The API will be available at `http://localhost:8000/api/`

**Useful Docker Commands:**
```bash
# View logs
docker-compose logs -f web

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Run Django management commands
docker-compose exec web python manage.py <command>

# Access Django shell
docker-compose exec web python manage.py shell
```

### Option 2: Local Development

**Prerequisites:**
- Python 3.13+
- PostgreSQL
- pip

**Installation:**

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your database credentials and secret key.

6. Run migrations:
```bash
python manage.py migrate
```

7. Create a superuser (for Django shell access):
```bash
python manage.py createsuperuser
```

8. Start the development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

### API Endpoints

- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/expenses/` - List expenses (with filters)
- `POST /api/expenses/` - Create expense
- `GET /api/expenses/{id}/` - Get expense detail
- `PUT /api/expenses/{id}/` - Update expense
- `DELETE /api/expenses/{id}/` - Delete expense
- `GET /api/categories/` - List categories
- `POST /api/categories/` - Create category
- `GET /api/categories/{id}/` - Get category detail
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category
- `GET /api/reports/summary/` - Get summary report with filters

### Creating Users

Users are created via Django shell (no registration endpoint):

**With Docker:**
```bash
docker-compose exec web python manage.py shell
```

**Without Docker:**
```bash
python manage.py shell
```

Then in the shell:
```python
from django.contrib.auth.models import User
user = User.objects.create_user('username', 'email@example.com', 'password')
user.save()
```

## Mobile Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your device (for testing)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your API base URL (optional - defaults to `http://localhost:8000/api`):
```
API_BASE_URL=http://localhost:8000/api
```

**Note**: For production, you may need to update the API base URL in `mobile/services/api.ts` or configure it via `app.json` extra config.

5. Start the Expo development server:
```bash
npm start
```

6. Scan the QR code with Expo Go (Android) or Camera app (iOS)

### Running on Android/Desktop

**Quick Start:**
1. Ensure backend is running: `cd backend && docker-compose up -d`
2. Install dependencies: `cd mobile && npm install`
3. Configure API URL in `mobile/services/api.ts`:
   - Android Emulator: `http://10.0.2.2:8000/api`
   - Physical Device: `http://YOUR_LOCAL_IP:8000/api`
   - Web: `http://localhost:8000/api` (default)
4. Start Expo: `npm start`
5. Run on Android: `npm run android` or press `a` in Expo CLI
6. Run on Web: `npm run web`

**Detailed Instructions:** See `mobile/RUNNING.md` and `mobile/QUICK_START.md`

## Features

### Backend

- JWT authentication
- Dynamic expense categories
- Expense CRUD operations
- Filtering and search capabilities
- Summary reports with aggregations
- PostgreSQL database
- RESTful API design

### Mobile

- Expense list with pull-to-refresh
- Add/edit/delete expenses
- Dynamic category management
- Reports dashboard with:
  - Time series chart
  - Category doughnut chart
  - Bar chart (grouped by day/week/month)
- Date range filtering
- Category filtering
- Summary statistics

## Development

### Running Tests

**Backend Tests:**

With Docker:
```bash
cd backend
docker-compose exec web python manage.py test
```

Or run specific test files:
```bash
docker-compose exec web python manage.py test expenses.tests.test_expenses
docker-compose exec web python manage.py test expenses.tests.test_categories
docker-compose exec web python manage.py test expenses.tests.test_authentication
docker-compose exec web python manage.py test expenses.tests.test_reports
```

Without Docker:
```bash
cd backend
python manage.py test
```

### Code Standards

- **Backend**: Follow PEP8, use `ruff` for linting
- **Mobile**: TypeScript, React best practices
- See `.cursor/rules/expense-checker.md` for detailed conventions

### Environment Variables

**Backend** (`.env`):
- `SECRET_KEY` - Django secret key
- `DEBUG` - Debug mode (True/False)
- `ALLOWED_HOSTS` - Comma-separated hosts
- `POSTGRES_DATABASE` - PostgreSQL database name
- `POSTGRES_USER` - PostgreSQL user
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port

**Mobile** (`.env`):
- `API_BASE_URL` - Backend API base URL

## License

Private project
