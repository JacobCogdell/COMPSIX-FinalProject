const request = require('supertest');
const app = require('../server');
const { User, Course } = require('../database/setup');

let teacherToken;
let studentToken;
let teacherRecord;
let courseId;
let assignmentId;

beforeAll(async () => {
  // Create teacher
  await request(app).post('/api/register').send({
    name: "AssignTeacher",
    email: "assignteacher@example.com",
    password: "password123",
    role: "teacher"
  });

  const teacherLogin = await request(app).post('/api/login').send({
    email: "assignteacher@example.com",
    password: "password123"
  });

  teacherToken = teacherLogin.body.token;
  teacherRecord = await User.findOne({ where: { email: "assignteacher@example.com" } });

  // Create student
  await request(app).post('/api/register').send({
    name: "AssignStudent",
    email: "assignstudent@example.com",
    password: "password123",
    role: "student"
  });

  const studentLogin = await request(app).post('/api/login').send({
    email: "assignstudent@example.com",
    password: "password123"
  });

  studentToken = studentLogin.body.token;

  // Create a course for assignments to belong to
  const courseRes = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      courseName: "Test Course",
      teacherName: "AssignTeacher",
      semester: "Fall 2026",
      teacherId: teacherRecord.id
    });

  courseId = courseRes.body.id;
});

describe('Assignments CRUD', () => {

  // --- CREATE ---

  test('POST /api/assignments - teacher can create', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: "Homework 1",
        description: "Complete chapter 1 exercises",
        dueDate: "2026-09-15T23:59:00.000Z",
        courseId: courseId
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Homework 1");
    expect(res.body.courseId).toBe(courseId);
    assignmentId = res.body.id;
  });

  test('POST /api/assignments - student cannot create', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: "Student Homework",
        dueDate: "2026-09-20T23:59:00.000Z",
        courseId: courseId
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/assignments - missing required fields returns 400', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: "Incomplete Assignment"
        // missing dueDate and courseId
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/assignments - no auth returns 401', async () => {
    const res = await request(app)
      .post('/api/assignments')
      .send({
        title: "No Auth Homework",
        dueDate: "2026-09-15T23:59:00.000Z",
        courseId: courseId
      });

    expect(res.statusCode).toBe(401);
  });

  // --- READ ---

  test('GET /api/assignments - returns all assignments', async () => {
    const res = await request(app)
      .get('/api/assignments')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/assignments/:id - returns single assignment', async () => {
    const res = await request(app)
      .get(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(assignmentId);
    expect(res.body.title).toBe("Homework 1");
  });

  test('GET /api/assignments/:id - not found returns 404', async () => {
    const res = await request(app)
      .get('/api/assignments/9999')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/assignments - no auth returns 401', async () => {
    const res = await request(app)
      .get('/api/assignments');

    expect(res.statusCode).toBe(401);
  });

  // --- UPDATE ---

  test('PUT /api/assignments/:id - teacher can update', async () => {
    const res = await request(app)
      .put(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: "Homework 1 - Updated",
        description: "Updated description"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Homework 1 - Updated");
  });

  test('PUT /api/assignments/:id - student cannot update', async () => {
    const res = await request(app)
      .put(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: "Student Trying to Update"
      });

    expect(res.statusCode).toBe(403);
  });

  test('PUT /api/assignments/:id - not found returns 404', async () => {
    const res = await request(app)
      .put('/api/assignments/9999')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ title: "Ghost Assignment" });

    expect(res.statusCode).toBe(404);
  });

  // --- DELETE ---

  test('DELETE /api/assignments/:id - student cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/assignments/:id - teacher can delete', async () => {
    const res = await request(app)
      .delete(`/api/assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Assignment deleted successfully');
  });

  test('DELETE /api/assignments/:id - not found returns 404', async () => {
    const res = await request(app)
      .delete('/api/assignments/9999')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(404);
  });

});
