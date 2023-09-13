# Appointment Scheduling Application

This web-based appointment scheduling application allows users to view available time slots, book appointments, and receive notifications. The project utilizes the following technology stack:
- Frontend: HTML, CSS, React
- Backend: Node.js, JavaScript, PHP
- Database: MySQL

## Features
- View available appointment time slots.
- Book appointments with available time slots.
- Receive notifications about booked appointments.

### Prerequisites
- Node.js and npm installed on your system.
- MySQL database set up with the necessary tables.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/appointment-scheduler.git
   cd appointment-scheduler

2. Install backend dependencies:
3. ```bash
   cd backend
    npm install
4. Create a .env file in the backend directory and set the following environmental variables
   ```bash
    DATABASE_HOST=your-database-host
    DATABASE_USER=your-database-username
    DATABASE_PASSWORD=your-database-password
    DATABASE_NAME=your-database-name
    SECRET_KEY=your-secret-key

  5. Install frontend dependencies:
     ```bash
         cd ../frontend
         npm install
## Backend Packages (Node.js/Express.js)
express: For creating REST APIs in Node.js using Express.
morgan: To log HTTP requests and responses, including endpoint information and query execution time.
dotenv: For managing environmental variables, especially sensitive/confidential data stored in a .env file.
nodemon: Automatically restarts the Node.js server when code changes are detected, making development smoother.
bcryptjs: For securely hashing and encrypting passwords.

## Frontend Packages (React)
react-router-dom: Essential for implementing client-side routing in your React application, enabling navigation between different views/components.
axios: A popular HTTP client for making network requests from your React application to your Express.js backend.
antd (Ant Design): A comprehensive UI component library for React, offering a wide range of pre-built components and styles to enhance the user interface of your application.
