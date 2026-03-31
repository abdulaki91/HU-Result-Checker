# cPanel MySQL Setup Guide (GojoHost)

## Step 1: Access cPanel

1. Login to your GojoHost cPanel
2. Navigate to **Databases** section

## Step 2: Create MySQL Database

1. Click on **MySQL Databases**
2. Under **Create New Database**:
   - Database Name: `student_results`
   - Click **Create Database**
3. Note: The actual database name will be `abdulaki_student_results` (prefixed with your username)

## Step 3: Create MySQL User

1. Under **MySQL Users** section:
   - Username: `student_admin`
   - Password: `Alhamdulillaah##91`
   - Click **Create User**
2. Note: The actual username will be `abdulaki_student_admin` (prefixed with your username)

## Step 4: Add User to Database

1. Under **Add User to Database**:
   - User: Select `abdulaki_student_admin`
   - Database: Select `abdulaki_student_results`
   - Click **Add**
2. Grant **ALL PRIVILEGES** and click **Make Changes**

## Step 5: Get Connection Details

In cPanel, you should see:

- **Database Name**: `abdulaki_student_results`
- **Username**: `abdulaki_student_admin`
- **Password**: `Alhamdulillaah##91`
- **Hostname**: Usually `localhost` (sometimes `abdulaki.com`)

## Step 6: Update .env.production File

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=abdulaki_student_admin
DB_NAME=abdulaki_student_results
DB_PASSWORD="Alhamdulillaah##91"
```

## Step 7: Test Connection

You can test the connection using cPanel's **phpMyAdmin**:

1. Click **phpMyAdmin** in cPanel
2. Login with your database credentials
3. Verify you can access the `abdulaki_student_results` database

## Common cPanel MySQL Hostnames:

- `localhost` (most common)
- `abdulaki.com` (your domain)
- `mysql.abdulaki.com` (subdomain)
- Check your cPanel for the exact hostname

## Deployment Notes:

1. Upload your Node.js files to the correct directory (usually `public_html` or a subdirectory)
2. Make sure Node.js is enabled in your hosting plan
3. Use the `.env.production` file for production deployment
4. Set up SSL certificate for HTTPS

## Troubleshooting:

- If connection fails, check the exact database prefix in cPanel
- Verify the hostname (try both `localhost` and your domain)
- Ensure your hosting plan supports Node.js applications
- Check if MySQL remote connections are enabled (usually not needed for same-server connections)
