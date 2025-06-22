const mongoose = require('mongoose');
require('dotenv').config();

// Ver se a variável de ambiente chegou
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
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

console.log(document.getElementById('costumer').innerHTML = Loginschema.get(this.name()));

const collection = mongoose.model("users", Loginschema);
module.exports = collection;


