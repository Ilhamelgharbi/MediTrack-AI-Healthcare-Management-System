# MediTrack-AI Frontend Creation Prompt

## Project Overview
Create a modern, responsive React frontend for **MediTrack-AI**, a comprehensive medication management system with role-based dashboards (Admin & Patient), real-time medication tracking, adherence monitoring, smart reminders, and an AI chatbot assistant.

---

## Tech Stack Requirements

### Core Technologies
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context API + React Query (TanStack Query)
- **UI Library:** Material-UI (MUI) v5 or Tailwind CSS + Shadcn/ui
- **Charts:** Recharts or Chart.js
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Date/Time:** date-fns or Day.js
- **Icons:** Lucide React or React Icons
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast

### Additional Libraries
- **Calendar:** React Big Calendar (for medication schedules)
- **Tables:** TanStack Table or MUI DataGrid
- **Chatbot UI:** Custom component with typing animation
- **File Upload:** React Dropzone (for future features)

---

## Design System

### Color Palette (Modern Medical Theme)
```css
/* Primary Colors - Trustworthy Medical Blue */
--primary-50: #E3F2FD;
--primary-100: #BBDEFB;
--primary-200: #90CAF9;
--primary-300: #64B5F6;
--primary-400: #42A5F5;
--primary-500: #2196F3; /* Main primary */
--primary-600: #1E88E5;
--primary-700: #1976D2;
--primary-800: #1565C0;
--primary-900: #0D47A1;

/* Secondary Colors - Caring Green */
--secondary-50: #E8F5E9;
--secondary-100: #C8E6C9;
--secondary-200: #A5D6A7;
--secondary-300: #81C784;
--secondary-400: #66BB6A;
--secondary-500: #4CAF50; /* Main secondary */
--secondary-600: #43A047;
--secondary-700: #388E3C;
--secondary-800: #2E7D32;
--secondary-900: #1B5E20;

/* Status Colors */
--success: #4CAF50;
--warning: #FF9800;
--error: #F44336;
--info: #2196F3;

/* Adherence Score Colors */
--excellent: #4CAF50; /* >= 90% */
--good: #8BC34A;     /* >= 75% */
--fair: #FFC107;     /* >= 60% */
--poor: #FF5722;     /* < 60% */

/* Neutral Colors */
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #EEEEEE;
--gray-300: #E0E0E0;
--gray-400: #BDBDBD;
--gray-500: #9E9E9E;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F5F7FA;
--bg-tertiary: #EDF2F7;

/* Text */
--text-primary: #212121;
--text-secondary: #616161;
--text-disabled: #9E9E9E;
```

