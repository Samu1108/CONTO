let transazioni = [];
let transazioniMostrate = 0;
const QUANTE = 5;

function aggiornaLista(transazioni, maxItems = 4) {
  const lista = document.getElementById('lista');
  if (!lista) return;

  lista.innerHTML = '';
  // Mostra maxItems transazioni più recenti
  const daMostrare = transazioni.slice(-maxItems).reverse();
  daMostrare.forEach(t => {
    const li = document.createElement('li');
    li.className = t.tipo === 'entrata' ? 'entrata' : 'uscita';
    li.textContent = `${t.data} - ${t.descrizione}: ${t.importo.toFixed(2)}€`;
    lista.appendChild(li);
  });
}

function aggiornaSaldo(transazioni) {
  let saldo = 0;
  transazioni.forEach(t => {
    saldo += t.tipo === 'entrata' ? t.importo : -t.importo;
  });
  const saldoSpan = document.getElementById('saldo');
  if (saldoSpan) saldoSpan.textContent = saldo.toFixed(2) + '€';
}

async function caricaTransazioni() {
  try {
    const res = await fetch('/api/transazioni');
    if (!res.ok) throw new Error('Errore caricamento transazioni');
    transazioni = await res.json();
    aggiornaSaldo(transazioni);

    if (isContoPage()) {
      transazioniMostrate = 0;
      mostraProssimeTransazioni();
    } else {
      aggiornaLista(transazioni);
    }
  } catch (e) {
    alert('Impossibile caricare le transazioni');
    console.error(e);
  }
}

async function aggiungiTransazione() {
  const descrizione = document.getElementById('descrizione').value.trim();
  const importo = parseFloat(document.getElementById('importo').value);
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;

  if (!descrizione || isNaN(importo) || !data) {
    alert('Compila tutti i campi correttamente.');
    return;
  }

  const nuova = { descrizione, importo, tipo, data };

  try {
    const res = await fetch('/api/transazioni', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuova),
    });

    if (!res.ok) throw new Error('Errore nel salvataggio');

    const dataAggiornata = await res.json();
    transazioni = dataAggiornata;

    if (isContoPage()) {
      transazioniMostrate = 0;
      mostraProssimeTransazioni();
    } else {
      aggiornaLista(transazioni);
    }
    aggiornaSaldo(transazioni);
    resetCampi();
  } catch (e) {
    alert('Errore durante il salvataggio.');
    console.error(e);
  }
}

function resetCampi() {
  const descrizione = document.getElementById('descrizione');
  const importo = document.getElementById('importo');
  const tipo = document.getElementById('tipo');
  const data = document.getElementById('data');

  if (descrizione) descrizione.value = '';
  if (importo) importo.value = '';
  if (tipo) tipo.value = 'entrata';
  if (data) data.value = getOggi();
}

function scaricaBackup() {
  const datiJSON = JSON.stringify(transazioni, null, 2);
  const blob = new Blob([datiJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transazioni_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function getOggi() {
  const oggi = new Date();
  oggi.setMinutes(oggi.getMinutes() - oggi.getTimezoneOffset());
  return oggi.toISOString().split('T')[0];
}

function mostraProssimeTransazioni() {
  const lista = document.getElementById('lista');
  const bottone = document.getElementById('mostraAltroBtn');
  if (!lista || !bottone) return;

  const fine = transazioniMostrate + QUANTE;
  const daMostrare = transazioni.slice(transazioniMostrate, fine);

  daMostrare.forEach(t => {
    const li = document.createElement('li');
    li.className = t.tipo === 'entrata' ? 'entrata' : 'uscita';
    li.textContent = `${t.data} - ${t.descrizione}: ${t.importo.toFixed(2)}€`;
    lista.appendChild(li);
  });

  transazioniMostrate += daMostrare.length;

  if (transazioniMostrate >= transazioni.length) {
    bottone.style.display = 'none';
  } else {
    bottone.style.display = 'inline-block';
  }
}

function isContoPage() {
  return window.location.pathname.endsWith('conto.html');
}

window.addEventListener('DOMContentLoaded', () => {
  // Imposta data oggi se esiste input data
  const dataInput = document.getElementById('data');
  if (dataInput) dataInput.value = getOggi();

  caricaTransazioni();

  const bottone = document.getElementById('mostraAltroBtn');
  if (bottone) {
    bottone.addEventListener('click', mostraProssimeTransazioni);
  }
});

  function gestisciDescrizione() {
    const input = document.getElementById('descrizione');
    if (input.value === 'Descrizione personalizzata') {
      input.value = '';
      input.placeholder = 'Scrivi la tua descrizione...';
    }
  }
