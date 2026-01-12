const connectDB = require('./src/db');
const { startServer } = require('./server');

connectDB();
startServer();