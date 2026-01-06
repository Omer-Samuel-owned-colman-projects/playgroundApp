const express = require('express');
const router = express.Router();
const postService = require('../services/postService');

router.get('/posts', async (req, res) => {
  try {
    const { sender } = req.query;
    let posts;
    if (sender) {
      posts = await postService.getPostsByUploaderId(sender);
    } else {
      posts = await postService.getAllPosts();
    }
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts/:post_id', async (req, res) => {
  try {
    const { post_id } = req.params;
    const post = await postService.getPostById(post_id);
    res.status(200).json(post);
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/posts', async (req, res) => {
  try {
    console.log(req.body);
    const { content, uploaderId } = req.body;
    const savedPost = await postService.createPost(content, uploaderId);
    res.status(201).json(savedPost);
  } catch (error) {
    if (error.message === 'Both content and uploaderId are required') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, uploaderId } = req.body;
    const updatedPost = await postService.updatePost(id, content, uploaderId);
    res.status(200).json(updatedPost);
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Both content and uploaderId are required') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await postService.deletePost(id);
    res.status(200).json({ message: 'Post deleted successfully', post: deletedPost });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
