import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Image, X, User, Trash2, Bookmark, Share2, MoreHorizontal, Eye } from 'lucide-react';
import '../assets/componentsCss/MentalHealthCommunity.css';

const EnhancedMentalHealthCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    image: null,
    isAnonymous: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentAnonymous, setCommentAnonymous] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [viewCounts, setViewCounts] = useState({});

  const API_BASE_URL = 'http://localhost:5000/api';
  const getToken = () => localStorage.getItem('token');

  const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/posts`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setImagePreview(base64);
        setNewPost(prev => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(newPost)
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => [data.data, ...prev]);
        setNewPost({ content: '', image: null, isAnonymous: false });
        setImagePreview(null);
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? data.data : p));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = (postId) => {
    setBookmarked(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (postId) => {
    if (navigator.share) {
      navigator.share({
        title: 'Safe Haven Post',
        text: 'Check out this story from Safe Haven',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!viewCounts[postId]) {
      setViewCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentText[postId];
    if (!content || !content.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          content,
          isAnonymous: commentAnonymous[postId] || false
        })
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? data.data : p));
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        setCommentAnonymous(prev => ({ ...prev, [postId]: false }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.map(p => p._id === postId ? data.data : p));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      const data = await response.json();
      if (data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="mh-community-container">
      <div className="mh-community-wrapper">
        {/* Enhanced Header with Stats */}
        <div className="mh-community-header">
          <div className="mh-header-content">
            <h1 className="mh-community-title">Safe Haven 💜</h1>
            <p className="mh-community-subtitle">A peaceful space where your story matters</p>
          </div>
          <div className="mh-community-stats">
            <div className="mh-stat-item">
              <span className="mh-stat-number">{posts.length}</span>
              <span className="mh-stat-label">Stories</span>
            </div>
            <div className="mh-stat-item">
              <span className="mh-stat-number">{posts.reduce((acc, p) => acc + (p.likeCount || 0), 0)}</span>
              <span className="mh-stat-label">Support</span>
            </div>
          </div>
        </div>

        {/* Enhanced Create Post Button */}
        <button onClick={() => setShowCreatePost(true)} className="mh-create-post-btn">
          <User size={20} className="mh-btn-icon" />
          <span>What's on your mind? Share your journey...</span>
        </button>

        {/* Enhanced Modal */}
        {showCreatePost && (
          <div className="mh-modal-overlay">
            <div className="mh-modal-content">
              <div className="mh-modal-header">
                <h2 className="mh-modal-title">✨ Share Your Story</h2>
                <button
                  onClick={() => {
                    setShowCreatePost(false);
                    setImagePreview(null);
                  }}
                  className="mh-modal-close-btn"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mh-form-group">
                <div className="mh-checkbox-group">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newPost.isAnonymous}
                    onChange={(e) => setNewPost(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="mh-checkbox-input"
                  />
                  <label htmlFor="anonymous" className="mh-checkbox-label">
                    🔒 Post anonymously
                  </label>
                </div>

                <textarea
                  placeholder="Share your thoughts, feelings, or experiences... Remember, you're not alone. 💙"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  className="mh-textarea-input"
                />

                {imagePreview && (
                  <div className="mh-image-preview-container">
                    <img src={imagePreview} alt="Preview" className="mh-image-preview" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setNewPost(prev => ({ ...prev, image: null }));
                      }}
                      className="mh-image-remove-btn"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}

                <div className="mh-form-actions">
                  <label className="mh-image-upload-label">
                    <Image size={20} />
                    <span>Add image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mh-image-upload-input"
                    />
                  </label>

                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim()}
                    className="mh-submit-btn"
                  >
                    <Send size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Posts Feed */}
        <div className="mh-posts-container">
          {loading ? (
            <div className="mh-loading-state">
              <div className="mh-loading-spinner"></div>
              <div className="mh-loading-text">Loading stories...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="mh-empty-state">
              <div className="mh-empty-icon">💭</div>
              <p className="mh-empty-title">No stories shared yet.</p>
              <p className="mh-empty-subtitle">Be the first to share your journey and inspire others.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="mh-post-card">
                <div className="mh-post-header">
                  <div className="mh-post-user-section">
                    <div className="mh-post-avatar">
                      <User size={22} />
                    </div>
                    <div className="mh-post-user-info">
                      <p className="mh-post-username">
                        {post.isAnonymous ? 'Anonymous Friend 🌸' : post.user?.name || 'Anonymous'}
                      </p>
                      <p className="mh-post-date">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mh-post-actions-top">
                    {post.user?._id === localStorage.getItem('userId') && (
                      <button onClick={() => handleDeletePost(post._id)} className="mh-icon-btn" title="Delete post">
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button className="mh-icon-btn" title="More options">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>

                <div className="mh-post-content">
                  <p>{post.content}</p>
                </div>

                {post.image && (
                  <div className="mh-post-image-wrapper">
                    <img src={post.image} alt="Post" className="mh-post-image" />
                  </div>
                )}

                {/* Enhanced Engagement Bar */}
                <div className="mh-post-engagement-bar">
                  <div className="mh-engagement-stats">
                    <span className="mh-stat-item">
                      <Heart size={14} className="mh-stat-icon liked" />
                      {post.likeCount || post.likes?.length || 0}
                    </span>
                    <span className="mh-stat-item">
                      {post.commentCount || post.comments?.length || 0} comments
                    </span>
                  </div>
                </div>

                <div className="mh-post-actions">
                  <button 
                    onClick={() => handleLike(post._id)} 
                    className={`mh-action-btn ${post.likes?.includes(localStorage.getItem('userId')) ? 'active' : ''}`}
                  >
                    <Heart 
                      size={20} 
                      className={post.likes?.includes(localStorage.getItem('userId')) ? 'mh-icon-liked' : ''} 
                    />
                    <span>Support</span>
                  </button>
                  <button onClick={() => toggleComments(post._id)} className="mh-action-btn">
                    <MessageCircle size={20} />
                    <span>Comment</span>
                  </button>
                  <button onClick={() => toggleBookmark(post._id)} className={`mh-action-btn ${bookmarked[post._id] ? 'active' : ''}`}>
                    <Bookmark size={20} className={bookmarked[post._id] ? 'mh-icon-bookmarked' : ''} />
                    <span>Save</span>
                  </button>
                  <button onClick={() => handleShare(post._id)} className="mh-action-btn">
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                </div>

                {/* Enhanced Comments Section */}
                {showComments[post._id] && (
                  <div className="mh-comments-section">
                    <div className="mh-add-comment">
                      <div className="mh-comment-anon-group">
                        <input
                          type="checkbox"
                          id={`anon-${post._id}`}
                          checked={commentAnonymous[post._id] || false}
                          onChange={(e) => setCommentAnonymous(prev => ({ ...prev, [post._id]: e.target.checked }))}
                          className="mh-comment-checkbox"
                        />
                        <label htmlFor={`anon-${post._id}`} className="mh-comment-anon-label">
                          Anonymous
                        </label>
                      </div>
                      <div className="mh-comment-input-wrapper">
                        <input
                          type="text"
                          placeholder="Share a supportive comment... 💬"
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                          className="mh-comment-input"
                        />
                        <button onClick={() => handleAddComment(post._id)} className="mh-comment-send-btn">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mh-comments-list">
                      {post.comments?.map((comment) => (
                        <div key={comment._id} className="mh-comment-card">
                          <div className="mh-comment-avatar">
                            <User size={16} />
                          </div>
                          <div className="mh-comment-content">
                            <div className="mh-comment-header">
                              <span className="mh-comment-username">
                                {comment.isAnonymous ? 'Anonymous' : comment.user?.name || 'Anonymous'}
                              </span>
                              <span className="mh-comment-date">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mh-comment-text">{comment.content}</p>
                          </div>
                          {comment.user?._id === localStorage.getItem('userId') && (
                            <button 
                              onClick={() => handleDeleteComment(post._id, comment._id)} 
                              className="mh-comment-delete-btn"
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Enhanced Info Banner */}
        <div className="mh-info-banner">
          <div className="mh-info-content">
            <span className="mh-info-icon">🛡️</span>
            <p className="mh-info-text">
              This is a safe, judgment-free space. All posts are visible to authenticated users. 
              Please be kind, supportive, and respectful. Together, we heal. 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMentalHealthCommunity;
