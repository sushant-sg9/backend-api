const express = require("express");
const dotenv = require("dotenv");
const ConnectDB  = require("./Config/db");
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
app.use(cors({ origin: true, credentials: true }));
  
app.get("/", (req, res) => {
    res.send("API is Running Sucessfully");
})

app.use('/api/user',userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/media', mediaRoutes);

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));