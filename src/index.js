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
    console.log("📥 Signup recebido:", req.body);

    const data = {
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    const existingUser = await collection.findOne({ name: data.name });
    if (existingUser) {
      console.log("⚠️ Usuário já existe:", data.name);
      return res.send(
        "User already exists. Please choose a different username."
      );
    }

    if (!name || !email || !password) {
      return res.status(400).send("Todos os campos são obrigatórios.");
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

// app.get("/home", (req, res) => {
//   // Garantir que a pessoa está logada
//   if (!req.session.user) return res.redirect("/");

//   res.render("home", {
//     user: req.session.user,
//     username: req.session.user.name,
//   });
// });

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
    console.error("❌ Erro ao carregar bookings:", err);
    res.status(500).send("Erro ao carregar seus agendamentos.");
  }
});

// app.post("/book", async (req, res) => {
//   const { name, email, tipoVeiculo, placa, servicos } = req.body;

//   try {
//     const newBooking = new Booking({
//       user: name,
//       email,
//       tipoVeiculo,
//       placa,
//       servicos,
//     });
//     await newBooking.save();
//     console.log("✅ Agendamento salvo:", newBooking);
//     res.send("Serviço agendado com sucesso!");
//   } catch (err) {
//     console.error("❌ Erro ao salvar agendamento:", err);
//     res.status(500).send("Erro ao salvar agendamento");
//   }
// });
// app.get("/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Erro ao deslogar:", err);
//     }
//     res.redirect("/");
//   });
// });


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
    console.log("✅ Agendamento salvo:", newBooking);

    // Monta os serviços (ajuste se vier como string)
    let servicosLista = "";
    if (Array.isArray(servicos)) {
      servicosLista = servicos
        .map((s) => {
          if (typeof s === "string") return `<li>${s}</li>`;
          return `<li><strong>${s.categoria}</strong>: ${s.descricao}</li>`;
        })
        .join("");
    }

    const emailBody = `
      <h2>📋 Confirmação de Agendamento</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Veículo:</strong> ${tipoVeiculo}</p>
      <p><strong>Placa:</strong> ${placa}</p>
      <p><strong>Serviços:</strong></p>
      <ul>${servicosLista}</ul>
    `;

    // 🔧 Configura o Nodemailer para Outlook
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // StartTLS
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: [process.env.EMAIL_OWNER, email],
      subject: "Novo agendamento confirmado",
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 E-mail enviado para:", email, "+ você mesmo");

    res.send("Agendamento feito e e-mail enviado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    res.status(500).send("Erro ao salvar agendamento ou enviar e-mail.");
  }
});

//Define Port for Application
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
