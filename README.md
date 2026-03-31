# Student Result Management System

A modern, full-stack web application for managing and accessing student academic results. Built with React, Node.js, Express, and MySQL with Sequelize ORM.

## 🚀 Features

### For Students

- **Quick Result Check**: Enter student ID to instantly view results
- **Numeric Search**: Search using just the numeric part of your ID (e.g., "001" for "CS-2023-001")
- **Detailed Transcripts**: View comprehensive course-wise grades and GPA
- **PDF Downloads**: Download official transcripts as PDF
- **Flexible ID Formats**: Supports various student ID formats (dashes, dots, spaces, slashes)
- **Responsive Design**: Works seamlessly on desktop and mobile

### For Administrators

- **Dashboard**: Overview of system statistics and performance
- **Student Management**: View, edit, and manage student records
- **Excel Import**: Bulk import student results with flexible column formats
- **Multiple Import Formats**: Support for simple results and complete student data
- **Analytics**: Comprehensive performance analytics and reports
- **Multi-Department Support**: Handle multiple departments and batches

### Technical Features

- **Modern UI**: Clean, elegant, and attractive interface with Tailwind CSS
- **Real-time Updates**: Live data updates and notifications
- **Secure Authentication**: JWT-based admin authentication
- **File Upload**: Drag-and-drop Excel file uploads with progress tracking
- **Data Validation**: Comprehensive input validation and error handling
- **Performance Optimized**: Fast loading and efficient data processing
- **Flexible Student IDs**: Supports various ID formats with intelligent search

## 🛠️ Technology Stack

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API calls

### Backend

- **Node.js** with Express.js
- **MySQL** with Sequelize ORM
- **JWT** for authentication
- **Multer** for file uploads
- **XLSX** for Excel processing
- **PDF-lib** for PDF generation
- **Bcrypt** for password hashing
- **Express Validator** for input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd check-result
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Configuration

#### Backend Environment

Create `backend/.env` file:

```env
NODE_ENV=development
PORT=5001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_NAME=abdulaki_student_results
DB_PASSWORD=""
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=Student Result System
```

### 4. Setup Database

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE abdulaki_student_results;
```

### 5. Start the Application

```bash
# Start backend (from backend folder)
cd backend && npm start

# Start frontend (from frontend folder)
cd frontend && npm run dev
```

## 📚 Usage

### Student Access

1. Visit http://localhost:5174 (or your frontend URL)
2. Click "Check Your Result"
3. Enter your student ID (supports various formats):
   - Full ID: `CS-2023-001`
   - Numeric only: `001` or `2023001`
   - Partial: `CS001`
4. View results and download PDF transcript

### Admin Access

1. Navigate to `/admin/login`
2. Login with credentials:
   - Email: `admin@studentresults.edu`
   - Password: `admin123`
3. Access features:
   - View system statistics
   - Manage student records
   - Upload Excel files
   - Download sample templates

### Excel Upload Formats

#### Simple Results Format (Recommended)

```
STUDENT NAME | STUDENT ID | QUIZ(5%) | MID(30%) | ASSIGNMENT(15%) | PROJECT(20%) | FINAL(50%) | TOTAL | GRADE
```

#### Complete Student Data Format

```
Full Name | Student ID | Department | Batch | Email | Phone | Course1_Code | Course1_Name | Course1_Grade
```

## 🏗️ Project Structure

```
check-result/
├── 📁 backend/              # Backend API (Node.js + Express + MySQL)
├── 📁 frontend/             # Frontend UI (React + Vite + Tailwind)
├── 📁 docs/                 # Documentation files
├── 📁 scripts/              # Setup and utility scripts
├── 📁 tests/                # Test files and testing utilities
├── 📁 deployment/           # Deployment scripts and configurations
├── 📁 temp/                 # Temporary files (gitignored)
├── 📄 README.md             # Main project documentation
├── 📄 LICENSE               # Project license
└── 📄 package.json          # Root package configuration
```

For detailed structure information, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## 🔧 Available Scripts

### Backend Scripts

```bash
cd backend
npm start          # Start production server
npm run dev        # Start development server with nodemon
node reset-admin.js # Reset admin account
```

### Frontend Scripts

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Testing Scripts

```bash
# Run from tests/ folder
node test-system.js      # Complete system test
node test-integration.js # Integration tests
node test-backend.js     # Backend API tests
```

## 📖 Documentation

All documentation is organized in the `docs/` folder:

- **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** - Detailed project organization
- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** - Testing procedures and guidelines
- **[EXCEL_IMPORT_ENHANCEMENT_SUMMARY.md](docs/EXCEL_IMPORT_ENHANCEMENT_SUMMARY.md)** - Excel import features
- **[UI_TEST_CHECKLIST.md](docs/UI_TEST_CHECKLIST.md)** - UI testing checklist

## 🚀 Deployment

### Local Development

1. Follow the Quick Start guide above
2. Both servers will run on:
   - Backend: http://localhost:5001
   - Frontend: http://localhost:5174

### Production Deployment

1. See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete instructions
2. Use scripts in `deployment/` folder for cPanel deployment
3. Update environment variables for production

## ✨ Key Features

### Enhanced Excel Import

- **Flexible Column Names**: Recognizes various column name formats
- **Smart Validation**: Handles different student ID formats
- **Automatic Calculations**: Calculates totals and grades if not provided
- **Multi-Sheet Support**: Process multiple courses/departments in one file
- **Sample Templates**: Downloadable Excel templates with proper formatting

### Intelligent Student Search

- **Numeric Search**: Find students using just numbers from their ID
- **Flexible ID Formats**: Supports dashes, dots, spaces, slashes in student IDs
- **Multiple Match Handling**: Shows selection list when multiple students match
- **Case Insensitive**: Works with any case combination

### Modern UI/UX

- **Responsive Design**: Works on all device sizes
- **Loading States**: Visual feedback for all operations
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback for actions
- **Smooth Animations**: Enhanced user experience with Framer Motion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the documentation in `docs/` folder
2. Run the test scripts in `tests/` folder
3. Create an issue with detailed information

---

**Made with ❤️ for education**
