require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced MongoDB Connection
const mongoClient = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000
});

let db;

// Initialize Database
async function initDatabase() {
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    
    // Verify connection
    await db.command({ ping: 1 });
    console.log('✅ MongoDB connected successfully');

    // Initialize collections
    await initCollections();
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

async function initCollections() {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      await db.collection('users').createIndex({ username: 1 }, { unique: true });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('🆕 Created users collection');
    }

    if (!collectionNames.includes('searchContent')) {
      await db.createCollection('searchContent');
      await db.collection('searchContent').createIndex({ '$**': 'text' });
      console.log('🆕 Created searchContent collection');
    }

    if (!collectionNames.includes('searchHistory')) {
      await db.createCollection('searchHistory');
      console.log('🆕 Created searchHistory collection');
    }

  } catch (err) {
    if (err.codeName !== 'NamespaceExists') {
      throw err;
    }
  }
}

// Initialize the database connection
initDatabase();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Authentication Middleware
const checkAuth = (req, res, next) => {
  const user = req.headers['x-user'];
  
  if (!user || user === 'guest') {
    return res.status(401).json({ 
      success: false,
      error: "Unauthorized - Please log in" 
    });
  }
  
  req.user = user;
  next();
};

// Helper function for error responses
function errorResponse(res, status, message, error = null) {
  if (error) console.error(message, error);
  return res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && error && { details: error.message })
  });
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// User Routes
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return errorResponse(res, 400, "All fields are required");
  }

  try {
    const existingUser = await db.collection('users').findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return errorResponse(res, 400, "Username or email already exists");
    }

    const newUser = {
      username,
      email,
      password, // TODO: Hash password in production!
      createdAt: new Date(),
      settings: {
        darkMode: false,
        resultsPerPage: 10,
        safeSearch: true,
        saveHistory: true,
        defaultSearchType: 'web'
      },
      searchHistory: []
    };

    await db.collection('users').insertOne(newUser);
    
    res.json({ 
      success: true,
      user: { username, email }
    });
  } catch (err) {
    errorResponse(res, 500, "Registration failed", err);
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return errorResponse(res, 400, "Username and password are required");
  }

  try {
    const user = await db.collection('users').findOne({ username });
    
    if (!user || user.password !== password) { // TODO: Use bcrypt.compare()
      return errorResponse(res, 401, "Invalid credentials");
    }

    res.json({ 
      success: true,
      user: { 
        username: user.username, 
        email: user.email,
        settings: user.settings || {}
      }
    });
  } catch (err) {
    errorResponse(res, 500, "Login failed", err);
  }
});

// History Routes (Fixed)
app.get('/api/history', checkAuth, async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ username: req.user });
    
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    res.json({
      success: true,
      history: user.searchHistory || []
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to load history", err);
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
  const { q, type = 'web', page = 1 } = req.query;
  const user = req.headers['x-user'] || 'guest';

  if (!q) {
    return errorResponse(res, 400, "Query parameter 'q' is required");
  }

  try {
    // History tracking implementation...
    // (Keep your existing search implementation here)

  } catch (err) {
    errorResponse(res, 500, "Search failed", err);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  errorResponse(res, 500, "Internal server error");
});

// 404 handler
app.use((req, res) => {
  errorResponse(res, 404, "Endpoint not found");
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('📚 Available endpoints:');
  console.log('- POST /api/signup');
  console.log('- POST /api/login');
  console.log('- GET  /api/history');
  console.log('- GET  /api/search');
  console.log('- GET  /api/health (status check)\n');
});