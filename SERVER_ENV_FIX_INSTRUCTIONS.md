# Fix .env File Git Tracking on cPanel Server

## Problem

When you edit `.env` files on your cPanel server, Git shows them as changed files and wants to commit them. This is a security risk because `.env` files contain sensitive information.

## Solution

Run these commands on your cPanel server to stop Git from tracking `.env` files.

## Method 1: Upload and Run Script

1. **Upload the fix script to your server:**
   - Upload `fix-server-env.sh` to your server root directory
   - Make it executable: `chmod +x fix-server-env.sh`
   - Run it: `./fix-server-env.sh`

## Method 2: Manual Commands

If you prefer to run commands manually, SSH into your server and run:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Remove .env files from Git tracking (they stay on server, just not tracked)
git rm --cached backend/.env 2>/dev/null || echo "backend/.env not tracked"
git rm --cached frontend/.env 2>/dev/null || echo "frontend/.env not tracked"
git rm --cached frontend/.env.production 2>/dev/null || echo "frontend/.env.production not tracked"

# Find and remove any other .env files from tracking
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*" -not -name "*.example*" -exec git rm --cached {} \; 2>/dev/null

# Ensure .gitignore files exist and have proper rules
echo "" >> .gitignore
echo "# Environment variables (DO NOT COMMIT)" >> .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "*.env" >> .gitignore

# Do the same for backend and frontend .gitignore files
echo "" >> backend/.gitignore
echo "# Environment variables (DO NOT COMMIT)" >> backend/.gitignore
echo ".env" >> backend/.gitignore
echo ".env.*" >> backend/.gitignore
echo "!.env.example" >> backend/.gitignore

echo "" >> frontend/.gitignore
echo "# Environment variables (DO NOT COMMIT)" >> frontend/.gitignore
echo ".env" >> frontend/.gitignore
echo ".env.*" >> frontend/.gitignore
echo "!.env.example" >> frontend/.gitignore

# Add and commit the .gitignore changes
git add .gitignore backend/.gitignore frontend/.gitignore
git commit -m "🔒 Remove .env files from Git tracking on server"
```

## Method 3: Quick One-Liner

If you just want a quick fix, run this single command:

```bash
git rm --cached backend/.env frontend/.env frontend/.env.production 2>/dev/null; echo -e "\n# Environment variables\n.env\n.env.*\n!.env.example\n*.env" >> .gitignore; git add .gitignore; git commit -m "Stop tracking .env files"
```

## Verification

After running any of the above methods:

1. **Check Git status:**

   ```bash
   git status
   ```

   You should NOT see any `.env` files listed.

2. **Test by editing a .env file:**

   ```bash
   echo "# test change" >> backend/.env
   git status
   ```

   The `.env` file should NOT appear in git status.

3. **Verify .env files still exist:**
   ```bash
   ls -la backend/.env frontend/.env
   ```
   The files should still be there, just not tracked by Git.

## What This Does

✅ **Keeps your .env files on the server** (doesn't delete them)
✅ **Stops Git from tracking changes** to .env files  
✅ **Prevents accidental commits** of sensitive data
✅ **Updates .gitignore** to prevent future tracking
✅ **Maintains server functionality** (your app still works)

## What This Doesn't Do

❌ **Doesn't delete your .env files** (they remain on server)
❌ **Doesn't affect your app** (environment variables still work)
❌ **Doesn't change local development** (only affects server)

## Troubleshooting

**If you still see .env files in git status:**

1. Make sure you ran the commands in the correct directory
2. Check if .env files are in subdirectories: `find . -name ".env*"`
3. Remove them individually: `git rm --cached path/to/.env`

**If your app stops working:**

1. Check that .env files still exist: `ls -la backend/.env`
2. Verify file permissions: `chmod 644 backend/.env`
3. Check file contents are correct

**If you need to track .env files again (NOT recommended):**

```bash
git add backend/.env
git commit -m "Re-add .env file"
```

## Security Best Practices

1. **Never commit .env files** to Git repositories
2. **Use environment variables** on production servers when possible
3. **Regularly rotate** sensitive keys and passwords
4. **Use different credentials** for development and production
5. **Backup .env files** securely outside of Git

## Need Help?

If you encounter issues:

1. Check the commands ran without errors
2. Verify you're in the correct directory
3. Ensure you have Git permissions on the server
4. Contact your hosting provider if Git commands fail
