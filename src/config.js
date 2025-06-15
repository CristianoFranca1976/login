const mongoose = require('mongoose');
require('dotenv').config();

// Use variável de ambiente (ex: Railway ou MongoDB Atlas)
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Database Connected Successfully");
})
.catch((err) => {
    console.error("Database cannot be Connected:", err);
});

// Schema
const Loginschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("User", Loginschema, "users");
module.exports = collection;
