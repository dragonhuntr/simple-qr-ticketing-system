const express = require('express');
const fs = require('fs');
const QRCode = require('qrcode');
const path = require('path')

const app = express();
const dbFile = './db.json';


if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({}));
}

function generateCode() {
  return Math.random().toString(36).substr(2, 8)
}

app.get('/scan', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scan.html'));
  });

app.get('/generate', async (req, res) => {
    const code = generateCode();
    const qrUrl = code;
    const qr = await QRCode.toDataURL(qrUrl);
    
    const db = JSON.parse(fs.readFileSync(dbFile));
    db[code] = false; // false means not claimed
    fs.writeFileSync(dbFile, JSON.stringify(db));
    
    res.json({ code, qr });
  });

app.get('/redeem/:code', (req, res) => {
    const { code } = req.params;
    const db = JSON.parse(fs.readFileSync(dbFile));
  
    if (db[code] === false) {
      db[code] = true;
      fs.writeFileSync(dbFile, JSON.stringify(db));
      res.send('<h1>Success</h1><p>Enjoy your free drink!</p>');
    } else if (db[code] === true) {
      res.send('<h1>Error</h1><p>This code has already been claimed.</p>');
    } else {
      res.send('<h1>Error</h1><p>Invalid code.</p>');
    }
  });

app.use(express.static('public'));

app.listen(3773, () => {
  console.log('Server running on http://localhost:3000');
});
