# COMPSIX-FinalProject
Study Planner API

A RESTful backend for managing users, courses, assignments, and study sessions. Built with Node.js, Express, Sequelize, and JWT authentication.

LIVE DEPLOYMENT: https://jcogdell-study-planner-api.onrender.com

Project Overview

This API supports:

- User registration and login with secure password hashing
- JWT-Based authentication for protected routes
- Role-based access control (teacher vs student)
- CRUD operations for Users, Courses, Assignments, and Study Sessions
- Sequelize ORM with SQLite
- Comprehensive Test Suite

Roles & Permissions

The API enforces two user roles with distinct access levels:

| Resource         | Action             | Teacher | Student |
|------------------|--------------------|---------|---------|
| *Users*          | View all users     |   ✅    |   ❌   |
| *Users*          | View own profile   |   ✅    |   ✅   |
| *Users*          | Create user        |   ✅    |   ❌   |
| *Users*          | Update own profile |   ✅    |   ✅   |
| *Users*          | Delete user        |   ✅    |   ❌   |
| *Courses*        | View courses       |   ✅    |   ✅   |
| *Courses*        | Create/Update/Del  |   ✅    |   ❌   |
| *Assignments*    | View assignments   |   ✅    |   ✅   |
| *Assignments*    | Create/Update/Del  |   ✅    |   ❌   |
| *Study Sessions* | View all sessions  |   ✅    |   ❌ (own only) |
| *Study Sessions* | Create/Update/Del  |   ❌    |   ✅ (own only) |

Ownership rules:
- Students can only view and modify their own user profile
- Students can only view, update, and delete their own study sessions
- Teachers can view any user profile and any study session

Setup Instructions

1. Install dependencies
npm install

2. Create a .env file

PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database/studyplanner_dev.db
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=1d
NODE_ENV=development

3. Set Up and Seed the Database
npm run setup
npm run seed

4. Start the server

npm start

Server runs at:

http://localhost:3000

5. Run tests

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

GET /api/assignments — Returns all assignments
GET /api/assignments/:id — Returns a single assignment

POST /api/assignments (Teacher Only)

Body:

title: string
description: string
dueDate: ISO timestamp
courseId: number

Response (201):

{ id, title, description, dueDate, courseId }

PUT /api/assignments/:id (Teacher Only) — Updates an assignment
DELETE /api/assignments/:id (Teacher Only) — Deletes an assignment


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

Error Responses 

| Status Code | Meaning                                    |
| ----------- | ------------------------------------------ | 
| 400         | Bad request / validation error             |
| 401         | Unauthorized / missing or invalid token    |
| 403         | Forbidden / insufficient role or ownership |
| 404         | Resource not found                         |
| 500         | Internal server error                      |

The database comes pre-seeded with sample data for testing:

Users (password for all: password123)

| Name	           | Email             |	Role        |
| ---------------- | ----------------- | ------------ |
| Prof. John Doe   | john@school.com   | teacher      |
| Prof. Jane Smith | jane@school.com   | teacher      |
| Mike Wheeler     | mike@school.com   | student      |
| Nancy Wheeler    | nancy@school.com  | student      |
| Dustin Henderson | dustin@school.com | student      |
| Lucas Sinclair   | lucas@school.com  | student      |

Courses: Computer Science 101, Physics 201, Computer Science 102, Physics 202, Physics 203

Postman Documentation
A complete Postman collection with example requests and responses for all endpoints is available:

https://jacobcogdell-9420481.postman.co/workspace/Jacob-Cogdell's-Workspace~37248d7c-78c2-4b37-8e58-630a4b21f735/collection/52608116-92995659-e444-4ad6-ac1f-fd6fe89bc61c

## Using Authentication

Most endpoints require a valid JWT token. Here's how to use it:

1. **Register** a user via `POST /api/register`
2. **Log in** via `POST /api/login` — the response includes a `token` field
3. **Include the token** in all subsequent requests using the `Authorization` header:
   `Authorization: Bearer <your_token_here>`
4. **Log out** via `POST /api/logout` — then delete the token on the client side


## Deployment Notes

This API is deployed on Render's free tier:

- The free instance spins down after 15 minutes of inactivity. 
- The SQLite database resets on each deploy 
- Auto-deploy is enabled — every push to main triggers a fresh build and reseed.

