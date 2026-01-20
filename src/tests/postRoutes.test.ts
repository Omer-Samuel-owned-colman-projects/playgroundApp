import request from 'supertest';
import { Express } from 'express';
import Post from '../models/Post';
import User from '../models/User';
import { createApp } from '../../server';
import { postsData, usersData } from './testUtils';

let app: Express;
let accessToken: string;
let userId: string;

beforeAll(async () => {
  app = createApp();
  await Post.deleteMany({});
  await User.deleteMany({});

  // Register and login a user to get access token
  await request(app)
    .post('/api/user/register')
    .send(usersData[0]);

  const loginResponse = await request(app)
    .post('/api/user/login')
    .send(usersData[0]);

  accessToken = loginResponse.body.accessToken;
  userId = loginResponse.body.user._id;
});

afterAll((done) => {
  done()
});

describe('post API', () => {
  test('should create a post successfully', async () => {
    for (let i = 0; i < postsData.length; i++) {
      const newPost = postsData[i];
      const response = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: newPost.content })
      .expect(201);
      
      expect(response.body.content).toBe(newPost.content);
      expect(response.body.sender).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
      
      if (i === 0) {
        postsData[0]._id = response.body._id.toString();
      }
    };
  });

  test('should return all posts successfully', async () => {
    const response = await request(app).get('/api/post');
    expect(response.body).toHaveLength(3);
    expect(response.statusCode).toBe(200);
  });

  test('should filter posts by query parameters', async () => {
    const response = await request(app)
      .get('/api/post')
      .query({ sender: userId })
      .expect(200);

    expect(response.body.length).toBeGreaterThanOrEqual(1);
    if (response.body.length > 0 && !postsData[0]._id) {
      postsData[0]._id = response.body[0]._id;
    }
  });

  test('should return a post by id successfully', async () => {
    const response = await request(app).get(`/api/post/${postsData[0]._id}`)
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postsData[0]._id);

  });

  test('should update a post successfully', async () => {
    const updateData = {
      content: 'Updated content',
    };

    const response = await request(app)
      .put(`/api/post/${postsData[0]._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);
    expect(response.body.content).toBe(updateData.content);
    expect(response.body.sender).toBeDefined();
  });

  test('should delete a post successfully', async () => {
    const response = await request(app)
      .delete(`/api/post/${postsData[0]._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body._id).toBe(postsData[0]._id);
  });

  test('should return 403 when trying to update another user\'s post', async () => {
    // Create a post with the current user
    const createResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Post by user 1' })
      .expect(201);
    
    const postId = createResponse.body._id;

    // Register a second user
    await request(app)
      .post('/api/user/register')
      .send({ email: 'user2@example.com', password: 'password123' });

    const loginResponse2 = await request(app)
      .post('/api/user/login')
      .send({ email: 'user2@example.com', password: 'password123' })
      .expect(200);

    const accessToken2 = loginResponse2.body.accessToken;

    // Try to update the first user's post with the second user's token
    const updateResponse = await request(app)
      .put(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ content: 'Trying to update someone else\'s post' })
      .expect(403);

    expect(updateResponse.body.error).toBe('Forbidden: You can only update your own posts');
  });

  test('should return 400 if content is missing on create post', async () => {
    const response = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Content is required');
  });

  test('should return 401 if no authorization header on create post', async () => {
    const response = await request(app)
      .post('/api/post')
      .send({ content: 'Test content' })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 400 if content is missing on update post', async () => {
    const createResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Test post' })
      .expect(201);

    const postId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBe('Content is required');
  });

  test('should return 401 if no authorization header on update post', async () => {
    const createResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Test post' })
      .expect(201);

    const postId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/post/${postId}`)
      .send({ content: 'Updated content' })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 404 if post not found on update', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .put(`/api/post/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Updated content' })
      .expect(404);

    expect(response.body.error).toBe('Post not found');
  });

  test('should return 403 when trying to delete another user\'s post', async () => {
    const createResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Post to delete' })
      .expect(201);
    
    const postId = createResponse.body._id;

    await request(app)
      .post('/api/user/register')
      .send({ email: 'user4@example.com', password: 'password123' });

    const loginResponse2 = await request(app)
      .post('/api/user/login')
      .send({ email: 'user4@example.com', password: 'password123' })
      .expect(200);

    const accessToken2 = loginResponse2.body.accessToken;

    const deleteResponse = await request(app)
      .delete(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(403);

    expect(deleteResponse.body.error).toBe('Forbidden: You can only delete your own posts');
  });

  test('should return 404 if post not found on delete', async () => {
    const dummyId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .delete(`/api/post/${dummyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.error).toBe('Post not found');
  });

  test('should return 401 if no authorization header on delete post', async () => {
    const createResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Test post' })
      .expect(201);

    const postId = createResponse.body._id;

    const response = await request(app)
      .delete(`/api/post/${postId}`)
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 404 if post not found on get by id', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .get(`/api/post/${fakeId}`)
      .expect(404);

    expect(response.body.error).toBe('Data not found');
  });
});
