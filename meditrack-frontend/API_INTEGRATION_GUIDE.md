# Patient API Integration Guide

## ✅ Integrated API Endpoints

### 1. **GET /patients/** - Get All Patients (Admin Only)
- **Location**: `PatientsPage.tsx`
- **Service Method**: `patientsAPI.getAllPatients(search?, statusFilter?, sort?)`
- **Features**:
  - Search by patient name or email
  - Filter by status (stable, critical, under_observation)
  - Sort patients
  - Mock data added for adherence (45-85%) and active medications
- **UI Elements**:
  - Patient list table with status badges
  - Adherence progress bars
  - Active medication count
  - Search and filter toolbar

### 2. **GET /patients/{id}** - Get Patient by ID (Admin Only)
- **Location**: `PatientDetailsPage.tsx`
- **Service Method**: `patientsAPI.getPatientById(patientId)`
- **Features**:
  - Full patient profile display
  - Medical history, allergies, medications
  - Mock adherence data (60-100%)
  - Mock active medications list
- **UI Elements**:
  - 3 tabs: Profile, Medications, Analytics
  - Vitals & attributes cards
  - Medical history section
  - Adherence analytics with charts

### 3. **GET /patients/me/profile** - Get Own Profile (Patient Only)
- **Location**: `PatientDetailsPage.tsx`
- **Route**: `/patients/me`
- **Service Method**: `patientsAPI.getMyProfile()`
- **Features**:
  - Patient views their own profile
  - Same UI as admin view but with edit capabilities
  - Role-based conditional rendering

### 4. **PUT /patients/me/profile** - Update Own Profile (Patient Only)
- **Location**: `PatientDetailsPage.tsx`
- **Service Method**: `patientsAPI.updateMyProfile(patientData)`
- **Editable Fields**:
  - Weight (kg) - number input
  - Height (cm) - number input
  - Blood Type - text input (max 5 chars)
  - Gender - dropdown (male, female, other)
  - Date of Birth - date picker
  - Allergies - textarea (max 500 chars)
  - Medical History - textarea (max 2000 chars)
  - Current Medications - textarea (max 1000 chars)
- **UI Features**:
  - Edit/Save button toggle
  - Cancel button during edit
  - Loading states during save
  - Error handling with dismissible alerts
  - Form validation

### 5. **PUT /patients/{id}/admin-update** - Admin Update Patient (Admin Only)
- **Location**: `services/patients.ts`
- **Service Method**: `patientsAPI.updatePatientByAdmin(patientId, adminData)`
- **Purpose**: Allows admins to update patient medical information
- **Note**: UI integration pending (backend ready)

## 🎨 UI/UX Features Maintained

### Design Consistency
- ✅ All original styling preserved
- ✅ Tailwind CSS classes maintained
- ✅ Color scheme consistent (blue primary, slate neutrals)
- ✅ Border radius and shadows unchanged
- ✅ Responsive grid layouts intact

### Mock Data Implementation
- **Adherence Data**: Random percentages (45-85% for list, 60-100% for details)
- **Active Medications**: Random selection from predefined list
- **Weekly Adherence Chart**: 7-day mock data with scores
- **Medication Status**: All marked as "ACTIVE"

### Interactive Elements
- Search and filter on patients list
- Clickable table rows navigate to patient details
- Tab navigation (Profile, Medications, Analytics)
- Edit mode toggle with form validation
- Loading states with spinners
- Error states with retry buttons

## 🔐 Security & Access Control

### Role-Based Access
- **Admin Role**:
  - Can view all patients (`/patients`)
  - Can view any patient details (`/patients/{id}`)
  - Can update patient medical data (admin-update endpoint)
  
- **Patient Role**:
  - Can only view own profile (`/patients/me`)
  - Can edit own profile information
  - Cannot access other patients' data

### Route Protection
- `ProtectedRoute` - Requires authentication
- `AdminRoute` - Requires admin role
- `PatientRoute` - Requires patient role
- Automatic redirects for unauthorized access

## 📊 Data Flow

```
Frontend Component
    ↓
Service Layer (patientsAPI)
    ↓
HTTP Request with Auth Headers
    ↓
Backend API (FastAPI)
    ↓
Database (SQLite)
    ↓
Response with Patient Data
    ↓
Mock Data Enhancement (adherence, meds)
    ↓
UI Rendering
```

## 🧪 Testing Checklist

### Admin User Testing
- [x] Login as admin
- [x] View patients list (`/patients`)
- [x] Search patients by name/email
- [x] Filter patients by status
- [x] Click patient to view details
- [x] View all patient information tabs
- [x] Verify adherence and medication display

### Patient User Testing
- [x] Login as patient
- [x] Navigate to profile (`/patients/me`)
- [x] Click "Edit Profile" button
- [x] Modify profile fields
- [x] Click "Save Changes"
- [x] Verify data persists after save
- [x] Test "Cancel" button
- [x] Verify error handling

### API Integration Testing
```bash
# Test backend connectivity
cd backend
python main.py

# Test frontend
cd meditrack-frontend
npm run dev

# Test endpoints manually
curl -X GET http://localhost:8000/patients/ \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X GET http://localhost:8000/patients/me/profile \
  -H "Authorization: Bearer PATIENT_TOKEN"

curl -X PUT http://localhost:8000/patients/me/profile \
  -H "Authorization: Bearer PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight": 75.0, "height": 180.0}'
```

## 🚀 Next Steps

### Pending Integrations
1. Admin patient update UI (backend ready)
2. Real medication management system
3. Real adherence tracking system
4. Reports and analytics endpoints
5. Prescription management

### Potential Enhancements
1. Real-time updates with WebSockets
2. Image upload for patient photos
3. PDF report generation
4. Advanced filtering and sorting
5. Bulk operations for admins
6. Audit logs for patient data changes

## 📝 Code Examples

### Fetching All Patients
```typescript
const fetchPatients = async () => {
  try {
    const data = await patientsAPI.getAllPatients();
    const patientsWithMockData = data.map(patient => ({
      ...patient,
      adherence: Math.floor(Math.random() * 40) + 45,
      active_meds: mockMedicationList.slice(0, 3)
    }));
    setPatients(patientsWithMockData);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Updating Patient Profile
```typescript
const handleSaveProfile = async () => {
  try {
    const updatedPatient = await patientsAPI.updateMyProfile(editFormData);
    setPatient(updatedPatient);
    setIsEditingProfile(false);
  } catch (error) {
    setError('Failed to update profile');
  }
};
```

## 🔧 Configuration

### Environment Variables
```env
VITE_BACKEND_URL=http://localhost:8000
```

### API Base URL
Configured in `services/patients.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

## ✨ Features Summary

✅ **Fully Functional**:
- Patient list view with real API data
- Patient details view with real API data
- Patient profile editing with API integration
- Role-based access control
- Search and filtering
- Loading and error states
- Mock data for adherence and medications
- Responsive design maintained
- All original styling preserved

🔄 **Using Mock Data**:
- Adherence percentages
- Weekly adherence analytics
- Active medications list
- Medication management tab

🎯 **Production Ready**:
- Error handling
- Loading states
- Form validation
- Security headers
- Role-based routing
- Clean code architecture
