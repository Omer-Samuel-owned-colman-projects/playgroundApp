const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');

const commentController = new CommentController();

router.get('', commentController.getAllComments.bind(commentController));

router.post('', commentController.createComment.bind(commentController));

router.put('/:id', commentController.updateComment.bind(commentController));

router.delete('/:id', commentController.deleteComment.bind(commentController));

module.exports = router;
