// Arcade Party: Mini-Server für Handy-Pads. Start: node server.js (oder start.bat)
// Keine Zusatzpakete nötig. index.html, pad.html und flood.html müssen im selben Ordner liegen.
// Die Dateien werden bei JEDER Anfrage frisch von der Platte gelesen: kein Neustart nötig, wenn du sie änderst.
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const PORT = +process.env.PORT || 3000;

const tv = new Set();          // Fernseher (index.html) per /events
const pads = new Map();        // Handy-ID -> Set von Antworten (/pev)
const last = new Map();        // Handy-ID -> letzte Nachricht vom Fernseher (für Neuverbindung)

function lanIp() {
  const c = [];
  for (const [name, list] of Object.entries(os.networkInterfaces()))
    for (const a of list || [])
      if (a.family === 'IPv4' && !a.internal) c.push({ name, ip: a.address });
  const priv = c.filter(x => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(x.ip) && !/vpn|virtual|vmware|vbox|hyper-v|wsl|docker/i.test(x.name));
  return (priv[0] || c[0] || { ip: 'localhost' }).ip;
}

function sendFile(res, file, type) {
  fs.readFile(path.join(__dirname, file), (e, d) => {
    res.writeHead(e ? 500 : 200, { 'Content-Type': type || 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(e ? file + ' fehlt im Ordner von server.js' : d);
  });
}

function body(q, max, cb) {
  let b = '';
  q.on('data', c => { b += c; if (b.length > max) q.destroy(); });
  q.on('end', () => cb(b));
}

http.createServer((q, r) => {
  const u = q.url.split('?')[0];

  if (u === '/' || u === '/index.html') return sendFile(r, 'index.html');
  if (u === '/pad' || u === '/pad.html') return sendFile(r, 'pad.html');
  // Spiel-Module (boss.js, sumo.js, ...): jede .js-Datei im Ordner wird ausgeliefert, ohne Server-Änderung
  if (/^\/[a-z0-9_-]+\.js$/i.test(u) && fs.existsSync(path.join(__dirname, u.slice(1)))) return sendFile(r, u.slice(1), 'application/javascript; charset=utf-8');
  if (u === '/flood.html') return sendFile(r, 'flood.html');
  if (u === '/flood' && fs.existsSync(path.join(__dirname, 'The_Flood.html'))) return sendFile(r, 'The_Flood.html');

  if (u === '/info') {
    r.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return r.end(JSON.stringify({ url: 'http://' + lanIp() + ':' + PORT + '/pad' }));
  }

  // Fernseher: bekommt alle Eingaben der Handys
  if (u === '/events') {
    q.socket.setTimeout(0);
    r.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    r.write(':ok\n\n');
    tv.add(r);
    q.on('close', () => tv.delete(r));
    return;
  }

  // Handy: bekommt Nachrichten vom Fernseher
  if (u === '/pev') {
    const id = (new URL(q.url, 'http://x').searchParams.get('id') || '').slice(0, 20);
    if (!id) { r.writeHead(400); return r.end(); }
    q.socket.setTimeout(0);
    r.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    r.write(':ok\n\n');
    if (last.has(id)) r.write('data: ' + last.get(id) + '\n\n');
    if (!pads.has(id)) pads.set(id, new Set());
    pads.get(id).add(r);
    q.on('close', () => { const s = pads.get(id); if (s) { s.delete(r); if (!s.size) pads.delete(id); } });
    return;
  }

  // Handy -> Fernseher
  if (u === '/in' && q.method === 'POST') {
    return body(q, 2000, b => {
      let m = null;
      try { m = JSON.parse(b); } catch (_) {}
      if (m && typeof m.id === 'string' && m.id.length < 20) {
        const msg = 'data: ' + JSON.stringify({ id: m.id, name: String(m.name || '').slice(0, 10), b: m.b | 0 }) + '\n\n';
        for (const c of tv) c.write(msg);
      }
      r.writeHead(204, { 'Cache-Control': 'no-store' });
      r.end();
    });
  }

  // Fernseher -> ein bestimmtes Handy
  if (u === '/to' && q.method === 'POST') {
    return body(q, 8000, b => {
      try {
        const m = JSON.parse(b);
        if (m && typeof m.id === 'string' && m.id.length < 20 && m.msg) {
          const data = JSON.stringify(m.msg);
          last.set(m.id, data);
          if (last.size > 200) last.delete(last.keys().next().value);
          for (const c of pads.get(m.id) || []) c.write('data: ' + data + '\n\n');
        }
      } catch (_) {}
      r.writeHead(204);
      r.end();
    });
  }

  r.writeHead(404);
  r.end();
}).listen(PORT, '0.0.0.0', () => {
  console.log('Arcade Party läuft.');
  console.log('  Am Rechner (Fernseher) öffnen: http://localhost:' + PORT);
  console.log('  Handys (selbes WLAN):          http://' + lanIp() + ':' + PORT + '/pad  (oder QR-Code in der Lobby)');
});

// Verbindungen offen halten, auch bei schlechtem WLAN
setInterval(() => {
  for (const c of tv) c.write(':\n\n');
  for (const s of pads.values()) for (const c of s) c.write(':\n\n');
}, 15000);
