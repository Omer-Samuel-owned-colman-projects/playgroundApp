const Post = require('../models/Post');
const DefaultController = require('./defaultController');

class PostController extends DefaultController {
  constructor() {
    super(Post);
  }

  async getPosts(req, res) {
    return super.get(req, res);
  }

  async getPostById(req, res) {
    return super.getById(req, res);
  }

  async createPost(req, res) {
    const { content, sender } = req.body;
    if (!content || !sender) {
      return res.status(400).json({ error: 'Both content and sender are required' });
    }
    return super.post(req, res);
  }

  async updatePost(req, res) {
    const { content, sender } = req.body;
    if (!content || !sender) {
      return res.status(400).json({ error: 'Both content and sender are required' });
    }
    return super.put(req, res);
  }

  async deletePost(req, res) {
    return super.del(req, res);
  }
}

module.exports = PostController;