### Typography
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Poppins', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing & Layout
```css
/* Spacing Scale */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */

/* Border Radius */
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── patient/
│   │   │   ├── MedicationCard.tsx
│   │   │   ├── AdherenceChart.tsx
│   │   │   ├── MedicationLog.tsx
│   │   │   ├── ReminderSchedule.tsx
│   │   │   ├── ProfileEditor.tsx
│   │   │   └── DashboardStats.tsx
│   │   ├── admin/
│   │   │   ├── PatientTable.tsx
│   │   │   ├── MedicationCatalog.tsx
│   │   │   ├── PatientDetails.tsx
│   │   │   ├── AssignMedicationForm.tsx
│   │   │   └── AdminStats.tsx
│   │   ├── medications/
│   │   │   ├── MedicationList.tsx
│   │   │   ├── MedicationForm.tsx
│   │   │   ├── MedicationDetails.tsx
│   │   │   └── MedicationFilters.tsx
│   │   ├── reminders/
│   │   │   ├── ReminderList.tsx
│   │   │   ├── ReminderCalendar.tsx
│   │   │   ├── ReminderForm.tsx
│   │   │   └── ReminderNotification.tsx
│   │   ├── adherence/
│   │   │   ├── AdherenceOverview.tsx
│   │   │   ├── ScoreCard.tsx
│   │   │   ├── StreakDisplay.tsx
│   │   │   ├── WeeklyChart.tsx
│   │   │   └── LogHistory.tsx
│   │   └── chatbot/
│   │       ├── ChatWindow.tsx
│   │       ├── ChatMessage.tsx
│   │       ├── ChatInput.tsx
│   │       └── ChatSuggestions.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Landing.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Contact.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── patient/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Medications.tsx
│   │   │   ├── Adherence.tsx
│   │   │   ├── Reminders.tsx
│   │   │   ├── History.tsx
│   │   │   └── Profile.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Patients.tsx
│   │       ├── PatientDetail.tsx
│   │       ├── MedicationCatalog.tsx
│   │       └── Analytics.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useMedications.ts
│   │   ├── useAdherence.ts
│   │   ├── useReminders.ts
│   │   ├── usePatients.ts
│   │   └── useChatbot.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ChatContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── patient.service.ts
│   │   ├── medication.service.ts
│   │   ├── adherence.service.ts
│   │   ├── reminder.service.ts
│   │   └── chatbot.service.ts
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── patient.types.ts
│   │   ├── medication.types.ts
│   │   ├── adherence.types.ts
│   │   ├── reminder.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── dateFormat.ts
│   │   ├── validation.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── animations.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Core Features & Pages

### 1. PUBLIC PAGES

#### Landing Page (`/`)
**Design:** Hero section with gradient background, feature cards, testimonials, call-to-action

**Sections:**
- **Hero Section:**
  - Headline: "Smart Medication Management, Simplified"
  - Subheading: "Track medications, improve adherence, never miss a dose"
  - CTA Buttons: "Get Started" (→ Register), "Learn More" (→ scroll)
  - Hero Image/Illustration: Medical professional with tablet
  
- **Features Section (3 columns):**
  1. **Smart Reminders** - Clock icon, "Never miss a dose with intelligent reminders"
  2. **Adherence Tracking** - Chart icon, "Monitor your medication habits and improve health outcomes"
  3. **AI Assistant** - Robot icon, "24/7 chatbot support for medication questions"

- **How It Works (4 steps):**
  1. Register & Create Profile
  2. Add Medications
  3. Set Reminders
  4. Track Progress

- **Statistics Section:**
  - "10,000+ Active Users"
  - "95% Adherence Rate"
  - "24/7 Support Available"

- **Footer:**
  - Links: About, Features, Contact, Privacy Policy, Terms
  - Social media icons
  - Copyright

**Responsive:** Mobile-first, hamburger menu on mobile

---

### 2. AUTHENTICATION

#### Login Page (`/login`)
**Design:** Centered card with gradient background, clean form

**Layout:**
```
┌──────────────────────────────────────┐
│  [Logo]                              │
│                                      │
│  Welcome Back                        │
│  Enter your credentials to continue │
│                                      │
│  Email                               │
│  [                    ]              │
│                                      │
│  Password                            │
│  [                    ]              │
│                                      │
│  [ ] Remember me    Forgot Password? │
│                                      │
│  [   Login Button   ]               │
│                                      │
│  Don't have account? Register        │
└──────────────────────────────────────┘
```

**Validations:**
- Email format validation
- Password minimum 6 characters
- Show/hide password toggle
- Error messages below fields

**API Integration:**
- POST `/auth/login` with form data (username, password)
- Store token in localStorage
- Redirect based on role: Admin → `/admin`, Patient → `/patient`

---

#### Register Page (`/register`)
**Design:** Similar to login, multi-step form

**Fields:**
- Full Name (required)
- Email (required, unique)
- Phone (optional)
- Password (required, min 6 chars)
- Confirm Password
- Role selection (Patient/Admin) - default Patient

**Validation:**
- Real-time email validation
- Password strength indicator
- Confirm password match

**API Integration:**
- POST `/auth/register`
- Auto-login after registration
- Redirect to onboarding flow

---

### 3. PATIENT DASHBOARD

#### Main Dashboard (`/patient/dashboard`)
**Layout:** Grid layout with cards

**Top Section - Stats Cards (4 columns):**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Meds  │ Today's     │ Adherence   │ Current     │
│    5        │ Doses: 3/4  │   92%       │ Streak: 7d  │
│ Active      │ ⏰ 1 pending│ 🎯 Excellent│ 🔥 Keep it! │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Main Content (2 columns):**

**Left Column (60%):**

1. **Today's Medications Card:**
   - List of scheduled doses for today
   - Each item shows:
     ```
     [Icon] Aspirin 100mg
     ⏰ 8:00 AM | 💊 Take with breakfast
     [✓ Mark Taken] [⏭ Skip] [Details]
     ```
   - Color-coded status: Taken (green), Pending (blue), Missed (red)

2. **Adherence Chart Card:**
   - Title: "7-Day Adherence Trend"
   - Bar chart or line chart
   - X-axis: Days (Mon-Sun)
   - Y-axis: Adherence % (0-100)
   - Color gradient based on score

**Right Column (40%):**

3. **Upcoming Reminders Card:**
   - Next 5 scheduled reminders
   - Time, medication name, dosage
   - Click to view details

4. **Quick Actions Card:**
   - Buttons:
     - ➕ Log Medication
     - 📅 View Calendar
     - 📊 Full Adherence Report
     - ⚙️ Manage Reminders

5. **AI Assistant Preview:**
   - Minimized chatbot widget
   - "Ask me about your medications"
   - Click to expand

**Responsive:**
- Mobile: Stack cards vertically
- Tablet: 2-column grid
- Desktop: Sidebar + main content

---

#### Medications Page (`/patient/medications`)
**Layout:** List view with filters and search

**Header:**
```
Medications                    [+ Log Dose] [Search...]
Active (3) | Pending (1) | All (5)
```

**Medication Cards:**
```
┌────────────────────────────────────────────────────┐
│ 💊 Aspirin 100mg                        [Active] ✓ │
│ Form: Tablet | 2x daily                            │
│ Take with breakfast and dinner                     │
│                                                    │
│ Start: Nov 1, 2025 | End: Dec 31, 2025           │
│ Prescribed by: Dr. Smith                          │
│                                                    │
│ [View Details] [Log Dose] [View History]         │
└────────────────────────────────────────────────────┘
```

**For Pending Medications:**
- Show "Confirm to Start" button
- Highlight with yellow border
- Show medication info and side effects

**Filters:**
- Status: Active, Pending, Stopped
- Form: Tablet, Capsule, etc.
- Sort: Name, Start Date, Frequency

**Actions per medication:**
- View full details (modal)
- Log dose
- View adherence history
- Set/edit reminders

---

#### Adherence Page (`/patient/adherence`)
**Layout:** Stats dashboard with charts

**Top Section:**
```
Overall Adherence Score: 92%
Current Streak: 7 days | Longest Streak: 15 days
```

**Tabs:**
1. **Overview:** Weekly/monthly stats
2. **History:** Log entries table
3. **Analytics:** Detailed charts

**Overview Tab:**

**Period Selector:**
- [Daily] [Weekly] [Monthly] [Overall]

**Stats Grid:**
```
┌────────────┬────────────┬────────────┬────────────┐
│ Scheduled  │ Taken      │ Skipped    │ Missed     │
│    42      │    38      │     2      │     2      │
│   100%     │   90.5%    │   4.8%     │   4.8%     │
└────────────┴────────────┴────────────┴────────────┘
```

**Charts Section:**
1. **Line Chart:** Daily adherence score (last 30 days)
2. **Pie Chart:** Status distribution
3. **Bar Chart:** By medication comparison

**History Tab:**
- Filterable table of all logs
- Columns: Date, Time, Medication, Status, Notes
- Export to CSV button
- Pagination

**Analytics Tab:**
- Best time of day for adherence
- Most missed medications
- Adherence by day of week
- On-time vs late doses

---

#### Reminders Page (`/patient/reminders`)
**Layout:** Calendar view + list view toggle

**Header:**
```
My Reminders          [Calendar] [List]    [+ New Schedule]
```

**Calendar View:**
- Monthly calendar with dots for scheduled reminders
- Click day to see reminders
- Color-coded by medication

**List View:**
- Grouped by medication
- Each medication card shows:
  ```
  Aspirin 100mg
  ⏰ Reminders: 8:00 AM, 8:00 PM
  📱 Channels: WhatsApp, Push
  🔔 15 min advance notice
  [Edit] [Delete] [Toggle On/Off]
  ```

**Create/Edit Reminder Modal:**
```
Schedule Reminder for: Aspirin 100mg

