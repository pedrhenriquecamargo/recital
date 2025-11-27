console.log("MONGO_URI carregado ->", process.env.MONGO_URI);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// =========================
//   AJUSTE PARA ES MODULES
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
//   SERVIR PASTA /public
// =========================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =========================
//   CONEXÃO COM MONGO
// =========================
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("MongoDB conectado!"))
.catch(err => {
  console.error("MONGO_URI:", process.env.MONGO_URI);
  console.error("Erro ao conectar no Mongo:", err);
});

// =========================
//   MODELS
// =========================

// coleção: inscricaos
const InscricaoSchema = new mongoose.Schema({
  ra: String,
  digito: String,
  nome: String,
  turma: String,
  periodo: String,
  celular: String,
  temRede: String,
  tipoRede: String,
  arroba: String,
  expectativa: String,
  motivo: String,
  dataInscricao: { type: Date, default: Date.now },
});

const Inscricao = mongoose.model("inscricaos", InscricaoSchema);

// coleção: feedback
const FeedbackSchema = new mongoose.Schema({
  ra: String,
  nome: String,
  resposta1: String,
  resposta2: String,
  data: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("feedback", FeedbackSchema);

// =========================
//   ROTAS
// =========================

// CRIAR INSCRIÇÃO
app.post("/inscrever", async (req, res) => {
  try {
    const salvar = await Inscricao.create(req.body);
    res.status(201).json({
      mensagem: "Inscrição criada!",
      protocolo: salvar._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar inscrição" });
  }
});

// CRIAR FEEDBACK
app.post("/feedback", async (req, res) => {
  try {
    await Feedback.create(req.body);
    res.status(201).json({ mensagem: "Feedback salvo!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao registrar feedback" });
  }
});

// =========================
//   INICIAR SERVIDOR
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
