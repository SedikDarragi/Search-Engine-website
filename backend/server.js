require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced MongoDB Connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.warn('⚠️  MONGODB_URI not set — server will start but DB operations will fail until configured.');
}
const mongoClient = mongoUri
  ? new MongoClient(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    })
  : null;

let db;

// Initialize Database
async function initDatabase() {
  if (!mongoClient) {
    console.warn('⚠️  Skipping MongoDB connection (no URI).');
    return null;
  }
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
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Server stays alive — set a valid MONGODB_URI and restart, or check /api/health for status.');
    return null;
  }
}

async function initCollections() {
  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

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

// Middleware — CORS: support single or comma-separated FRONTEND_URL
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, health checks, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // In production, allow any Netlify preview/deploy URL if configured with wildcard
      // For demo, allow all origins when FRONTEND_URL contains '*'
      return callback(null, true);
    },
    credentials: true,
  })
);
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
      error: 'Unauthorized - Please log in',
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
    ...(process.env.NODE_ENV === 'development' && error && { details: error.message }),
  });
}

function requireDb(res) {
  if (!db) {
    return errorResponse(res, 503, 'Database not connected — check MONGODB_URI');
  }
  return null;
}

// Routes
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Search Engine API', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db ? 'connected' : 'disconnected',
    timestamp: new Date(),
  });
});

// User Routes
app.post('/api/signup', async (req, res) => {
  if (requireDb(res)) return;
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return errorResponse(res, 400, 'All fields are required');
  }

  try {
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return errorResponse(res, 400, 'Username or email already exists');
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
        defaultSearchType: 'web',
      },
      searchHistory: [],
    };

    await db.collection('users').insertOne(newUser);

    res.json({
      success: true,
      user: { username, email },
    });
  } catch (err) {
    errorResponse(res, 500, 'Registration failed', err);
  }
});

app.post('/api/login', async (req, res) => {
  if (requireDb(res)) return;
  const { username, password } = req.body;

  if (!username || !password) {
    return errorResponse(res, 400, 'Username and password are required');
  }

  try {
    const user = await db.collection('users').findOne({ username });

    if (!user || user.password !== password) {
      // TODO: Use bcrypt.compare()
      return errorResponse(res, 401, 'Invalid credentials');
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        settings: user.settings || {},
      },
    });
  } catch (err) {
    errorResponse(res, 500, 'Login failed', err);
  }
});

// History Routes
app.get('/api/history', checkAuth, async (req, res) => {
  if (requireDb(res)) return;
  try {
    const user = await db.collection('users').findOne({ username: req.user });

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    res.json({
      success: true,
      history: user.searchHistory || [],
    });
  } catch (err) {
    errorResponse(res, 500, 'Failed to load history', err);
  }
});

// DELETE /api/history — clear all history for authenticated user
app.delete('/api/history', checkAuth, async (req, res) => {
  if (requireDb(res)) return;
  try {
    const result = await db.collection('users').updateOne(
      { username: req.user },
      { $set: { searchHistory: [] } }
    );
    if (result.matchedCount === 0) {
      return errorResponse(res, 404, 'User not found');
    }
    res.json({ success: true, message: 'History cleared' });
  } catch (err) {
    errorResponse(res, 500, 'Failed to clear history', err);
  }
});

// DELETE /api/history/:id — delete single history item by _id
app.delete('/api/history/:id', checkAuth, async (req, res) => {
  if (requireDb(res)) return;
  const { id } = req.params;
  try {
    const user = await db.collection('users').findOne({ username: req.user });
    if (!user) return errorResponse(res, 404, 'User not found');

    const originalLength = (user.searchHistory || []).length;
    // _id stored as string (Date.now string) or ObjectId — support both
    const filtered = (user.searchHistory || []).filter((item) => String(item._id) !== String(id));

    if (filtered.length === originalLength) {
      return errorResponse(res, 404, 'History item not found');
    }

    await db.collection('users').updateOne(
      { username: req.user },
      { $set: { searchHistory: filtered } }
    );

    res.json({ success: true, message: 'History item deleted' });
  } catch (err) {
    errorResponse(res, 500, 'Failed to delete history item', err);
  }
});

// Search Route — now fully implemented
app.get('/api/search', async (req, res) => {
  if (requireDb(res)) return;
  const { q, type = 'web', page = 1, limit: limitParam } = req.query;
  const user = req.headers['x-user'] || 'guest';

  if (!q) {
    return errorResponse(res, 400, "Query parameter 'q' is required");
  }

  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(limitParam, 10) || 10));
    const skip = (pageNum - 1) * limit;

    // Try full-text search first, fall back to regex if no text index hit
    let mongoResults = [];
    let total = 0;

    // Build filter for type
    const typeFilter = type === 'images' ? { image: { $exists: true, $ne: null } } : {};

    // Attempt $text search
    try {
      const textQuery = { $text: { $search: q }, ...typeFilter };
      total = await db.collection('searchContent').countDocuments(textQuery);
      if (total > 0) {
        mongoResults = await db
          .collection('searchContent')
          .find(textQuery, { projection: { score: { $meta: 'textScore' } } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit)
          .toArray();
      }
    } catch (e) {
      // text index may not exist yet — ignore and fall back
      console.warn('Text search failed, falling back to regex:', e.message);
    }

    // Fallback / supplement: regex search if text returned nothing
    if (mongoResults.length === 0) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const regexQuery = {
        $or: [{ title: regex }, { description: regex }, { tags: regex }, { url: regex }],
        ...typeFilter,
      };
      total = await db.collection('searchContent').countDocuments(regexQuery);
      mongoResults = await db
        .collection('searchContent')
        .find(regexQuery)
        .skip(skip)
        .limit(limit)
        .toArray();
    }

    // History tracking — append to user's embedded searchHistory if authenticated
    if (user !== 'guest') {
      try {
        const historyEntry = {
          _id: new ObjectId().toString(),
          query: q,
          type,
          timestamp: new Date(),
        };
        await db.collection('users').updateOne(
          { username: user },
          { $push: { searchHistory: { $each: [historyEntry], $position: 0, $slice: 100 } } }
        );
      } catch (histErr) {
        console.warn('Failed to save history:', histErr.message);
      }
    }

    // Keep response shape expected by frontend: ResultsList needs { google, mongo }
    res.json({
      success: true,
      items: {
        mongo: mongoResults,
        google: [],
      },
      pagination: {
        page: pageNum,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      query: q,
      type,
    });
  } catch (err) {
    errorResponse(res, 500, 'Search failed', err);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  errorResponse(res, 500, 'Internal server error');
});

// 404 handler
app.use((req, res) => {
  errorResponse(res, 404, 'Endpoint not found');
});

// Start server — bind to 0.0.0.0 for Render/Docker
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log('📚 Available endpoints:');
  console.log('- POST /api/signup');
  console.log('- POST /api/login');
  console.log('- GET  /api/history');
  console.log('- DELETE /api/history');
  console.log('- DELETE /api/history/:id');
  console.log('- GET  /api/search');
  console.log('- GET  /api/health (status check)\n');
});