Frequency: [Twice Daily ▼]
Times: [08:00] [20:00] [+ Add Time]
Advance Notice: [15] minutes
Channels:
  [✓] WhatsApp  [✓] Push Notifications
  [ ] SMS       [ ] Email
Smart Features:
  [✓] Auto-skip if already taken
  [✓] Send follow-up if missed
Quiet Hours:
  [ ] Enable  [22:00] to [07:00]

[Cancel] [Save Schedule]
```

**Reminder Stats Card:**
- Total active schedules
- Reminders sent today
- Response rate
- Delivery success rate

---

#### History Page (`/patient/history`)
**Layout:** Timeline view with filters

**Filters:**
```
Date Range: [Nov 1, 2025] to [Nov 23, 2025]
Medication: [All ▼]
Status: [All ▼] [Taken] [Skipped] [Missed]
[Apply Filters]
```

**Timeline View:**
```
Nov 23, 2025
├─ 8:15 AM ✓ Took Aspirin 100mg (On time)
│  Notes: Took with breakfast
├─ 8:45 AM ✓ Took Metformin 500mg (15 min late)
└─ 8:00 PM ⏰ Pending: Aspirin 100mg

Nov 22, 2025
├─ 8:00 AM ✓ Took Aspirin 100mg (On time)
├─ 2:00 PM ⏭ Skipped Vitamin D (Felt nauseous)
└─ 8:05 PM ✓ Took Aspirin 100mg (5 min late)
```

**Actions:**
- Edit log entry
- Add notes
- Delete entry
- View medication details

**Export Options:**
- Download as PDF
- Download as CSV
- Email to doctor

---

#### Profile Page (`/patient/profile`)
**Layout:** Tabbed interface

**Tabs:**
1. Personal Info
2. Medical Info
3. Settings

**Personal Info Tab:**
```
Profile Picture
[Avatar Upload]

Full Name: [John Doe            ]
Email: [john@example.com      ]
Phone: [+1234567890           ]

[Cancel] [Save Changes]
```

**Medical Info Tab:**
```
Date of Birth: [05/15/1990    ]
Gender: [Male ▼]
Blood Type: [A+ ▼]
Height: [175.5] cm
Weight: [70.0] kg

Allergies:
[Penicillin, Sulfa drugs      ]

Current Medical Conditions:
[Type 2 Diabetes, Hypertension]

[Cancel] [Save Changes]
```

**Settings Tab:**
```
Notification Preferences:
  [✓] Email notifications
  [✓] Push notifications
  [ ] SMS notifications
  
