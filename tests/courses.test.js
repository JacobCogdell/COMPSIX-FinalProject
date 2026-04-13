const request = require('supertest');
const app = require('../server');

let teacherToken;
let studentToken;

beforeAll(async () => {
  // Create teacher
  await request(app).post('/api/register').send({
    name: "Teacher",
    email: "teacher@example.com",
    password: "password123"
  });

  const teacherLogin = await request(app).post('/api/login').send({
    email: "teacher@example.com",
    password: "password123"
  });

  teacherToken = teacherLogin.body.token;

  // Create student
  await request(app).post('/api/register').send({
    name: "Student",
    email: "student@example.com",
    password: "password123"
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
        teacherId: 1
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
        teacherId: 1
      });

    expect(res.statusCode).toBe(403);
  });

});