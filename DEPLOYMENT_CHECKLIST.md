# 🚀 Deployment Checklist

## ✅ Pre-Deployment

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend starts without errors
- [ ] All environment files configured
- [ ] Database credentials verified

## ✅ cPanel MySQL Setup

- [ ] Database created: `abdulaki_student_results`
- [ ] User created: `abdulaki_student_admin`
- [ ] User added to database with ALL PRIVILEGES
- [ ] Connection tested via phpMyAdmin

## ✅ Backend Deployment

- [ ] Files uploaded to `/public_html/api/`
- [ ] `.env.production` copied to `.env`
- [ ] Dependencies installed: `npm install --production`
- [ ] Database connection tested
- [ ] Node.js app configured in cPanel

## ✅ Frontend Deployment

- [ ] Production build created: `npm run build:prod`
- [ ] Files uploaded from `dist/` to `/public_html/`
- [ ] `index.html` accessible at domain root

## ✅ Domain & SSL

- [ ] Domain pointing to correct directory
- [ ] SSL certificate installed and working
- [ ] HTTPS redirects enabled

## ✅ Testing

- [ ] Website loads: `https://abdulaki.com`
- [ ] API responds: `https://abdulaki.com/api/health`
- [ ] Student search works
- [ ] Database operations functional

## ✅ Post-Deployment

- [ ] Error logs checked
- [ ] Performance monitored
- [ ] Backup strategy implemented

## 🔧 Quick Commands

### Local Testing

```bash
# Backend
cd backend && npm run deploy:test

# Frontend
cd frontend && npm run build:prod
```

### Production Verification

```bash
# Test API health
curl https://abdulaki.com/api/health

# Check database connection
node -e "require('./config/database').testConnection()"
```

## 📱 Contact Info

- **Domain**: abdulaki.com
- **Hosting**: GojoHost cPanel
- **Database**: MySQL (abdulaki_student_results)
- **Framework**: React + Node.js + Express + Sequelize