Reminder Settings:
  Default advance time: [15] minutes
  Quiet hours: [22:00] to [07:00]
  
Privacy:
  [✓] Allow admin to view adherence stats
  [ ] Share anonymous data for research
  
Account:
  [Change Password]
  [Download My Data]
  [Delete Account]
```

---

### 4. ADMIN DASHBOARD

#### Main Dashboard (`/admin/dashboard`)
**Layout:** Analytics-focused with multiple metrics

**Top Stats Row (4 cards):**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total       │ New This    │ Medications │ Avg         │
│ Patients    │ Month       │ Prescribed  │ Adherence   │
│    248      │     23      │    1,847    │    87%      │
│ +12% ↑     │ 📈 Growth   │ Active      │ 🎯 Good     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Main Content (2 columns):**

**Left Column:**

1. **Recent Patients Card:**
   - Last 5 registered patients
   - Avatar, name, status, registration date
   - Quick actions: View Profile, Assign Medication

2. **Adherence Overview Chart:**
   - Line chart: Average adherence over time
   - Compare: This month vs last month
   - Filter by patient groups

3. **Medication Distribution:**
   - Bar chart: Top 10 prescribed medications
   - Total prescriptions per medication

**Right Column:**

4. **Alerts & Notifications:**
   - Patients with low adherence (< 70%)
   - Pending medication confirmations
   - System notifications

5. **Quick Actions:**
   - ➕ Add New Patient
   - 💊 Add Medication to Catalog
   - 📊 Generate Report
   - 👥 View All Patients

6. **System Health:**
   - API status
   - Last backup
   - Active users now

---

#### Patients Page (`/admin/patients`)
**Layout:** Filterable data table

**Header:**
```
Patients (248)        [+ Add Patient]    [🔍 Search...]
[Export CSV] [Filters ▼]
```

**Filters Panel (collapsible):**
```
Status: [ All ] [Stable] [Critical] [Under Observation]
Adherence: [All] [>90%] [75-90%] [60-75%] [<60%]
Assigned to me: [ ] Show only
Sort by: [Name ▼]
```

**Table:**
| Avatar | Name | Email | Status | Adherence | Medications | Last Activity | Actions |
|--------|------|-------|--------|-----------|-------------|--------------|---------|
| 👤 | John Doe | john@... | Stable 🟢 | 92% 🎯 | 3 active | 2 hours ago | [View] [Edit] |
| 👤 | Jane Smith | jane@... | Critical 🔴 | 65% ⚠️ | 5 active | 1 day ago | [View] [Edit] |

**Pagination:**
```
Showing 1-10 of 248    [Previous] [1] [2] [3] ... [25] [Next]
```

**Row Actions:**
- View: Go to patient detail page
- Edit: Update medical info
- Delete: Deactivate account (confirm dialog)

**Bulk Actions:**
- Select multiple patients
- Send notification
- Export selected

---

#### Patient Detail Page (`/admin/patients/:id`)
**Layout:** Profile view with tabs

**Header Section:**
```
[← Back to Patients]

[Avatar]  John Doe                        [Edit Profile]
          john@example.com
          +1234567890
          
Status: Stable 🟢 | Assigned to: Dr. Smith
```

**Tabs:**
1. Overview
2. Medications
3. Adherence
4. Medical History
5. Activity Log

**Overview Tab:**

**Personal Information Card:**
- Age: 33 years
- Gender: Male
- Blood Type: A+
- Height: 175 cm | Weight: 70 kg

**Medical Information Card:**
- Allergies: Penicillin, Sulfa drugs
- Conditions: Type 2 Diabetes, Hypertension
- Emergency Contact: [Name, Phone]

**Current Medications Summary:**
- 3 Active medications
- 92% adherence rate
- Last logged: 2 hours ago

**Medications Tab:**

**Active Medications (3):**
```
┌──────────────────────────────────────────┐
│ Aspirin 100mg - Tablet                   │
│ 2x daily | With meals                    │
│ Started: Nov 1, 2025 | Ends: Dec 31     │
│ Adherence: 95% ✓                         │
│ [View Details] [Update] [Stop]           │
└──────────────────────────────────────────┘
```

**Actions:**
- [+ Assign New Medication]
- [View Stopped Medications]

**Assign Medication Form (Modal):**
```
Select Medication: [Search catalog... ▼]
  → Shows: Aspirin 100mg - Tablet

Dosage: [100mg    ]
Instructions: [Take with breakfast       ]
Times per day: [2]
Schedule: [08:00] [20:00]

Duration:
  Start Date: [2025-11-23]
  End Date: [2025-12-23] or [ ] Ongoing

[Cancel] [Assign Medication]
```

**Adherence Tab:**
- Full adherence dashboard (same as patient view)
- Admin can see all stats
- Download reports

**Medical History Tab:**
- Stopped medications with reasons
- Past conditions
- Notes from consultations

**Activity Log Tab:**
- Timeline of all actions
- Medication changes
- Login history
- Profile updates

---

#### Medication Catalog Page (`/admin/medications`)
**Layout:** Grid/list view toggle with search

**Header:**
```
Medication Catalog (487)     [+ Add Medication]
[Grid] [List]    [🔍 Search by name...]

