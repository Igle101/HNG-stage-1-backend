require('dotenv').config();
console.log('MONGO URI:', process.env.MONGODB_URI ? 'loaded' : 'NOT FOUND');

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error FULL:', err.stack || err.message || err);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
});

// Wait for DB connection BEFORE starting the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Profiles endpoint: http://localhost:${PORT}/api/profiles`);
  });
});

module.exports = app;