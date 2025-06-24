require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendTest() {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_OWNER,
      subject: "✅ Teste de envio",
      text: "Este é um e-mail de teste enviado com Nodemailer + Outlook",
    });

    console.log("📨 E-mail enviado:", info.messageId);
  } catch (err) {
    console.error("❌ Erro ao enviar:", err);
  }
}

sendTest();