Filter by form: [All] [Tablet] [Capsule] [Syrup] [Injection]
```

**Grid View (Cards):**
```
┌─────────────────────────────┐
│ 💊 Aspirin                  │
│ Form: Tablet                │
│ Default: 100mg              │
│                             │
│ Prescribed: 89 times        │
│ Side effects: May cause...  │
│                             │
│ [View] [Edit] [Delete]      │
└─────────────────────────────┘
```

**List View (Table):**
| Name | Form | Default Dosage | Side Effects | Warnings | Prescribed | Actions |
|------|------|----------------|--------------|----------|------------|---------|
| Aspirin | Tablet | 100mg | May cause... | Do not... | 89x | [View][Edit][Delete] |

**Add/Edit Medication Form (Modal or Page):**
```
Medication Name: [Aspirin         ]
Form: [Tablet ▼]
Default Dosage: [100mg           ]

Side Effects:
[May cause stomach upset, nausea...]

Warnings:
[Do not take on empty stomach...]

[Cancel] [Save Medication]
```

**Medication Detail View (Modal):**
- Full information
- List of patients currently taking
- Adherence stats for this medication
- Recently added by admin

---

### 5. AI CHATBOT

**Floating Chat Widget (All Pages):**
```
[Bottom right corner]
┌────────────┐
│ 💬 Chat    │ ← Minimized
│ (3) unread │
└────────────┘
```

**Expanded Chat Window:**
```
┌─────────────────────────────────────┐
│ MediTrack AI Assistant        [✕]  │
├─────────────────────────────────────┤
│                                     │
│ Bot: Hi! I'm your medication        │
│      assistant. How can I help?    │
│      ⏰ 10:30 AM                    │
│                                     │
│              You: What medications  │
│                   do I take today? │
│                   ⏰ 10:31 AM      │
│                                     │
│ Bot: You have 3 medications today: │
│      1. Aspirin 100mg at 8 AM ✓   │
│      2. Metformin 500mg at 12 PM   │
│      3. Aspirin 100mg at 8 PM      │
│      ⏰ 10:31 AM                    │
│                                     │
│ [Suggested questions:]              │
│ • When is my next dose?            │
│ • Show my adherence score          │
│ • What are side effects?           │
│                                     │
├─────────────────────────────────────┤
│ [Type your message...          ] [↑]│
└─────────────────────────────────────┘
```

**Chatbot Features:**
- Context-aware responses
- Quick action buttons
- Typing animation
- Message timestamps
- Suggested questions
- Voice input (future)
- Markdown support for formatting

**Chatbot Capabilities:**
1. **Medication Info:**
   - "What medications am I taking?"
   - "Tell me about Aspirin"
   - "What are the side effects?"

2. **Adherence:**
   - "What's my adherence score?"
   - "Show my streak"
   - "Did I take my morning dose?"

3. **Reminders:**
   - "When is my next dose?"
   - "Set a reminder for 8 AM"
   - "Turn off reminders today"

4. **Logging:**
   - "Mark Aspirin as taken"
   - "I skipped my afternoon dose"
   - "Log all today's medications"

5. **Help:**
   - "How do I add medication?"
   - "What do the colors mean?"
   - "Contact support"

**Implementation:**
- Use OpenAI API or local LLM
- RAG (Retrieval Augmented Generation) with medication database
- Context includes user's medication list, adherence history
- Fallback to predefined responses
- Escalate to human support when needed

---

## Component Details

### Common Components

#### Button Component
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

// Usage:
<Button variant="primary" size="md" loading={isLoading}>
  Save Changes
</Button>
```

**Styles:**
- Primary: Filled with primary color
- Secondary: Filled with secondary color
- Outline: Border with transparent background
- Ghost: No border, hover effect
- Danger: Red for destructive actions

**States:**
- Default
- Hover: Darken 10%
- Active: Darken 15%
- Disabled: 50% opacity
- Loading: Show spinner, disable clicks

---

#### Card Component
```tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  actions?: ReactNode;
  hoverable?: boolean;
  children: ReactNode;
}

<Card title="Today's Medications" hoverable>
  {/* Content */}
</Card>
```

**Styles:**
- White background
- Subtle shadow
- Border radius: 12px
- Padding: 24px
- Hover: Lift effect (if hoverable)

---

#### Modal Component
```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
}

<Modal isOpen={isOpen} onClose={handleClose} title="Add Medication">
  {/* Form content */}
  <Modal.Footer>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Save</Button>
  </Modal.Footer>
</Modal>
```

**Features:**
- Backdrop overlay (semi-transparent)
- Click outside to close
- ESC key to close
- Smooth animation (fade + scale)
- Focus trap
- Scroll lock on body

---

#### Badge Component
```tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size: 'sm' | 'md';
  dot?: boolean;
  children: ReactNode;
}

<Badge variant="success">Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
```

**Styles:**
- Pill shape (full border radius)
- Small text
- Color-coded backgrounds
- Optional leading dot

