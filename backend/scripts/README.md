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

### 3. `updateGradeSystem.js` - Grade System Migration

**Command**: `node scripts/updateGradeSystem.js`

**What it does**:

- 🔄 Updates the system to use uploaded grades instead of calculated grades
- ✅ Converts null grades to "N/A"
- 🧮 Recalculates GPAs based on uploaded grades only
- 🔧 Updates database schema to support "N/A" grades
- ✅ **PRESERVES all existing student and course data**

**Use when**:

- Migrating from calculated grades to uploaded grades system
- After updating the codebase to remove grade calculation logic
- One-time migration script (run once after system update)

## Login Credentials

After running either script, you can login with:

- **Username**: `abdulaki`
- **Password**: `Alhamdulillaah##91`
- **Email**: `abdulakimustefa@gmail.com`

## Important Notes

### Grade System Changes

The system has been updated to require grades to be uploaded in Excel files rather than calculated from individual marks:

- **Individual marks** (quiz, midterm, assignment, project, final) are now stored for reference only
- **Grades** must be provided in the Excel upload with a "Grade" column
- **GPA calculation** now uses only the uploaded grades
- **Assessment configurations** are maintained for historical reference

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
5. **After grade system update**: Run `updateGradeSystem.js` once to migrate data

## Troubleshooting

### If you accidentally deleted students:

1. Check if you have a database backup
2. If not, you'll need to re-upload the Excel files through the admin panel
3. The view count limits will be reset for all students

### If database schema is out of sync:

1. Run `npm run seed` to update schema without losing data
2. If that fails, you may need to run `npm run db:reset` (will lose all data)

### After removing grade calculation logic:

1. Run `node scripts/updateGradeSystem.js` to migrate existing data
2. Ensure Excel uploads include a "Grade" column
3. Individual marks columns are optional and for reference only
