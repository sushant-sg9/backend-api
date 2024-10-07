const express = require("express");
const dotenv = require("dotenv");
const ConnectDB  = require("./config/db");
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors");

dotenv.config();
ConnectDB()
const app = express();
app.use(express.json())
app.use(cors());


app.get("/", (req, res) => {
    res.send("API is Running Sucessfully");
})

app.use('/api/user',userRoutes);

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));