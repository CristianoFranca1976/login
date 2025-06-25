require("dotenv").config(); // Adicione no início do index.js!
const express = require("express");
const path = require("path");
const { collection, Booking } = require("./config"); // ✅ Correto
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require("nodemailer");

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));
app.use(express.static("image"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(
  session({
    secret: "Palitodedete10@", // Pode ser qualquer frase secreta
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Coloque como 'true' se usar HTTPS
  })
);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// POST /signup
app.post("/signup", async (req, res) => {
  try {
    console.log("📥 Signup received:", req.body);

    const data = {
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
      console.log("⚠️ User already exists:", data.name);
      return res.send(
        "User already exists. Please choose a different username."
      );
    }

    if (!name || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    data.password = hashedPassword;

    const result = await collection.create(data);

    console.log("✅ Usuário criado:", result);

    return res.redirect("/"); // ou res.render("home");
  } catch (err) {
    console.error("❌ Erro no signup:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const identifier = req.body.username; // usuário ou e-mail
    const check = await collection.findOne({
      $or: [{ name: identifier }, { email: identifier }],
    });

    if (!check) return res.send("User name not found");

    const ok = await bcrypt.compare(req.body.password, check.password);
    if (!ok) return res.send("Wrong password");

    // 👉 grava na sessão
    req.session.user = { name: check.name, email: check.email };

    // 👉 renderiza já passando tudo que o EJS precisa
    return res.render("home", {
      user: req.session.user, // usado em <%= user.name %>
      username: req.session.user.name, // usado em <%= username %>
    });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).send(`<pre>${err.stack}</pre>`);
  }
});

app.get("/home", async (req, res) => {
  if (!req.session.user) return res.redirect("/");

  try {
    const userEmail = req.session.user.email;

    const userBookings = await Booking.find({ email: userEmail });

    const uniqueBookings = [];
    const seen = new Set();

    for (const booking of userBookings) {
      const dateKey =
        booking.date instanceof Date
          ? booking.date.toISOString()
          : new Date().toISOString();
      const key = dateKey + booking.placa;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBookings.push(booking);
      }
    }
    res.render("home", {
      user: req.session.user,
      username: req.session.user.name,
      bookings: uniqueBookings,
    });
  } catch (err) {
    console.error("❌ Error loading bookings:", err);
    res.status(500).send("Error loading your appointments.");
  }
});

app.post("/book", async (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const { tipoVeiculo, placa, servicos } = req.body;
  const name = req.session.user.name;
  const email = req.session.user.email;

  try {
    const newBooking = new Booking({
      user: name,
      email,
      tipoVeiculo,
      placa,
      servicos,
    });

    await newBooking.save();
    console.log("✅ Appointment saved:", newBooking);

    // Monta os serviços (ajuste se vier como string)
    let servicosLista = "";

    if (Array.isArray(servicos)) {
      servicosLista = servicos
        .map((s) =>
          typeof s === "string"
            ? `<li>${s}</li>`
            : `<li>${s?.categoria || ""}: ${s?.descricao || ""}</li>`
        )
        .join("");
    } else if (typeof servicos === "string") {
      servicosLista = `<li>${servicos}</li>`;
    }

    const emailBody = `
      <h2>📋 Appointment Confirmation</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Vehicle:</strong> ${tipoVeiculo}</p>
      <p><strong>Plate:</strong> ${placa}</p>
      <p><strong>Services:</strong></p>
      <ul>${servicosLista}</ul>
    `;

    // 🔧 Configura o Nodemailer para Outlook
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    res.send("Appointment made and email sent successfully!");
  } catch (err) {
    
    res.status(500).send("Error saving the appointment or sending the email.");
  }
});

//Define Port for Application
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
