const express = require('express');
const router = express.Router();
const {
    getPosts,
    createPost,
    toggleLike,
    addComment,
    deleteComment,
    deletePost
} = require('../controllers/postController');
const { protect } = require('../middlewares/auth');

router.use(protect);

// Post routes
router.route('/')
    .get(getPosts)
    .post(createPost);

router.route('/:id')
    .delete(deletePost);

router.route('/:id/like')
    .put(toggleLike);

router.route('/:id/comments')
    .post(addComment);

router.route('/:id/comments/:commentId')
    .delete(deleteComment);

module.exports = router;