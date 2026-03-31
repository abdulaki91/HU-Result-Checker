# Student Result Management System

A modern, full-stack web application for managing and accessing student academic results. Built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### For Students

- **Quick Result Check**: Enter student ID to instantly view results
- **Detailed Transcripts**: View comprehensive course-wise grades and GPA
- **PDF Downloads**: Download official transcripts as PDF
- **Search Functionality**: Search for students by name or ID
- **Responsive Design**: Works seamlessly on desktop and mobile

### For Administrators

- **Dashboard**: Overview of system statistics and performance
- **Student Management**: View, edit, and manage student records
- **Excel Import**: Bulk import student results from Excel files
- **Analytics**: Comprehensive performance analytics and reports
- **Multi-Department Support**: Handle multiple departments and batches

### Technical Features

- **Modern UI**: Clean, elegant, and attractive interface
- **Real-time Updates**: Live data updates and notifications
- **Secure Authentication**: JWT-based admin authentication
- **File Upload**: Drag-and-drop Excel file uploads
- **Data Validation**: Comprehensive input validation and error handling
- **Performance Optimized**: Fast loading and efficient data processing

## 🛠️ Technology Stack

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Axios** for API calls

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
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
cd student-result-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Environment Configuration

#### Backend Environment (.env)

Create `backend/.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_results
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend Environment (.env)

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Student Result System
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Seed the Database (Optional)

Populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:

- Admin user (username: `admin`, password: `admin123`)
- Sample students across multiple departments
- Realistic grade distributions and course data

### 6. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run backend:dev  # Backend on http://localhost:5000
npm run frontend:dev # Frontend on http://localhost:5173
```

## 📚 Usage

### Student Access

1. Visit the homepage
2. Click "Check Your Result" or navigate to `/check-result`
3. Enter your student ID (e.g., `CS-2023-001`)
4. View your results and download PDF transcript

### Admin Access

1. Navigate to `/admin/login`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Access the admin dashboard to:
   - View system statistics
   - Manage student records
   - Upload Excel files with student data
   - Generate reports and analytics

### Excel Upload Format

When uploading student data, ensure your Excel file has these columns:

**Required:**

- Full Name
- Student ID
- Department
- Batch (4-digit year)

**Optional:**

- Email
- Phone
- Semester
- Academic Year
- Course details (course1_code, course1_name, course1_credits, course1_grade, etc.)

## 🏗️ Project Structure

```
student-result-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── scripts/           # Utility scripts
│   └── package.json
└── package.json            # Root package.json
```

## 🔧 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run start` - Start production server
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean all node_modules and build files

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Update your production environment variables:

- Set `NODE_ENV=production`
- Use a secure `JWT_SECRET`
- Configure production `MONGODB_URI`
- Set correct `CLIENT_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact support at support@studentresults.edu

## 🎯 Roadmap

- [ ] Advanced analytics and reporting
- [ ] Email notifications for results
- [ ] Mobile app development
- [ ] Integration with learning management systems
- [ ] Multi-language support
- [ ] Advanced user roles and permissions

---

**Made with ❤️ for education**
