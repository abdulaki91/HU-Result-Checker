# Complete Deployment Guide for cPanel (GojoHost)

## 🎯 Overview

This guide will help you deploy the Student Result System to your GojoHost cPanel hosting.

## 📋 Prerequisites

- cPanel access to your GojoHost account
- Domain: abdulaki.com
- Node.js support enabled in your hosting plan
- MySQL database access

## 🗄️ Step 1: Setup MySQL Database in cPanel

### 1.1 Create Database

1. Login to your GojoHost cPanel
2. Go to **Databases** → **MySQL Databases**
3. Under **Create New Database**:
   - Database Name: `student_results`
   - Click **Create Database**
   - Note: Actual name will be `abdulaki_student_results`

### 1.2 Create Database User

1. Under **MySQL Users**:
   - Username: `student_admin`
   - Password: `Alhamdulillaah##91`
   - Click **Create User**
   - Note: Actual username will be `abdulaki_student_admin`

### 1.3 Add User to Database

1. Under **Add User to Database**:
   - User: `abdulaki_student_admin`
   - Database: `abdulaki_student_results`
   - Click **Add**
2. Grant **ALL PRIVILEGES**
3. Click **Make Changes**

### 1.4 Test Database Connection

1. Open **phpMyAdmin** from cPanel
2. Login with your database credentials
3. Verify you can access `abdulaki_student_results` database

## 🚀 Step 2: Deploy Backend

### 2.1 Prepare Backend Files

```bash
# On your local machine
cd backend
npm run deploy:prep
```

### 2.2 Update Production Environment

Edit `backend/.env.production` with your exact cPanel credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=abdulaki_student_admin
DB_NAME=abdulaki_student_results
DB_PASSWORD="Alhamdulillaah##91"
```

### 2.3 Upload Backend Files

1. Create a folder in cPanel File Manager: `/public_html/api/`
2. Upload all backend files to `/public_html/api/`
3. Copy `.env.production` to `.env` in the api folder

### 2.4 Install Dependencies

```bash
# SSH into your server or use cPanel Terminal
cd /public_html/api
npm install --production
```

### 2.5 Test Backend

```bash
# Start the backend
npm start

# Or test database connection
node -e "require('./config/database').testConnection()"
```

## 🌐 Step 3: Deploy Frontend

### 3.1 Build Frontend for Production

```bash
# On your local machine
cd frontend
npm run build:prod
```

### 3.2 Upload Frontend Files

1. Upload all files from `frontend/dist/` to `/public_html/`
2. Your file structure should look like:
   ```
   /public_html/
   ├── index.html
   ├── assets/
   │   ├── index-*.css
   │   ├── index-*.js
   │   └── ...
   └── api/
       ├── server.js
       ├── package.json
       └── ...
   ```

## ⚙️ Step 4: Configure Domain & SSL

### 4.1 Domain Configuration

1. In cPanel, go to **Subdomains** or **Addon Domains**
2. Point your domain to `/public_html/`
3. Ensure `index.html` is set as the default document

### 4.2 SSL Certificate

1. Go to **SSL/TLS** in cPanel
2. Enable **Let's Encrypt** SSL certificate
3. Force HTTPS redirects

## 🔧 Step 5: Configure Node.js Application

### 5.1 Node.js App Setup (if supported)

1. Go to **Node.js Apps** in cPanel
2. Create new application:
   - Node.js version: Latest available
   - Application root: `/public_html/api`
   - Application URL: `abdulaki.com/api`
   - Startup file: `server.js`

### 5.2 Environment Variables

Add these in Node.js app configuration:

```
NODE_ENV=production
PORT=5001
```

## 📝 Step 6: Final Configuration

### 6.1 Update API URLs

Ensure frontend is pointing to correct API:

- Production API URL: `https://abdulaki.com/api`

### 6.2 Test the Application

1. Visit: `https://abdulaki.com`
2. Test student search functionality
3. Test admin login (if implemented)
4. Verify database operations

## 🔍 Step 7: Troubleshooting

### Common Issues:

#### Database Connection Failed

- Verify database credentials in cPanel
- Check if MySQL service is running
- Ensure user has proper privileges

#### Node.js App Not Starting

- Check Node.js version compatibility
- Verify file permissions
- Check error logs in cPanel

#### Frontend Not Loading

- Verify all files uploaded correctly
- Check browser console for errors
- Ensure SSL certificate is working

#### API Endpoints Not Working

- Check if Node.js app is running
- Verify API URL configuration
- Check CORS settings

### Log Files to Check:

- Node.js application logs in cPanel
- Error logs in cPanel → **Error Logs**
- Browser developer console

## 📊 Step 8: Post-Deployment

### 8.1 Seed Database (Optional)

```bash
# SSH into server
cd /public_html/api
npm run seed
```

### 8.2 Monitor Application

- Set up monitoring for uptime
- Check logs regularly
- Monitor database performance

### 8.3 Backup Strategy

- Regular database backups via cPanel
- Code backups via Git
- File system backups

## 🎉 Success!

Your Student Result System should now be live at:

- **Frontend**: https://abdulaki.com
- **Backend API**: https://abdulaki.com/api

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review cPanel error logs
3. Contact GojoHost support for hosting-specific issues
4. Check application logs for code-related issues
