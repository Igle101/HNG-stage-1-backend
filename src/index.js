
const express = require('express');
require('dotenv').config();

const app = express();
const connectDB =require('./config/db')

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


const PORT = process.env.PORT || 8080;

app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Returns a hello world message
 *     responses:
 *       200:
 *         description: A hello world message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);
 

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});
 

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'upstream or server failure',
  });
});
 


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Profiles endpoint: http://localhost:${PORT}/api/profiles`);
});
 
module.exports = app;
