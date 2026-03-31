# 🧪 UI Testing Checklist

## System Status

- ✅ Backend API: http://localhost:5001
- ✅ Frontend: http://localhost:5174
- ✅ Database: localhost:3306/abdulaki_student_results
- ✅ Admin Login: admin@studentresults.edu / admin123

## 🎯 Manual UI Testing Steps

### 1. Homepage Test

- [ ] Open http://localhost:5174 in your browser
- [ ] Verify the homepage loads correctly
- [ ] Check that the navigation menu is visible
- [ ] Test the "Check Results" and "Search Students" links

### 2. Admin Login Test

- [ ] Navigate to Admin Login (usually /admin/login)
- [ ] Enter credentials:
  - Email: `admin@studentresults.edu`
  - Password: `admin123`
- [ ] Click Login button
- [ ] Verify successful login and redirect to admin dashboard
- [ ] Check that admin navigation menu appears

### 3. Admin Dashboard Test

- [ ] Verify dashboard loads with statistics
- [ ] Check that all navigation links work:
  - [ ] Students Management
  - [ ] Upload Data
  - [ ] Statistics
  - [ ] Logout

### 4. Students Management Test

- [ ] Navigate to Students page
- [ ] Verify student list loads (may be empty initially)
- [ ] Test search functionality
- [ ] Test filter options (department, batch)
- [ ] Test pagination (if students exist)

### 5. Upload Test

- [ ] Navigate to Upload page
- [ ] Test file upload interface
- [ ] Verify drag & drop functionality
- [ ] Check upload progress indicator
- [ ] Test file validation (Excel files only)

### 6. Student Search (Public)

- [ ] Go back to homepage
- [ ] Navigate to Search Students
- [ ] Test search functionality
- [ ] Verify search results display
- [ ] Test result details view

### 7. Responsive Design Test

- [ ] Test on different screen sizes
- [ ] Verify mobile responsiveness
- [ ] Check that all elements are accessible

## 🚨 Common Issues to Check

### Authentication Issues

- If login fails, check browser console for errors
- Verify network requests are going to correct API endpoint
- Check that JWT token is stored in localStorage

### CORS Issues

- If you see CORS errors, verify backend CLIENT_URL matches frontend URL
- Check that both servers are running on correct ports

### Database Issues

- If data doesn't load, check backend console for database errors
- Verify MySQL service is running
- Check database connection in backend logs

## 🔧 Troubleshooting Commands

### Restart Backend

```bash
cd backend
npm start
```

### Restart Frontend

```bash
cd frontend
npm run dev
```

### Reset Admin Account

```bash
cd backend
node reset-admin.js
```

### Check Server Status

```bash
node test-system-complete.js
```

## ✅ Success Criteria

The system is working correctly if:

1. ✅ Admin can login successfully
2. ✅ Dashboard loads with navigation
3. ✅ All admin pages are accessible
4. ✅ Public search functionality works
5. ✅ No console errors in browser
6. ✅ API requests complete successfully
7. ✅ Responsive design works on mobile

## 📝 Notes

- Frontend runs on port 5174 (5173 was in use)
- Backend API runs on port 5001
- Database is localhost MySQL
- Admin credentials: admin@studentresults.edu / admin123
- All authentication uses JWT tokens
- File uploads support Excel format (.xlsx, .xls)
