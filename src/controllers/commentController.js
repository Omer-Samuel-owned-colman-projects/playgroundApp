const Comment = require('../models/Comment');
const DefaultController = require('./defaultController');

class CommentController extends DefaultController {
  constructor() {
    super(Comment);
  }

  async getAllComments(req, res) {
    return super.get(req, res);
  }

  async createComment(req, res) {
    const { message, sender, postId } = req.body;
    if (!message || !sender || !postId) {
      return res.status(400).json({ error: 'message, sender, and postId are required' });
    }
    return super.post(req, res);
  }

  async updateComment(req, res) {
    const { message, sender, postId } = req.body;
    if (!message || !sender || !postId) {
      return res.status(400).json({ error: 'message, sender, and postId are required' });
    }
    return super.put(req, res);
  }

  async deleteComment(req, res) {
    return super.del(req, res);
  }
}

module.exports = CommentController;
