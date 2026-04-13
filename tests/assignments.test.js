const request = require('supertest');
const app = require('../server');

let teacherToken;
let courseId;

beforeAll(async () => {
  // Create teacher
  await request(app).post('/api/register').send({
    name: "Teacher",
    email: "teach2@example.com",
    password: "password123",
    role: "teacher"
  });

  const login = await request(app).post('/api/login').send({
    email: "teach2@example.com",
    password: "password123"
  });

  teacherToken = login.body.token;

  // Create course
  const course = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      courseName: "Math 101",
      teacherName: "Teacher",
      semester: "Spring",
      teacherId: 1
    });

  courseId = course.body.id;
});

describe('Assignments CRUD', () => {

  test('POST /api/assignments - teacher can create', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: "Homework 1",
        description: "Read chapter 1",
        dueDate: "2024-01-10",
        courseId
      });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/assignments - missing fields', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

});