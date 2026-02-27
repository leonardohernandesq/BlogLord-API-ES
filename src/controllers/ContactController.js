const axios = require("axios");
const nodemailer = require("nodemailer");

const ContactController = {
  send: async (req, res) => {
    const { name, phone, email, message, recaptchaToken } = req.body;
    console.log("---------------------");
    console.log(name, phone, email, message, recaptchaToken);
    console.log("---------------------");

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log("---------------------");
      console.log("transporter", transporter);
      console.log("---------------------");

      // 1. Validar reCAPTCHA token
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Token do reCAPTCHA ausente.",
        });
      }

      console.log("---------------------");
      console.log("recaptchaToken", recaptchaToken);
      console.log("---------------------");

      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`,
      );

      const { success } = recaptchaResponse.data;

      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Falha na verificação do reCAPTCHA.",
        });
      }

      console.log("---------------------");
      console.log("success", success);
      console.log("---------------------");

      // 2. Validação dos campos
      if (!phone) {
        return res
          .status(400)
          .json({ success: false, message: "Insira um telefone" });
      }

      if (!email || !email.includes("@")) {
        return res
          .status(400)
          .json({ success: false, message: "Insira um email válido" });
      }

      if (!message) {
        return res
          .status(400)
          .json({ success: false, message: "Mensagem é obrigatória" });
      }

      const result = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Sitio de presupuesto del Lord System",
        text: `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Correo electrónico:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `,
      });

      console.log("---------------------");
      console.log("success", result);
      console.log("---------------------");

      return res.status(200).json({ success: true, result });
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      return res
        .status(500)
        .json({ success: false, message: "Erro ao enviar e-mail." });
    }
  },
};

module.exports = ContactController;
