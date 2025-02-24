const express = require("express");
const dotenv = require("dotenv");
const ConnectDB = require("./Config/db");
const userRoutes = require('./routes/userRoutes')
const adminRoutes = require('./routes/adminRoutes');
const tokenRoutes = require('./routes/tokenRoutes')
const mediaRoutes = require('./routes/mediaRoutes')
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");

dotenv.config();
ConnectDB()
const app = express();
app.use(express.json())

// Configure CORS with specific options
app.use(cors({
  origin: ['https://admin.hookstep.net', 'http://localhost:3000'], // Add any other allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Enable if you're using cookies/sessions
  maxAge: 86400 // Cache preflight request results for 24 hours
}));

app.get("/", (req, res) => {
    res.send("API is Running Successfully");
})

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/media', mediaRoutes);

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));