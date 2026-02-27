const axios = require("axios");
const nodemailer = require("nodemailer");

const ContactController = {
  send: async (req, res) => {
    const { name, phone, email, message, recaptchaToken } = req.body;
    let transporter;

    try {
      transporter = nodemailer.createTransport({
        host: "smtp.titan.email",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        logger: true,
        debug: true,
      });

      // 🔥 TESTA CONEXÃO SMTP AQUI
      await transporter.verify();
      console.log("✅ SMTP conectado com sucesso");
    } catch (smtpError) {
      console.error("❌ Erro na conexão SMTP:", smtpError);

      return res.status(500).json({
        success: false,
        message: "Erro na conexão com o servidor de email.",
      });
    }

    try {
      // 1. Validar reCAPTCHA token
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Token do reCAPTCHA ausente.",
        });
      }

      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`,
      );

      const { success, score, action } = recaptchaResponse.data;

      if (!success) {
        return res.status(400).json({
          success: false,
          message: "Falha na verificação do reCAPTCHA.",
        });
      }

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
        html: `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Correo electrónico:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `,
      });

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