---

#### Form Components
```tsx
// Input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  required
/>

// Select
<Select
  label="Medication Form"
  options={[
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' }
  ]}
  value={form}
  onChange={setForm}
/>

// Textarea
<Textarea
  label="Notes"
  rows={4}
  placeholder="Add any notes..."
/>

// Checkbox
<Checkbox label="Remember me" checked={remember} onChange={setRemember} />

// Switch
<Switch label="Enable notifications" checked={enabled} onChange={setEnabled} />

// Date Picker
<DatePicker
  label="Start Date"
  value={startDate}
  onChange={setStartDate}
  minDate={new Date()}
/>

// Time Picker
<TimePicker
  label="Reminder Time"
  value={time}
  onChange={setTime}
  format="12h"
/>
```

**Validation:**
- Real-time validation on blur
- Show error message below field
- Red border on error
- Green checkmark on valid
- Required indicator (*)

---

### Layout Components

#### Navbar
```tsx
<Navbar>
  <Navbar.Logo>
    <img src="/logo.svg" alt="MediTrack" />
  </Navbar.Logo>
  
  <Navbar.Menu>
    <NavLink to="/dashboard">Dashboard</NavLink>
    <NavLink to="/medications">Medications</NavLink>
    <NavLink to="/adherence">Adherence</NavLink>
  </Navbar.Menu>
  
  <Navbar.Actions>
    <IconButton icon={<BellIcon />} badge={3} />
    <UserMenu user={currentUser} onLogout={handleLogout} />
  </Navbar.Actions>
</Navbar>
```

**Features:**
- Sticky on scroll
- Shadow on scroll
- Active link highlight
- Notification badge
- User dropdown menu
- Mobile: Hamburger menu

---

#### Sidebar
```tsx
<Sidebar collapsed={isCollapsed} onToggle={setIsCollapsed}>
  <SidebarItem icon={<HomeIcon />} label="Dashboard" to="/patient/dashboard" />
  <SidebarItem icon={<PillIcon />} label="Medications" to="/patient/medications" />
  <SidebarItem icon={<ChartIcon />} label="Adherence" to="/patient/adherence" />
  <SidebarItem icon={<BellIcon />} label="Reminders" to="/patient/reminders" badge={5} />
  <SidebarItem icon={<HistoryIcon />} label="History" to="/patient/history" />
  <SidebarItem icon={<UserIcon />} label="Profile" to="/patient/profile" />
  
  <Sidebar.Divider />
  
  <SidebarItem icon={<LogoutIcon />} label="Logout" onClick={handleLogout} />
</Sidebar>
```

**Features:**
- Collapsible (full width ↔ icons only)
- Active state highlight
- Icon + text or icon only
- Badges for notifications
- Smooth transitions
- Mobile: Overlay drawer

**Responsive:**
- Desktop: Always visible
- Tablet: Collapsible
- Mobile: Drawer (slide from left)

---

### Chart Components

#### Adherence Chart
```tsx
<AdherenceChart
  data={adherenceData}
  period="weekly"
  showGrid={true}
  animate={true}
/>
```

**Data Format:**
```ts
const adherenceData = [
  { date: '2025-11-17', score: 100, taken: 4, scheduled: 4 },
  { date: '2025-11-18', score: 75, taken: 3, scheduled: 4 },
  // ...
];
```

**Chart Types:**
- Line Chart: Trend over time
- Bar Chart: Daily comparison
- Pie Chart: Status distribution
- Radial Progress: Current score

**Features:**
- Tooltips on hover
- Legend
- Grid lines
- Smooth animations
- Responsive
- Color-coded by score range

---

### Table Components

#### DataTable
```tsx
<DataTable
  columns={columns}
  data={patients}
  loading={isLoading}
  pagination={{
    pageSize: 10,
    totalPages: 25,
    currentPage: 1,
    onPageChange: handlePageChange
  }}
  filters={filters}
  sortable={true}
  selectable={true}
  onRowClick={handleRowClick}
/>
```

**Features:**
- Sortable columns (click header)
- Filterable columns
- Searchable
- Pagination
- Row selection (checkboxes)
- Loading skeleton
- Empty state
- Expandable rows
- Fixed header on scroll
- Column resizing
- Export to CSV

---

## API Integration

### API Service (`services/api.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### Auth Service (`services/auth.service.ts`)
```typescript
import api from './api';

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    
    return access_token;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
```

---

### React Query Hooks

#### useMedications Hook
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationService } from '../services/medication.service';

