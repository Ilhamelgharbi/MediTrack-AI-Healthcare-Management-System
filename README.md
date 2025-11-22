# 🏥 MediTrack AI - Healthcare Management System

A full-stack healthcare management application with AI-powered medication tracking, patient management, and health monitoring.

## 📋 Project Overview

**MediTrack AI** is a comprehensive healthcare platform designed for managing patient records, medication schedules, and health monitoring with role-based access control.

### 🎯 Key Features

- **Authentication System**: JWT-based authentication with role-based access control (Admin & Patient roles)
- **Patient Management**: Complete patient profile management with medical history, allergies, and medications
- **Role-Based Access**: Admins manage all patients, patients access their own data
- **Automatic Patient Assignment**: New patients are automatically assigned to the first admin
- **Secure Backend**: FastAPI with SQLAlchemy ORM, bcrypt password hashing
- **Modern Frontend**: React 19 with TypeScript, Tailwind CSS
- **Email Validation**: Gmail-only authentication (@gmail.com)

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: JWT tokens, OAuth2 password flow
- **Password Security**: bcrypt hashing
- **Validation**: Pydantic schemas
- **Testing**: pytest with 12/12 tests passing

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **HTTP Client**: Fetch API

## 📁 Project Structure

```
meditrack-ai/
├── backend/
│   ├── app/
│   │   ├── auth/              # Authentication module
│   │   │   ├── models.py      # User model with RoleEnum
│   │   │   ├── routes.py      # Login, register, /me endpoints
│   │   │   ├── schemas.py     # Pydantic validation schemas
│   │   │   ├── services.py    # Business logic & user management
│   │   │   └── utils.py       # JWT, password hashing utilities
│   │   ├── patients/          # Patient management module
│   │   │   ├── models.py      # Patient model with medical fields
│   │   │   ├── routes.py      # CRUD endpoints with role guards
│   │   │   ├── schemas.py     # Patient validation schemas
│   │   │   └── services.py    # Patient business logic
│   │   ├── database/          # Database configuration
│   │   │   ├── db.py          # SQLAlchemy setup
│   │   │   └── init_db.py     # Database initialization
│   │   └── config/            # Application settings
│   ├── tests/                 # Unit & integration tests
│   │   ├── test_auth.py       # Auth tests (12 passing)
│   │   └── patients/
│   ├── main.py                # FastAPI application entry
│   └── requirements.txt       # Python dependencies
│
└── meditrack-frontend/
    ├── features/              # Feature modules
    │   ├── auth/             # Login & registration
    │   ├── dashboard/        # Patient & admin dashboards
    │   ├── patients/         # Patient management UI
    │   └── profile/          # User profile
    ├── context/              # React Context providers
    │   └── AuthContext.tsx   # Authentication state
    ├── components/           # Reusable UI components
    ├── services/             # API service layer
    ├── App.tsx              # Main routing & route guards
    └── types.ts             # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```powershell
cd backend
```

2. **Install dependencies**
```powershell
python -m pip install -r requirements.txt
```

3. **Run the server**
```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

4. **Access API Documentation**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. **Navigate to frontend directory**
```powershell
cd meditrack-frontend
```

2. **Install dependencies**
```powershell
npm install
```

3. **Run development server**
```powershell
npm run dev
```

4. **Access Application**
- Frontend: http://localhost:5173

## 🔐 Default Credentials

The system initializes with a default admin account:

- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: Admin

## 🧪 Testing

### Run Backend Tests
```powershell
cd backend
python -m pytest tests/test_auth.py -v
```

**Test Coverage**: 12/12 authentication tests passing ✅
- User registration (patient & admin)
- Email validation & duplicate checks
- Password validation
- Login flow with JWT tokens
- Token verification
- Protected endpoint access

## 🔌 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login & get JWT token | No |
| GET | `/auth/me` | Get current user info | Yes |

