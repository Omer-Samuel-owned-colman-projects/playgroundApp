import request from 'supertest';
import { Express } from 'express';
import Post from '../models/Post';
import { createApp } from '../../server';
import { postsData } from './testUtils';

let app: Express;

beforeAll(async () => {
  app = createApp();
  await Post.deleteMany({});
});

afterAll((done) => {
  done()
});

describe('post API', () => {
  test('should create a post successfully', async () => {
    for (const newPost of postsData) {
      const response = await request(app)
      .post('/api/post')
      .send(newPost)
      .expect(201);
      
      expect(response.body).toMatchObject(newPost);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
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
      .query({ sender: 'user2' })
      .expect(200);

    expect(response.body).toHaveLength(1);
    postsData[0]._id = response.body[0]._id;
  });

  test('should return a post by id successfully', async () => {
    const response = await request(app).get(`/api/post/${postsData[0]._id}`)
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postsData[0]._id);

  });

  test('should update a post successfully', async () => {
    const updateData = {
      content: 'Updated content',
      sender: 'user1',
    };

    const response = await request(app).put(`/api/post/${postsData[0]._id}`).send(updateData)
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(updateData.content);
    expect(response.body.sender).toBe(updateData.sender);
  });

  test('should delete a post successfully', async () => {
    const response = await request(app).delete(`/api/post/${postsData[0]._id}`)
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postsData[0]._id);
  });
});
