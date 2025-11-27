// Mostrar campos de rede social quando escolher "sim"
const selectRede = document.getElementById("temRede");
const camposRede = document.getElementById("redeSocialCampos");

selectRede.addEventListener("change", () => {
  camposRede.classList.toggle("hidden", selectRede.value !== "sim");
});

// Elementos
const form = document.getElementById("formInscricao");
const feedbackForm = document.getElementById("feedbackForm");

const btnToFeedback = document.getElementById("btnToFeedback");
const btnBack = document.getElementById("btnBack");

const telaSucesso = document.getElementById("sucesso");
const protocoloEl = document.getElementById("protocolo");

// Armazena temporariamente os dados
let dadosInscricaoTemp = null;

// Botão que avança para o feedback
btnToFeedback.addEventListener("click", () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  dadosInscricaoTemp = {
    ra: form.ra.value,
    digito: form.digito.value,
    nome: form.nomeCompleto.value,
    turma: form.turma.value,
    periodo: form.periodo.value,

    celular: form.celular.value,

    temRede: form.temRede.value,
    tipoRede:
      form.temRede.value === "sim"
        ? document.getElementById("tipoRede").value
        : "Não tenho",
    arroba:
      form.temRede.value === "sim"
        ? document.getElementById("arroba").value
        : "",

    expectativa: form.expectativa.value,
    motivo: form.motivo.value
  };

  form.classList.add("hidden");
  feedbackForm.classList.remove("hidden");
});

// Botão Voltar
btnBack.addEventListener("click", () => {
  feedbackForm.classList.add("hidden");
  form.classList.remove("hidden");
});

// Envio final (inscrição + feedback)
feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!feedbackForm.checkValidity()) {
    feedbackForm.reportValidity();
    return;
  }

  const feedbackDados = {
    ra: dadosInscricaoTemp.ra,
    nome: dadosInscricaoTemp.nome,
    resposta1: document.getElementById("r1").value,
    resposta2: document.getElementById("r2").value
  };

  try {
    // Enviar inscrição para o backend na MESMA origem
    const insc = await fetch("/inscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosInscricaoTemp)
    });

    if (!insc.ok) throw new Error(await insc.text());

    const inscJson = await insc.json();

    // Enviar feedback
    const fb = await fetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackDados)
    });

    if (!fb.ok) throw new Error(await fb.text());

    protocoloEl.textContent = inscJson.protocolo || "—";

    feedbackForm.classList.add("hidden");
    telaSucesso.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar dados. Veja o console para detalhes.");
  }
});
