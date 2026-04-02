# Database Scripts

This directory contains scripts for managing the database.

## Scripts

### 1. `seedData.js` - Safe Seeding (PRESERVES DATA)

**Command**: `npm run seed` or `node scripts/seedData.js`

**What it does**:

- ✅ Syncs database schema without deleting existing data
- ✅ Creates admin/teacher users only if they don't exist
- ✅ Initializes column settings if they don't exist
- ✅ **PRESERVES all existing student data**

**Use when**:

- Setting up the database for the first time
- Adding missing admin users
- Updating database schema without losing data
- After pulling code updates that might have schema changes

### 2. `resetDatabase.js` - Complete Reset (DELETES ALL DATA)

**Command**: `npm run db:reset` or `node scripts/resetDatabase.js`

**What it does**:

- ⚠️ **DELETES ALL DATA** in the database
- 🔄 Recreates all tables from scratch
- 👥 Creates fresh admin and teacher accounts
- 📊 Initializes default column settings
- 🗑️ Removes all students, courses, and user data

**Use when**:

- You want to start completely fresh
- Database is corrupted and needs to be rebuilt
- Testing with a clean database
- **NEVER use in production with real data**

## Login Credentials

After running either script, you can login with:

- **Username**: `abdulaki`
- **Password**: `Alhamdulillaah##91`
- **Email**: `abdulakimustefa@gmail.com`

## Important Notes

### Why Students Were Being Deleted

Previously, the `seedData.js` script was using `syncDatabase(true)` with `force: true`, which recreates all tables and deletes all existing data. This has been fixed.

### Current Behavior

- **Server startup**: Uses `syncDatabase()` without force - preserves data
- **Seed script**: Uses `syncDatabase(false)` - preserves data
- **Reset script**: Uses `syncDatabase(true)` - deletes all data (intentionally)

### Best Practices

1. **For development**: Use `npm run seed` to set up the database
2. **For production**: Never run reset script, only use seed script
3. **For testing**: Use reset script to get a clean state
4. **After code updates**: Run seed script to apply schema changes safely

## Troubleshooting

### If you accidentally deleted students:

1. Check if you have a database backup
2. If not, you'll need to re-upload the Excel files through the admin panel
3. The view count limits will be reset for all students

### If database schema is out of sync:

1. Run `npm run seed` to update schema without losing data
2. If that fails, you may need to run `npm run db:reset` (will lose all data)
