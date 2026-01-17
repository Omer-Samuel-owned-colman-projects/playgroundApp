import { Request, Response } from 'express';
import Comment from '../models/Comment';
import DefaultController from './defaultController';

class CommentController extends DefaultController {
  constructor() {
    super(Comment);
  }

  async getAllComments(req: Request, res: Response): Promise<Response> {
    return super.get(req, res);
  }

  async createComment(req: Request, res: Response): Promise<Response> {
    const { message, sender, postId } = req.body;
    if (!message || !sender || !postId) {
      return res.status(400).json({ error: 'message, sender, and postId are required' });
    }
    return super.post(req, res);
  }

  async updateComment(req: Request, res: Response): Promise<Response> {
    const { message, sender, postId } = req.body;
    if (!message || !sender || !postId) {
      return res.status(400).json({ error: 'message, sender, and postId are required' });
    }
    return super.put(req, res);
  }

  async deleteComment(req: Request, res: Response): Promise<Response> {
    return super.del(req, res);
  }
}

export default CommentController;
