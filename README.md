# COMPSIX-FinalProject
Study Planner API

A RESTful backend for managing users, courses, assignments, and study sessions. Built with Node.js, Express, Sequelize, and JWT authentication.

Project Overview

This API supports:

User registration and login

Role-based access control (teacher vs student)

CRUD operations for Users, Courses, Assignments, and Study Sessions

JWT authentication

Sequelize ORM with SQLite (or other SQL engines)

Setup Instructions

1. Install dependencies

npm install

2. Create a .env file

PORT=3000
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1d
DATABASE_URL=./database/studyplanner_dev.db
NODE_ENV=development

3. Start the server

npm start

Server runs at:

http://localhost:3000

4. Run tests

npm test

Authentication Endpoints

POST /api/register

Registers a new user.

Body:

name: string
email: string
password: string
role: "teacher" or "student" (optional, defaults to student)

Response (201):

{
  message: "User registered successfully",
  user: { id, name, email, role }
}

POST /api/login

Authenticates a user and returns a JWT.

Body:

email: string
password: string

Response (200):

{
  message: "Login successful",
  token: "<jwt>",
  user: { id, name, email }
}

POST /api/logout

Logs out the current user.

Headers:
Authorization: Bearer <jwt>

Response (200):
{
  "message": "Logout successful. Please delete your token on the client."
}


Users Endpoints (Auth Required)

GET /api/users

Returns all users.

GET /api/users/:id

Returns a single user.

POST /api/users

Creates a user.

PUT /api/users/:id

Updates a user.

DELETE /api/users/:id

Deletes a user.

Courses Endpoints

Teacher role required for create, update, delete.

GET /api/courses

Returns all courses.

GET /api/courses/:id

Returns a single course.

POST /api/courses (Teacher Only)

Body:

courseName: string
teacherName: string
semester: string
teacherId: number

Response (201):

{ id, courseName, teacherName, semester, teacherId }

PUT /api/courses/:id (Teacher Only)

Updates a course.

DELETE /api/courses/:id (Teacher Only)

Deletes a course.

Assignments Endpoints

Teacher role required for create, update, delete.

GET /api/assignments

GET /api/assignments/:id

POST /api/assignments

PUT /api/assignments/:id

DELETE /api/assignments/:id

Study Sessions Endpoints

Student role required for create, update, delete.

GET /api/study-sessions

Returns all study sessions.

GET /api/study-sessions/:id

Returns a single study session.

POST /api/study-sessions (Student Only)

Body:

userId: number
courseId: number
startTime: ISO timestamp
endTime: ISO timestamp

Response (201):

{ id, userId, courseId, startTime, endTime }

PUT /api/study-sessions/:id (Student Only)

Updates a study session.

DELETE /api/study-sessions/:id (Student Only)

Deletes a study session.

Testing

Run all tests:

npm test