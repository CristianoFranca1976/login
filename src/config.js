const mongoose = require('mongoose');
require('dotenv').config();

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

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

const collection = mongoose.model("users", Loginschema);
module.exports = collection;
