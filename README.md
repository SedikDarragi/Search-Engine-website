# Search Engine

A full-stack search engine application with React frontend and Node.js/Express backend.
for a website demo click [Portfolio Website](https://local-search-engine.netlify.app)
currently the backend is not fully function on the website, so it's a work in progress.

## Features

- Full-text search functionality
- Image search capabilities
- User authentication
- Search history
- Responsive design

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend-react
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory with your MongoDB URI and other configurations.

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # In a new terminal, start frontend (from frontend-react directory)
   npm start
   ```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
JWT_SECRET=your_jwt_secret
```

## License

MIT
