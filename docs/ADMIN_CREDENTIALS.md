# Admin Credentials

## Default Admin Account

After running the seed script (`npm run seed`), you can login with:

### 🔑 **Login Credentials:**

- **Email**: `admin@studentresults.edu`
- **Username**: `admin`
- **Password**: `admin123`

### 🚀 **First Time Setup:**

1. **Seed the Database:**

   ```bash
   cd backend
   npm run seed
   ```

2. **Login to Admin Panel:**
   - Visit: `http://localhost:5173/admin/login`
   - Use the credentials above

3. **Change Default Password:**
   - After first login, change the default password
   - Update admin email if needed

### 📧 **Email Domain:**

- **Admin Email**: `admin@studentresults.edu`
- **Student Emails**: Generated as `firstname.lastname@student.edu`
- **Teacher Emails**: Generated as `teacher1@studentresults.edu`

### 🔒 **Security Notes:**

- **Change default password** immediately after first login
- **Use strong passwords** in production
- **Enable 2FA** if implemented
- **Regular password updates** recommended

### 🎯 **Admin Features:**

- Upload student data via Excel
- Manage student records
- View statistics and analytics
- Download PDF reports
- Bulk operations on student data

### 📊 **Sample Data:**

The seed script creates:

- 1 Admin user
- 1 Teacher user
- 50-75 Sample students across 3 departments
- Multiple courses per student
- Realistic grade distributions

### 🔧 **Troubleshooting:**

If you can't login:

1. Ensure database is connected
2. Run seed script: `npm run seed`
3. Check browser console for errors
4. Verify API is running on correct port
