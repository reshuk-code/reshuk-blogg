const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // To handle file uploads
const path = require('path'); // Added to handle file paths

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files like images

mongoose.connect('mongodb://localhost:27017/reshukDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

const postSchema = new mongoose.Schema({
  author: String,
  title: String,
  content: String,
  coverImage: String,
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  ip: String,  // Store the IP address for admin stats
  replies: [{ reply: String, createdAt: { type: Date, default: Date.now } }]
});

const Post = mongoose.model('Post', postSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });




// Route to get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Route to submit a new post
app.post('/api/postUpdaTe', upload.single('coverImage'), async (req, res) => {
  const { author, title, content, ip } = req.body; // Ensure 'author' is included
  const coverImage = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const post = new Post({ author, title, content, coverImage, ip });
    await post.save();
    res.status(201).json({ message: 'Post saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving post' });
  }
});


// Route to like a post
app.post('/api/like/:postId', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, { $inc: { likes: 1 } }, { new: true });
    res.json({ message: 'Liked successfully', likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Route to dislike a post
app.post('/api/dislike/:postId', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, { $inc: { dislikes: 1 } }, { new: true });
    res.json({ message: 'Disliked successfully', dislikes: post.dislikes });
  } catch (err) {
    res.status(500).json({ message: 'Error disliking post' });
  }
});

// Route to reply to a post
app.post('/api/reply/:postId', async (req, res) => {
  const { reply } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(req.params.postId, { $push: { replies: { reply } } }, { new: true });
    res.json({ message: 'Replied successfully', replies: post.replies });
  } catch (err) {
    res.status(500).json({ message: 'Error replying to post' });
  }
});

// Admin Panel Route
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// API to verify admin access
app.post("/admin/login", (req, res) => {
    const { code } = req.body;

    if (code === "00002065") {
        res.status(200).json({ message: "Access granted" });
    } else {
        res.status(403).json({ error: "Unauthorized access" });
    }
});

// Admin: Get statistics of blogs (total posts, total likes, total comments by IP)
app.get("/admin/stats", async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $group: {
                    _id: "$ip", // Group by the IP address
                    totalPosts: { $sum: 1 },
                    totalLikes: { $sum: "$likes" },
                    totalComments: { $sum: { $size: "$replies" } },
                },
            },
        ]);
        res.status(200).json(stats);
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// Admin: Delete a post
app.delete("/admin/delete/:postId", async (req, res) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findByIdAndDelete(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete post" });
    }
});
app.use('/blog',(req,res)=>{
  res.sendFile(path.join(__dirname, 'public','blog.html'))
})
app.use('/create',(req,res)=>{
  res.sendFile(path.join(__dirname,'public' , 'create.html'))
})
// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});