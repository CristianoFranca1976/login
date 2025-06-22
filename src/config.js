const mongoose = require("mongoose");
require("dotenv").config();

// Ver se a variável de ambiente chegou
console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const BookingSchema = new mongoose.Schema({
  user: { type: String, required: true },
  email: { type: String, required: true },
  tipoVeiculo: { type: String, required: true },
  placa: { type: String, required: true },
  servicos: [
    {
      categoria: String,
      descricao: String,
    },
  ],
  date: { type: Date, default: Date.now },
});

const collection = mongoose.model("users", Loginschema);
const Booking = mongoose.model("bookings", BookingSchema);
module.exports = {
  collection, // login
  Booking, // booking
};
