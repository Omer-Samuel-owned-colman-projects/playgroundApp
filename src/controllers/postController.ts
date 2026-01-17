import { Request, Response } from 'express';
import Post from '../models/Post';
import DefaultController from './defaultController';

class PostController extends DefaultController {
  constructor() {
    super(Post);
  }

  async getPosts(req: Request, res: Response): Promise<Response> {
    return super.get(req, res);
  }

  async getPostById(req: Request, res: Response): Promise<Response> {
    return super.getById(req, res);
  }

  async createPost(req: Request, res: Response): Promise<Response> {
    const { content, sender } = req.body;
    if (!content || !sender) {
      return res.status(400).json({ error: 'Both content and sender are required' });
    }
    return super.post(req, res);
  }

  async updatePost(req: Request, res: Response): Promise<Response> {
    const { content, sender } = req.body;
    if (!content || !sender) {
      return res.status(400).json({ error: 'Both content and sender are required' });
    }
    return super.put(req, res);
  }

  async deletePost(req: Request, res: Response): Promise<Response> {
    return super.del(req, res);
  }
}

export default PostController;
