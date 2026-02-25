const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database");
const Routes = require("./routes");

dotenv.config();
connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api", Routes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${process.env.PORT}`);
});
