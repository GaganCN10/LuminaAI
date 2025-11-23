const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching posts',
            error: error.message
        });
    }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, image, isAnonymous } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        const post = await Post.create({
            user: req.user._id,
            content,
            image: image || null,
            isAnonymous: isAnonymous || false
        });

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name');

        res.status(201).json({
            success: true,
            data: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating post',
            error: error.message
        });
    }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const likeIndex = post.likes.indexOf(req.user._id);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(req.user._id);
        }

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name')
            .populate('comments.user', 'name');

        res.status(200).json({
            success: true,
            data: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling like',
            error: error.message
        });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { content, isAnonymous } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.comments.push({
            user: req.user._id,
            content,
            isAnonymous: isAnonymous || false
        });

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name')
            .populate('comments.user', 'name');

        res.status(201).json({
            success: true,
            data: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        comment.deleteOne();
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('user', 'name')
            .populate('comments.user', 'name');

        res.status(200).json({
            success: true,
            data: populatedPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check if user owns the post
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting post',
            error: error.message
        });
    }
};

module.exports = {
    getPosts,
    createPost,
    toggleLike,
    addComment,
    deleteComment,
    deletePost
};