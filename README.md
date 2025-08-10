# Exam Portal - Full Stack Application

![Exam Portal Screenshot](./media/exam-portal-screenshot.png) <!-- Add actual screenshot later -->

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features Implemented](#features-implemented)
4. [Setup Instructions](#setup-instructions)
5. [Live Demo](#live-demo)
6. [API Documentation](#api-documentation)
7. [Project Structure](#project-structure)

## Project Overview

This project is a full-stack exam-taking application developed as part of the LeadMasters AI Tech Solutions selection assessment. The application allows users to register, login, start timed exams with randomized questions, navigate through questions, and submit answers for automatic scoring.

**Objective**: To demonstrate core engineering fundamentals and best practices in building a functional exam-taking interface with React.js, backend APIs, and database integration.

## Technology Stack

| Component            | Technology                          |
| -------------------- | ----------------------------------- |
| **Frontend**         | React.js (v18)                      |
| **Backend**          | Python with FastAPI                 |
| **Database**         | MySQL (Local or Railway)            |
| **Authentication**   | JWT Tokens                          |
| **State Management** | Redux Toolkit                       |
| **Styling**          | Tailwind CSS                        |
| **Deployment**       | Render (Backend), Vercel (Frontend) |

## Features Implemented

1. **User Authentication**

   - JWT-based registration and login
   - Protected routes with authentication checks
   - Persistent session using localStorage

2. **Exam Interface**

   - "Start Exam" functionality with randomized questions
   - MCQ display with navigation (Next/Previous)
   - Real-time countdown timer with auto-submit
   - Autosave answers every 30 seconds
   - Manual exam submission

3. **Result Processing**

   - Automatic scoring calculation
   - Result display after submission
   - Session management (in-progress/completed)

4. **UI/UX**
   - Responsive design with Tailwind CSS
   - Intuitive navigation
   - Visual timer warning when time is running out

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 16+
- MySQL 8.0+ (or Railway account for cloud database)
- pip package manager
- npm package manager

### Backend Setup

1. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:

**For Local MySQL:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=examdb
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_secret_key
```

5. Initialize database:

```bash
python -m alembic upgrade head
```

6. Start backend server:

```bash
cd backend/app
fastapi run main.py
```

### Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure API base URL (optional):

```bash
cp .env.example .env
```

Edit `.env` to point to your backend:

```env
VITE_API_BASE=http://localhost:8000  # or the link of backend I deployed in render
VITE_API_BASE=https://exammodule.onrender.com
```

3. Start development server:

```bash
npm run dev
```

4. Access the application at:

```
http://localhost:5173
```

### Database Setup

**Option 1: Local MySQL**

```sql
CREATE DATABASE examdb;
```

**Option 2: Railway MySQL**

1. Create a new Railway project
2. Provision a MySQL database
3. Copy connection credentials to your `.env` file
4. Run migrations as shown in backend setup

## Live Demo

The application is deployed for testing:

**Backend API Documentation:**  
[![Swagger UI](https://img.shields.io/badge/Swagger-UI-%23Clojure?style=flat-square&logo=swagger)](https://exammodule.onrender.com/docs)

_Visit the Swagger UI to test all API endpoints interactively_

## API Documentation

The backend provides comprehensive API documentation through Swagger UI. You can test all endpoints directly from your browser.

### Interactive Documentation

- **Swagger UI:** https://exammodule.onrender.com/docs
- **ReDoc:** https://exammodule.onrender.com/redoc

### Postman Collection

The Postman collection for testing all API endpoints is included in the repository:
[Postman Link](https://harshavardhan-8534042.postman.co/workspace/Harsha-Vardhan's-Workspace~3c4d1fcf-46c8-4060-8986-110a4790ee0f/collection/45437576-4908c385-d5da-4058-8c53-cf7fb8528fd9?action=share&creator=45437576&active-environment=45437576-72bd29aa-7b0b-42f2-aa98-bbe184815465)

### API Testing Instructions:

1. Import the collection into Postman
2. Set environment variable `base_url` to your Render backend URL
3. Execute requests in this order:
   - Register a new user
   - Login to get JWT token
   - Start an exam session
   - Get session details
   - Autosave answers
   - Submit exam

### Key Endpoints:

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | /auth/register     | Register new user        |
| POST   | /auth/login        | Authenticate user        |
| POST   | /exam/start        | Start new exam session   |
| GET    | /exam/session/{id} | Get exam session details |
| POST   | /exam/autosave     | Save answers during exam |
| POST   | /exam/submit       | Submit exam for grading  |

## Project Structure

```
exam-portal/
├── backend/                  # FastAPI backend
│   ├── alembic/              # Database migrations
│   ├── app/                  # Application code
│   │   ├── crud.py           # Database operations
│   │   ├── database.py       # DB connection setup
│   │   ├── deps.py           # Dependencies
│   │   ├── main.py           # Main application
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── routers/          # API routers
│   │   ├── schemas.py        # Pydantic models
│   │   └── auth_utils.py     # Authentication helpers
│   ├── .env.example          # Environment template
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/         # Authentication
│   │   │   ├── dashboard/    # Dashboard view
│   │   │   └── exam/         # Exam components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── App.jsx           # Main component
│   │   └── main.jsx          # Entry point
│   ├── .env.example          # Environment template
│   └── package.json
│
├── postman/                  # API documentation
│   └── Exam Portal API.postman_collection.json
│
├── .gitignore
└── README.md                 # This file
```
