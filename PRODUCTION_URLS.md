# Production URLs Configuration

## Live URLs

- **Frontend**: https://cs-checkresult.com.abdulaki.com/
- **Backend API**: https://cs-cheresultbackend.abdulaki.com/api

## Configuration Files

### Frontend Production (`.env.production`)

```env
VITE_API_URL=https://cs-cheresultbackend.abdulaki.com/api
VITE_APP_NAME=Student Result System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_FRONTEND_URL=https://cs-checkresult.com.abdulaki.com
```

### Backend Production (`.env`)

```env
NODE_ENV=production
PORT=5001
CLIENT_URL=https://cs-checkresult.com.abdulaki.com
# ... other database and security configs
```

## Deployment Commands

### Build Frontend for Production

```bash
cd frontend
npm run build:prod
```

### Deploy Built Files

Upload the contents of `frontend/dist/` to your web server.

### Quick Deployment

```bash
# Unix/Linux/Mac
./deploy.sh

# Windows
deploy.bat
```

## Admin Access

- **URL**: https://cs-checkresult.com.abdulaki.com/admin/login
- **Username**: `abdulaki`
- **Password**: `Alhamdulillaah##91`

## API Endpoints

All API endpoints are prefixed with `/api`:

- Auth: `https://cs-cheresultbackend.abdulaki.com/api/auth/*`
- Students: `https://cs-cheresultbackend.abdulaki.com/api/students/*`
- Admin: `https://cs-cheresultbackend.abdulaki.com/api/admin/*`
- Results: `https://cs-cheresultbackend.abdulaki.com/api/results/*`

## CORS Configuration

The backend allows requests from:

- Development: `http://localhost:5173`
- Production: `https://cs-checkresult.com.abdulaki.com`
