import { Request, Response } from 'express';
import Post from '../models/Post';
import DefaultController from './defaultController';
import { AuthRequest } from '../services/authServices';

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

  async createPost(req: AuthRequest, res: Response): Promise<Response> {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.body.sender = req.user._id;
    return super.post(req, res);
  }

  async updatePost(req: AuthRequest, res: Response): Promise<Response> {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    try {
      const post = await this.model.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if the authenticated user is the creator
      if (post.sender.toString() !== req.user._id) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own posts' });
      }

      req.body.sender = req.user._id;
      return super.put(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async deletePost(req: AuthRequest, res: Response): Promise<Response> {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    try {
      const post = await this.model.findById(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if the authenticated user is the creator
      if (post.sender.toString() !== req.user._id) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own posts' });
      }

      return super.del(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

export default PostController;
