const mongoose = require('mongoose');
require('dotenv').config();

// Ver se a variável de ambiente chegou
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

mongoose.connect("mongodb+srv://cristianofranca:VUpEawp2gHH9SlbP@login.h6f4kfq.mongodb.net/?retryWrites=true&w=majority&appName=login", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ Database Connected Successfully");
})
.catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
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


