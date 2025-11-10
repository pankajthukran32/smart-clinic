// Load modules 
const express = require('express');
const colors = require('colors');
require('dotenv').config({ path: './config/config.env' });
const bookRoutes = require('./api/routes/book.route');
const dbConnect = require('./config/db');


// Load Envs 
const PORT = process.env.PORT | 5000;
const ENV = process.env.NODE_ENV;
const MONGO_URI = process.env.MONGO_URI;

// Start Server
const app = express();
app.use(express.json());
app.use('/api/v1/books', bookRoutes);
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT} in ${ENV} mode`.bgGreen);
})

// Test route
app.get('/', (req, res) => {
    res.send('API is running...');
  });


// Connect mongo databse
dbConnect(process.env.MONGO_URI);