export const useMedications = (patientId?: number) => {
  const queryClient = useQueryClient();

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications', patientId],
    queryFn: () => medicationService.getPatientMedications(patientId!),
    enabled: !!patientId,
  });

  const confirmMedication = useMutation({
    mutationFn: medicationService.confirmMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication confirmed!');
    },
  });

  const logDose = useMutation({
    mutationFn: medicationService.logDose,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['adherence'] });
      toast.success('Dose logged successfully!');
    },
  });

  return {
    medications,
    isLoading,
    confirmMedication,
    logDose,
  };
};
```

---

### useAdherence Hook
```typescript
export const useAdherence = (period: 'daily' | 'weekly' | 'monthly') => {
  const { data: stats } = useQuery({
    queryKey: ['adherence', 'stats', period],
    queryFn: () => adherenceService.getStats(period),
  });

  const { data: chartData } = useQuery({
    queryKey: ['adherence', 'chart'],
    queryFn: () => adherenceService.getChartData(7),
  });

  const { data: dashboard } = useQuery({
    queryKey: ['adherence', 'dashboard'],
    queryFn: () => adherenceService.getDashboard(),
  });

  return { stats, chartData, dashboard };
};
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Desktops */
--breakpoint-xl: 1280px;  /* Large desktops */
--breakpoint-2xl: 1536px; /* Extra large */
```

### Layout Adjustments

**Mobile (<768px):**
- Single column layout
- Hamburger menu
- Bottom navigation bar
- Stacked cards
- Simplified charts
- Floating action button
- Full-width modals

**Tablet (768px - 1024px):**
- 2-column grid
- Collapsible sidebar
- Side drawer for filters
- Responsive tables (horizontal scroll)

**Desktop (>1024px):**
- Full sidebar
- Multi-column grids
- Side-by-side modals
- Full data tables
- Hover interactions

---

## Animations & Transitions

### Page Transitions
```typescript
// Using Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {/* Page content */}
</motion.div>
```

### Micro-interactions
- Button hover: Scale 1.02, darken
- Card hover: Lift (shadow increase)
- Input focus: Border glow
- Badge pulse: For notifications
- Loading: Skeleton screens
- Success: Checkmark animation
- Error: Shake animation

### Loading States
- Skeleton screens (placeholder UI)
- Spinner for buttons
- Progress bar for uploads
- Shimmer effect for images

---

## Accessibility

### WCAG 2.1 AA Compliance

**Keyboard Navigation:**
- Tab through interactive elements
- Enter/Space to activate
- ESC to close modals
- Arrow keys in lists/menus

**Screen Reader Support:**
- Semantic HTML (header, nav, main, aside)
- ARIA labels for icons
- ARIA live regions for notifications
- Alt text for images
- Form labels

**Color Contrast:**
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

**Focus Indicators:**
- Visible focus outline
- Skip to main content link
- Focus trap in modals

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load pages
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/patient/dashboard" element={<PatientDashboard />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

### Image Optimization
- WebP format with fallback
- Lazy loading (intersection observer)
- Responsive images (srcset)
- Placeholder blur effect

### Bundle Optimization
- Tree shaking
- Minification
- Compression (gzip/brotli)
- CDN for static assets

### Caching Strategy
- React Query cache
- localStorage for user preferences
- Service worker (PWA)

---

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- Form validation
- Utility functions

### Integration Tests
- API integration
- Authentication flow
- Form submissions
- Navigation

### E2E Tests (Playwright/Cypress)
- Critical user journeys:
  1. Register → Login → Dashboard
  2. Add medication → Set reminder → Log dose
  3. View adherence stats → Export report
  4. Admin: Add patient → Assign medication

---

## Deployment

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=MediTrack-AI
VITE_ENABLE_CHATBOT=true
VITE_OPENAI_API_KEY=sk-...
```

### Build Script
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

---

## Security Considerations

### Authentication
- JWT stored in localStorage (consider httpOnly cookies for production)
- Token expiration handling
- Automatic logout on inactivity
- Secure password requirements

### Data Protection
- Input sanitization
- XSS prevention
- CSRF tokens
- Rate limiting on API calls
- Content Security Policy (CSP)

### Privacy
- HIPAA compliance considerations
- Encrypt sensitive data
- Audit logs
- Data export/deletion

---

## Future Enhancements

### Phase 2 Features
- **Progressive Web App (PWA):**
  - Offline support
  - Install to home screen
  - Push notifications
  - Background sync

- **Advanced Analytics:**
  - ML-powered adherence predictions
  - Personalized recommendations
  - Medication interaction warnings
  - Trend analysis

- **Social Features:**
  - Family member access (caregiver mode)
  - Support groups
  - Share progress with doctor
  - Community challenges

- **Integrations:**
  - Apple Health / Google Fit
  - Electronic Health Records (EHR)
  - Pharmacy APIs
  - Telemedicine platforms

- **Advanced Chatbot:**
  - Voice commands
  - Image recognition (pill identification)
  - Symptom checker
  - Multi-language support

---

## Success Criteria

### Functional Requirements ✓
- All CRUD operations working
- Role-based access control enforced
- Real-time data updates
- Form validation
- Error handling
- Responsive on all devices

### Non-Functional Requirements
- **Performance:**
  - Initial load < 3 seconds
  - Interaction response < 100ms
  - Lighthouse score > 90

- **Usability:**
  - Intuitive navigation
  - Clear visual hierarchy
  - Helpful error messages
  - Onboarding tutorial

- **Reliability:**
  - 99.9% uptime
  - Graceful error handling
  - Offline functionality (future)

