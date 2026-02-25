const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado! Token não fornecido." });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token inválido! Formato incorreto." });
  }

  const jwtToken = authHeader.split(" ")[1];

  if (!jwtToken || jwtToken.length < 10 || jwtToken.length > 200) {
    return res.status(401).json({ error: "Token inválido!" });
  }

  try {
    const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
    // Se quiser salvar o userId no req para usar nos próximos handlers:
    req.userId = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado!" });
  }
};

module.exports = authMiddleware;
