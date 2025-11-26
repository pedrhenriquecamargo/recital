// URL da API
const API_URL = "/relatorio-hoje";

const statusEl = document.getElementById("status");
const tableEl = document.getElementById("relatorioTable");
const tbody = document.getElementById("tableBody");
const emptyEl = document.getElementById("empty");

const btnRefresh = document.getElementById("btnRefresh");
const btnExport = document.getElementById("btnExport");
const btnPrint = document.getElementById("btnPrint");

async function fetchRelatorio() {
  statusEl.textContent = "Carregando...";
  statusEl.style.color = "";

  try {
    const resp = await fetch(API_URL, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);

    const data = await resp.json();
    renderTable(data);
  } catch (err) {
    console.error("Erro ao buscar relatório:", err);
    statusEl.textContent = "Erro ao carregar relatório. Verifique o servidor.";
    statusEl.style.color = "crimson";
    tableEl.classList.add("hidden");
    emptyEl.classList.add("hidden");
  }
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
}

function renderTable(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tableEl.classList.add("hidden");
    emptyEl.classList.remove("hidden");
    statusEl.textContent = "Nenhuma inscrição encontrada hoje.";
    return;
  }

  // ordenar por data
  items.sort((a, b) => new Date(a.dataInscricao) - new Date(b.dataInscricao));

  for (const it of items) {
    const tr = document.createElement("tr");

    // DATA
    const tdData = document.createElement("td");
    tdData.textContent = formatDate(it.dataInscricao);
    tr.appendChild(tdData);

    // NOME
    const tdNome = document.createElement("td");
    tdNome.textContent = it.nome || "-";
    tr.appendChild(tdNome);

    // RA + DÍGITO
    const raRaw = it.ra || "";
    const dig = it.digito || "";
    const tdRA = document.createElement("td");
    tdRA.textContent = raRaw ? `${raRaw}${dig ? "-" + dig : ""}` : "-";
    tr.appendChild(tdRA);

    // TURMA (NOVO)
    const tdTurma = document.createElement("td");
    tdTurma.textContent = it.turma || "-";
    tr.appendChild(tdTurma);

    // PERÍODO (manter caso use)
    const tdPeriodo = document.createElement("td");
    tdPeriodo.textContent = it.periodo || "-";
    tr.appendChild(tdPeriodo);

    tbody.appendChild(tr);
  }

  tableEl.classList.remove("hidden");
  emptyEl.classList.add("hidden");
  statusEl.textContent = `${items.length} inscrição(ões) encontradas hoje.`;
}

/* Export CSV */
function exportCSV() {
  const rows = [];
  rows.push(["Data/Hora", "Nome", "RA", "Turma", "Período"]);

  const trs = tbody.querySelectorAll("tr");
  trs.forEach(tr => {
    const cols = tr.querySelectorAll("td");
    const row = Array.from(cols).map(td => td.textContent.trim());
    rows.push(row);
  });

  if (rows.length <= 1) {
    alert("Não há dados para exportar.");
    return;
  }

  const csvContent = rows
    .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-inscricoes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Print */
function doPrint() {
  window.print();
}

/* Eventos */
btnRefresh.addEventListener("click", fetchRelatorio);
btnExport.addEventListener("click", exportCSV);
btnPrint.addEventListener("click", doPrint);

/* Inicializar */
fetchRelatorio();
