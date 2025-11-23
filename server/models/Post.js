const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [2000, 'Post cannot be more than 2000 characters']
    },
    image: {
        type: String, // Base64 string or image URL
        default: null
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [CommentSchema]
}, {
    timestamps: true
});

// Virtual for like count
PostSchema.virtual('likeCount').get(function() {
    return this.likes.length;
});

// Virtual for comment count
PostSchema.virtual('commentCount').get(function() {
    return this.comments.length;
});

// Ensure virtuals are included in JSON
PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', PostSchema);