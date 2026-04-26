const request = require('supertest');
const app = require('../server');
const { User } = require('../database/setup');

let studentToken;
let studentRecord;
let courseId;
let teacherToken;
let teacherRecord;

beforeAll(async () => {
  // Create student
  await request(app).post('/api/register').send({
    name: "Student",
    email: "stud2@example.com",
    password: "password123",
    role: "student"
  });

  const login = await request(app).post('/api/login').send({
    email: "stud2@example.com",
    password: "password123"
  });

  studentToken = login.body.token;
  studentRecord = await User.findOne({ where: { email: "stud2@example.com" } });

  // Create course (teacher required)
  await request(app).post('/api/register').send({
    name: "Teacher",
    email: "teach3@example.com",
    password: "password123",
    role: "teacher"
  });

  const teacherLogin = await request(app).post('/api/login').send({
    email: "teach3@example.com",
    password: "password123"
  });

  teacherToken = teacherLogin.body.token;
  teacherRecord = await User.findOne({ where: { email: "teach3@example.com" } });

  const course = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      courseName: "History 101",
      teacherName: "Teacher",
      semester: "Fall",
      teacherId: teacherRecord.id
    });

  courseId = course.body.id;
});

describe('Study Sessions CRUD', () => {

  test('POST /api/study-sessions - student can create', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        userId: studentRecord.id,
        courseId,
        startTime: "2024-01-01T10:00:00Z",
        endTime: "2024-01-01T11:00:00Z"
      });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/study-sessions - missing fields', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

});