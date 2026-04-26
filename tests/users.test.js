const request = require('supertest');
const app = require('../server');

describe('User Registration & Login', () => {

  test('POST /api/register - success', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("test@example.com");
  });

  test('POST /api/register - missing fields', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ email: "bad@example.com" });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/register - duplicate email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({
        name: "Another User",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/login - success', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: "test@example.com",
        password: "password123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/login - wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: "test@example.com",
        password: "wrong"
      });

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/logout - logs out successfully', async () => {
    const res = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('Logout successful');
  });
  
});