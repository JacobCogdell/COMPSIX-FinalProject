const request = require('supertest');
const app = require('../server');
const { User, Course } = require('../database/setup');

let teacherToken;
let studentToken;
let student2Token;
let studentRecord;
let student2Record;
let teacherRecord;
let courseId;
let sessionId;

beforeAll(async () => {
  // Create teacher
  await request(app).post('/api/register').send({
    name: "SessionTeacher",
    email: "sessionteacher@example.com",
    password: "password123",
    role: "teacher"
  });

  const teacherLogin = await request(app).post('/api/login').send({
    email: "sessionteacher@example.com",
    password: "password123"
  });

  teacherToken = teacherLogin.body.token;
  teacherRecord = await User.findOne({ where: { email: "sessionteacher@example.com" } });

  // Create student 1
  await request(app).post('/api/register').send({
    name: "SessionStudent",
    email: "sessionstudent@example.com",
    password: "password123",
    role: "student"
  });

  const studentLogin = await request(app).post('/api/login').send({
    email: "sessionstudent@example.com",
    password: "password123"
  });

  studentToken = studentLogin.body.token;
  studentRecord = await User.findOne({ where: { email: "sessionstudent@example.com" } });

  // Create student 2 (for ownership tests)
  await request(app).post('/api/register').send({
    name: "OtherStudent",
    email: "otherstudent@example.com",
    password: "password123",
    role: "student"
  });

  const student2Login = await request(app).post('/api/login').send({
    email: "otherstudent@example.com",
    password: "password123"
  });

  student2Token = student2Login.body.token;
  student2Record = await User.findOne({ where: { email: "otherstudent@example.com" } });

  // Create a course for study sessions
  const courseRes = await request(app)
    .post('/api/courses')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      courseName: "Session Test Course",
      teacherName: "SessionTeacher",
      semester: "Fall 2026",
      teacherId: teacherRecord.id
    });

  courseId = courseRes.body.id;
});

describe('Study Sessions CRUD', () => {

  // --- CREATE ---

  test('POST /api/study-sessions - student can create', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        userId: studentRecord.id,
        courseId: courseId,
        startTime: "2026-09-10T14:00:00.000Z",
        endTime: "2026-09-10T16:00:00.000Z"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(studentRecord.id);
    expect(res.body.courseId).toBe(courseId);
    sessionId = res.body.id;
  });

  test('POST /api/study-sessions - teacher cannot create', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        userId: teacherRecord.id,
        courseId: courseId,
        startTime: "2026-09-10T14:00:00.000Z",
        endTime: "2026-09-10T16:00:00.000Z"
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/study-sessions - missing required fields returns 400', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        userId: studentRecord.id
        // missing courseId, startTime, endTime
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/study-sessions - no auth returns 401', async () => {
    const res = await request(app)
      .post('/api/study-sessions')
      .send({
        userId: studentRecord.id,
        courseId: courseId,
        startTime: "2026-09-10T14:00:00.000Z",
        endTime: "2026-09-10T16:00:00.000Z"
      });

    expect(res.statusCode).toBe(401);
  });

  // --- READ ---

  test('GET /api/study-sessions - student sees only own sessions', async () => {
    const res = await request(app)
      .get('/api/study-sessions')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(session => {
      expect(session.userId).toBe(studentRecord.id);
    });
  });

  test('GET /api/study-sessions - teacher sees all sessions', async () => {
    const res = await request(app)
      .get('/api/study-sessions')
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/study-sessions/:id - owner can view', async () => {
    const res = await request(app)
      .get(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(sessionId);
  });

  test('GET /api/study-sessions/:id - other student is forbidden', async () => {
    const res = await request(app)
      .get(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/study-sessions/:id - teacher can view any session', async () => {
    const res = await request(app)
      .get(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(sessionId);
  });

  test('GET /api/study-sessions/:id - not found returns 404', async () => {
    const res = await request(app)
      .get('/api/study-sessions/9999')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(404);
  });

  test('GET /api/study-sessions - no auth returns 401', async () => {
    const res = await request(app)
      .get('/api/study-sessions');

    expect(res.statusCode).toBe(401);
  });

  // --- UPDATE ---

  test('PUT /api/study-sessions/:id - owner can update', async () => {
    const res = await request(app)
      .put(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        endTime: "2026-09-10T18:00:00.000Z",
        notes: "Extended session"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.notes).toBe("Extended session");
  });

  test('PUT /api/study-sessions/:id - other student cannot update', async () => {
    const res = await request(app)
      .put(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${student2Token}`)
      .send({
        notes: "Hijacked session"
      });

    expect(res.statusCode).toBe(403);
  });

  test('PUT /api/study-sessions/:id - teacher cannot update', async () => {
    const res = await request(app)
      .put(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        notes: "Teacher override"
      });

    expect(res.statusCode).toBe(403);
  });

  test('PUT /api/study-sessions/:id - not found returns 404', async () => {
    const res = await request(app)
      .put('/api/study-sessions/9999')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ notes: "Ghost session" });

    expect(res.statusCode).toBe(404);
  });

  // --- DELETE ---

  test('DELETE /api/study-sessions/:id - other student cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/study-sessions/:id - teacher cannot delete', async () => {
    const res = await request(app)
      .delete(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${teacherToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('DELETE /api/study-sessions/:id - owner can delete', async () => {
    const res = await request(app)
      .delete(`/api/study-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Study session deleted successfully');
  });

  test('DELETE /api/study-sessions/:id - not found returns 404', async () => {
    const res = await request(app)
      .delete('/api/study-sessions/9999')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(404);
  });

});
