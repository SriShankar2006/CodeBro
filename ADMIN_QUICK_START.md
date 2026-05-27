# 🔐 Quick Admin Setup Reference

## Admin Login Credentials
```
Email:    admin@codebro.io
Password: Admin123!@#
```

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Firebase Setup (2 minutes)
```
1. Go to: https://console.firebase.google.com
2. Select your CodeBro project
3. Click: Authentication → Users → Create User
4. Email:    admin@codebro.io
5. Password: Admin123!@#
6. Click: Create
```

### Step 2: Supabase Setup (1 minute)
```
1. Go to: https://supabase.com/dashboard
2. Select your CodeBro project
3. Click: SQL Editor
4. Copy and paste:

   UPDATE users SET role = 'admin' WHERE email = 'admin@codebro.io';

5. Click: Run
```

### Step 3: Login & Verify (1 minute)
```
1. Go to: Your CodeBro app
2. Click: Login
3. Email:    admin@codebro.io
4. Password: Admin123!@#
5. Click: Sign In
6. Click: Profile Icon (top-right)
7. Verify: "⚙️ Admin Panel" option appears
```

---

## 🎯 What You Can Do as Admin

- 📊 View all users and their progress
- 🔍 Search and filter users by role, activity, performance
- 📈 See detailed analytics for each user
- ➕ Add custom coding problems
- 📚 Create custom courses
- 📋 Monitor submissions and quiz attempts
- 🏆 Manage XP and achievements
- 🔔 Send announcements
- 👥 Manage user roles and permissions

---

## 🚨 Important Actions After Setup

1. **Change Your Password** (High Priority)
   - Click Profile Icon → Settings
   - Change password immediately
   - Use a strong, unique password

2. **Secure Your Credentials**
   - Don't share these credentials in public
   - Use secure communication channels
   - Keep credentials in password manager

3. **Set Up Other Admins**
   - Create additional admin accounts if needed
   - Follow same Firebase + Supabase setup process
   - Use different email addresses

---

## 📱 Profile Icon Features

**For All Users:**
- Click profile icon → View Profile
- Click profile icon → Submissions
- Click profile icon → Settings

**For Admins Only:**
- Click profile icon → Admin Panel (shows all user data)
- Access user search and filtering
- View analytics and statistics

---

## ⚙️ Troubleshooting

### Admin Panel Not Showing?
```
✓ Confirm Firebase user was created
✓ Confirm Supabase role = 'admin' was set
✓ Refresh the page
✓ Clear browser cache
✓ Log out and log back in
```

### Profile Icon Not Visible?
```
✓ Refresh the page
✓ Check browser console (F12) for errors
✓ Ensure user profile exists in Supabase
✓ Clear browser cache
```

### Users Not Loading in Admin Dashboard?
```
✓ Check Supabase connection
✓ Verify database tables exist
✓ Check RLS (Row Level Security) policies
✓ Verify API keys in environment variables
```

---

## 📞 Database Setup Verification

To verify everything is set up correctly, run these SQL queries:

### Check if admin user exists:
```sql
SELECT * FROM users WHERE email = 'admin@codebro.io';
```

### Check if admin role is set:
```sql
SELECT email, role FROM users WHERE email = 'admin@codebro.io';
```

### Check all users and their roles:
```sql
SELECT display_name, email, role FROM users;
```

---

## 🔑 Default Credentials Summary

| Field | Value |
|-------|-------|
| **Admin Email** | admin@codebro.io |
| **Admin Password** | Admin123!@# |
| **First Login** | After Firebase + Supabase setup |
| **Setup Time** | ~5 minutes |
| **Required** | Firebase + Supabase access |

---

## ✅ Setup Completion Checklist

- [ ] Created Firebase user with admin@codebro.io
- [ ] Set Supabase user role to 'admin'
- [ ] Logged in successfully
- [ ] Verified admin panel appears
- [ ] Changed admin password
- [ ] Tested user search feature
- [ ] Viewed sample user details
- [ ] Added a test problem or course
- [ ] Checked analytics tab
- [ ] Saved credentials securely

---

## 🚀 You're Ready!

Once you've completed all steps above, your admin dashboard is fully operational. You can now:

1. Manage users and their progress
2. Create and edit problems
3. Create and edit courses
4. View detailed analytics
5. Monitor platform activity
6. Manage user roles

Happy administering! 🎉
