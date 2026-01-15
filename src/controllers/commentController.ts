import { Request, Response } from 'express';
import Comment from '../models/Comment';
import DefaultController from './defaultController';
import { AuthRequest } from '../services/authServices';

class CommentController extends DefaultController {
  constructor() {
    super(Comment);
  }

  async getAllComments(req: Request, res: Response): Promise<Response> {
    return super.get(req, res);
  }

  async createComment(req: AuthRequest, res: Response): Promise<Response> {
    const { message, postId } = req.body;
    if (!message || !postId) {
      return res.status(400).json({ error: 'message and postId are required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.body.sender = req.user._id;
    return super.post(req, res);
  }

  async updateComment(req: AuthRequest, res: Response): Promise<Response> {
    const { message, postId } = req.body;
    if (!message || !postId) {
      return res.status(400).json({ error: 'message and postId are required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    try {
      const comment = await this.model.findById(id);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the authenticated user is the creator
      if (comment.sender.toString() !== req.user._id) {
        return res.status(403).json({ error: 'Forbidden: You can only update your own comments' });
      }

      req.body.sender = req.user._id;
      return super.put(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }

  async deleteComment(req: AuthRequest, res: Response): Promise<Response> {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    try {
      const comment = await this.model.findById(id);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the authenticated user is the creator
      if (comment.sender.toString() !== req.user._id) {
        return res.status(403).json({ error: 'Forbidden: You can only delete your own comments' });
      }

      return super.del(req, res);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ error: errorMessage });
    }
  }
}

export default CommentController;
