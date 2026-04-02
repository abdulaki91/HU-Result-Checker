# Production Deployment Guide

## URLs

- **Frontend**: https://cs-checkresult.com.abdulaki.com/
- **Backend API**: https://cs-cheresultbackend.abdulaki.com/api

## Backend Deployment

### 1. Environment Configuration

Copy the production environment template:

```bash
cp backend/.env.production.example backend/.env
```

Update the `.env` file with your production values:

```env
NODE_ENV=production
PORT=5001
DB_HOST=your_production_database_host
DB_USER=your_production_database_user
DB_NAME=your_production_database_name
DB_PASSWORD="your_production_database_password"
JWT_SECRET=your-super-secure-production-jwt-key-minimum-32-characters
CLIENT_URL=https://cs-checkresult.com.abdulaki.com
```

### 2. Database Setup

Run the seed script to initialize the database:

```bash
cd backend
npm run seed
```

### 3. Start Backend Server

```bash
cd backend
npm start
```

## Frontend Deployment

### 1. Build for Production

```bash
cd frontend
npm run build
```

### 2. Deploy Built Files

The `frontend/dist` folder contains the built files. Deploy these to your web server.

### 3. Environment Configuration

The production build will automatically use:

- **API URL**: `https://cs-cheresultbackend.abdulaki.com/api`
- **Frontend URL**: `https://cs-checkresult.com.abdulaki.com`

## Admin Credentials

- **Username**: `abdulaki`
- **Password**: `Alhamdulillaah##91`
- **Email**: `abdulakimustefa@gmail.com`

## Important Notes

### CORS Configuration

The backend is configured to allow requests from:

- Development: `http://localhost:5173`
- Production: `https://cs-checkresult.com.abdulaki.com`

### Database Scripts

- **Safe seeding** (preserves data): `npm run seed`
- **Complete reset** (deletes all data): `npm run db:reset`

### Security

- Ensure your production database is secure
- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS for both frontend and backend
- Regularly backup your database

### File Structure

```
production/
├── backend/
│   ├── .env (production config)
│   ├── uploads/ (student files)
│   └── ... (backend files)
└── frontend/
    └── dist/ (built frontend files)
```

## Troubleshooting

### CORS Issues

If you get CORS errors, ensure:

1. Backend `.env` has correct `CLIENT_URL`
2. Frontend is accessing the correct API URL
3. Both domains are using HTTPS

### Database Connection

If database connection fails:

1. Check database credentials in `.env`
2. Ensure database server is running
3. Verify network connectivity

### File Uploads

Ensure the `uploads/` directory has proper write permissions:

```bash
chmod 755 backend/uploads
```
