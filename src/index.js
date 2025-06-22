const express = require("express");
const path = require("path");
const { collection, Booking } = require("./config"); // ✅ Correto
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
// convert data into json format
app.use(express.json());
// Static file
app.use(express.static("public"));
app.use(express.static("image"));

app.use(express.urlencoded({ extended: false }));
//use EJS as the view engine
app.set("view engine", "ejs");

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
// POST /login
app.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login recebido:", req.body);

    const identifier = req.body.username;

    const check = await collection.findOne({
      $or: [{ name: identifier }, { email: identifier }],
    });

    if (!check) {
      console.log("⚠️ Usuário não encontrado:", req.body.username);
      return res.send("User name not found");
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      check.password
    );

    if (!isPasswordMatch) {
      console.log("❌ Senha incorreta para:", req.body.username);
      return res.send("Wrong password");
    }

    req.session.user = {
      name: check.name,
      email: check.email,
    };

    return res.render("home", { user: req.session.user });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/book", async (req, res) => {
  const { name, email, tipoVeiculo, placa, servicos } = req.body;

  try {
    const newBooking = new Booking({
      user: name,
      email,
      tipoVeiculo,
      placa,
      servicos
    });

    await newBooking.save();
    console.log("✅ Agendamento salvo:", newBooking);
    res.send("Serviço agendado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao salvar agendamento:", err);
    res.status(500).send("Erro ao salvar agendamento");
  }
});
;

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao deslogar:", err);
    }
    res.redirect("/");
  });
});

//Define Port for Application
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server listening on port: http://localhost:${port}`);
});
