import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, limit, startAfter
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-analytics.js";

// ✅ Config Firebase
const firebaseConfig = {
 YOUR API KEY.
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ✅ Detect page
const bodyHTML = document.querySelector("body").innerHTML;
const isIndexPage = bodyHTML.includes("Inserisci");
const isContoPage = bodyHTML.includes("Movimenti");
const isStatsPage = bodyHTML.includes("Statistiche");

// Variabili comuni
let lista = document.getElementById("lista");
let saldoSpan = document.getElementById("saldo");

// ✅ Funzioni comuni
function getOggi() {
  const oggi = new Date();
  oggi.setMinutes(oggi.getMinutes() - oggi.getTimezoneOffset());
  return oggi.toISOString().split("T")[0];
}

async function caricaSaldo() {
  let saldo = 0;
  const q = query(collection(db, "transazioni"), orderBy("data", "asc"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const t = doc.data();
    saldo += t.tipo === "entrata" ? t.importo : -t.importo;
  });
  if (saldoSpan) saldoSpan.textContent = saldo.toFixed(2) + "€";
}

// ✅ INDEX PAGE
if (isIndexPage) {
  const descrizioneInput = document.getElementById("descrizione");
  const importoInput = document.getElementById("importo");
  const tipoInput = document.getElementById("tipo");
  const dataInput = document.getElementById("data");

  window.aggiungiTransazione = async function () {
    const descrizione = descrizioneInput.value.trim();
    const importo = parseFloat(importoInput.value);
    const tipo = tipoInput.value;
    const data = dataInput.value;

    if (!descrizione || isNaN(importo) || !data) {
      alert("Compila tutti i campi!");
      return;
    }

    await addDoc(collection(db, "transazioni"), {
      descrizione,
      importo,
      tipo,
      data
    });

    resetCampi();
    caricaSaldo(); // aggiorna saldo
  };

  window.resetCampi = function () {
    descrizioneInput.value = "";
    importoInput.value = "";
    tipoInput.value = "entrata";
    dataInput.value = getOggi();
  };

  window.scaricaBackup = async function () {
    const q = query(collection(db, "transazioni"), orderBy("data", "asc"));
    const snapshot = await getDocs(q);
    const dati = snapshot.docs.map(doc => doc.data());

    const blob = new Blob([JSON.stringify(dati, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transazioni_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  document.addEventListener("DOMContentLoaded", () => {
    dataInput.value = getOggi();
    caricaSaldo();
  });
}

// ✅ CONTO PAGE (paginazione)
if (isContoPage) {
  const mostraAltroBtn = document.getElementById("mostraAltroBtn");
  let ultimoDocumento = null;
  const BATCH_SIZE = 5;

  mostraAltroBtn.addEventListener("click", caricaTransazioni);

  async function caricaTransazioni() {
    let q;
    if (ultimoDocumento) {
      q = query(collection(db, "transazioni"), orderBy("data", "asc"), startAfter(ultimoDocumento), limit(BATCH_SIZE));
    } else {
      q = query(collection(db, "transazioni"), orderBy("data", "asc"), limit(BATCH_SIZE));
    }

    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      mostraAltroBtn.disabled = true;
      mostraAltroBtn.textContent = "Nessun'altra transazione";
      return;
    }

    snapshot.forEach(doc => {
      const t = doc.data();
      const li = document.createElement("li");
      li.className = t.tipo === "entrata" ? "entrata" : "uscita";
      li.textContent = `${t.data} - ${t.descrizione}: ${t.importo.toFixed(2)}€`;
      lista.appendChild(li);
    });

    ultimoDocumento = snapshot.docs[snapshot.docs.length - 1];
  }

  async function mostraSaldo() {
    let saldo = 0;
    const q = query(collection(db, "transazioni"), orderBy("data", "asc"));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
      const t = doc.data();
      saldo += t.tipo === "entrata" ? t.importo : -t.importo;
    });
    saldoSpan.textContent = saldo.toFixed(2);
  }

  document.addEventListener("DOMContentLoaded", () => {
    mostraSaldo();
    caricaTransazioni();
  });
}

// ✅ STATS PAGE (grafici)
if (isStatsPage) {
  import("https://cdn.jsdelivr.net/npm/chart.js").then(() => {
    creaGrafici();
  });

  async function fetchTransazioni() {
    const q = query(collection(db, "transazioni"), orderBy("data", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("it-IT");
  }

  function groupByDate(transazioni) {
    return transazioni.reduce((acc, t) => {
      acc[t.data] = acc[t.data] || [];
      acc[t.data].push(t);
      return acc;
    }, {});
  }

  async function creaGrafici() {
    const transazioni = await fetchTransazioni();
    if (transazioni.length === 0) return;

    // Totale entrate/uscite
    let totaleEntrate = 0, totaleUscite = 0;
    transazioni.forEach(t => {
      if (t.tipo === "entrata") totaleEntrate += t.importo;
      else totaleUscite += t.importo;
    });

    // ✅ Grafico a torta
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: ["Entrate", "Uscite"],
        datasets: [{
          data: [totaleEntrate, totaleUscite],
          backgroundColor: ["#28a745", "#dc3545"],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

    // ✅ Grafico linea saldo
    transazioni.sort((a, b) => new Date(a.data) - new Date(b.data));
    const gruppi = groupByDate(transazioni);
    const dateOrdinate = Object.keys(gruppi).sort((a, b) => new Date(a) - new Date(b));

    let saldo = 0;
    const saldoGiorni = dateOrdinate.map(data => {
      gruppi[data].forEach(t => {
        saldo += (t.tipo === "entrata" ? t.importo : -t.importo);
      });
      return { data, saldo };
    });

    const lineCtx = document.getElementById("lineChart").getContext("2d");
    new Chart(lineCtx, {
      type: "line",
      data: {
        labels: saldoGiorni.map(d => formatDate(d.data)),
        datasets: [{
          label: "Saldo (€)",
          data: saldoGiorni.map(d => d.saldo.toFixed(2)),
          borderColor: "#0057a3",
          backgroundColor: "rgba(0, 87, 163, 0.2)",
          fill: true
        }]
      }
    });
  }
}
