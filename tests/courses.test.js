const request = require('supertest');
const app = require('../server');
const { User } = require('../database/setup');

let teacherToken;
let studentToken;
let teacherRecord;

beforeAll(async () => {
  // Create teacher
  await request(app).post('/api/register').send({
    name: "Teacher",
    email: "teacher@example.com",
    password: "password123",
    role: "teacher"
  });

  const teacherLogin = await request(app).post('/api/login').send({
    email: "teacher@example.com",
    password: "password123"
  });

  teacherRecord = await User.findOne({ where: { email: "teacher@example.com" } });

  teacherToken = teacherLogin.body.token;

  // Create student
  await request(app).post('/api/register').send({
    name: "Student",
    email: "student@example.com",
    password: "password123",
    role: "student"
  });

  const studentLogin = await request(app).post('/api/login').send({
    email: "student@example.com",
    password: "password123"
  });

  studentToken = studentLogin.body.token;
});

describe('Courses CRUD', () => {

  test('POST /api/courses - teacher can create', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        courseName: "Biology 101",
        teacherName: "Teacher",
        semester: "Fall",
        teacherId: teacherRecord.id
      });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/courses - student cannot create', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        courseName: "Chemistry",
        teacherName: "Teacher",
        semester: "Fall",
        teacherId: teacherRecord.id
      });

    expect(res.statusCode).toBe(403);
  });

});