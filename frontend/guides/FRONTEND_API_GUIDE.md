# MediTrack-AI Frontend Integration Guide

## Table of Contents
- [Overview](#overview)
- [Base URL & Authentication](#base-url--authentication)
- [User Roles & Permissions](#user-roles--permissions)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Patients](#patients)
  - [Medications](#medications)
  - [Adherence Tracking](#adherence-tracking)
  - [Reminders](#reminders)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Overview

**MediTrack-AI** is a comprehensive medication management system with:
- JWT-based authentication
- Role-based access control (Admin/Patient)
- Medication tracking and adherence monitoring
- Smart reminder system
- Patient health management

**Backend Stack:** FastAPI + SQLAlchemy + SQLite
**API Documentation:** Available at `/docs` (Swagger UI)

---

## Base URL & Authentication

### Base URL
```
http://localhost:8000
```

### Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

Get the token from the `/auth/login` endpoint after registration.

---

## User Roles & Permissions

### 🔵 Patient Role
**Can:**
- View and update their own profile
- View their assigned medications
- Confirm medication assignments
- Log medication doses (taken/skipped/missed)
- View their adherence stats
- Create and manage reminder schedules
- View reminders

**Cannot:**
- Access other patients' data
- Create/update/delete medications in catalog
- Assign medications to patients
- View admin-only data

### 🔴 Admin Role
**Can:**
- Everything patients can do
- View all patients
- Create/update/delete medications in catalog
- Assign medications to patients
- Stop patient medications
- Update patient medical information
- View any patient's adherence stats

---

## API Endpoints

## Authentication

### 1. Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient"
}
```

**Field Details:**
- `full_name` (required): String, min 2 chars, max 100 chars
- `email` (required): Valid email format, must be unique
- `phone` (optional): String, max 20 chars
- `password` (required): String, min 6 chars
- `role` (optional): "patient" or "admin", default: "patient"

**Response (201):**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "patient",
  "date_created": "2025-11-23T10:30:00Z"
}
```

**Errors:**
- `400`: Email already exists
- `422`: Validation error (invalid email, short password, etc.)

---

### 2. Login
**POST** `/auth/login`

Get access token for authentication.

**Request Body (Form Data):**
```
username=john@example.com&password=password123
```

**Content-Type:** `application/x-www-form-urlencoded`

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: Incorrect email or password

**Usage in Frontend:**
```javascript
// Store the token
localStorage.setItem('token', response.access_token);

// Use in API calls
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

### 3. Get Current User
**GET** `/auth/me`

Get authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "patient",
  "date_created": "2025-11-23T10:30:00Z"
}
```

**Errors:**
- `401`: Invalid or expired token

---

## Patients

### 1. Get All Patients (Admin Only)
**GET** `/patients/`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `skip` (optional): Number of records to skip, default: 0
- `limit` (optional): Max records to return, default: 100
- `search` (optional): Search by name or email
- `status` (optional): Filter by status: "stable", "critical", "under_observation"
- `sort` (optional): "newest", "oldest", "name_asc", "name_desc"

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "blood_type": "A+",
    "height": 175.5,
    "weight": 70.0,
    "status": "stable",
    "medical_history": "No major illnesses",
    "allergies": "Penicillin",
    "current_medications": "None",
    "assigned_admin_id": 1,
    "created_at": "2025-11-23T10:30:00Z",
    "updated_at": "2025-11-23T10:30:00Z",
    "user": {
      "id": 2,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "patient"
    }
  }
]
```

---

### 2. Get My Profile (Patient)
**GET** `/patients/me/profile`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (200):**
```json
{
  "id": 1,
  "user_id": 2,
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "blood_type": "A+",
  "height": 175.5,
  "weight": 70.0,
  "status": "stable",
  "medical_history": "No major illnesses",
  "allergies": "Penicillin",
  "current_medications": "None",
  "assigned_admin_id": 1,
  "created_at": "2025-11-23T10:30:00Z",
  "updated_at": "2025-11-23T10:30:00Z",
  "user": { /* user details */ }
}
```

---

### 3. Update My Profile (Patient)
**PUT** `/patients/me/profile`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:**
```json
{
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "blood_type": "A+",
  "height": 175.5,
  "weight": 70.0,
  "allergies": "Penicillin",
  "current_medications": "Aspirin 100mg"
}
```

**All fields are optional** - only include fields you want to update.

**Field Details:**
- `date_of_birth`: "YYYY-MM-DD" format
- `gender`: "male" or "female"
- `blood_type`: String, max 5 chars
- `height`: Float, in centimeters
- `weight`: Float, in kilograms
- `allergies`: String, max 500 chars
- `current_medications`: String, max 1000 chars

**Response (200):** Updated patient object

---

### 4. Get Patient by ID (Admin Only)
**GET** `/patients/{patient_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):** Patient object

---

### 5. Admin Update Patient
**PUT** `/patients/{patient_id}/admin-update`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "critical",
  "medical_history": "Type 2 Diabetes, Hypertension",
  "allergies": "Penicillin, Sulfa drugs"
}
```

**Field Details:**
- `status` (optional): "stable", "critical", "under_observation"
- `medical_history` (optional): String, max 2000 chars
- `allergies` (optional): String, max 500 chars

**Response (200):** Updated patient object

---

## Medications

### Medication Catalog Endpoints

### 1. Create Medication (Admin Only)
**POST** `/medications/`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "name": "Aspirin",
  "form": "tablet",
  "default_dosage": "100mg",
  "side_effects": "May cause stomach upset",
  "warnings": "Do not take on empty stomach"
}
```

**Field Details:**
- `name` (required): String, min 1 char, max 255 chars
- `form` (required): "tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "patch"
- `default_dosage` (optional): String, max 100 chars
- `side_effects` (optional): Text
- `warnings` (optional): Text

**Response (201):**
```json
{
  "id": 1,
  "name": "Aspirin",
  "form": "tablet",
  "default_dosage": "100mg",
  "side_effects": "May cause stomach upset",
  "warnings": "Do not take on empty stomach",
  "created_by": 1,
  "created_at": "2025-11-23T10:30:00Z",
  "updated_at": null
}
```

---

### 2. Get All Medications
**GET** `/medications/`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skip` (optional): Pagination offset, default: 0
- `limit` (optional): Max results, default: 100, max: 500
- `search` (optional): Search by medication name

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Aspirin",
    "form": "tablet",
    "default_dosage": "100mg",
    "side_effects": "May cause stomach upset",
    "warnings": "Do not take on empty stomach",
    "created_by": 1,
    "created_at": "2025-11-23T10:30:00Z",
    "updated_at": null
  }
]
```

---

### 3. Get Medication by ID
**GET** `/medications/{medication_id}`

**Headers:** `Authorization: Bearer <token>`

**Response (200):** Medication object

**Errors:**
- `404`: Medication not found

---

### 4. Update Medication (Admin Only)
**PUT** `/medications/{medication_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Aspirin 100mg",
  "default_dosage": "100mg",
  "side_effects": "Updated side effects"
}
```

**Response (200):** Updated medication object

---

### 5. Delete Medication (Admin Only)
**DELETE** `/medications/{medication_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (204):** No content

**Errors:**
- `400`: Cannot delete medication assigned to patients

---

### Patient Medication Assignment Endpoints

### 6. Assign Medication to Patient (Admin Only)
**POST** `/medications/patients/{patient_id}/medications`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "medication_id": 1,
  "dosage": "100mg",
  "instructions": "Take with breakfast",
  "times_per_day": 2,
  "start_date": "2025-11-23",
  "end_date": "2025-12-23"
}
```

**Field Details:**
- `medication_id` (required): Integer, ID from medication catalog
- `dosage` (required): String, max 100 chars
- `instructions` (optional): Text
- `times_per_day` (required): Integer, 1-24
- `start_date` (required): Date "YYYY-MM-DD"
- `end_date` (optional): Date "YYYY-MM-DD"

**Response (201):**
```json
{
  "id": 1,
  "patient_id": 2,
  "medication_id": 1,
  "dosage": "100mg",
  "instructions": "Take with breakfast",
  "times_per_day": 2,
  "start_date": "2025-11-23",
  "end_date": "2025-12-23",
  "status": "pending",
  "confirmed_by_patient": false,
  "assigned_by_doctor": 1,
  "created_at": "2025-11-23T10:30:00Z",
  "updated_at": null,
  "medication": {
    "id": 1,
    "name": "Aspirin",
    "form": "tablet",
    "default_dosage": "100mg"
  }
}
```

**Notes:**
- Initial status is "pending" until patient confirms
- Patient must confirm before taking medication

---

### 7. Get Patient Medications
**GET** `/medications/patients/{patient_id}/medications`

**Headers:** `Authorization: Bearer <token>`

**Authorization:**
- Admin can view any patient's medications
- Patient can only view their own

**Query Parameters:**
- `status_filter` (optional): "pending", "active", "stopped"
- `include_inactive` (optional): Boolean, default: false

**Response (200):**
```json
[
  {
    "id": 1,
    "patient_id": 2,
    "medication_id": 1,
    "dosage": "100mg",
    "instructions": "Take with breakfast",
    "times_per_day": 2,
    "start_date": "2025-11-23",
    "end_date": "2025-12-23",
    "status": "active",
    "confirmed_by_patient": true,
    "assigned_by_doctor": 1,
    "created_at": "2025-11-23T10:30:00Z",
    "updated_at": "2025-11-23T11:00:00Z",
    "medication": {
      "id": 1,
      "name": "Aspirin",
      "form": "tablet",
      "default_dosage": "100mg",
      "side_effects": "May cause stomach upset",
      "warnings": "Do not take on empty stomach"
    }
  }
]
```

---

### 8. Confirm Medication (Patient Only)
**PATCH** `/medications/patients/{patient_id}/medications/{medication_assignment_id}/confirm`

**Headers:** `Authorization: Bearer <patient_token>`

**Notes:**
- Patient must confirm they will take the medication
- Changes status from "pending" to "active"
- Patient can only confirm their own medications

**Response (200):**
```json
{
  "id": 1,
  "status": "active",
  "confirmed_by_patient": true,
  /* ... other fields ... */
}
```

---

### 9. Update Patient Medication (Admin Only)
**PUT** `/medications/patients/{patient_id}/medications/{medication_assignment_id}`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:** (all fields optional)
```json
{
  "dosage": "150mg",
  "instructions": "Take with dinner instead",
  "times_per_day": 1,
  "end_date": "2026-01-23"
}
```

**Response (200):** Updated medication assignment

---

### 10. Stop Medication (Admin Only)
**PATCH** `/medications/patients/{patient_id}/medications/{medication_assignment_id}/stop`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "reason": "Treatment completed successfully"
}
```

**Field Details:**
- `reason` (optional): String, why medication was stopped

**Response (200):**
```json
{
  "id": 1,
  "patient_medication_id": 1,
  "stopped_by": 1,
  "stopped_at": "2025-11-23T15:30:00Z",
  "reason": "Treatment completed successfully",
  "patient_medication": {
    "id": 1,
    "status": "stopped",
    /* ... other fields ... */
  }
}
```

---

### 11. Get Inactive Medications
**GET** `/medications/patients/{patient_id}/medications/inactive`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "patient_medication_id": 1,
    "stopped_by": 1,
    "stopped_at": "2025-11-23T15:30:00Z",
    "reason": "Treatment completed successfully",
    "patient_medication": {
      "id": 1,
      "medication": {
        "name": "Aspirin",
        "form": "tablet"
      }
    }
  }
]
```

---

## Adherence Tracking

### Medication Log Endpoints

### 1. Log Medication
**POST** `/adherence/logs`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:**
```json
{
  "patient_medication_id": 1,
  "scheduled_time": "2025-11-23T08:00:00Z",
  "status": "taken",
  "actual_time": "2025-11-23T08:15:00Z",
  "notes": "Took with breakfast",
  "logged_via": "manual"
}
```

**Field Details:**
- `patient_medication_id` (required): Integer
- `scheduled_time` (required): ISO datetime when dose was scheduled
- `status` (required): "taken", "skipped", "missed"
- `actual_time` (optional): ISO datetime when actually taken (auto-set if status="taken")
- `notes` (optional): String
- `skipped_reason` (optional): String, reason if skipped
- `logged_via` (optional): "manual", "whatsapp", "sms", "auto", default: "manual"

**Response (201):**
```json
{
  "id": 1,
  "patient_medication_id": 1,
  "patient_id": 2,
  "scheduled_time": "2025-11-23T08:00:00Z",
  "scheduled_date": "2025-11-23",
  "status": "taken",
  "actual_time": "2025-11-23T08:15:00Z",
  "on_time": true,
  "minutes_late": 15,
  "notes": "Took with breakfast",
  "skipped_reason": null,
  "logged_via": "manual",
  "reminder_id": null,
  "created_at": "2025-11-23T08:15:30Z",
  "updated_at": null
}
```

**Notes:**
- System calculates `on_time` (within ±30 minutes)
- `minutes_late` is auto-calculated
- Can't create duplicate logs for same dose

---

### 2. Update Medication Log
**PUT** `/adherence/logs/{log_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:** (all fields optional)
```json
{
  "status": "taken",
  "actual_time": "2025-11-23T08:20:00Z",
  "notes": "Updated: Took after meal"
}
```

**Response (200):** Updated log object

---

### 3. Get Medication Logs
**GET** `/adherence/logs`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `patient_medication_id` (optional): Filter by specific medication
- `status` (optional): "taken", "skipped", "missed"
- `start_date` (optional): "YYYY-MM-DD"
- `end_date` (optional): "YYYY-MM-DD"
- `skip` (optional): Pagination offset
- `limit` (optional): Max results, default: 100, max: 500

**Response (200):** Array of medication log objects

**Example:**
```
GET /adherence/logs?status=taken&start_date=2025-11-01&limit=50
```

---

### 4. Delete Medication Log
**DELETE** `/adherence/logs/{log_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (204):** No content

---

### Adherence Statistics Endpoints

### 5. Get Adherence Stats
**GET** `/adherence/stats`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `period` (required): "daily", "weekly", "monthly", "overall"
- `patient_medication_id` (optional): Stats for specific medication

**Response (200):**
```json
{
  "id": 1,
  "patient_id": 2,
  "patient_medication_id": null,
  "period_type": "weekly",
  "period_start": "2025-11-17",
  "period_end": "2025-11-23",
  "total_scheduled": 14,
  "total_taken": 12,
  "total_skipped": 1,
  "total_missed": 1,
  "adherence_score": 85.71,
  "on_time_score": 91.67,
  "current_streak": 5,
  "longest_streak": 5,
  "calculated_at": "2025-11-23T16:00:00Z"
}
```

**Field Meanings:**
- `adherence_score`: (taken / scheduled) × 100
- `on_time_score`: (on_time_taken / total_taken) × 100
- `current_streak`: Consecutive days with 100% adherence
- `longest_streak`: Best streak in this period

---

### 6. Get Chart Data
**GET** `/adherence/chart`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `days` (optional): Number of days, 1-90, default: 7
- `patient_medication_id` (optional): Filter by medication

**Response (200):**
```json
[
  {
    "date": "2025-11-23",
    "score": 100.0,
    "taken": 2,
    "scheduled": 2,
    "status": "excellent"
  },
  {
    "date": "2025-11-22",
    "score": 50.0,
    "taken": 1,
    "scheduled": 2,
    "status": "poor"
  }
]
```

**Status Levels:**
- `excellent`: score >= 90
- `good`: score >= 75
- `fair`: score >= 60
- `poor`: score < 60

---

### 7. Get Adherence Dashboard
**GET** `/adherence/dashboard`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (200):**
```json
{
  "overall_stats": {
    "period_type": "overall",
    "adherence_score": 88.5,
    "total_taken": 85,
    "total_scheduled": 96,
    "current_streak": 5,
    "longest_streak": 12
  },
  "weekly_stats": {
    "period_type": "weekly",
    "adherence_score": 85.71,
    /* ... */
  },
  "daily_stats": {
    "period_type": "daily",
    "adherence_score": 100.0,
    /* ... */
  },
  "chart_data": [
    /* 7 days of chart data */
  ],
  "recent_logs": [
    /* Last 10 medication logs */
  ]
}
```

**Use Case:** Perfect for patient dashboard homepage

---

### Admin Adherence Endpoints

### 8. Get Patient Stats (Admin Only)
**GET** `/adherence/patients/{patient_id}/stats`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:** Same as patient stats endpoint

**Response (200):** Same as patient stats response

---

### 9. Get Patient Logs (Admin Only)
**GET** `/adherence/patients/{patient_id}/logs`

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:** Same as patient logs endpoint

**Response (200):** Array of patient's logs

---

### 10. Get Patient Dashboard (Admin Only)
**GET** `/adherence/patients/{patient_id}/dashboard`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (200):** Complete dashboard for specified patient

---

## Reminders

### Reminder Schedule Endpoints

### 1. Create Reminder Schedule
**POST** `/reminders/schedules`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:**
```json
{
  "patient_medication_id": 1,
  "frequency": "twice_daily",
  "reminder_times": ["08:00", "20:00"],
  "advance_minutes": 15,
  "channel_whatsapp": true,
  "channel_sms": false,
  "channel_push": true,
  "channel_email": false,
  "auto_skip_if_taken": true,
  "escalate_if_missed": true,
  "escalate_delay_minutes": 30,
  "quiet_hours_enabled": false,
  "quiet_hours_start": null,
  "quiet_hours_end": null,
  "start_date": "2025-11-23T00:00:00Z",
  "end_date": null
}
```

**Field Details:**
- `patient_medication_id` (required): Integer
- `frequency` (optional): "once", "daily", "twice_daily", "three_times_daily", "custom"
- `reminder_times` (required): Array of times in "HH:MM" format
- `advance_minutes` (optional): 0-120, default: 15, minutes before dose time
- `channel_whatsapp` (optional): Boolean, default: true
- `channel_sms` (optional): Boolean, default: false
- `channel_push` (optional): Boolean, default: true
- `channel_email` (optional): Boolean, default: false
- `auto_skip_if_taken` (optional): Boolean, skip reminder if already logged
- `escalate_if_missed` (optional): Boolean, send follow-up if not taken
- `escalate_delay_minutes` (optional): 5-240, default: 30
- `quiet_hours_enabled` (optional): Boolean, no reminders during quiet hours
- `quiet_hours_start` (optional): "HH:MM" format
- `quiet_hours_end` (optional): "HH:MM" format
- `start_date` (required): ISO datetime
- `end_date` (optional): ISO datetime

**Response (201):**
```json
{
  "id": 1,
  "patient_medication_id": 1,
  "patient_id": 2,
  "is_active": true,
  "frequency": "twice_daily",
  "reminder_times": ["08:00", "20:00"],
  "advance_minutes": 15,
  "channel_whatsapp": true,
  "channel_sms": false,
  "channel_push": true,
  "channel_email": false,
  "auto_skip_if_taken": true,
  "escalate_if_missed": true,
  "escalate_delay_minutes": 30,
  "quiet_hours_enabled": false,
  "quiet_hours_start": null,
  "quiet_hours_end": null,
  "start_date": "2025-11-23T00:00:00Z",
  "end_date": null,
  "created_at": "2025-11-23T10:30:00Z",
  "updated_at": null
}
```

**Errors:**
- `400`: Invalid time format, duplicate schedule for medication

---

### 2. Get Reminder Schedules
**GET** `/reminders/schedules`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `active_only` (optional): Boolean, default: false

**Response (200):** Array of reminder schedule objects

---

### 3. Get Schedule by Medication
**GET** `/reminders/schedules/medication/{patient_medication_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (200):** Reminder schedule object

**Errors:**
- `404`: No schedule found for this medication

---

### 4. Update Reminder Schedule
**PUT** `/reminders/schedules/{schedule_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:** (all fields optional)
```json
{
  "is_active": true,
  "reminder_times": ["09:00", "21:00"],
  "advance_minutes": 30
}
```

**Response (200):** Updated schedule object

---

### 5. Delete Reminder Schedule
**DELETE** `/reminders/schedules/{schedule_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (204):** No content

---

### 6. Toggle Schedule (Enable/Disable)
**POST** `/reminders/schedules/{schedule_id}/toggle?is_active=true`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `is_active` (required): Boolean

**Response (200):**
```json
{
  "message": "Reminder schedule enabled",
  "is_active": true
}
```

---

### 7. Generate Reminders from Schedule
**POST** `/reminders/schedules/{schedule_id}/generate?days_ahead=7`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `days_ahead` (optional): Integer, default: 7

**Notes:**
- Manually trigger reminder generation
- Usually done by background job
- Creates individual reminder instances

**Response (200):**
```json
{
  "message": "Generated 14 reminders",
  "count": 14,
  "reminders": [
    /* Array of reminder objects */
  ]
}
```

---

### Reminder Instance Endpoints

### 8. Get Reminders
**GET** `/reminders/`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `status` (optional): "pending", "sent", "delivered", "read", "responded", "failed", "cancelled"
- `start_date` (optional): ISO datetime
- `end_date` (optional): ISO datetime
- `limit` (optional): Integer, default: 100

**Response (200):**
```json
[
  {
    "id": 1,
    "patient_medication_id": 1,
    "patient_id": 2,
    "scheduled_time": "2025-11-23T07:45:00Z",
    "actual_dose_time": "2025-11-23T08:00:00Z",
    "reminder_advance_minutes": 15,
    "channel": "whatsapp",
    "status": "delivered",
    "twilio_message_sid": "SM1234567890",
    "twilio_status": "delivered",
    "message_text": "Time to take your Aspirin 100mg",
    "response_text": null,
    "response_received_at": null,
    "sent_at": "2025-11-23T07:45:00Z",
    "delivered_at": "2025-11-23T07:45:05Z",
    "read_at": null,
    "retry_count": 0,
    "created_at": "2025-11-23T00:00:00Z"
  }
]
```

---

### 9. Get Specific Reminder
**GET** `/reminders/{reminder_id}`

**Headers:** `Authorization: Bearer <patient_token>`

**Response (200):** Reminder object

**Errors:**
- `404`: Reminder not found

---

### 10. Cancel Reminder
**POST** `/reminders/{reminder_id}/cancel`

**Headers:** `Authorization: Bearer <patient_token>`

**Request Body:**
```json
{
  "reason": "Already took medication"
}
```

**Field Details:**
- `reason` (optional): String

**Response (200):** Updated reminder with status="cancelled"

**Notes:**
- Can only cancel "pending" reminders
- Once sent, cannot be cancelled

---

### 11. Get Reminder Stats
**GET** `/reminders/stats/summary?days=30`

**Headers:** `Authorization: Bearer <patient_token>`

**Query Parameters:**
- `days` (optional): Integer, default: 30

**Response (200):**
```json
{
  "total_reminders": 60,
  "sent": 58,
  "delivered": 56,
  "failed": 2,
  "responded": 45,
  "delivery_rate": 96.55,
  "response_rate": 80.36,
  "average_response_time_minutes": 8.5
}
```

---

## Data Models

### User Object
```typescript
interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: "patient" | "admin";
  date_created: string; // ISO datetime
}
```

### Patient Object
```typescript
interface Patient {
  id: number;
  user_id: number;
  date_of_birth: string | null; // YYYY-MM-DD
  gender: "male" | "female" | null;
  blood_type: string | null;
  height: number | null; // cm
  weight: number | null; // kg
  status: "stable" | "critical" | "under_observation";
  medical_history: string | null;
  allergies: string | null;
  current_medications: string | null;
  assigned_admin_id: number | null;
  created_at: string; // ISO datetime
  updated_at: string | null;
  user: User;
}
```

### Medication Object
```typescript
interface Medication {
  id: number;
  name: string;
  form: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "inhaler" | "patch";
  default_dosage: string | null;
  side_effects: string | null;
  warnings: string | null;
  created_by: number;
  created_at: string;
  updated_at: string | null;
}
```

### Patient Medication Assignment
```typescript
interface PatientMedication {
  id: number;
  patient_id: number;
  medication_id: number;
  dosage: string;
  instructions: string | null;
  times_per_day: number;
  start_date: string; // YYYY-MM-DD
  end_date: string | null;
  status: "pending" | "active" | "stopped";
  confirmed_by_patient: boolean;
  assigned_by_doctor: number;
  created_at: string;
  updated_at: string | null;
  medication: Medication;
}
```

### Medication Log
```typescript
interface MedicationLog {
  id: number;
  patient_medication_id: number;
  patient_id: number;
  scheduled_time: string; // ISO datetime
  scheduled_date: string; // YYYY-MM-DD
  status: "taken" | "skipped" | "missed";
  actual_time: string | null;
  on_time: boolean;
  minutes_late: number | null;
  notes: string | null;
  skipped_reason: string | null;
  logged_via: "manual" | "whatsapp" | "sms" | "auto";
  reminder_id: number | null;
  created_at: string;
  updated_at: string | null;
}
```

### Adherence Stats
```typescript
interface AdherenceStats {
  id: number;
  patient_id: number;
  patient_medication_id: number | null;
  period_type: "daily" | "weekly" | "monthly" | "overall";
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  total_scheduled: number;
  total_taken: number;
  total_skipped: number;
  total_missed: number;
  adherence_score: number; // 0-100
  on_time_score: number; // 0-100
  current_streak: number;
  longest_streak: number;
  calculated_at: string;
}
```

### Reminder Schedule
```typescript
interface ReminderSchedule {
  id: number;
  patient_medication_id: number;
  patient_id: number;
  is_active: boolean;
  frequency: "once" | "daily" | "twice_daily" | "three_times_daily" | "custom";
  reminder_times: string[]; // ["HH:MM", ...]
  advance_minutes: number;
  channel_whatsapp: boolean;
  channel_sms: boolean;
  channel_push: boolean;
  channel_email: boolean;
  auto_skip_if_taken: boolean;
  escalate_if_missed: boolean;
  escalate_delay_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null; // HH:MM
  quiet_hours_end: string | null;
  start_date: string; // ISO datetime
  end_date: string | null;
  created_at: string;
  updated_at: string | null;
}
```

### Reminder Instance
```typescript
interface Reminder {
  id: number;
  patient_medication_id: number;
  patient_id: number;
  scheduled_time: string; // ISO datetime
  actual_dose_time: string;
  reminder_advance_minutes: number;
  channel: "whatsapp" | "sms" | "email" | "push";
  status: "pending" | "sent" | "delivered" | "read" | "responded" | "failed" | "cancelled";
  twilio_message_sid: string | null;
  twilio_status: string | null;
  message_text: string;
  response_text: string | null;
  response_received_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  retry_count: number;
  created_at: string;
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

**200 OK** - Request succeeded
**201 Created** - Resource created successfully
**204 No Content** - Successful deletion
**400 Bad Request** - Invalid input data
**401 Unauthorized** - Missing or invalid token
**403 Forbidden** - Insufficient permissions
**404 Not Found** - Resource doesn't exist
**422 Unprocessable Entity** - Validation error
**500 Internal Server Error** - Server error

### Example Error Handling (JavaScript)
```javascript
async function callAPI(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return null; // No content
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle specific errors
    if (error.message.includes('token')) {
      // Token expired - redirect to login
      window.location.href = '/login';
    }
    
    throw error;
  }
}
```

---

## Frontend Implementation Tips

### 1. Authentication Flow
```javascript
// Login
const login = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData
  });

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  
  // Get user details
  const user = await getCurrentUser();
  localStorage.setItem('user', JSON.stringify(user));
};

// Check authentication
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Get current user
const getCurrentUser = async () => {
  const response = await fetch('/auth/me', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return await response.json();
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

### 2. Role-Based UI
```javascript
const user = JSON.parse(localStorage.getItem('user'));

// Show/hide based on role
if (user.role === 'admin') {
  // Show admin features
  document.getElementById('admin-panel').style.display = 'block';
} else {
  // Show patient features only
  document.getElementById('patient-view').style.display = 'block';
}
```

### 3. Date Formatting
```javascript
// For API requests - use YYYY-MM-DD
const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

// For display
const formatDateForDisplay = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
```

### 4. Adherence Score Display
```javascript
const getScoreColor = (score) => {
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
};

const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Improvement';
};
```

### 5. Reminder Time Validation
```javascript
const validateTime = (timeString) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
};

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};
```

---

## Testing Endpoints

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"

# Get current user (replace TOKEN)
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Swagger UI
Navigate to `http://localhost:8000/docs` for interactive API documentation.

---

## Support & Resources

**API Documentation:** http://localhost:8000/docs
**Backend Repository:** [GitHub Link]
**Test Suite:** All endpoints have 80 passing unit tests

For questions or issues, please refer to the backend test files for usage examples.
