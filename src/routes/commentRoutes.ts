import express, { Router } from 'express';
import CommentController from '../controllers/commentController';

const router: Router = express.Router();
const commentController = new CommentController();

router.get('', commentController.getAllComments.bind(commentController));
router.post('', commentController.createComment.bind(commentController));
router.put('/:id', commentController.updateComment.bind(commentController));
router.delete('/:id', commentController.deleteComment.bind(commentController));

export default router;
