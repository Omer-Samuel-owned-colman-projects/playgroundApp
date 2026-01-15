import request from 'supertest';
import { Express } from 'express';
import User from '../models/User';
import { createApp } from '../../server';
import { usersData } from './testUtils';
import { generateRefreshToken } from '../services/authServices';

let app: Express;
let testUser: {
  email: string;
  password: string;
  _id?: string;
  accessToken?: string;
  refreshToken?: string;
};

beforeAll(async () => {
  app = createApp();
  await User.deleteMany({});
});

afterAll((done) => {
  done();
});

describe('user API', () => {
  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send(usersData[0])
      .expect(201);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(usersData[0].email);
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user._id).toBeDefined();
    expect(response.body.user.refreshToken).toBeDefined();
    expect(response.body.user.createdAt).toBeDefined();
    expect(response.body.user.updatedAt).toBeDefined();

    testUser = {
      email: usersData[0].email,
      password: usersData[0].password,
      _id: response.body.user._id,
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken
    };
  });

  test('should return 400 if email is missing on register', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({ password: 'password123' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email and password are required');
  });

  test('should return 400 if password is missing on register', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({ email: 'test2@example.com' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email and password are required');
  });

  test('should return 409 if user already exists', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send(usersData[0])
      .expect(409);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('User with this email already exists');
  });

  test('should login user successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send(usersData[0])
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.user.email).toBe(usersData[0].email);
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();

    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test('should return 400 if email is missing on login', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ password: usersData[0].password })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email and password are required');
  });

  test('should return 400 if password is missing on login', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({ email: usersData[0].email })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Email and password are required');
  });

  test('should return 401 if email does not exist', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({
        email: 'nonexistent@example.com',
        password: usersData[0].password
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid email or password');
  });

  test('should return 401 if password is incorrect', async () => {
    const response = await request(app)
      .post('/api/user/login')
      .send({
        email: usersData[0].email,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid email or password');
  });

  test('should logout user successfully with valid token', async () => {
    const response = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${testUser.accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Logged out successfully');

    const user = await User.findById(testUser._id);
    expect(user?.refreshToken).toBeNull();
  });

  test('should return 401 if no authorization header on logout', async () => {
    const response = await request(app)
      .post('/api/user/logout')
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });

  test('should return 401 if invalid token on logout', async () => {
    const response = await request(app)
      .post('/api/user/logout')
      .set('Authorization', 'Bearer invalidtoken123')
      .expect(401);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Unauthorized');
  });

  test('should refresh access token successfully', async () => {
    // Login again to get a fresh token
    const loginResponse = await request(app)
      .post('/api/user/login')
      .send(usersData[0])
      .expect(200);

    const response = await request(app)
      .post('/api/user/refresh')
      .send({
        refreshToken: loginResponse.body.refreshToken
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  });

  test('should return 400 if refresh token is missing', async () => {
    const response = await request(app)
      .post('/api/user/refresh')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Refresh token is required');
  });

  test('should return 403 if refresh token is invalid', async () => {
    const response = await request(app)
      .post('/api/user/refresh')
      .send({
        refreshToken: 'invalidrefreshtoken123'
      })
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Invalid or expired refresh token');
  });

  test('should return 403 if refresh token is not found in database', async () => {
    const fakeToken = generateRefreshToken('507f1f77bcf86cd799439011');

    const response = await request(app)
      .post('/api/user/refresh')
      .send({
        refreshToken: fakeToken
      })
      .expect(403);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Refresh token not found');
  });
});
