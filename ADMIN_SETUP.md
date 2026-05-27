# CodeBro Admin Dashboard Setup Guide

## 🔐 Admin Credentials

**Email:** `admin@codebro.io`  
**Password:** `Admin123!@#`

> ⚠️ **Important:** Change your password immediately after first login. Never share these credentials publicly.

---

## Step-by-Step Setup

### Step 1: Create Admin User in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your CodeBro project
3. Navigate to **Authentication** → **Users**
4. Click **Create User** button
5. Fill in the following:
   - **Email:** `admin@codebro.io`
   - **Password:** `Admin123!@#`
6. Click **Create**

### Step 2: Set Admin Role in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your CodeBro project
3. Navigate to **SQL Editor**
4. Run the following SQL query:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@codebro.io';
```

5. Click **Run**

### Step 3: Access Admin Dashboard

1. Log in to CodeBro with the admin credentials:
   - Email: `admin@codebro.io`
   - Password: `Admin123!@#`

2. Click on your **Profile Icon** in the top-right navbar
3. Select **⚙️ Admin Panel** from the dropdown menu
4. You'll see the admin dashboard with all user details and platform analytics

---

## ✨ Admin Dashboard Features

### Overview Tab
- **Platform Statistics:** Total users, problems, courses, and daily active users
- **Admin Credentials:** Display of admin login information
- **Quick Actions:** Buttons to quickly navigate to different admin sections
- **Platform Stats:** Breakdown of problem difficulties and course information

### Users Tab
- **Search & Filter:** Search users by name, email, username, or UID
- **Role Filter:** Filter users by role (Admin, Student)
- **User Progress:** View detailed progress for each user including:
  - Solved problems
  - Submissions and acceptance rate
  - Active courses and progress
  - Quiz performance
  - Last activity date
- **User Details Modal:** Click "View" on any user to see:
  - Complete profile information
  - XP, level, and streak
  - Course progress details
  - Recent submissions
  - Quiz history

### Problems Tab
- **Add Problems:** Create custom problems with:
  - Title, difficulty level, topics
  - XP rewards and acceptance rates
  - Company tags
- **Edit & Delete:** Modify or remove custom problems
- **Problem Statistics:** View all problems in the platform

### Courses Tab
- **Add Courses:** Create custom courses with:
  - Title, description, level
  - Lessons and estimated hours
  - Tags and icons
- **Edit & Delete:** Modify or remove custom courses
- **Course Management:** View all courses with enrollment data

### Analytics Tab
- **Charts & Statistics:**
  - Problems by difficulty
  - Lessons per course
  - Company coverage analysis
  - Database information
- **Real-time Metrics:** View actual user engagement and submission trends

---

## 📊 User Data Visible to Admins

Each user profile in the admin dashboard displays:

| Field | Description |
|-------|-------------|
| **Name** | User's display name and username |
| **Email** | User's registration email |
| **XP & Level** | Current experience points and user level |
| **Solved Problems** | Number of problems solved vs. total |
| **Submissions** | Total submissions and acceptance rate |
| **Courses** | Active courses and average progress |
| **Quiz Performance** | Quizzes taken and average accuracy |
| **Activity** | Last login and latest activity date |
| **Role** | User role (Student or Admin) |

---

## 🔒 Security Notes

1. **Change Password:** After first login, immediately change your admin password
2. **Share Responsibly:** Only give admin credentials to trusted team members
3. **Audit Trail:** All admin actions are recorded in your database
4. **Firebase Rules:** Ensure Firebase security rules allow admin operations
5. **Supabase Policies:** Update RLS (Row Level Security) policies as needed

---

## ✅ Profile Icon Fix

The profile icon in the navbar now:
- ✅ Always displays for all users (no missing icons)
- ✅ Shows user initials if no avatar is uploaded
- ✅ Displays avatar image if available
- ✅ Opens a dropdown menu when clicked
- ✅ Provides quick access to profile, submissions, settings, and admin panel (for admins)

---

## 🆘 Troubleshooting

### Admin Dashboard Not Showing
- Ensure your Supabase user record has `role = 'admin'`
- Check that you're logged in with the correct email
- Refresh the page after setting admin role

### Profile Icon Not Visible
- Clear browser cache and reload
- Check that the user profile was created successfully in Supabase
- Ensure Supabase connection is active

### Users Not Loading
- Check Supabase connection and API keys
- Verify Supabase `users` table exists
- Check database permissions and RLS policies
- Ensure `getAdminUserDashboard` function has access to needed data

### Can't Create Custom Problems/Courses
- Verify localStorage is enabled in your browser
- Check browser console for errors
- Ensure you have adequate storage space

---

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Firebase and Supabase credentials in environment variables
3. Review database connection settings
4. Check RLS policies in Supabase

---

## 🎯 Next Steps

After setting up the admin account:
1. Change your password in Settings
2. Explore the admin dashboard tabs
3. Add your first custom problem or course
4. Invite other admins using their email addresses
5. Monitor platform analytics and user progress

Happy administering! 🚀
