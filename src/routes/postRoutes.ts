import express, { Router } from 'express';
import PostController from '../controllers/postController';

const router: Router = express.Router();
const postController = new PostController();

router.get('', postController.getPosts.bind(postController));
router.get('/:id', postController.getPostById.bind(postController));
router.post('', postController.createPost.bind(postController));
router.put('/:id', postController.updatePost.bind(postController));
router.delete('/:id', postController.deletePost.bind(postController));

export default router;
