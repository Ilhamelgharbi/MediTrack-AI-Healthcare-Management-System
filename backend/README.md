# Quick Start Guide - MediTrack-AI Backend

## 🚀 Quick Setup (3 Steps)

### 1. Install Dependencies
```powershell
cd C:\Users\user\Desktop\meditrack-ai\backend
python -m pip install -r requirements.txt
```

### 2. Run the Application
```powershell
python main.py
```

### 3. Test the API
Open your browser: http://localhost:8000/docs

---

## 📌 Three Main Endpoints

### 1️⃣ Register User: `POST /auth/register`
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "phone": "+1234567890",
  "role": "patient"
}
```

### 2️⃣ Login: `POST /auth/login`
```json
{
  "email": "john@example.com",
  "password": "secure123"
}
```
Returns: `{"access_token": "...", "token_type": "bearer"}`

### 3️⃣ Get Current User: `GET /auth/me`
Header: `Authorization: Bearer <your_token>`

---

## 🧪 Run Tests
```powershell
pytest tests/test_auth.py -v
```

---

## 🔑 Key Features
- ✅ User registration with validation
- ✅ Login with JWT tokens
- ✅ Role-based access (patient/admin)
- ✅ Protected endpoints
- ✅ Password hashing (bcrypt)
- ✅ Error handling with HTTPExceptions
- ✅ Comprehensive unit tests

---

## 📖 Full Tutorial
See `SETUP_TUTORIAL.md` for detailed step-by-step instructions.