### Patients (`/patients`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/patients/` | Get all patients | Yes | Admin |
| GET | `/patients/{id}` | Get patient by ID | Yes | Admin |
| GET | `/patients/me/profile` | Get own profile | Yes | Patient |
| PUT | `/patients/me/profile` | Update own profile | Yes | Patient |
| PUT | `/patients/{id}/admin-update` | Admin update patient | Yes | Admin |

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `full_name`: User's full name
- `email`: Unique email (Gmail only)
- `phone`: Phone number (optional)
- `password_hash`: bcrypt hashed password
- `role`: Enum (admin, patient)
- `date_created`: Timestamp

### Patients Table
- `id`: Primary key
- `user_id`: Foreign key → users.id (one-to-one)
- `assigned_admin_id`: Foreign key → users.id (many-to-one)
- `date_of_birth`: Patient DOB
- `gender`: Enum (male, female, other)
- `blood_type`: Blood type (A+, B+, O-, etc.)
- `height`: Height in cm
- `weight`: Weight in kg
- `status`: Enum (stable, critical, under_observation)
- `medical_history`: Text field
- `allergies`: Text field
- `current_medications`: Text field
- `created_at`, `updated_at`: Timestamps

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ bcrypt password hashing with salt rounds
- ✅ Role-based access control (RBAC)
- ✅ Email validation (Gmail only)
- ✅ Password minimum length (6 characters)
- ✅ Protected API endpoints
- ✅ CORS configuration for frontend
- ✅ Token expiration (24 hours default)

## 🎨 Frontend Features

### Authentication
- Login page with Gmail validation
- Registration with role selection (admin/patient)
- JWT token storage in localStorage
- Automatic token refresh on page load
- Role-based redirects after login

### Route Protection
- `ProtectedRoute`: Requires authentication
- `AdminRoute`: Requires admin role → redirects patients to `/dashboard`
- `PatientRoute`: Requires patient role → redirects admins to `/patients`

### Role-Based Navigation
- **Admin Dashboard** (`/patients`): View and manage all assigned patients
- **Patient Dashboard** (`/dashboard`): Personal health overview and medication tracking

## 🐛 Known Issues & Limitations

- ⚠️ bcrypt version warning (harmless, doesn't affect functionality)
- ⚠️ SQLAlchemy deprecation warnings (planned upgrade to 2.0)
- 📝 Frontend patient management UI in progress
- 📝 Medication tracking features planned
- 📝 Real-time notifications not implemented

## 📝 Environment Variables

### Backend (`.env`)
```env
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./meditrack.db
```

### Frontend (`.env`)
```env
VITE_BACKEND_URL=http://localhost:8000
```

## 🤝 Contributing

This is a student project. Contributions are welcome!

### Development Workflow
1. Create feature branch
2. Make changes
3. Run tests: `pytest tests/ -v`
4. Ensure all tests pass
5. Commit with descriptive message
6. Push to GitHub

## 📄 License

This project is for educational purposes.

## 🚦 Project Status

### ✅ Completed
- [x] User authentication (register, login, JWT)
- [x] Patient model with medical fields
- [x] Role-based access control
- [x] Automatic patient-admin assignment
- [x] Backend API tests (12/12 passing)
- [x] Frontend authentication flow
- [x] Gmail-only email validation
- [x] Protected routes with role guards
- [x] Database initialization with admin user

### 🔄 In Progress
- [ ] Frontend patient management UI
- [ ] Admin dashboard with patient list
- [ ] Patient profile editing interface

### 📋 Planned
- [ ] Medication tracking module
- [ ] Reminder system
- [ ] AI-powered health insights
- [ ] Appointment scheduling
- [ ] Medical report uploads
- [ ] Real-time chat between patients and admins

## 📞 Support

For issues or questions, check the API documentation at http://localhost:8000/docs

---

**Last Updated**: November 22, 2025  
**Version**: 1.0.0-beta  
**Status**: Ready for GitHub push ✅
