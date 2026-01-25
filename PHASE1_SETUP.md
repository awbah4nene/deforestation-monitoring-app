# Phase 1 Authentication Setup - Configuration Guide

## ✅ What Has Been Implemented

### **Authentication Infrastructure**
- NextAuth.js with Prisma adapter for database-backed authentication
- Credentials provider with email/password login
- JWT-based session management with 30-day expiration
- Password hashing using bcryptjs

### **API Routes Created**
- `/api/auth/[...nextauth]` - NextAuth handler for login/logout/session
- `/api/auth/register` - User registration endpoint with validation
- `/api/auth/session` - Current session information endpoint

### **Authentication Pages**
- `/auth/login` - Login page with form validation
- `/auth/register` - Registration page with role selection
- `/auth/error` - Error handling page for auth failures

### **Protected Dashboard**
- `/dashboard` - Main dashboard with statistics from seeded data
- Role-based sidebar navigation
- User dropdown menu with profile and settings
- Authentication required for all dashboard routes

### **Security Features**
- Protected route middleware at application level
- Role-based access control utilities
- Automatic redirect to login for unauthenticated users
- Automatic redirect to dashboard for authenticated users

### **Database Integration**
- Prisma client properly configured for API routes
- User model with roles, active status tracking
- Last login timestamp tracking
- Support for organization memberships

---

## 📋 Configuration Steps

### **1. Update Environment Variables**

Open the `.env.local` file and configure:

```env
# Database - Use your Supabase connection string
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true"

# NextAuth - Generate a secure secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Supabase (optional, if using additional Supabase features)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use this online: https://generate-secret.vercel.app/32
```

### **2. Test Login Credentials**

Use the credentials from your seeded database. Check your seed file for user emails and passwords.

Common seeded users:
- Email: `admin@forestmonitor.sl` (if in your seed data)
- Password: Check your seed file for the password

### **3. Start the Development Server**

```bash
npm run dev
```

The application will start at `http://localhost:3000`

---

## 🧪 Testing the Authentication Flow

### **Test Registration**
1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/auth/login`
3. Click "Register here"
4. Fill in the registration form with:
   - Full Name
   - Email
   - Phone (optional)
   - Role (Field Officer, Stakeholder, or Viewer)
   - Password (min 8 characters)
5. Submit and you'll be redirected to login

### **Test Login**
1. Go to `/auth/login`
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to `/dashboard`

### **Test Protected Routes**
1. Try accessing `/dashboard` without logging in
2. You should be redirected to `/auth/login`
3. After login, you'll be taken back to `/dashboard`

### **Test Role-Based Access**
1. Login with different role users
2. Notice the sidebar shows different menu items based on role:
   - **ADMIN & GOVERNMENT_OFFICIAL**: All menu items including Users and ML Models
   - **FIELD_OFFICER**: Dashboard, Map, Alerts, Field Reports, Regions, Settings
   - **STAKEHOLDER**: Dashboard, Map, Alerts, Regions, Analytics, Settings
   - **VIEWER**: Dashboard, Map, Alerts, Regions, Settings (read-only)

### **Test Logout**
1. Click on your user avatar in top-right
2. Click "Sign out"
3. You'll be redirected to login page

---

## 🔍 Verify Database Integration

Check that authentication is working with your Supabase database:

1. After login, verify `lastLoginAt` is updated in the User table
2. Check that sessions are being created
3. Verify the dashboard statistics load correctly from your seeded data

---

## 📊 Dashboard Features

The dashboard displays real-time statistics from your database:
- **Pending Alerts**: Count of deforestation alerts with PENDING status
- **Forest Regions**: Total number of forest regions
- **Reports (30d)**: Field reports from last 30 days
- **Active Users**: Count of users with isActive = true

---

## 🛠️ Troubleshooting

### **"Invalid email or password" error**
- Verify the user exists in your database
- Check the password was hashed correctly during seeding
- Ensure your DATABASE_URL is correct

### **"NEXTAUTH_SECRET not set" error**
- Make sure `.env.local` exists
- Verify NEXTAUTH_SECRET is defined
- Restart the dev server after adding environment variables

### **Middleware redirect loop**
- Clear browser cookies
- Check that public paths are configured correctly in middleware.ts
- Verify NEXTAUTH_URL matches your development URL

### **Database connection errors**
- Verify your DATABASE_URL is correct
- Ensure Prisma client is generated: `npm run prisma:generate`
- Check Supabase connection pooling settings

---

## 🎯 Next Steps

After Phase 1 is complete and tested, you're ready to proceed with:

**Phase 2: Core Dashboard**
- User profile management
- Dashboard widgets and customization
- Basic CRUD API endpoints

**Phase 3: Map & Visualization**
- Interactive Leaflet map
- Forest region boundaries
- Alert markers and satellite imagery overlay

---

## 📁 Files Created

### Authentication Configuration
- `lib/auth/config.ts` - NextAuth configuration
- `lib/auth/types.ts` - TypeScript type definitions
- `lib/auth/session.ts` - Session utilities and role checking
- `middleware.ts` - Route protection middleware

### API Routes
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/api/auth/register/route.ts` - Registration endpoint
- `app/api/auth/session/route.ts` - Session endpoint

### Pages
- `app/auth/login/page.tsx` - Login page
- `app/auth/register/page.tsx` - Registration page
- `app/auth/error/page.tsx` - Error page
- `app/dashboard/page.tsx` - Main dashboard
- `app/dashboard/layout.tsx` - Dashboard layout with auth check

### Components
- `app/dashboard/components/DashboardNav.tsx` - Top navigation bar
- `app/dashboard/components/DashboardSidebar.tsx` - Side navigation menu

### Configuration
- `.env.local` - Environment variables template

---

## ✨ Summary

Phase 1 is now complete with:
- ✅ Secure authentication with NextAuth
- ✅ User registration and login
- ✅ Role-based access control
- ✅ Protected dashboard routes
- ✅ Database integration with Prisma
- ✅ Middleware for route protection
- ✅ Session management

You can now login and access the dashboard with your seeded user credentials!
