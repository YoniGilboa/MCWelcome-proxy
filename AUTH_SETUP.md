# Mind Channel - Authentication & Role Management Setup

## Changes Implemented

### 1. **Removed User Registration**
- Removed signup page functionality
- Updated all navigation links to remove "Sign Up" references
- Modified Header component to show only "Sign In" button for non-authenticated users
- Users can now only be created by administrators

### 2. **Password Reset Flow**
- Created `/auth/forgot-password` page - Users can request password reset
- Created `/auth/reset-password` page - Users can set new password via email link
- Added "Forgot password?" link on sign-in page
- Email-based password reset using Supabase Auth

### 3. **User Roles System**
Two user roles implemented:
- **Admin**: Full access to admin panel and all features
- **Client**: Access to solutions they've been approved for

### 4. **Admin-Only Access**
- Middleware updated to check user roles
- Admin routes (`/admin/*`) are protected
- Only users with `role: 'admin'` in user_metadata can access admin panel
- Non-admin users are redirected to solutions page

### 5. **Admin Panel Enhancements**
- Professional CRM-style dashboard with sidebar
- **Add User** functionality - Admins can create new users with email, password, and role
- User management table with solution approval/revoke
- Stats dashboard showing total users, active users, and approvals
- Role badge display in user menu

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required for Admin User Creation
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Where to find these values:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Database Setup (TODO)

You'll need to create these tables in Supabase:

### User Solutions Table
```sql
CREATE TABLE user_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  solution_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'approved', 'revoked', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, solution_id)
);

-- Enable RLS
ALTER TABLE user_solutions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own solutions"
  ON user_solutions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all solutions"
  ON user_solutions FOR ALL
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
```

## Creating Your First Admin User

Since signup is disabled, you need to create the first admin user manually via Supabase:

### Method 1: Using Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. After creating, click on the user
5. Go to **User Metadata** section
6. Add custom metadata:
   ```json
   {
     "role": "admin"
   }
   ```

### Method 2: Using Supabase SQL Editor
```sql
-- Create admin user (replace with your email/password)
INSERT INTO auth.users (
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@yourdomain.com',
  crypt('your_password', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}',
  'authenticated',
  'authenticated'
);
```

## How to Use

### As an Admin:
1. Sign in with your admin credentials
2. Access the admin panel at `/admin` or through the user menu
3. Click "Add User" to create new users
4. Assign role: `admin` or `client`
5. Approve/revoke solution access for users

### As a Client:
1. Wait for admin to create your account
2. Check your email for credentials (or admin will provide them)
3. Sign in at `/auth/signin`
4. If you forgot password, use "Forgot password?" link
5. Access approved solutions from `/solutions` page

### Password Reset Flow:
1. Go to sign-in page
2. Click "Forgot password?"
3. Enter your email
4. Check email for reset link
5. Click link to set new password
6. Redirected to sign-in page

## File Changes Summary

### New Files:
- `/app/auth/forgot-password/page.tsx` - Password reset request page
- `/app/auth/reset-password/page.tsx` - New password setup page
- `/app/api/admin/create-user/route.ts` - API endpoint for admin user creation

### Modified Files:
- `/app/auth/signin/page.tsx` - Added forgot password link, removed signup link
- `/components/Header.tsx` - Removed signup buttons, updated navigation
- `/middleware.ts` - Added role-based access control
- `/app/admin/page.tsx` - Added user creation modal, role checking
- `/app/solutions/page.tsx` - Display user role, conditional admin panel access

### Removed Functionality:
- Public signup page (file still exists but not linked)
- Signup navigation links
- Google OAuth signup (keeping sign-in for now)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
2. **Admin API**: The `/api/admin/create-user` route should have additional authentication
3. **RLS Policies**: Ensure Row Level Security is properly configured
4. **Email Verification**: Consider enabling email verification for new users
5. **Password Strength**: Enforce strong password requirements

## Testing Checklist

- [ ] Admin can sign in and access admin panel
- [ ] Client users are redirected from `/admin` to `/solutions`
- [ ] Password reset emails are being sent
- [ ] New users can be created from admin panel
- [ ] User roles are correctly assigned and displayed
- [ ] Solution approvals work correctly
- [ ] Non-authenticated users can't access protected routes
- [ ] Sign out works properly

## Next Steps

1. Set up Supabase environment variables
2. Create database tables for user_solutions
3. Create your first admin user via Supabase dashboard
4. Test the complete authentication flow
5. Configure email templates in Supabase for password reset
6. Add actual database queries to replace mock data
7. Implement proper admin authentication middleware
8. Add email notifications when users are created

## Support

For issues or questions:
- Check Supabase logs for authentication errors
- Verify environment variables are set correctly
- Ensure database tables and RLS policies are created
- Check browser console for client-side errors
