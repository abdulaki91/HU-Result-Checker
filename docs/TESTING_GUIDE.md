# 🧪 Testing Guide

## Quick Testing Commands

### 🚀 **Run All Tests**

```bash
npm run test
```

_Comprehensive system testing (file structure, dependencies, builds, etc.)_

### ⚡ **Quick Integration Test**

```bash
npm run test:quick
```

_Fast backend-frontend connectivity test_

### 🔗 **Integration Test Only**

```bash
npm run test:integration
```

_Same as quick test - tests API endpoints and configuration_

## 📋 Test Categories

### 1. **System Tests** (`npm run test`)

- ✅ File structure validation
- ✅ Environment configuration check
- ✅ Dependencies verification
- ✅ Build process testing
- ✅ Database connection test
- ✅ Server startup test
- ✅ Integration validation

### 2. **Integration Tests** (`npm run test:quick`)

- ✅ Backend server connectivity
- ✅ API endpoint responses
- ✅ Configuration validation
- ✅ Authentication testing
- ✅ CORS verification

## 🎯 Expected Results

### ✅ **Successful Test Output:**

```
🧪 INTEGRATION TESTING SUITE
========================================
✅ Backend server is running on port 5001
✅ Backend configured for port 5001
✅ Frontend API URL correctly configured
✅ Health Check: 200
✅ Student Search (Empty): 200
✅ Student Filters: 200
🎉 All integration tests passed!
```

### ⚠️ **Common Issues & Solutions:**

#### Backend Not Running

```
❌ Backend server is not running on port 5001
💡 Start backend: cd backend && npm start
```

#### Database Connection Failed

```
❌ Database connection failed
💡 Check your .env file and MySQL server
```

#### Admin Login Failed

```
⚠️ Admin user not found (run seed script)
💡 Run: cd backend && npm run seed
```

## 🔧 Manual Testing Steps

### 1. **Start Services**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. **Test Frontend**

- Visit: http://localhost:5173
- Check homepage loads
- Test student search
- Navigate to admin login

### 3. **Test Admin Panel**

- Go to: http://localhost:5173/admin/login
- Login: `admin@studentresults.edu` / `admin123`
- Test dashboard, upload, statistics

### 4. **Test API Directly**

```bash
# Health check
curl http://localhost:5001/api/health

# Student search
curl "http://localhost:5001/api/students/search?q=test"

# Admin login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"admin123"}'
```

## 🐛 Troubleshooting

### Port Conflicts

- Backend uses port **5001**
- Frontend uses port **5173**
- Check with: `netstat -an | findstr :5001`

### Environment Issues

- Ensure `.env` files exist in both `backend/` and `frontend/`
- Run: `node setup-env.js` to create from templates

### Database Issues

- Check MySQL is running
- Verify credentials in `backend/.env`
- Test connection: `cd backend && node -e "require('./config/database').testConnection()"`

### Build Issues

- Clean install: `npm run clean && npm run install:all`
- Check Node.js version compatibility

## 📊 Test Coverage

### Backend API Endpoints Tested:

- ✅ `GET /api/health` - Health check
- ✅ `GET /api/students/search` - Student search
- ✅ `GET /api/students/filters` - Filter options
- ✅ `POST /api/auth/login` - Authentication

### Frontend Components Tested:

- ✅ Build process
- ✅ Environment configuration
- ✅ Dependency resolution
- ✅ Server startup

### Integration Points Tested:

- ✅ API URL configuration
- ✅ CORS setup
- ✅ Authentication flow
- ✅ Error handling

## 🚀 Continuous Testing

### Before Deployment:

```bash
npm run test          # Full system test
npm run build         # Build both frontend and backend
npm run test:quick    # Final integration check
```

### During Development:

```bash
npm run test:quick    # Quick check after changes
```

### After Database Changes:

```bash
cd backend
npm run seed          # Reseed database
cd ..
npm run test:quick    # Verify integration
```

## 📝 Test Reports

Tests generate colored console output:

- 🟢 **Green**: Passed tests
- 🔴 **Red**: Failed tests
- 🟡 **Yellow**: Warnings
- 🔵 **Blue**: Information

Success rate is calculated and displayed at the end of full system tests.

## 🎯 Performance Benchmarks

### Expected Response Times:

- Health check: < 100ms
- Student search: < 500ms
- Authentication: < 300ms
- Database connection: < 2s

### Build Times:

- Frontend build: < 30s
- Backend syntax check: < 5s
- Full system test: < 60s
