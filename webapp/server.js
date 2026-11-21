const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createInitialState } = require('./data/seed');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const REUNION_DIR = path.resolve(__dirname, '..', 'reunions', '2026-11_cadrage');
const JURIDIQUE_DIR = path.resolve(__dirname, '..', 'juridique');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let state = loadState();
const sseClients = new Set();

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.boatStatus) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erreur lecture state.json, réinitialisation depuis seed:', err.message);
  }
  const initial = createInitialState();
  saveState(initial);
  return initial;
}

function saveState(nextState) {
  const tmpFile = `${STATE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(nextState, null, 2), 'utf8');
  fs.renameSync(tmpFile, STATE_FILE);
}

function broadcastState() {
  const payload = `event: state\ndata: ${JSON.stringify(state)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function commitState() {
  saveState(state);
  broadcastState();
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 2 * 1024 * 1024) {
        reject(new Error('Requête trop volumineuse'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new Error('JSON invalide'));
      }
    });
    req.on('error', reject);
  });
}

function cleanStr(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Fichier introuvable');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
}

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/state') {
    return sendJson(res, 200, state);
  }

  if (req.method === 'GET' && pathname === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write(`event: state\ndata: ${JSON.stringify(state)}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Méthode non autorisée' });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }

  const nowIso = new Date().toISOString();

  if (pathname === '/api/status') {
    const allowedStates = ['mooring', 'water', 'chantier'];
    const nextState = allowedStates.includes(body.state) ? body.state : state.boatStatus.state;
    const crew = Array.isArray(body.crew)
      ? body.crew.filter((id) => state.members.some((m) => m.id === id))
      : state.boatStatus.crew;

    let nextLocation = state.boatStatus.location;
    if (body.spotId) {
      const spot = state.loireSpots.find((s) => s.id === body.spotId);
      if (spot) {
        nextLocation = {
          spotId: spot.id,
          name: spot.name,
          kmIndex: spot.kmIndex,
          lat: spot.lat,
          lng: spot.lng,
          isGps: false,
          updatedAt: nowIso
        };
      }
    } else if (typeof body.lat === 'number' && typeof body.lng === 'number') {
      nextLocation = {
        spotId: 'gps',
        name: cleanStr(body.locationName, 120) || `Position GPS (${body.lat.toFixed(4)}, ${body.lng.toFixed(4)})`,
        kmIndex: typeof body.kmIndex === 'number' ? body.kmIndex : 2,
        lat: body.lat,
        lng: body.lng,
        isGps: true,
        updatedAt: nowIso
      };
    } else if (nextState === 'mooring' && body.resetToPelio !== false) {
      const pelio = state.loireSpots.find((s) => s.id === 'pelio');
      if (pelio) {
        nextLocation = {
          spotId: pelio.id,
          name: pelio.name,
          kmIndex: pelio.kmIndex,
          lat: pelio.lat,
          lng: pelio.lng,
          isGps: false,
          updatedAt: nowIso
        };
      }
    }

    const prevState = state.boatStatus.state;
    const prevCrew = Array.isArray(state.boatStatus.crew) ? state.boatStatus.crew : [];
    const lastWaterCrew = (prevState === 'water' && nextState === 'mooring' && prevCrew.length > 0)
      ? prevCrew
      : (Array.isArray(state.boatStatus.lastWaterCrew) ? state.boatStatus.lastWaterCrew : []);

    state.boatStatus = {
      state: nextState,
      crew: nextState === 'mooring' ? [] : crew,
      lastWaterCrew,
      outingType: body.outingType === 'private' ? 'private' : 'open',
      maxSeats: Math.max(1, Math.min(8, Number(body.maxSeats) || 4)),
      returnTime: nextState === 'mooring' ? '' : cleanStr(body.returnTime, 40),
      note: cleanStr(body.note, 300) || (nextState === 'mooring' ? 'Amarré au Port du Pélio (Rochecorbon).' : ''),
      location: nextLocation,
      updatedBy: cleanStr(body.memberId, 40) || state.boatStatus.updatedBy,
      updatedAt: nowIso
    };
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/ecopage') {
    if (body.action === 'next_person') {
      const len = state.ecopage.rotationOrder.length;
      state.ecopage.currentIndex = (state.ecopage.currentIndex + 1) % len;
    } else {
      state.ecopage.lastCheckedBy = cleanStr(body.memberId, 40) || state.ecopage.rotationOrder[state.ecopage.currentIndex];
      state.ecopage.lastCheckedAt = nowIso;
      if (body.stateNote) {
        state.ecopage.stateNote = cleanStr(body.stateNote, 240);
      }
      if (body.advanceRotation) {
        const len = state.ecopage.rotationOrder.length;
        state.ecopage.currentIndex = (state.ecopage.currentIndex + 1) % len;
      }
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/bookings') {
    const title = cleanStr(body.title, 120);
    const date = cleanStr(body.date, 20);
    if (!title || !date) {
      return sendJson(res, 400, { error: 'Le titre et la date sont obligatoires.' });
    }
    const allowedTypes = ['open', 'private', 'chantier'];
    const type = allowedTypes.includes(body.type) ? body.type : 'open';
    const authorId = cleanStr(body.authorId, 40) || 'anthony';
    const initialParticipants = Array.isArray(body.participants) && body.participants.length > 0
      ? body.participants
      : [authorId];

    const booking = {
      id: makeId('bk'),
      title,
      date,
      endDate: cleanStr(body.endDate, 20) || date,
      startTime: cleanStr(body.startTime, 10) || '10:00',
      endTime: cleanStr(body.endTime, 10) || '13:00',
      type,
      authorId,
      participants: Array.from(new Set(initialParticipants)),
      maxSeats: Math.max(1, Math.min(11, Number(body.maxSeats) || (type === 'chantier' ? 8 : 4))),
      isLastMinute: Boolean(body.isLastMinute),
      note: cleanStr(body.note, 300),
      createdAt: nowIso
    };
    state.bookings.push(booking);
    state.bookings.sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/bookings/toggle-join') {
    const booking = state.bookings.find((b) => b.id === body.bookingId);
    const memberId = cleanStr(body.memberId, 40);
    if (!booking || !memberId) {
      return sendJson(res, 404, { error: 'Créneau ou membre introuvable.' });
    }
    const idx = booking.participants.indexOf(memberId);
    if (idx >= 0) {
      booking.participants.splice(idx, 1);
    } else {
      if (booking.type === 'private') {
        return sendJson(res, 400, { error: 'Cette sortie est marquée privée / famille.' });
      }
      if (booking.participants.length >= booking.maxSeats) {
        return sendJson(res, 400, { error: 'Toutes les places sont déjà prises sur ce créneau.' });
      }
      booking.participants.push(memberId);
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/bookings/delete') {
    const before = state.bookings.length;
    state.bookings = state.bookings.filter((b) => b.id !== body.bookingId);
    if (state.bookings.length === before) {
      return sendJson(res, 404, { error: 'Créneau introuvable.' });
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/fuel') {
    if (body.action === 'config') {
      if (body.mode === 'scale' || body.mode === 'mark') {
        state.fuel.mode = body.mode;
      }
      if (typeof body.pricePerLiter === 'number' && body.pricePerLiter > 0) {
        state.fuel.pricePerLiter = Number(body.pricePerLiter.toFixed(2));
      }
      commitState();
      return sendJson(res, 200, state);
    }

    if (body.action === 'refill') {
      const addedLiters = Math.max(0.1, Number(body.liters) || 0);
      const addedKg = addedLiters * state.fuel.densityKgPerL;
      const newWeight = Math.min(state.fuel.fullTankKg + 1, Number((state.fuel.currentWeightKg + addedKg).toFixed(2)));
      state.fuel.currentWeightKg = newWeight;
      state.fuel.logs.unshift({
        id: makeId('fuel'),
        kind: 'refill',
        date: nowIso.slice(0, 10),
        memberId: cleanStr(body.memberId, 40) || 'anthony',
        crewNames: cleanStr(body.crewNames, 100) || 'Plein / Complément nourrice',
        startKg: Number((newWeight - addedKg).toFixed(2)),
        endKg: newWeight,
        litersUsed: Number((-addedLiters).toFixed(2)),
        costEur: Number((addedLiters * state.fuel.pricePerLiter).toFixed(2)),
        note: cleanStr(body.note, 240) || `Ajout de ${addedLiters.toFixed(1)} L à la nourrice.`
      });
      commitState();
      return sendJson(res, 200, state);
    }

    const startKg = Number(body.startKg);
    const endKg = Number(body.endKg);
    if (!Number.isFinite(startKg) || !Number.isFinite(endKg) || startKg < endKg) {
      return sendJson(res, 400, { error: 'Le poids au départ doit être supérieur ou égal au poids au retour.' });
    }
    const kgUsed = Math.max(0, startKg - endKg);
    const litersUsed = Number((kgUsed / state.fuel.densityKgPerL).toFixed(2));
    const costEur = Number((litersUsed * state.fuel.pricePerLiter).toFixed(2));
    const authorMemberId = cleanStr(body.memberId, 40) || 'anthony';
    const rawParticipants = Array.isArray(body.participants)
      ? body.participants.filter((id) => state.members.some((m) => m.id === id))
      : [];
    const participants = rawParticipants.length > 0 ? Array.from(new Set(rawParticipants)) : [authorMemberId];
    const crewNames = participants.map((id) => state.members.find((m) => m.id === id)?.name || id).join(', ');

    state.fuel.currentWeightKg = Number(endKg.toFixed(2));
    state.fuel.logs.unshift({
      id: makeId('fuel'),
      kind: 'outing',
      date: cleanStr(body.date, 20) || nowIso.slice(0, 10),
      memberId: authorMemberId,
      participants,
      bookingId: cleanStr(body.bookingId, 60),
      crewNames: cleanStr(body.crewNames, 120) || crewNames,
      startKg: Number(startKg.toFixed(2)),
      endKg: Number(endKg.toFixed(2)),
      litersUsed,
      costEur,
      note: cleanStr(body.note, 240) || 'Pesée de sortie enregistrée'
    });
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/equity-config') {
    if (typeof body.enabled === 'boolean') {
      state.equityConfig.enabled = body.enabled;
    }
    if (body.weights && typeof body.weights === 'object') {
      const w = state.equityConfig.weights;
      if (typeof body.weights.weekdayPerHour === 'number') w.weekdayPerHour = body.weights.weekdayPerHour;
      if (typeof body.weights.weekendPerHour === 'number') w.weekendPerHour = body.weights.weekendPerHour;
      if (typeof body.weights.lastMinuteFree === 'boolean') w.lastMinuteFree = body.weights.lastMinuteFree;
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/charter') {
    const memberId = cleanStr(body.memberId, 40) || 'anthony';
    const title = cleanStr(body.title, 140);
    const content = cleanStr(body.content, 2500);
    if (!title || !content) {
      return sendJson(res, 400, { error: 'Le titre et le texte sont obligatoires.' });
    }
    const existing = state.charterSections.find((s) => s.id === body.id);
    if (existing) {
      existing.title = title;
      existing.content = content;
      existing.updatedBy = memberId;
      existing.updatedAt = nowIso;
      existing.history = existing.history || [];
      existing.history.unshift({
        authorId: memberId,
        date: nowIso,
        note: cleanStr(body.editNote, 140) || 'Mise à jour du texte'
      });
      existing.history = existing.history.slice(0, 8);
    } else {
      state.charterSections.push({
        id: makeId('ch'),
        title,
        content,
        updatedBy: memberId,
        updatedAt: nowIso,
        history: [{ authorId: memberId, date: nowIso, note: 'Création de l\'article' }]
      });
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/ideas') {
    const title = cleanStr(body.title, 140);
    const description = cleanStr(body.description, 800);
    const authorId = cleanStr(body.authorId, 40) || 'jeanne';
    if (!title) {
      return sendJson(res, 400, { error: 'Merci d\'indiquer un titre pour votre idée.' });
    }
    state.ideas.unshift({
      id: makeId('idea'),
      title,
      description,
      authorId,
      status: 'discussion',
      votes: [authorId],
      createdAt: nowIso
    });
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/ideas/vote') {
    const idea = state.ideas.find((i) => i.id === body.ideaId);
    const memberId = cleanStr(body.memberId, 40);
    if (!idea || !memberId) {
      return sendJson(res, 404, { error: 'Idée introuvable.' });
    }
    if (body.status && ['discussion', 'test', 'acte'].includes(body.status)) {
      idea.status = body.status;
    } else {
      const idx = idea.votes.indexOf(memberId);
      if (idx >= 0) idea.votes.splice(idx, 1);
      else idea.votes.push(memberId);
    }
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/logbook') {
    const title = cleanStr(body.title, 140);
    const story = cleanStr(body.story, 2000);
    if (!title || !story) {
      return sendJson(res, 400, { error: 'Le titre et le récit sont obligatoires.' });
    }
    const authorId = cleanStr(body.authorId, 40) || 'anthony';
    const crew = Array.isArray(body.crew)
      ? body.crew.filter((id) => state.members.some((m) => m.id === id))
      : [authorId];
    if (!Array.isArray(state.logbookEntries)) state.logbookEntries = [];
    state.logbookEntries.unshift({
      id: makeId('log'),
      date: cleanStr(body.date, 20) || nowIso.slice(0, 10),
      title,
      authorId,
      crew: crew.length > 0 ? Array.from(new Set(crew)) : [authorId],
      weather: cleanStr(body.weather, 120),
      story,
      boatNotes: cleanStr(body.boatNotes, 600),
      imageData: typeof body.imageData === 'string' && body.imageData.startsWith('data:image/') ? body.imageData.slice(0, 450000) : '',
      createdAt: nowIso
    });
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/collab-docs') {
    if (!Array.isArray(state.collabDocs)) state.collabDocs = [];
    const memberId = cleanStr(body.memberId, 40) || 'anthony';
    const action = body.action || 'save_doc';

    if (action === 'save_doc') {
      const title = cleanStr(body.title, 160);
      const content = cleanStr(body.content, 4000);
      if (!title || !content) {
        return sendJson(res, 400, { error: 'Le titre et le contenu du document sont obligatoires.' });
      }
      const existing = state.collabDocs.find((d) => d.id === body.id);
      if (existing) {
        existing.title = title;
        existing.content = content;
        existing.updatedBy = memberId;
        existing.updatedAt = nowIso;
        existing.history = existing.history || [];
        existing.history.unshift({
          authorId: memberId,
          date: nowIso,
          note: cleanStr(body.editNote, 160) || 'Modification du document'
        });
        existing.history = existing.history.slice(0, 12);
      } else {
        state.collabDocs.unshift({
          id: makeId('doc'),
          title,
          status: 'draft',
          authorId: memberId,
          updatedBy: memberId,
          updatedAt: nowIso,
          content,
          history: [{ authorId: memberId, date: nowIso, note: 'Création du document' }],
          proposals: []
        });
      }
      commitState();
      return sendJson(res, 200, state);
    }

    const doc = state.collabDocs.find((d) => d.id === body.docId);
    if (!doc) {
      return sendJson(res, 404, { error: 'Document introuvable.' });
    }

    if (action === 'cycle_status') {
      const order = ['draft', 'review', 'validated'];
      doc.status = order[(order.indexOf(doc.status) + 1) % order.length];
      doc.updatedBy = memberId;
      doc.updatedAt = nowIso;
      commitState();
      return sendJson(res, 200, state);
    }

    if (action === 'add_proposal') {
      const text = cleanStr(body.text, 800);
      if (!text) {
        return sendJson(res, 400, { error: 'Merci d\'écrire votre proposition.' });
      }
      if (!Array.isArray(doc.proposals)) doc.proposals = [];
      doc.proposals.unshift({
        id: makeId('prop'),
        authorId: memberId,
        text,
        votes: [memberId],
        integrated: false,
        createdAt: nowIso
      });
      commitState();
      return sendJson(res, 200, state);
    }

    if (action === 'toggle_proposal') {
      const prop = (doc.proposals || []).find((p) => p.id === body.proposalId);
      if (!prop) {
        return sendJson(res, 404, { error: 'Proposition introuvable.' });
      }
      if (body.toggleIntegrated) {
        prop.integrated = !prop.integrated;
      } else {
        prop.votes = Array.isArray(prop.votes) ? prop.votes : [];
        const idx = prop.votes.indexOf(memberId);
        if (idx >= 0) prop.votes.splice(idx, 1);
        else prop.votes.push(memberId);
      }
      commitState();
      return sendJson(res, 200, state);
    }

    return sendJson(res, 400, { error: 'Action document inconnue.' });
  }

  if (pathname === '/api/messages') {
    const text = cleanStr(body.text, 1000);
    if (!text) {
      return sendJson(res, 400, { error: 'Le message est vide.' });
    }
    const allowedCategories = ['info', 'sortie', 'materiel', 'photo'];
    state.messages.unshift({
      id: makeId('msg'),
      authorId: cleanStr(body.authorId, 40) || 'anthony',
      category: allowedCategories.includes(body.category) ? body.category : 'info',
      pinned: Boolean(body.pinned),
      reactions: { '👍': [], '⛵': [], '🛠️': [] },
      text,
      imageData: typeof body.imageData === 'string' && body.imageData.startsWith('data:image/') ? body.imageData.slice(0, 450000) : '',
      createdAt: nowIso
    });
    state.messages = state.messages.slice(0, 80);
    commitState();
    return sendJson(res, 200, state);
  }

  if (pathname === '/api/messages/react') {
    const msg = state.messages.find((m) => m.id === body.messageId);
    const memberId = cleanStr(body.memberId, 40);
    if (!msg || !memberId) {
      return sendJson(res, 404, { error: 'Message ou membre introuvable.' });
    }
    if (body.togglePin) {
      msg.pinned = !msg.pinned;
      commitState();
      return sendJson(res, 200, state);
    }
    const allowedEmojis = ['👍', '⛵', '🛠️'];
    if (allowedEmojis.includes(body.emoji)) {
      if (!msg.reactions || typeof msg.reactions !== 'object') {
        msg.reactions = { '👍': [], '⛵': [], '🛠️': [] };
      }
      if (!Array.isArray(msg.reactions[body.emoji])) {
        msg.reactions[body.emoji] = [];
      }
      const arr = msg.reactions[body.emoji];
      const idx = arr.indexOf(memberId);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(memberId);
      commitState();
      return sendJson(res, 200, state);
    }
    return sendJson(res, 400, { error: 'Action invalide.' });
  }

  return sendJson(res, 404, { error: 'Route API inconnue' });
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(reqUrl.pathname);

  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch((err) => {
      console.error('API error:', err);
      sendJson(res, 500, { error: 'Erreur interne du serveur' });
    });
    return;
  }

  if (pathname === '/docs/Compte_Rendu_Tombolla_Rochecorbon.pdf') {
    return serveFile(res, path.join(REUNION_DIR, 'Compte_Rendu_Tombolla_Rochecorbon.pdf'));
  }
  if (pathname === '/docs/compte_rendu_tombolla.md') {
    return serveFile(res, path.join(REUNION_DIR, 'compte_rendu_tombolla.md'));
  }
  if (pathname.startsWith('/docs/juridique/')) {
    const relJuridique = pathname.replace('/docs/juridique/', '');
    const resolvedJuridique = path.resolve(JURIDIQUE_DIR, relJuridique);
    if (!resolvedJuridique.startsWith(JURIDIQUE_DIR + path.sep) || !resolvedJuridique.endsWith('.md')) {
      res.writeHead(403);
      res.end('Accès interdit');
      return;
    }
    return serveFile(res, resolvedJuridique);
  }

  let safeRelPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolved = path.resolve(PUBLIC_DIR, safeRelPath);
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Accès interdit');
    return;
  }
  serveFile(res, resolved);
});

server.listen(PORT, HOST, () => {
  console.log(`⛵ Collectif Tombola Web App prête sur http://localhost:${PORT}`);
});
