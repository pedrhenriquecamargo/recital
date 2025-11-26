import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ======================
//  CONFIG PATH
// ======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
//  SERVIR FRONTEND
// ======================
app.use(express.static(path.join(__dirname, "public")));
app.use("/relatorio", express.static(path.join(__dirname, "relatorio")));

// ======================
//  MONGODB
// ======================
mongoose
  .connect("mongodb://127.0.0.1:27017/Recital")
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Erro ao conectar no Mongo:", err));


// ======================
//  SCHEMAS
// ======================
const InscricaoSchema = new mongoose.Schema({
  ra: String,
  digito: String,
  nome: String,
  turma: String,
  periodo: String,

  dataInscricao: { type: Date, default: Date.now },

  celular: String,
  temRede: String,
  tipoRede: String,
  arroba: String,

  expectativa: String,
  motivo: String
});

const Inscricao = mongoose.model("Inscricao", InscricaoSchema);


const FeedbackSchema = new mongoose.Schema({
  ra: String,
  nome: String,
  resposta1: String,
  resposta2: String,
  data: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);


// ======================
//  ROTAS — INSCRIÇÃO
// ======================
app.post("/inscrever", async (req, res) => {
  try {
    const nova = await Inscricao.create(req.body);
    const protocolo = `REC-${nova._id.toString().slice(-6).toUpperCase()}`;

    return res.json({
      ok: true,
      mensagem: "Inscrição salva!",
      protocolo
    });
  } catch (err) {
    console.error("Erro /inscrever:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao registrar inscrição"
    });
  }
});


// ======================
//  ROTAS — FEEDBACK
// ======================
app.post("/feedback", async (req, res) => {
  try {
    await Feedback.create(req.body);
    return res.json({ ok: true, mensagem: "Feedback salvo!" });
  } catch (err) {
    console.error("Erro /feedback:", err);
    return res.status(500).json({
      ok: false,
      erro: "Erro ao salvar feedback"
    });
  }
});


// ======================
//  ROTAS — RELATÓRIO
// ======================
app.get("/relatorio-hoje", async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    // AGORA TURMA É RETORNADA CERTINHO
    const lista = await Inscricao.find({
      dataInscricao: { $gte: hoje, $lt: amanha }
    }).select("dataInscricao nome ra digito turma periodo -_id");

    return res.json(lista);
  } catch (err) {
    console.error("Erro /relatorio-hoje:", err);
    return res.status(500).json({
      erro: "Erro ao gerar relatório"
    });
  }
});


// ======================
//  SERVIDOR
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
