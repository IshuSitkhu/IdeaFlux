// const express = require('express');
// const router = express.Router();
// const blogController = require('./blog.controller');
// const verifyToken = require('../../middleware/auth.middleware');
// const Blog = require('./blog.model');

// // 🔍 Public Routes FIRST
// router.get('/all', async (req, res) => {
//   try {
//     const blogs = await Blog.find({}, '_id title content');
//     res.json({ blogs });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch blogs', err });
//   }
// });


// // Add this route before dynamic routes
// router.get('/latest', async (req, res) => {
//   try {
//     const latestBlogs = await Blog.find()
//       .sort({ createdAt: -1 })
//       .limit(5)   // Get latest 5 blogs
//       .populate("author", "name"); // populate author name if you want
//     res.status(200).json(latestBlogs);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch latest blogs", error: error.message });
//   }
// });

// router.get('/trending', blogController.getTrendingBlogs);
// router.get('/category/:category', blogController.getBlogsByCategory);

// // 🔥 FIX: move this line ABOVE `/:id`
// router.get('/recommendation-data', blogController.getAllBlogsForRecommendation);
// router.get('/recommend-content/:title', blogController.getContentRecommendations);
// router.get("/recommend-category-public", blogController.recommendByCategoryPublic);
// router.get("/recommend-collab", verifyToken, blogController.getCollaborativeRecommendations);
// router.get("/recommend-user/:userId", blogController.getUserCollaborativeRecommendations);

// router.get("/metadata", blogController.getMetadataByIds);


// router.get('/related/:blogId', blogController.getRelatedBlogs);


// // General list — must be before dynamic `/:id`
// router.get('/', blogController.getAllBlogs);

// // 🔒 User-specific & protected routes
// router.get('/user/:userId', verifyToken, blogController.getBlogsByUser);
// router.get('/user/recommendations', verifyToken, blogController.getUserRecommendations);

// // POST, PATCH, DELETE
// router.post('/', verifyToken, blogController.createBlog);
// router.patch('/:id', verifyToken, blogController.updateBlog);
// router.delete('/:id', verifyToken, blogController.deleteBlog);
// // router.patch('/:id/like', verifyToken, blogController.toggleLike);
// // router.get('/:blogId/like-status', verifyToken, blogController.getLikeStatus); // optional, for frontend to check
// router.patch('/:id/comment', verifyToken, blogController.addComment);
// router.delete('/:blogId/comment/:commentId', verifyToken, blogController.deleteComment);

// // 👇 LAST — dynamic route to avoid catching everything before
// router.get('/:id', blogController.getBlogById);


// module.exports = router;


const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
const verifyToken = require('../../middleware/auth.middleware');
const Blog = require('./blog.model');

// 🔍 Public Routes FIRST
router.get('/all', async (req, res) => {
  try {
    const blogs = await Blog.find({}, '_id title content');
    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs', err });
  }
});

// Add this route before dynamic routes
router.get('/latest', async (req, res) => {
  try {
    const latestBlogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "name");
    res.status(200).json(latestBlogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch latest blogs", error: error.message });
  }
});

router.get('/trending', blogController.getTrendingBlogs);
router.get('/category/:category', blogController.getBlogsByCategory);

router.get("/by-categories", blogController.getBlogsByCategories);

// 🔥 FIX: move this line ABOVE `/:id`
router.get('/recommendation-data', blogController.getAllBlogsForRecommendation);
router.get('/recommend-content/:title', blogController.getContentRecommendations);
router.get("/recommend-category-public", blogController.recommendByCategoryPublic);
router.get("/recommend-collab", verifyToken, blogController.getCollaborativeRecommendations);
router.get("/recommend-user/:userId", blogController.getUserCollaborativeRecommendations);
router.get("/metadata", blogController.getMetadataByIds);
router.get('/related/:blogId', blogController.getRelatedBlogs);

// ---------------- NEW ROUTE: FOLLOWING-FIRST ----------------
router.get('/following-first', verifyToken, blogController.getFollowingFirstPosts);

// General list — must be before dynamic `/:id`
router.get('/', blogController.getAllBlogs);

// 🔒 User-specific & protected routes
router.get('/user/:userId', verifyToken, blogController.getBlogsByUser);
router.get('/user/recommendations', verifyToken, blogController.getUserRecommendations);

// POST, PATCH, DELETE
router.post('/', verifyToken, blogController.createBlog);
router.patch('/:id', verifyToken, blogController.updateBlog);
router.delete('/:id', verifyToken, blogController.deleteBlog);
router.patch('/:id/comment', verifyToken, blogController.addComment);
router.delete('/:blogId/comment/:commentId', verifyToken, blogController.deleteComment);

// 👇 LAST — dynamic route to avoid catching everything before
router.get('/:id', blogController.getBlogById);

module.exports = router;
