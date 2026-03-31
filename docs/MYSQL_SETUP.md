# MySQL Setup Guide

## For Local Development (Windows)

### Option 1: Install MySQL Server

1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Install with default settings
3. Set root password during installation
4. Update `.env` file with your root password

### Option 2: Use XAMPP (Easier)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Start MySQL service from XAMPP Control Panel
4. Use default settings (no password for root)

### Option 3: Use Docker

```bash
# Run MySQL in Docker container
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=student_results -p 3306:3306 -d mysql:8.0

# Update .env file:
DB_PASSWORD=password
```

## For Production Server (abdulaki.com)

### 1. Install MySQL on Server

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

### 3. Configure Remote Access

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE abdulaki_student_results;
CREATE USER 'abdulahaki'@'%' IDENTIFIED BY 'Alhamdulillaah##91';
GRANT ALL PRIVILEGES ON abdulaki_student_results.* TO 'abdulahaki'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Update MySQL Configuration

```bash
# Edit MySQL config
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Change bind-address
bind-address = 0.0.0.0

# Restart MySQL
sudo systemctl restart mysql
```

### 5. Configure Firewall

```bash
# Allow MySQL port
sudo ufw allow 3306

# Check if port is open
sudo netstat -tlnp | grep :3306
```

### 6. Test Connection

```bash
# From another machine
mysql -h abdulaki.com -u abdulahaki -p abdulaki_student_results
```

## Environment Files

### Development (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_NAME=student_results
DB_PASSWORD=your_local_password
```

### Production (.env.production)

```env
DB_HOST=abdulaki.com
DB_PORT=3306
DB_USER=abdulahaki
DB_NAME=abdulaki_student_results
DB_PASSWORD="Alhamdulillaah##91"
```

## Troubleshooting

### Connection Refused Error

- Check if MySQL service is running: `sudo systemctl status mysql`
- Check if port 3306 is open: `sudo netstat -tlnp | grep :3306`
- Check firewall settings: `sudo ufw status`

### Access Denied Error

- Verify username and password
- Check user permissions: `SHOW GRANTS FOR 'username'@'%';`
- Ensure user can connect from remote host

### Timeout Error

- Check network connectivity
- Verify firewall rules
- Check if MySQL is bound to correct interface
