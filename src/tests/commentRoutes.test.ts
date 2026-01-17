import request from 'supertest';
import { Express } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';
import { createApp } from '../../server';
import { commentsData } from './testUtils';

let app: Express;
let testPostId: string;

beforeAll(async () => {
  app = createApp();
  await Comment.deleteMany({});
  await Post.deleteMany({});
  
  const testPost = await Post.create({
    content: 'post for comments',
    sender: '123',
  });
  
  testPostId = testPost._id.toString();
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
      .send(newComment)
      .expect(201);
      
      expect(response.body).toMatchObject(newComment);
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
      sender: 'user1',
      postId: testPostId,
    };

    const response = await request(app).put(`/api/comment/${commentsData[0]._id}`).send(updateData)
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(updateData.message);
    expect(response.body.sender).toBe(updateData.sender);
  });

  test('should delete a comment successfully', async () => {
    const response = await request(app).delete(`/api/comment/${commentsData[0]._id}`)
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentsData[0]._id);
  });
});
