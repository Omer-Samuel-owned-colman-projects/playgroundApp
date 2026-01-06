const Post = require('../models/Post');

const createPost = async (content, uploaderId) => {
  if (!content || !uploaderId) {
    throw new Error('Both content and uploaderId are required');
  }

  const post = new Post({
    content,
    uploaderId
  });

  const savedPost = await post.save();
  return savedPost;
};

const getAllPosts = async () => {
  const posts = await Post.find().sort({ createdAt: -1 });
  return posts;
};

const getPostById = async (id) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new Error('Post not found');
  }
  return post;
};

const getPostsByUploaderId = async (uploaderId) => {
  const posts = await Post.find({ uploaderId }).sort({ createdAt: -1 });
  return posts;
};

const deletePost = async (id) => {
  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    throw new Error('Post not found');
  }
  return post;
};

const updatePost = async (id, content, uploaderId) => {
  if (!content || !uploaderId) {
    throw new Error('Both content and uploaderId are required');
  }

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    { content, uploaderId },
    { new: true, runValidators: true }
  );

  if (!updatedPost) {
    throw new Error('Post not found');
  }

  return updatedPost;
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUploaderId,
  deletePost,
  updatePost
};