---

## Development Checklist

### Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (React Router, React Query, MUI/Tailwind, etc.)
- [ ] Configure ESLint + Prettier
- [ ] Setup environment variables
- [ ] Create folder structure

### Authentication
- [ ] Login page with form validation
- [ ] Register page with validation
- [ ] Protected routes
- [ ] Auth context
- [ ] Token management
- [ ] Role-based routing

### Layout
- [ ] Navbar component
- [ ] Sidebar component (collapsible)
- [ ] Footer component
- [ ] Dashboard layout wrapper
- [ ] Mobile responsive navigation

### Patient Features
- [ ] Dashboard with stats cards
- [ ] Medication list with filters
- [ ] Medication detail modal
- [ ] Log dose form
- [ ] Adherence charts (line, bar, pie)
- [ ] Reminder schedule form
- [ ] Reminder calendar view
- [ ] History timeline
- [ ] Profile edit form

### Admin Features
- [ ] Admin dashboard with analytics
- [ ] Patient table with filters
- [ ] Patient detail page
- [ ] Assign medication form
- [ ] Medication catalog (CRUD)
- [ ] Bulk actions

### Chatbot
- [ ] Chat window component
- [ ] Message component with typing animation
- [ ] Chat input with suggestions
- [ ] API integration (OpenAI/local)
- [ ] Context-aware responses

### Common Components
- [ ] Button (all variants)
- [ ] Card
- [ ] Modal
- [ ] Input
- [ ] Select
- [ ] Textarea
- [ ] Checkbox
- [ ] Switch
- [ ] Badge
- [ ] Avatar
- [ ] Spinner
- [ ] DataTable

### API Integration
- [ ] Axios setup with interceptors
- [ ] Auth service
- [ ] Patient service
- [ ] Medication service
- [ ] Adherence service
- [ ] Reminder service
- [ ] React Query hooks

### Polish
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Form validation
- [ ] Animations
- [ ] Dark mode (optional)
- [ ] Accessibility audit
- [ ] Performance optimization

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for API
- [ ] E2E tests for critical flows

### Deployment
- [ ] Build optimization
- [ ] Environment configuration
- [ ] Docker setup
- [ ] CI/CD pipeline

---

## Example Code Snippets

### Patient Dashboard Page
```tsx
import { useAuth } from '@/hooks/useAuth';
import { useMedications } from '@/hooks/useMedications';
import { useAdherence } from '@/hooks/useAdherence';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/patient/StatsCard';
import MedicationCard from '@/components/patient/MedicationCard';
import AdherenceChart from '@/components/patient/AdherenceChart';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { medications, isLoading } = useMedications(user.id);
  const { dashboard } = useAdherence('weekly');

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <PageHeader title={`Welcome back, ${user.full_name}`} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Medications"
          value={medications?.length || 0}
          subtitle="Active"
          icon={<PillIcon />}
          color="primary"
        />
        <StatsCard
          title="Today's Doses"
          value={`${dashboard?.daily_stats.total_taken}/${dashboard?.daily_stats.total_scheduled}`}
          subtitle="1 pending"
          icon={<ClockIcon />}
          color="warning"
        />
        <StatsCard
          title="Adherence Score"
          value={`${dashboard?.weekly_stats.adherence_score}%`}
          subtitle="Excellent"
          icon={<TrendUpIcon />}
          color="success"
        />
        <StatsCard
          title="Current Streak"
          value={`${dashboard?.overall_stats.current_streak}d`}
          subtitle="Keep it up!"
          icon={<FireIcon />}
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Today's Medications">
            {medications?.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </Card>
          
          <Card title="7-Day Adherence Trend" className="mt-6">
            <AdherenceChart data={dashboard?.chart_data} />
          </Card>
        </div>

        <div>
          <Card title="Upcoming Reminders">
            {/* Reminder list */}
          </Card>
          
          <Card title="Quick Actions" className="mt-6">
            <Button variant="primary" fullWidth icon={<PlusIcon />}>
              Log Medication
            </Button>
            <Button variant="outline" fullWidth icon={<CalendarIcon />} className="mt-3">
              View Calendar
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## Final Notes

This prompt provides a **complete blueprint** for building a modern, production-ready React frontend that:

1. ✅ **Matches your backend API perfectly** - All endpoints, request/response formats, authentication
2. ✅ **Modern UI/UX** - Clean design, smooth animations, responsive layout
3. ✅ **Role-based access** - Separate Patient and Admin experiences
4. ✅ **Feature-complete** - Medications, adherence tracking, reminders, chatbot
5. ✅ **Production-ready** - Error handling, loading states, validation, security
6. ✅ **Scalable architecture** - Clean code structure, reusable components, TypeScript

**Use this prompt with:**
- AI code generators (v0.dev, bolt.new, etc.)
- Human developers
- Code templates
- As a specification document

**Expected Development Time:**
- With AI assistance: 2-4 days
- Manual development: 2-3 weeks
- Full polish + testing: +1 week

Good luck building your frontend! 🚀
