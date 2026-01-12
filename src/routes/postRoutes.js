const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');

const postController = new PostController();

router.get('', postController.getPosts.bind(postController));

router.get('/:id', postController.getPostById.bind(postController));

router.post('', postController.createPost.bind(postController));

router.put('/:id', postController.updatePost.bind(postController));

router.delete('/:id', postController.deletePost.bind(postController));

module.exports = router;
