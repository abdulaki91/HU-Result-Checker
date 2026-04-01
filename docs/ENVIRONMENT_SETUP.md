# Environment Setup Guide

## Overview

This project uses environment variables to configure sensitive settings like database credentials, API keys, and server configurations. These variables are stored in `.env` files that are **NOT** committed to Git for security reasons.

## Quick Setup

### 1. Backend Environment Setup

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your actual values:

- Database credentials
- JWT secret key
- Admin credentials
- Server configuration

### 2. Frontend Environment Setup

```bash
cd frontend
cp .env.example .env
```

Then edit `frontend/.env` with your actual values:

- API URL (development vs production)
- App configuration
- Feature flags

## Environment Files

### Files Tracked by Git ✅

- `.env.example` - Template files with example values
- `.gitignore` - Ensures .env files are ignored

### Files NOT Tracked by Git ❌

- `.env` - Contains actual sensitive values
- `.env.local` - Local overrides
- `.env.production` - Production-specific values
- `.env.development` - Development-specific values

## Security Notes

⚠️ **NEVER commit `.env` files to Git!**

- `.env` files contain sensitive information (passwords, API keys, secrets)
- Always use `.env.example` as templates
- Update `.env.example` when adding new environment variables
- Use strong, unique values for JWT secrets and passwords in production

## Production Deployment

For production deployment:

1. **Backend**: Set environment variables on your hosting platform
2. **Frontend**: Update `frontend/.env.production` with production API URL
3. **Database**: Use secure database credentials
4. **JWT**: Use a strong, unique JWT secret
5. **Admin**: Change default admin credentials

## Environment Variables Reference

### Backend Variables

- `DB_HOST` - Database host
- `DB_PORT` - Database port (usually 3306 for MySQL)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `CLIENT_URL` - Frontend URL for CORS

### Frontend Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Troubleshooting

### Common Issues

1. **Server won't start**: Check database credentials in `backend/.env`
2. **API calls fail**: Verify `VITE_API_URL` in `frontend/.env`
3. **CORS errors**: Ensure `CLIENT_URL` matches frontend URL
4. **Admin login fails**: Check `ADMIN_EMAIL` and `ADMIN_PASSWORD`

### Verification Commands

```bash
# Check if .env files exist
ls -la backend/.env frontend/.env

# Verify .env files are ignored by Git
git status

# Test database connection
cd backend && npm run test:db
```

## Best Practices

1. **Use different values for development and production**
2. **Regularly rotate JWT secrets and passwords**
3. **Use environment-specific `.env` files when needed**
4. **Document new environment variables in `.env.example`**
5. **Never share `.env` files via email, chat, or other insecure channels**

## Need Help?

If you encounter issues with environment setup:

1. Check this documentation
2. Verify your `.env` files match the `.env.example` templates
3. Ensure all required variables are set
4. Check the application logs for specific error messages
