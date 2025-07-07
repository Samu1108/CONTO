const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 2999;
const DATA_FILE = path.join(__dirname, 'transazioni.json');

// RIMOSSO il middleware auth

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/transazioni', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  res.json(JSON.parse(data));
});

app.post('/api/transazioni', (req, res) => {
  const nuova = req.body;
  if (!nuova.descrizione || typeof nuova.importo !== 'number' || !nuova.tipo || !nuova.data) {
    return res.status(400).json({ error: 'Dati transazione invalidi' });
  }

  let transazioni = [];
  if (fs.existsSync(DATA_FILE)) {
    transazioni = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  }

  transazioni.push(nuova);
  fs.writeFileSync(DATA_FILE, JSON.stringify(transazioni, null, 2), 'utf-8');
  res.json(transazioni);
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
