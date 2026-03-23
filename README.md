# 🤖 Telegram Student Results Bot

A comprehensive Telegram bot system for managing and checking student results with Excel file processing, MySQL database integration, and cPanel hosting support.

## ✨ Features

- **📊 Excel File Processing**: Upload and process student results from Excel files
- **🔍 Flexible Student Search**: Students can search with full or partial IDs
- **👨‍💼 Admin Panel**: Complete admin interface for managing results and settings
- **📋 Column Management**: Admins can control which columns are visible to students
- **🎓 Course Information**: Add course name and instructor details
- **🗄️ Dual Storage**: Support for both MySQL database and JSON file storage
- **🌐 cPanel Ready**: Optimized for cPanel shared hosting with webhook support
- **🔄 Real-time Updates**: Refresh functionality throughout the interface
- **📱 Interactive Menus**: User-friendly Telegram inline keyboards
- **🛡️ Error Handling**: Comprehensive error handling and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- MySQL database (or use JSON storage)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Your Telegram User ID (from [@userinfobot](https://t.me/userinfobot))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/telegram-student-results-bot.git
   cd telegram-student-results-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.cpanel.example .env
   # Edit .env with your configuration
   ```

4. **Setup database** (if using MySQL)

   ```bash
   npm run setup-db
   ```

5. **Test configuration**

   ```bash
   npm run test-config
   ```

6. **Start the bot**

   ```bash
   # For local development (polling mode)
   npm run dev

   # For production/cPanel (webhook mode)
   npm start
   ```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Bot Configuration
BOT_TOKEN=your_telegram_bot_token
ADMIN_USER_ID=your_telegram_user_id

# cPanel Hosting
BOT_BASE_URL=http://yourdomain.com
CPANEL_DOMAIN=yourdomain.com
PROTOCOL=http
NODE_ENV=production

# Database (MySQL)
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Or use JSON storage
USE_JSON_STORAGE=false
```

### Your Bot URLs

- **Home**: `http://yourdomain.com/`
- **Status**: `http://yourdomain.com/status`
- **Health**: `http://yourdomain.com/health`
- **Webhook**: `http://yourdomain.com/webhook`

## 📋 Excel File Format

The bot accepts Excel files with the following columns:

### Required Columns

- **NAME**: Student name
- **ID**: Student ID (supports flexible matching)

### Optional Columns

- **Quiz**: Quiz scores
- **Mid**: Midterm scores
- **Assignment**: Assignment scores
- **Group Assignment**: Group assignment scores
- **Project**: Project scores
- **Final**: Final exam scores
- **Total**: Total scores
- **Grade**: Final grade (accepts any text including "--", "N/A")

### Example Excel Structure

| NAME       | ID        | Quiz | Mid | Assignment | Group Assignment | Project | Final | Total | Grade |
| ---------- | --------- | ---- | --- | ---------- | ---------------- | ------- | ----- | ----- | ----- |
| John Doe   | GPR001/23 | 85   | 78  | 90         | 88               | 92      | 85    | 518   | A     |
| Jane Smith | GPR002/23 | 92   | 85  | 88         | 90               | 89      | 91    | 535   | A+    |

## 🎯 Usage

### For Students

1. Start the bot: `/start`
2. Choose "🔍 Check My Result"
3. Enter your student ID (full or partial)
4. View your results

### For Admins

1. Start the bot: `/start`
2. Access admin panel with various options:
   - **📤 Upload Results**: Upload Excel files
   - **👥 View All Students**: Browse all records
   - **⚙️ Column Settings**: Control visible columns
   - **🎓 Course Settings**: Set course information
   - **🔄 Refresh**: Update interface

### Student ID Flexibility

Students can search using:

- Full ID: `GPR001/23`
- Partial ID: `001/23` (removes common prefixes like GPR, STU, etc.)

## 🏗️ Project Structure

```
├── src/
│   ├── bot/
│   │   └── StudentResultsBot.js     # Main bot class
│   ├── handlers/
│   │   ├── commandHandler.js        # Command handling
│   │   ├── fileHandler.js           # File upload handling
│   │   ├── menuHandler.js           # Menu interactions
│   │   └── messageHandler.js        # Text message handling
│   └── utils/
│       ├── logger.js                # Logging utility
│       └── validators.js            # Input validation
├── data/                            # JSON storage (if enabled)
├── temp/                            # Temporary file storage
├── app.js                           # cPanel entry point (webhook)
├── bot.js                           # Local development (polling)
├── webhook-bot.js                   # Webhook mode
├── database.js                      # Database operations
├── excelService.js                  # Excel processing
├── config.js                        # Configuration management
└── setup-database.js               # Database setup
```

## 🌐 Deployment

### Local Development

```bash
npm run dev          # Polling mode
npm run dev:webhook  # Webhook mode with nodemon
```

### cPanel Hosting

```bash
npm run deploy-cpanel    # Automated deployment script
npm run setup-webhook-cpanel  # Setup webhook
npm start                     # Start production server
```

See [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md) for detailed cPanel setup instructions.

### Webhook Setup

```bash
# Setup webhook for your domain
npm run setup-webhook-cpanel

# Clear webhook (switch back to polling)
npm run clear-webhook
```

## 📊 Available Scripts

- `npm start` - Start production server (webhook mode)
- `npm run dev` - Start development server (polling mode)
- `npm run test-config` - Test your configuration
- `npm run setup-db` - Initialize database
- `npm run setup-webhook-cpanel` - Setup webhook for cPanel
- `npm run deploy-cpanel` - Automated cPanel deployment
- `npm run clear-webhook` - Remove webhook

## 🔍 API Endpoints

- `GET /` - Bot status and information
- `GET /status` - Detailed bot status
- `GET /health` - Health check
- `POST /webhook` - Telegram webhook endpoint

## 🛠️ Troubleshooting

### Common Issues

1. **Webhook not working**
   - Ensure HTTPS is enabled (Telegram requirement)
   - Check webhook URL is accessible
   - Verify bot token is correct

2. **Database connection failed**
   - Check database credentials in .env
   - Ensure database exists and user has permissions
   - Try using JSON storage as fallback

3. **Excel upload errors**
   - Verify file has NAME and ID columns
   - Check file size limits
   - Ensure proper Excel format (.xlsx)

4. **Bot not responding**
   - Check bot token validity
   - Verify admin user ID is correct
   - Check server logs for errors

### Debug Commands

```bash
# Test configuration
npm run test-config

# Check webhook status
node -e "
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('YOUR_BOT_TOKEN');
bot.getWebHookInfo().then(console.log);
"

# Test database connection
npm run setup-db
```

## 📚 Documentation

- [CPANEL_DEPLOYMENT.md](CPANEL_DEPLOYMENT.md) - Complete cPanel deployment guide
- [CPANEL_QUICK_SETUP.md](CPANEL_QUICK_SETUP.md) - Quick setup instructions
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [excel-format-guide.md](excel-format-guide.md) - Excel file format guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Telegram Bot API wrapper
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel file processing
- [mysql2](https://github.com/sidorares/node-mysql2) - MySQL client
- [express](https://expressjs.com/) - Web framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
2. Search existing [GitHub Issues](https://github.com/yourusername/telegram-student-results-bot/issues)
3. Create a new issue with detailed information

---

**Made with ❤️ for educational institutions**
