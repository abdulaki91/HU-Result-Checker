# Frontend - Student Result System

React + Vite frontend application for the Student Result Management System.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Building for cPanel

### Option 1: Build Locally (Recommended)

This is the most reliable method and what you should use:

```bash
# Build locally
npm run build

# Upload the 'dist' folder to cPanel
# Location: public_html/frontend/dist/
```

### Option 2: Build on cPanel

If you need to build on cPanel:

```bash
# SSH into cPanel
cd ~/your-repo-path/frontend

# Run the build script
chmod +x build-cpanel.sh
./build-cpanel.sh
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=https://cs-cheresultbackend.abdulaki.com
```

For production, use `.env.production`:

```env
VITE_API_URL=https://cs-cheresultbackend.abdulaki.com
```

## Common Issues

### Build fails on cPanel

**Solution:** Build locally and upload the `dist` folder instead.

### "JavaScript heap out of memory"

**Solution:** Use the build:cpanel script which increases memory:

```bash
npm run build:cpanel
```

### Dependency conflicts

**Solution:** The `.npmrc` file is already configured to handle this:

```bash
npm install --legacy-peer-deps
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   ├── utils/          # Utility functions
│   └── main.jsx        # Entry point
├── public/             # Static assets
├── dist/               # Build output (gitignored)
├── .env                # Environment variables (gitignored)
├── .env.example        # Example environment variables
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Technologies

- React 18
- Vite 5
- React Router 6
- TanStack Query (React Query)
- Tailwind CSS
- Framer Motion
- Axios
- React Hook Form
- React Hot Toast
- Lucide React (icons)

## Deployment

See [CPANEL_DEPLOYMENT.md](../CPANEL_DEPLOYMENT.md) in the root directory for detailed deployment instructions.

## Quick Deployment

```bash
# From project root
./deploy-to-cpanel.sh

# Then upload frontend/dist/* to cPanel
```
