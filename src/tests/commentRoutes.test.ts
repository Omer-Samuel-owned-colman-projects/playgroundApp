import request from 'supertest';
import { Express } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';
import { createApp } from '../../server';
import { commentsData, usersData } from './testUtils';

let app: Express;
let testPostId: string;
let accessToken: string;

beforeAll(async () => {
  app = createApp();
  await Comment.deleteMany({});
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
  
  // Create a test post using authenticated request
  const postResponse = await request(app)
    .post('/api/post')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      content: 'post for comments',
    })
    .expect(201);
  
  testPostId = postResponse.body._id.toString();
  await Post.findByIdAndDelete(testPostId);
  
  commentsData.forEach(comment => comment.postId = testPostId);
});

afterAll((done) => {
  done()
});

describe('comment API', () => {
  test('should create a comment successfully', async () => {
    for (const newComment of commentsData) {
      const response = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: newComment.message, postId: newComment.postId })
      .expect(201);
      
      expect(response.body.message).toBe(newComment.message);
      expect(response.body.postId).toBe(newComment.postId);
      expect(response.body.sender).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    //   newComment._id = response.body._id;
    };
  });

  test('should return all comments successfully', async () => {
    const response = await request(app).get('/api/comment');
    expect(response.body).toHaveLength(4);
    expect(response.statusCode).toBe(200);
  });

  test('should filter comments by query parameters', async () => {
    const response = await request(app)
      .get('/api/comment')
      .query({ postId: testPostId })
      .expect(200);

    expect(response.body.length).toBe(4);
    commentsData[0]._id = response.body[0]._id;
  });

  test('should update a comment successfully', async () => {
    const updateData = {
      message: 'Updated message',
      postId: testPostId,
    };

    const response = await request(app)
      .put(`/api/comment/${commentsData[0]._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateData)
      .expect(200);
    expect(response.body.message).toBe(updateData.message);
    expect(response.body.sender).toBeDefined();
  });

  test('should delete a comment successfully', async () => {
    const response = await request(app)
      .delete(`/api/comment/${commentsData[0]._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body._id).toBe(commentsData[0]._id);
  });

  test('should return 403 when trying to update another user\'s comment', async () => {
    // Create a post first
    const postResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Post for comment test' })
      .expect(201);
    
    const postId = postResponse.body._id;

    // Create a comment with the current user
    const createResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Comment by user 1', postId })
      .expect(201);
    
    const commentId = createResponse.body._id;

    // Register a second user
    await request(app)
      .post('/api/user/register')
      .send({ email: 'user2@example.com', password: 'password123' });

    const loginResponse2 = await request(app)
      .post('/api/user/login')
      .send({ email: 'user2@example.com', password: 'password123' })
      .expect(200);

    const accessToken2 = loginResponse2.body.accessToken;

    // Try to update the first user's comment with the second user's token
    const updateResponse = await request(app)
      .put(`/api/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .send({ message: 'Trying to update someone else\'s comment', postId })
      .expect(403);

    expect(updateResponse.body.error).toBe('Forbidden: You can only update your own comments');
  });

  test('should return 400 if message is missing on create comment', async () => {
    const response = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ postId: testPostId })
      .expect(400);

    expect(response.body.error).toBe('message and postId are required');
  });

  test('should return 400 if postId is missing on create comment', async () => {
    const response = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Test message' })
      .expect(400);

    expect(response.body.error).toBe('message and postId are required');
  });

  test('should return 401 if no authorization header on create comment', async () => {
    const response = await request(app)
      .post('/api/comment')
      .send({ message: 'Test message', postId: testPostId })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 400 if message is missing on update comment', async () => {
    const createResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Test comment', postId: testPostId })
      .expect(201);

    const commentId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ postId: testPostId })
      .expect(400);

    expect(response.body.error).toBe('message and postId are required');
  });

  test('should return 400 if postId is missing on update comment', async () => {
    const createResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Test comment', postId: testPostId })
      .expect(201);

    const commentId = createResponse.body._id;

    const response = await request(app)
      .put(`/api/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Updated message' })
      .expect(400);

    expect(response.body.error).toBe('message and postId are required');
  });

  test('should return 401 if no authorization header on update comment', async () => {
    const creationResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Test comment', postId: testPostId })
      .expect(201);

    const commentId = creationResponse.body._id;

    const response = await request(app)
      .put(`/api/comment/${commentId}`)
      .send({ message: 'Updated message', postId: testPostId })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  test('should return 404 if comment not found on update', async () => {
    const dumnmyId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .put(`/api/comment/${dumnmyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Updated message', postId: testPostId })
      .expect(404);

    expect(response.body.error).toBe('Comment not found');
  });

  test('should return 403 when trying to delete another user\'s comment', async () => {
    const postResponse = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Post for delete test' })
      .expect(201);
    
    const postId = postResponse.body._id;

    const creationResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Comment to delete', postId })
      .expect(201);
    
    const commentId = creationResponse.body._id;

    await request(app)
      .post('/api/user/register')
      .send({ email: 'user3@example.com', password: 'password123' });

    const secondUserLoginResponse = await request(app)
      .post('/api/user/login')
      .send({ email: 'user3@example.com', password: 'password123' })
      .expect(200);

    const accessToken2 = secondUserLoginResponse.body.accessToken;

    const deleteResponse = await request(app)
      .delete(`/api/comment/${commentId}`)
      .set('Authorization', `Bearer ${accessToken2}`)
      .expect(403);

    expect(deleteResponse.body.error).toBe('Forbidden: You can only delete your own comments');
  });

  test('should return 404 if comment not found on delete', async () => {
    const dummyId = '507f1f77bcf86cd799439011';
    const response = await request(app)
      .delete(`/api/comment/${dummyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.error).toBe('Comment not found');
  });

  test('should return 401 if no authorization header on delete comment', async () => {
    const createResponse = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ message: 'Test comment', postId: testPostId })
      .expect(201);

    const commentId = createResponse.body._id;

    const response = await request(app)
      .delete(`/api/comment/${commentId}`)
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});
