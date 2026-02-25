const { Resend } = require("resend");
const axios = require("axios");

const ContactController = {
  send: async (req, res) => {
    const resend = new Resend(process.env.RESEND);

    try {
      const { name, phone, email, message, recaptchaToken } = req.body;

      // 1. Validar reCAPTCHA token
      if (!recaptchaToken) {
        return res.status(400).json({
          success: false,
          message: "Token do reCAPTCHA ausente.",
        });
      }

      const recaptchaResponse = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
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

      // 3. Enviar email via Resend
      const result = await resend.emails.send({
        from: `Lord System <onboarding@resend.dev>`,
        to: "leonardo_hernandes@outlook.com.br",
        cc: "henriquepacotee@gmail.com",
        reply_to: email,
        subject: "Orçamento do site da Lord System",
        html: `
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${phone}</p>
          <p><strong>Mensagem:</strong></p>
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
