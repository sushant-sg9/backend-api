const mongoose = require('mongoose');

const ConnectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        });

        console.log(`MongoDB Connected Successfully: ${connection.connection.host}`);
    }
    catch(err) {
        console.log(`Error: ${err.message}`);
        process.exit();

    }
}

module.exports = ConnectDB;