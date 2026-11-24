// Collectif Tombola — Application Web Mobile-First & Didactique (Vanilla JS + Supabase)

const SUPABASE_URL = 'https://fcmuovgcwpmkiawmxmjc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9F1BpWGYBzUkiaQQmEhGzA_IsfRCILM';
const STORAGE_BUCKET = 'tombola-docs';

const STORAGE_MEMBER_KEY = 'tombola_member_id';
const STORAGE_HELP_KEY = 'tombola_help_enabled';
const STORAGE_TOUR_DONE = 'tombola_tour_done';
const STORAGE_AUTO_GPS_KEY = 'tombola_auto_gps';
const STORAGE_WEATHER_CACHE_KEY = 'tombola_weather_cache_v1';
const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const WEATHER_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
const BOAT_ICO = '<svg class="inline-boat-ico" viewBox="0 0 48 44" aria-hidden="true"><use href="#icon-loire-boat"></use></svg>';

const MEMBER_ORDER = [
  'amande', 'anthony', 'jeanne', 'julie', 'tom', 'fred',
  'didi', 'nicolas', 'dimitri', 'pascal', 'stephane'
];

const LOIRE_SPOTS = [
  { id: 'tours', name: 'Tours (Pont Wilson / Île Aucard)', kmIndex: 0, lat: 47.3982, lng: 0.6845, tip: 'Attention au courant sous les piles des ponts.' },
  { id: 'marmoutier', name: 'Sainte-Radegonde / Marmoutier', kmIndex: 1, lat: 47.4034, lng: 0.7180, tip: 'Belle vue sur les coteaux et calme le matin.' },
  { id: 'pelio', name: 'Port du Pélio (Rochecorbon)', kmIndex: 2, lat: 47.4065, lng: 0.7552, tip: 'Port d\'attache habituel de Tombola. Trappe moteur cadenassée.' },
  { id: 'vouvray', name: 'Île de la Métairie / Vouvray', kmIndex: 3, lat: 47.4048, lng: 0.7931, tip: 'Bancs de sable changeants selon la hauteur d\'eau.' },
  { id: 'montlouis', name: 'Montlouis-sur-Loire (La Bourdaisière)', kmIndex: 4, lat: 47.3905, lng: 0.8240, tip: 'Halte abritée possible rive gauche.' },
  { id: 'lussault', name: 'Lussault-sur-Loire', kmIndex: 5, lat: 47.3970, lng: 0.9165, tip: 'Bivouac sauvage facile sur les grèves.' },
  { id: 'amboise', name: 'Île d\'Or (Amboise)', kmIndex: 6, lat: 47.4139, lng: 0.9825, tip: 'Escales de 2 jours / nuit au mouillage.' }
];

const BOAT_GUIDES = [
  {
    id: 'guide-moteur',
    section: 'tech',
    icon: '⚙️',
    title: 'Démarrer le moteur & points de vigilance',
    summary: 'Vérifier la durite de refroidissement, l\'essence au peson et la sécurité trappe.',
    steps: [
      'Ouvrir le cadenas à code de la trappe sous le moteur et vérifier le niveau d\'essence (accrocher simplement la nourrice au peson à crochet dans le vide avant de partir).',
      'Brancher le tuyau d\'essence avec la poire flèche vers le moteur, pomper jusqu\'à ce qu\'elle soit ferme, et ouvrir la vis d\'évent du bouchon.',
      'Vérifier la petite durite renifleur de refroidissement (maintenue par le collier Colson) : de l\'eau doit pisser dès que le moteur tourne.',
      'Penser à relever l\'embase si on approche d\'un banc de sable peu profond.'
    ]
  },
  {
    id: 'guide-voile',
    section: 'tech',
    icon: '⛵',
    title: 'Navigation sous voile & affalage d\'urgence',
    summary: 'Consignes essentielles de Clément et Titouan (testé par 55 km/h de vent).',
    steps: [
      'Le bateau gîte vite et a une forte prise au vent : ne hisser la voile que si au moins 2 personnes expérimentées sont à bord (sauf modification poste solo).',
      'TOUJOURS garder le moteur au ralenti quand il y a du vent : en cas de dérive vers les arbres/branches, un coup de gaz immédiat redresse l\'étrave.',
      'Avant d\'affaler : mettre l\'étrave face au vent ! Par vent fort, le collier de racage plaque la voile contre le mât ; il faut donc anticiper la manœuvre et accompagner la vergue.',
      'Celui qui tient la barre donne des instructions courtes ; les équipiers appliquent immédiatement sans hésiter.'
    ]
  },
  {
    id: 'guide-securite',
    section: 'safety',
    icon: '🦺',
    title: 'Matériel de sécurité obligatoire à bord',
    summary: 'Check-list rapide avant de larguer les amarres au Pélio.',
    steps: [
      '1 gilet de sauvetage par personne à bord (port systématique vivement conseillé, obligatoire pour les non-nageurs et enfants).',
      'Bout de remorquage prêt à l\'avant.',
      'Rames de secours et bourde à portée de main (vérifier les dames de nage).',
      'Écope disponible et caillebotis vérifiés (aucune voie d\'eau).'
    ]
  },
  {
    id: 'guide-retour',
    section: 'safety',
    icon: '⚓',
    title: 'Check-list retour au Port du Pélio',
    summary: 'Les 5 gestes simples pour laisser Tombola nickel au suivant.',
    steps: [
      'Amarrer proprement à l\'emplacement prévu (double amarre si crue ou vent annoncé).',
      'Écoper si besoin et nettoyer les traces de boue/sable sur les caillebotis.',
      'Couper l\'évent de la nourrice, soulever la nourrice dans le vide avec le peson à crochet et noter le poids dans l\'onglet Essence.',
      'Refermer la trappe moteur avec le cadenas à code.',
      'Cliquer sur « Je suis rentré au Pélio » sur l\'appli pour que le voyant repasse au vert.'
    ]
  }
];

const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

const LOIRE_SCHEMATIC_POINTS = [
  { id: 'tours', x: 62, y: 118, lng: 0.6845 },
  { id: 'marmoutier', x: 168, y: 106, lng: 0.7180 },
  { id: 'pelio', x: 278, y: 128, lng: 0.7552 },
  { id: 'vouvray', x: 392, y: 102, lng: 0.7931 },
  { id: 'montlouis', x: 498, y: 126, lng: 0.8240 },
  { id: 'lussault', x: 604, y: 104, lng: 0.9165 },
  { id: 'amboise', x: 702, y: 90, lng: 0.9825 }
];

function readSavedCookie(name) {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : '';
}

function savePersistentValue(key, val) {
  localStorage.setItem(key, val);
  document.cookie = `${key}=${encodeURIComponent(val)}; max-age=31536000; path=/; SameSite=Lax`;
}

function loadPersistentValue(key) {
  return localStorage.getItem(key) || readSavedCookie(key) || '';
}

let appState = null;
let currentAuthSession = null;
let realtimeChannel = null;
let reloadTimer = null;
const signedUrlCache = new Map();
let currentMemberId = loadPersistentValue(STORAGE_MEMBER_KEY);
let activeTab = 'bateau';
let activePlanningView = 'list'; // 'list' | 'week' | 'month'
let planningAnchorDate = new Date();
let selectedMonthDate = '';
let activeBookingFilter = 'all';
let activeDocsTab = 'logbook';
let activeTodoFilter = 'open'; // 'open' | 'all' | 'course' | 'tache'
let activePhotoFilter = 'all'; // 'all' | 'navigation' | 'chantier' | 'collectif'
let activeChatFilter = 'all'; // 'all' | 'pinned' | 'sortie' | 'materiel'
let helpEnabled = localStorage.getItem(STORAGE_HELP_KEY) !== 'false';
let autoGpsEnabled = localStorage.getItem(STORAGE_AUTO_GPS_KEY) === 'true';
let gpsWatchId = null;
let lastAutoGpsSentAt = 0;
let weatherState = null;
let weatherLastFetchAt = 0;
let weatherFetchInFlight = false;
let tourStep = 0;
let pendingConfirmAction = null;
let selectedCrewSet = new Set();
let selectedLogCrewSet = new Set();
let selectedFuelCrewSet = new Set();
let fuelCrewInitialized = false;
let pendingPhotoData = '';
let pendingLogPhotoData = '';
let pendingAlbumPhotoData = '';

// Helpers DOM
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function escapeHtml(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getMember(id) {
  return (appState?.members || []).find((m) => m.id === id) || {
    id,
    name: id || 'Un membre',
    short: '?',
    color: '#475569'
  };
}

function showToast(msg, isError = false) {
  const el = $('#toast-banner');
  el.textContent = msg;
  el.style.background = isError ? '#991b1b' : '#14532d';
  el.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    el.hidden = true;
  }, 4200);
}

function formatDateFr(isoDate) {
  if (!isoDate) return '';
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return isoDate;
  }
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function isWeekendDate(isoDate) {
  if (!isoDate) return false;
  const d = new Date(`${isoDate}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function calcBookingHours(booking) {
  const [sh = 10, sm = 0] = (booking.startTime || '10:00').split(':').map(Number);
  const [eh = 13, em = 0] = (booking.endTime || '13:00').split(':').map(Number);
  let hours = (eh + em / 60) - (sh + sm / 60);
  if (hours <= 0) hours = 3;
  if (booking.endDate && booking.endDate > booking.date) {
    const days = Math.round((new Date(booking.endDate) - new Date(booking.date)) / 86400000) + 1;
    hours = Math.max(hours, days * 6);
  }
  return hours;
}

function hasActiveAuthSession() {
  return Boolean(currentAuthSession?.access_token);
}

function cleanStr(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function isAuthError(err) {
  if (!err) return false;
  const status = Number(err.status || err.statusCode || 0);
  return status === 401 || status === 403 || err.code === '42501' || err.code === 'PGRST301';
}

function dataUrlToBlob(dataUrl) {
  const parts = String(dataUrl).split(',');
  const mimeMatch = parts[0]?.match(/data:([^;]+);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(parts[1] || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function uploadCompressedPhoto(prefix, id, dataUrl) {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return '';
  const path = `photos/${prefix}-${id}.jpg`;
  const blob = dataUrlToBlob(dataUrl.slice(0, 650000));
  const { error } = await sbClient.storage
    .from(STORAGE_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) {
    throw new Error('Impossible d\'envoyer la photo vers Supabase Storage.');
  }
  return `storage:${path}`;
}

async function ensureSignedUrls(paths) {
  const now = Date.now();
  const missing = Array.from(new Set(paths)).filter((p) => {
    if (!p) return false;
    const cached = signedUrlCache.get(p);
    return !cached || cached.expiresAt <= now;
  });
  if (missing.length === 0) return;

  const { data, error } = await sbClient.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(missing, 3600);
  if (error || !Array.isArray(data)) return;

  const ttlMs = 50 * 60 * 1000;
  for (const item of data) {
    if (item?.path && item?.signedUrl) {
      signedUrlCache.set(item.path, {
        url: item.signedUrl,
        expiresAt: now + ttlMs
      });
    }
  }
}

async function getSignedDocUrl(path) {
  await ensureSignedUrls([path]);
  return signedUrlCache.get(path)?.url || '';
}

function resolveImageField(imageUrl) {
  if (typeof imageUrl !== 'string' || !imageUrl) return '';
  if (imageUrl.startsWith('storage:')) {
    const path = imageUrl.slice('storage:'.length);
    return signedUrlCache.get(path)?.url || '';
  }
  if (imageUrl.startsWith('data:image/') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return '';
}

async function loadAllState() {
  const { data: { session }, error: sessErr } = await sbClient.auth.getSession();
  if (sessErr || !session?.access_token) {
    currentAuthSession = null;
    return false;
  }
  currentAuthSession = session;

  const [
    membersRes,
    boatRes,
    bookingsRes,
    fuelLogsRes,
    charterRes,
    ideasRes,
    logbookRes,
    collabDocsRes,
    messagesRes,
    todosRes,
    photosRes
  ] = await Promise.all([
    sbClient.from('members').select('*'),
    sbClient.from('boat_status').select('*').eq('id', 1).single(),
    sbClient.from('bookings').select('*').order('date', { ascending: true }).order('start_time', { ascending: true }),
    sbClient.from('fuel_logs').select('*').order('created_at', { ascending: false }).limit(100),
    sbClient.from('charter_sections').select('*').order('created_at', { ascending: true }).order('id', { ascending: true }),
    sbClient.from('ideas').select('*').order('created_at', { ascending: false }),
    sbClient.from('logbook_entries').select('*').order('date', { ascending: false }).order('created_at', { ascending: false }),
    sbClient.from('collab_docs').select('*').order('created_at', { ascending: false }),
    sbClient.from('messages').select('*').order('created_at', { ascending: false }).limit(80),
    sbClient.from('todos').select('*').order('done', { ascending: true }).order('created_at', { ascending: false }),
    sbClient.from('photos').select('*').order('taken_on', { ascending: false }).order('created_at', { ascending: false })
  ]);

  const results = [
    membersRes, boatRes, bookingsRes, fuelLogsRes,
    charterRes, ideasRes, logbookRes, collabDocsRes,
    messagesRes, todosRes, photosRes
  ];
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) {
    if (isAuthError(firstErr)) {
      await sbClient.auth.signOut().catch(() => {});
      currentAuthSession = null;
      return false;
    }
    throw new Error(firstErr.message || 'Erreur lors du chargement Supabase.');
  }

  const members = (membersRes.data || [])
    .slice()
    .sort((a, b) => {
      const ia = MEMBER_ORDER.indexOf(a.id);
      const ib = MEMBER_ORDER.indexOf(b.id);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((m) => ({
      ...m,
      avatarUrl: m.avatar_url || ''
    }));

  const logRows = logbookRes.data || [];
  const msgRows = messagesRes.data || [];
  const photoRows = photosRes.data || [];
  const pathsToSign = ['docs/Compte_Rendu_Tombolla_Rochecorbon.pdf'];
  for (const r of logRows) {
    if (typeof r.image_url === 'string' && r.image_url.startsWith('storage:')) {
      pathsToSign.push(r.image_url.slice('storage:'.length));
    }
  }
  for (const r of msgRows) {
    if (typeof r.image_url === 'string' && r.image_url.startsWith('storage:')) {
      pathsToSign.push(r.image_url.slice('storage:'.length));
    }
  }
  for (const r of photoRows) {
    if (typeof r.image_url === 'string' && r.image_url.startsWith('storage:')) {
      pathsToSign.push(r.image_url.slice('storage:'.length));
    }
  }
  await ensureSignedUrls(pathsToSign);

  const pdfLink = $('#official-pdf-link');
  const pdfSignedUrl = signedUrlCache.get('docs/Compte_Rendu_Tombolla_Rochecorbon.pdf')?.url;
  if (pdfLink && pdfSignedUrl) {
    pdfLink.href = pdfSignedUrl;
  }

  const bs = boatRes.data || {};
  const fc = bs.fuel_config || {};
  const eco = bs.ecopage || {};
  const pc = bs.priority_config || {};

  appState = {
    boatName: 'Tombola',
    members,
    loireSpots: LOIRE_SPOTS,
    guides: BOAT_GUIDES,
    boatStatus: {
      state: bs.state || 'chantier',
      crew: Array.isArray(bs.crew) ? bs.crew : [],
      lastWaterCrew: Array.isArray(bs.last_water_crew) ? bs.last_water_crew : [],
      outingType: bs.outing_type || 'open',
      maxSeats: Number(bs.max_seats) || 4,
      returnTime: bs.return_time || '',
      note: bs.note || '',
      location: bs.location || {},
      updatedBy: bs.updated_by || 'anthony',
      updatedAt: bs.updated_at || new Date().toISOString()
    },
    ecopage: {
      rotationOrder: Array.isArray(eco.rotationOrder) ? eco.rotationOrder : MEMBER_ORDER,
      currentIndex: Number(eco.currentIndex) || 0,
      weekLabel: eco.weekLabel || 'Au démarrage après chantier',
      lastCheckedBy: eco.lastCheckedBy || '',
      lastCheckedAt: eco.lastCheckedAt || '',
      stateNote: eco.stateNote || ''
    },
    priorityConfig: {
      weekdayPerHour: Number(pc.weekdayPerHour ?? 1),
      weekendPerHour: Number(pc.weekendPerHour ?? 2.5),
      openDiscount: Number(pc.openDiscount ?? 0.5),
      lastMinuteFree: pc.lastMinuteFree !== false,
      includeChantier: Boolean(pc.includeChantier)
    },
    fuel: {
      mode: fc.mode === 'mark' ? 'mark' : 'scale',
      emptyTankKg: Number(fc.emptyTankKg ?? 1.8),
      fullTankKg: Number(fc.fullTankKg ?? 10.8),
      densityKgPerL: Number(fc.densityKgPerL ?? 0.75),
      pricePerLiter: Number(fc.pricePerLiter ?? 1.85),
      currentWeightKg: Number(fc.currentWeightKg ?? 9.3),
      logs: (fuelLogsRes.data || []).map((l) => ({
        id: l.id,
        kind: l.kind,
        date: l.date,
        memberId: l.member_id,
        bookingId: l.booking_id || '',
        participants: Array.isArray(l.participants) ? l.participants : [],
        crewNames: l.crew_names || '',
        startKg: l.start_kg !== null && l.start_kg !== undefined ? Number(l.start_kg) : null,
        endKg: l.end_kg !== null && l.end_kg !== undefined ? Number(l.end_kg) : null,
        litersUsed: Number(l.liters_used),
        costEur: Number(l.cost_eur),
        note: l.note || ''
      }))
    },
    bookings: (bookingsRes.data || []).map((b) => ({
      id: b.id,
      title: b.title,
      date: b.date,
      endDate: b.end_date,
      startTime: b.start_time,
      endTime: b.end_time,
      type: b.type,
      authorId: b.author_id,
      participants: Array.isArray(b.participants) ? b.participants : [],
      maxSeats: Number(b.max_seats) || 4,
      isLastMinute: Boolean(b.is_last_minute),
      note: b.note || '',
      createdAt: b.created_at
    })),
    todos: (todosRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      kind: t.kind || 'course',
      done: Boolean(t.done),
      authorId: t.author_id,
      doneBy: t.done_by || '',
      doneAt: t.done_at || '',
      note: t.note || '',
      createdAt: t.created_at
    })),
    photos: photoRows.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category || 'navigation',
      authorId: p.author_id,
      takenOn: p.taken_on || '',
      imageData: resolveImageField(p.image_url),
      createdAt: p.created_at
    })),
    charterSections: (charterRes.data || []).map((c) => ({
      id: c.id,
      title: c.title,
      content: c.content,
      updatedBy: c.updated_by,
      updatedAt: c.updated_at,
      createdAt: c.created_at,
      history: Array.isArray(c.history) ? c.history : []
    })),
    ideas: (ideasRes.data || []).map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description || '',
      authorId: i.author_id,
      status: i.status,
      votes: Array.isArray(i.votes) ? i.votes : [],
      createdAt: i.created_at
    })),
    logbookEntries: logRows.map((l) => ({
      id: l.id,
      date: l.date,
      title: l.title,
      authorId: l.author_id,
      crew: Array.isArray(l.crew) ? l.crew : [],
      weather: l.weather || '',
      story: l.story,
      boatNotes: l.boat_notes || '',
      imageData: resolveImageField(l.image_url),
      createdAt: l.created_at
    })),
    collabDocs: (collabDocsRes.data || []).map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      authorId: d.author_id,
      updatedBy: d.updated_by,
      updatedAt: d.updated_at,
      createdAt: d.created_at,
      content: d.content,
      history: Array.isArray(d.history) ? d.history : [],
      proposals: Array.isArray(d.proposals) ? d.proposals : []
    })),
    messages: msgRows.map((m) => ({
      id: m.id,
      authorId: m.author_id,
      category: m.category,
      pinned: Boolean(m.pinned),
      reactions: m.reactions && typeof m.reactions === 'object'
        ? m.reactions
        : { '👍': [], '⛵': [], '🛠️': [] },
      text: m.text,
      imageData: resolveImageField(m.image_url),
      createdAt: m.created_at
    }))
  };

  const hasValidMember = Boolean(
    currentMemberId && appState.members.some((m) => m.id === currentMemberId)
  );
  if (!hasValidMember) {
    currentMemberId = '';
    localStorage.removeItem(STORAGE_MEMBER_KEY);
  }

  renderAll();
  return true;
}

async function fetchSingleRow(table, id) {
  const { data, error } = await sbClient.from(table).select('*').eq('id', id).single();
  if (error || !data) {
    if (isAuthError(error)) {
      currentAuthSession = null;
      openProfileDialog();
      throw new Error('Session expirée : merci de saisir le code du collectif.');
    }
    throw new Error('Élément introuvable.');
  }
  return data;
}

function throwIfSupabaseError(error, fallbackMsg) {
  if (!error) return;
  if (isAuthError(error)) {
    currentAuthSession = null;
    openProfileDialog();
    throw new Error('Session expirée : merci de saisir le code du collectif.');
  }
  throw new Error(error.message || fallbackMsg || 'Une erreur est survenue.');
}

async function logActivity(memberId, category, text) {
  if (!text || !hasActiveAuthSession()) return;
  try {
    const allowedCategories = ['info', 'sortie', 'materiel', 'photo'];
    await sbClient.from('messages').insert({
      id: makeId('act'),
      author_id: cleanStr(memberId, 40) || currentMemberId || 'anthony',
      category: allowedCategories.includes(category) ? category : 'info',
      pinned: false,
      reactions: { '👍': [], '⛵': [], '🛠️': [] },
      text: cleanStr(text, 900),
      image_url: '',
      created_at: new Date().toISOString()
    });
  } catch {
    // ne jamais bloquer l'action principale si le journal d'activité échoue
  }
}

function openWhatsAppShare(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}

function renderAvatarDotHtml(member, sizePx = 20, fontSize = '0.68rem', cls = 'avatar-dot') {
  const m = member || getMember('');
  const sizeStyle = sizePx ? `width:${sizePx}px;height:${sizePx}px;font-size:${fontSize};` : '';
  if (m.avatarUrl) {
    return `<span class="${cls}" style="${sizeStyle}background:transparent;"><img src="${escapeHtml(m.avatarUrl)}" alt="${escapeHtml(m.name)}" class="avatar-img"></span>`;
  }
  return `<span class="${cls}" style="${sizeStyle}background:${escapeHtml(m.color)}">${escapeHtml(m.short)}</span>`;
}

async function apiPost(route, body = {}) {
  if (!hasActiveAuthSession()) {
    openProfileDialog();
    throw new Error('Déverrouillez d\'abord l\'accès collectif.');
  }

  const nowIso = new Date().toISOString();

  if (route === '/api/status') {
    const bs = await fetchSingleRow('boat_status', 1);
    const allowedStates = ['mooring', 'water', 'chantier'];
    const nextState = allowedStates.includes(body.state) ? body.state : bs.state;
    const validIds = new Set((appState?.members || []).map((m) => m.id));
    const crew = Array.isArray(body.crew)
      ? body.crew.filter((id) => validIds.has(id))
      : (Array.isArray(bs.crew) ? bs.crew : []);

    let nextLocation = bs.location || {};
    if (body.spotId) {
      const spot = LOIRE_SPOTS.find((s) => s.id === body.spotId);
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
      const pelio = LOIRE_SPOTS.find((s) => s.id === 'pelio');
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

    const prevState = bs.state;
    const prevCrew = Array.isArray(bs.crew) ? bs.crew : [];
    const lastWaterCrew = (prevState === 'water' && nextState === 'mooring' && prevCrew.length > 0)
      ? prevCrew
      : (Array.isArray(bs.last_water_crew) ? bs.last_water_crew : []);

    const { error } = await sbClient
      .from('boat_status')
      .update({
        state: nextState,
        crew: nextState === 'mooring' ? [] : crew,
        last_water_crew: lastWaterCrew,
        outing_type: body.outingType === 'private' ? 'private' : 'open',
        max_seats: Math.max(1, Math.min(8, Number(body.maxSeats) || 4)),
        return_time: nextState === 'mooring' ? '' : cleanStr(body.returnTime, 40),
        note: cleanStr(body.note, 300) || (nextState === 'mooring' ? 'Amarré au Port du Pélio (Rochecorbon).' : ''),
        location: nextLocation,
        updated_by: cleanStr(body.memberId, 40) || bs.updated_by,
        updated_at: nowIso
      })
      .eq('id', 1);
    throwIfSupabaseError(error, 'Impossible de mettre à jour le statut du bateau.');
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || bs.updated_by;
    if (body.state && body.state !== prevState) {
      const actor = getMember(actorId).name;
      const msgTxt = nextState === 'water'
        ? `⛵ ${actor} a passé Tombola « Sur l'eau » (${nextLocation.name || 'Loire'}).`
        : nextState === 'chantier'
          ? `🟠 ${actor} a passé Tombola en statut « En chantier ».`
          : `⚓ ${actor} a signalé le retour de Tombola au Port du Pélio (libre).`;
      await logActivity(actorId, nextState === 'chantier' ? 'materiel' : 'sortie', msgTxt);
    }
    await loadAllState();
    return appState;
  }

  if (route === '/api/ecopage') {
    const bs = await fetchSingleRow('boat_status', 1);
    const eco = { ...(bs.ecopage || {}) };
    const order = Array.isArray(eco.rotationOrder) && eco.rotationOrder.length > 0
      ? eco.rotationOrder
      : MEMBER_ORDER;
    eco.rotationOrder = order;
    let curIdx = Number(eco.currentIndex) || 0;
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || order[curIdx];

    if (body.action === 'next_person') {
      curIdx = (curIdx + 1) % order.length;
      eco.currentIndex = curIdx;
      await logActivity(actorId, 'materiel', `🔄 ${getMember(actorId).name} a passé le tour d'écopage à ${getMember(order[curIdx]).name}.`);
    } else {
      eco.lastCheckedBy = actorId;
      eco.lastCheckedAt = nowIso;
      if (body.stateNote) {
        eco.stateNote = cleanStr(body.stateNote, 240);
      }
      if (body.advanceRotation) {
        curIdx = (curIdx + 1) % order.length;
        eco.currentIndex = curIdx;
      }
      await logActivity(actorId, 'materiel', `🪣 ${getMember(actorId).name} a validé l'écopage de la semaine.`);
    }

    const { error } = await sbClient
      .from('boat_status')
      .update({
        ecopage: eco,
        updated_by: actorId,
        updated_at: nowIso
      })
      .eq('id', 1);
    throwIfSupabaseError(error, 'Impossible de mettre à jour l\'écopage.');
    await loadAllState();
    return appState;
  }

  if (route === '/api/priority-config') {
    const bs = await fetchSingleRow('boat_status', 1);
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const nextCfg = {
      weekdayPerHour: Math.max(0, Math.min(10, Number(body.weekdayPerHour ?? 1))),
      weekendPerHour: Math.max(0, Math.min(10, Number(body.weekendPerHour ?? 2.5))),
      openDiscount: Math.max(0, Math.min(0.9, Number(body.openDiscount ?? 0.5))),
      lastMinuteFree: Boolean(body.lastMinuteFree),
      includeChantier: Boolean(body.includeChantier)
    };
    const { error } = await sbClient
      .from('boat_status')
      .update({
        priority_config: nextCfg,
        updated_by: actorId,
        updated_at: nowIso
      })
      .eq('id', 1);
    throwIfSupabaseError(error, 'Impossible d\'enregistrer les règles de priorité.');
    await logActivity(actorId, 'info', `⚖️ ${getMember(actorId).name} a ajusté les règles de priorité du planning (semaine ${nextCfg.weekdayPerHour} u/h, WE ${nextCfg.weekendPerHour} u/h).`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/bookings') {
    const title = cleanStr(body.title, 120);
    const date = cleanStr(body.date, 20);
    if (!title || !date) {
      throw new Error('Le titre et la date sont obligatoires.');
    }
    const allowedTypes = ['open', 'private', 'chantier'];
    const type = allowedTypes.includes(body.type) ? body.type : 'open';
    const authorId = cleanStr(body.authorId, 40) || currentMemberId || 'anthony';
    const initialParticipants = Array.isArray(body.participants) && body.participants.length > 0
      ? body.participants
      : [authorId];

    const { error } = await sbClient.from('bookings').insert({
      id: makeId('bk'),
      title,
      date,
      end_date: cleanStr(body.endDate, 20) || date,
      start_time: cleanStr(body.startTime, 10) || '10:00',
      end_time: cleanStr(body.endTime, 10) || '13:00',
      type,
      author_id: authorId,
      participants: Array.from(new Set(initialParticipants)),
      max_seats: Math.max(1, Math.min(11, Number(body.maxSeats) || (type === 'chantier' ? 8 : 4))),
      is_last_minute: Boolean(body.isLastMinute),
      note: cleanStr(body.note, 300),
      created_at: nowIso
    });
    throwIfSupabaseError(error, 'Impossible d\'ajouter ce créneau.');
    await logActivity(authorId, type === 'chantier' ? 'materiel' : 'sortie', `📅 ${getMember(authorId).name} a ajouté au planning : « ${title} » (${formatDateFr(date)}).`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/bookings/toggle-join') {
    const memberId = cleanStr(body.memberId, 40);
    if (!body.bookingId || !memberId) {
      throw new Error('Créneau ou membre introuvable.');
    }
    const booking = await fetchSingleRow('bookings', body.bookingId);
    const participants = Array.isArray(booking.participants) ? booking.participants.slice() : [];
    const idx = participants.indexOf(memberId);
    let joined = false;
    if (idx >= 0) {
      participants.splice(idx, 1);
    } else {
      if (booking.type === 'private') {
        throw new Error('Cette sortie est marquée privée / famille.');
      }
      if (participants.length >= booking.max_seats) {
        throw new Error('Toutes les places sont déjà prises sur ce créneau.');
      }
      participants.push(memberId);
      joined = true;
    }

    const { error } = await sbClient
      .from('bookings')
      .update({ participants })
      .eq('id', booking.id);
    throwIfSupabaseError(error, 'Impossible de modifier l\'inscription.');
    await logActivity(memberId, booking.type === 'chantier' ? 'materiel' : 'sortie', `${joined ? '✋' : '↩️'} ${getMember(memberId).name} ${joined ? 'rejoint' : 'quitte'} « ${booking.title} ».`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/bookings/delete') {
    const existing = appState?.bookings?.find((b) => b.id === body.bookingId);
    const { data, error } = await sbClient
      .from('bookings')
      .delete()
      .eq('id', body.bookingId)
      .select('id');
    throwIfSupabaseError(error, 'Impossible d\'annuler ce créneau.');
    if (!data || data.length === 0) {
      throw new Error('Créneau introuvable.');
    }
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    if (existing) {
      await logActivity(actorId, existing.type === 'chantier' ? 'materiel' : 'sortie', `🗑️ ${getMember(actorId).name} a annulé le créneau « ${existing.title} ».`);
    }
    await loadAllState();
    return appState;
  }

  if (route === '/api/fuel') {
    const bs = await fetchSingleRow('boat_status', 1);
    const fc = {
      mode: 'scale',
      emptyTankKg: 1.8,
      fullTankKg: 10.8,
      densityKgPerL: 0.75,
      pricePerLiter: 1.85,
      currentWeightKg: 9.3,
      ...(bs.fuel_config || {})
    };

    if (body.action === 'config') {
      if (body.mode === 'scale' || body.mode === 'mark') fc.mode = body.mode;
      if (typeof body.pricePerLiter === 'number' && body.pricePerLiter > 0) {
        fc.pricePerLiter = Number(body.pricePerLiter.toFixed(2));
      }
      const { error } = await sbClient
        .from('boat_status')
        .update({ fuel_config: fc, updated_at: nowIso })
        .eq('id', 1);
      throwIfSupabaseError(error, 'Impossible de changer le mode carburant.');
      await loadAllState();
      return appState;
    }

    if (body.action === 'refill') {
      const addedLiters = Math.max(0.1, Number(body.liters) || 0);
      const addedKg = addedLiters * Number(fc.densityKgPerL);
      const newWeight = Math.min(Number(fc.fullTankKg) + 1, Number((Number(fc.currentWeightKg) + addedKg).toFixed(2)));
      const authorId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
      fc.currentWeightKg = newWeight;

      const { error: logErr } = await sbClient.from('fuel_logs').insert({
        id: makeId('fuel'),
        kind: 'refill',
        date: nowIso.slice(0, 10),
        member_id: authorId,
        booking_id: null,
        participants: [authorId],
        crew_names: cleanStr(body.crewNames, 100) || 'Plein / Complément nourrice',
        start_kg: Number((newWeight - addedKg).toFixed(2)),
        end_kg: newWeight,
        liters_used: Number((-addedLiters).toFixed(2)),
        cost_eur: Number((addedLiters * Number(fc.pricePerLiter)).toFixed(2)),
        note: cleanStr(body.note, 240) || `Ajout de ${addedLiters.toFixed(1)} L à la nourrice.`
      });
      throwIfSupabaseError(logErr, 'Impossible d\'enregistrer le plein.');

      const { error: updErr } = await sbClient
        .from('boat_status')
        .update({ fuel_config: fc, updated_by: authorId, updated_at: nowIso })
        .eq('id', 1);
      throwIfSupabaseError(updErr, 'Impossible de mettre à jour la jauge.');

      await logActivity(authorId, 'materiel', `⛽ ${getMember(authorId).name} a ajouté ${addedLiters.toFixed(1)} L d'essence dans la nourrice.`);
      await loadAllState();
      return appState;
    }

    const startKg = Number(body.startKg);
    const endKg = Number(body.endKg);
    if (!Number.isFinite(startKg) || !Number.isFinite(endKg) || startKg < endKg) {
      throw new Error('Le poids au départ doit être supérieur ou égal au poids au retour.');
    }
    const kgUsed = Math.max(0, startKg - endKg);
    const litersUsed = Number((kgUsed / Number(fc.densityKgPerL)).toFixed(2));
    const costEur = Number((litersUsed * Number(fc.pricePerLiter)).toFixed(2));
    const authorMemberId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const validIds = new Set((appState?.members || []).map((m) => m.id));
    const rawParticipants = Array.isArray(body.participants)
      ? body.participants.filter((id) => validIds.has(id))
      : [];
    const participants = rawParticipants.length > 0 ? Array.from(new Set(rawParticipants)) : [authorMemberId];
    const crewNames = participants.map((id) => getMember(id).name).join(', ');
    const validBookingId = appState?.bookings?.some((b) => b.id === body.bookingId)
      ? cleanStr(body.bookingId, 60)
      : null;

    fc.currentWeightKg = Number(endKg.toFixed(2));

    const { error: logErr } = await sbClient.from('fuel_logs').insert({
      id: makeId('fuel'),
      kind: 'outing',
      date: cleanStr(body.date, 20) || nowIso.slice(0, 10),
      member_id: authorMemberId,
      booking_id: validBookingId,
      participants,
      crew_names: cleanStr(body.crewNames, 120) || crewNames,
      start_kg: Number(startKg.toFixed(2)),
      end_kg: Number(endKg.toFixed(2)),
      liters_used: litersUsed,
      cost_eur: costEur,
      note: cleanStr(body.note, 240) || 'Pesée au peson enregistrée'
    });
    throwIfSupabaseError(logErr, 'Impossible d\'enregistrer la pesée.');

    const { error: updErr } = await sbClient
      .from('boat_status')
      .update({ fuel_config: fc, updated_by: authorMemberId, updated_at: nowIso })
      .eq('id', 1);
    throwIfSupabaseError(updErr, 'Impossible de mettre à jour la jauge.');

    await logActivity(authorMemberId, 'materiel', `⛽ ${getMember(authorMemberId).name} a enregistré une pesée d'essence : ${litersUsed.toFixed(2)} L (${crewNames}).`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/charter') {
    const memberId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const title = cleanStr(body.title, 140);
    const content = cleanStr(body.content, 2500);
    if (!title || !content) {
      throw new Error('Le titre et le texte sont obligatoires.');
    }

    if (body.id) {
      const existing = await fetchSingleRow('charter_sections', body.id);
      const history = Array.isArray(existing.history) ? existing.history.slice() : [];
      history.unshift({
        authorId: memberId,
        date: nowIso,
        note: cleanStr(body.editNote, 140) || 'Mise à jour du texte'
      });
      const { error } = await sbClient
        .from('charter_sections')
        .update({
          title,
          content,
          updated_by: memberId,
          updated_at: nowIso,
          history: history.slice(0, 8)
        })
        .eq('id', existing.id);
      throwIfSupabaseError(error, 'Impossible de modifier l\'article de Charte.');
      await logActivity(memberId, 'info', `📜 ${getMember(memberId).name} a mis à jour la Charte : « ${title} ».`);
    } else {
      const { error } = await sbClient.from('charter_sections').insert({
        id: makeId('ch'),
        title,
        content,
        updated_by: memberId,
        updated_at: nowIso,
        created_at: nowIso,
        history: [{ authorId: memberId, date: nowIso, note: 'Création de l\'article' }]
      });
      throwIfSupabaseError(error, 'Impossible de créer l\'article de Charte.');
      await logActivity(memberId, 'info', `📜 ${getMember(memberId).name} a ajouté un article à la Charte : « ${title} ».`);
    }

    await loadAllState();
    return appState;
  }

  if (route === '/api/ideas') {
    const title = cleanStr(body.title, 140);
    const description = cleanStr(body.description, 800);
    const authorId = cleanStr(body.authorId, 40) || currentMemberId || 'jeanne';
    if (!title) {
      throw new Error('Merci d\'indiquer un titre pour votre idée.');
    }
    const { error } = await sbClient.from('ideas').insert({
      id: makeId('idea'),
      title,
      description,
      author_id: authorId,
      status: 'discussion',
      votes: [authorId],
      created_at: nowIso
    });
    throwIfSupabaseError(error, 'Impossible d\'ajouter cette idée.');
    await logActivity(authorId, 'info', `💡 ${getMember(authorId).name} a posé une idée sur le Frigo : « ${title} ».`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/ideas/vote') {
    const memberId = cleanStr(body.memberId, 40);
    if (!body.ideaId || !memberId) {
      throw new Error('Idée introuvable.');
    }
    const idea = await fetchSingleRow('ideas', body.ideaId);
    const patch = {};
    if (body.status && ['discussion', 'test', 'acte'].includes(body.status)) {
      patch.status = body.status;
    } else {
      const votes = Array.isArray(idea.votes) ? idea.votes.slice() : [];
      const idx = votes.indexOf(memberId);
      if (idx >= 0) votes.splice(idx, 1);
      else votes.push(memberId);
      patch.votes = votes;
    }
    const { error } = await sbClient.from('ideas').update(patch).eq('id', idea.id);
    throwIfSupabaseError(error, 'Impossible de mettre à jour l\'idée.');
    await loadAllState();
    return appState;
  }

  if (route === '/api/logbook') {
    const title = cleanStr(body.title, 140);
    const story = cleanStr(body.story, 2000);
    if (!title || !story) {
      throw new Error('Le titre et le récit sont obligatoires.');
    }
    const authorId = cleanStr(body.authorId, 40) || currentMemberId || 'anthony';
    const validIds = new Set((appState?.members || []).map((m) => m.id));
    const crew = Array.isArray(body.crew)
      ? body.crew.filter((id) => validIds.has(id))
      : [authorId];
    const entryId = makeId('log');
    const imageUrl = await uploadCompressedPhoto('log', entryId, body.imageData);

    const { error } = await sbClient.from('logbook_entries').insert({
      id: entryId,
      date: cleanStr(body.date, 20) || nowIso.slice(0, 10),
      title,
      author_id: authorId,
      crew: crew.length > 0 ? Array.from(new Set(crew)) : [authorId],
      weather: cleanStr(body.weather, 120),
      story,
      boat_notes: cleanStr(body.boatNotes, 600),
      image_url: imageUrl,
      created_at: nowIso
    });
    throwIfSupabaseError(error, 'Impossible de publier dans le journal de nav.');
    await logActivity(authorId, 'sortie', `📓 ${getMember(authorId).name} a ajouté une sortie au Journal de nav : « ${title} ».`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/todos') {
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const action = body.action || 'add';

    if (action === 'add') {
      const title = cleanStr(body.title, 160);
      if (!title) throw new Error('Merci d\'indiquer l\'intitulé de la course ou tâche.');
      const kind = body.kind === 'tache' ? 'tache' : 'course';
      const { error } = await sbClient.from('todos').insert({
        id: makeId('todo'),
        title,
        kind,
        done: false,
        author_id: actorId,
        note: cleanStr(body.note, 260),
        created_at: nowIso
      });
      throwIfSupabaseError(error, 'Impossible d\'ajouter à la liste.');
      await logActivity(actorId, 'materiel', `🛒 ${getMember(actorId).name} a ajouté ${kind === 'course' ? 'à la liste de courses' : 'à la To-Do'} : « ${title} ».`);
      await loadAllState();
      return appState;
    }

    if (action === 'toggle') {
      const item = await fetchSingleRow('todos', body.todoId);
      const nextDone = !item.done;
      const { error } = await sbClient
        .from('todos')
        .update({
          done: nextDone,
          done_by: nextDone ? actorId : null,
          done_at: nextDone ? nowIso : null
        })
        .eq('id', item.id);
      throwIfSupabaseError(error, 'Impossible de mettre à jour la tâche.');
      if (nextDone) {
        await logActivity(actorId, 'materiel', `✅ ${getMember(actorId).name} a coché « ${item.title} ».`);
      }
      await loadAllState();
      return appState;
    }

    if (action === 'delete') {
      const { error } = await sbClient.from('todos').delete().eq('id', body.todoId);
      throwIfSupabaseError(error, 'Impossible de supprimer cet élément.');
      await loadAllState();
      return appState;
    }

    throw new Error('Action To-Do inconnue.');
  }

  if (route === '/api/photos') {
    const actorId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const action = body.action || 'add';

    if (action === 'delete') {
      const { error } = await sbClient.from('photos').delete().eq('id', body.photoId);
      throwIfSupabaseError(error, 'Impossible de supprimer cette photo.');
      await loadAllState();
      return appState;
    }

    const title = cleanStr(body.title, 140);
    if (!title || !body.imageData) {
      throw new Error('Merci d\'indiquer une légende et de choisir une photo.');
    }
    const allowedCats = ['navigation', 'chantier', 'collectif'];
    const category = allowedCats.includes(body.category) ? body.category : 'navigation';
    const photoId = makeId('ph');
    const imageUrl = await uploadCompressedPhoto('album', photoId, body.imageData);

    const { error } = await sbClient.from('photos').insert({
      id: photoId,
      title,
      category,
      author_id: actorId,
      image_url: imageUrl,
      taken_on: cleanStr(body.takenOn, 20) || nowIso.slice(0, 10),
      created_at: nowIso
    });
    throwIfSupabaseError(error, 'Impossible de publier la photo dans l\'album.');
    await logActivity(actorId, 'photo', `📸 ${getMember(actorId).name} a ajouté une photo dans l'album : « ${title} ».`);
    await loadAllState();
    return appState;
  }

  if (route === '/api/member/avatar') {
    const memberId = cleanStr(body.memberId, 40) || currentMemberId;
    if (!memberId) throw new Error('Membre introuvable.');
    const avatarUrl = typeof body.avatarUrl === 'string' && body.avatarUrl.startsWith('data:image/')
      ? body.avatarUrl.slice(0, 45000)
      : '';
    const { error } = await sbClient
      .from('members')
      .update({ avatar_url: avatarUrl })
      .eq('id', memberId);
    throwIfSupabaseError(error, 'Impossible de mettre à jour la photo de profil.');
    if (avatarUrl) {
      await logActivity(memberId, 'info', `📷 ${getMember(memberId).name} a ajouté sa photo de profil.`);
    }
    await loadAllState();
    return appState;
  }

  if (route === '/api/collab-docs') {
    const memberId = cleanStr(body.memberId, 40) || currentMemberId || 'anthony';
    const action = body.action || 'save_doc';

    if (action === 'save_doc') {
      const title = cleanStr(body.title, 160);
      const content = cleanStr(body.content, 4000);
      if (!title || !content) {
        throw new Error('Le titre et le contenu du document sont obligatoires.');
      }
      if (body.id) {
        const existing = await fetchSingleRow('collab_docs', body.id);
        const history = Array.isArray(existing.history) ? existing.history.slice() : [];
        history.unshift({
          authorId: memberId,
          date: nowIso,
          note: cleanStr(body.editNote, 160) || 'Modification du document'
        });
        const { error } = await sbClient
          .from('collab_docs')
          .update({
            title,
            content,
            updated_by: memberId,
            updated_at: nowIso,
            history: history.slice(0, 12)
          })
          .eq('id', existing.id);
        throwIfSupabaseError(error, 'Impossible de mettre à jour le document.');
        await logActivity(memberId, 'info', `🤝 ${getMember(memberId).name} a mis à jour « ${title} ».`);
      } else {
        const { error } = await sbClient.from('collab_docs').insert({
          id: makeId('doc'),
          title,
          status: 'draft',
          author_id: memberId,
          updated_by: memberId,
          updated_at: nowIso,
          created_at: nowIso,
          content,
          history: [{ authorId: memberId, date: nowIso, note: 'Création du document' }],
          proposals: []
        });
        throwIfSupabaseError(error, 'Impossible de créer le document.');
        await logActivity(memberId, 'info', `🤝 ${getMember(memberId).name} a ajouté un document : « ${title} ».`);
      }
      await loadAllState();
      return appState;
    }

    const doc = await fetchSingleRow('collab_docs', body.docId);

    if (action === 'cycle_status') {
      const order = ['draft', 'review', 'validated'];
      const nextStatus = order[(order.indexOf(doc.status) + 1) % order.length];
      const { error } = await sbClient
        .from('collab_docs')
        .update({ status: nextStatus, updated_by: memberId, updated_at: nowIso })
        .eq('id', doc.id);
      throwIfSupabaseError(error, 'Impossible de changer le statut du document.');
      await logActivity(memberId, 'info', `🔄 ${getMember(memberId).name} a passé « ${doc.title} » en statut ${nextStatus}.`);
      await loadAllState();
      return appState;
    }

    if (action === 'add_proposal') {
      const text = cleanStr(body.text, 800);
      if (!text) {
        throw new Error('Merci d\'écrire votre proposition.');
      }
      const proposals = Array.isArray(doc.proposals) ? doc.proposals.slice() : [];
      proposals.unshift({
        id: makeId('prop'),
        authorId: memberId,
        text,
        votes: [memberId],
        integrated: false,
        createdAt: nowIso
      });
      const { error } = await sbClient
        .from('collab_docs')
        .update({ proposals })
        .eq('id', doc.id);
      throwIfSupabaseError(error, 'Impossible d\'ajouter la proposition.');
      await logActivity(memberId, 'info', `💬 ${getMember(memberId).name} a ajouté une proposition sur « ${doc.title} ».`);
      await loadAllState();
      return appState;
    }

    if (action === 'toggle_proposal') {
      const proposals = Array.isArray(doc.proposals) ? JSON.parse(JSON.stringify(doc.proposals)) : [];
      const prop = proposals.find((p) => p.id === body.proposalId);
      if (!prop) {
        throw new Error('Proposition introuvable.');
      }
      if (body.toggleIntegrated) {
        prop.integrated = !prop.integrated;
      } else {
        prop.votes = Array.isArray(prop.votes) ? prop.votes : [];
        const idx = prop.votes.indexOf(memberId);
        if (idx >= 0) prop.votes.splice(idx, 1);
        else prop.votes.push(memberId);
      }
      const { error } = await sbClient
        .from('collab_docs')
        .update({ proposals })
        .eq('id', doc.id);
      throwIfSupabaseError(error, 'Impossible de mettre à jour la proposition.');
      await loadAllState();
      return appState;
    }

    throw new Error('Action document inconnue.');
  }

  if (route === '/api/messages') {
    const text = cleanStr(body.text, 1000);
    if (!text) {
      throw new Error('Le message est vide.');
    }
    const allowedCategories = ['info', 'sortie', 'materiel', 'photo'];
    const msgId = makeId('msg');
    const imageUrl = await uploadCompressedPhoto('msg', msgId, body.imageData);

    const { error } = await sbClient.from('messages').insert({
      id: msgId,
      author_id: cleanStr(body.authorId, 40) || currentMemberId || 'anthony',
      category: allowedCategories.includes(body.category) ? body.category : 'info',
      pinned: Boolean(body.pinned),
      reactions: { '👍': [], '⛵': [], '🛠️': [] },
      text,
      image_url: imageUrl,
      created_at: nowIso
    });
    throwIfSupabaseError(error, 'Impossible d\'envoyer le message.');
    await loadAllState();
    return appState;
  }

  if (route === '/api/messages/react') {
    const memberId = cleanStr(body.memberId, 40);
    if (!body.messageId || !memberId) {
      throw new Error('Message ou membre introuvable.');
    }
    const msg = await fetchSingleRow('messages', body.messageId);
    if (body.togglePin) {
      const { error } = await sbClient
        .from('messages')
        .update({ pinned: !msg.pinned })
        .eq('id', msg.id);
      throwIfSupabaseError(error, 'Impossible d\'épingler le message.');
      await loadAllState();
      return appState;
    }
    const allowedEmojis = ['👍', '⛵', '🛠️'];
    if (allowedEmojis.includes(body.emoji)) {
      const reactions = msg.reactions && typeof msg.reactions === 'object'
        ? JSON.parse(JSON.stringify(msg.reactions))
        : { '👍': [], '⛵': [], '🛠️': [] };
      if (!Array.isArray(reactions[body.emoji])) reactions[body.emoji] = [];
      const idx = reactions[body.emoji].indexOf(memberId);
      if (idx >= 0) reactions[body.emoji].splice(idx, 1);
      else reactions[body.emoji].push(memberId);

      const { error } = await sbClient
        .from('messages')
        .update({ reactions })
        .eq('id', msg.id);
      throwIfSupabaseError(error, 'Impossible d\'enregistrer la réaction.');
      await loadAllState();
      return appState;
    }
    throw new Error('Action invalide.');
  }

  throw new Error('Route API inconnue.');
}

function renderInlineMarkdown(escapedText) {
  return escapedText
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function renderSimpleMarkdown(mdText) {
  const lines = String(mdText || '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = '';

  const closeList = () => {
    if (inList) {
      html.push(`</${inList}>`);
      inList = '';
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }
    if (/^-{3,}$/.test(line)) {
      closeList();
      html.push('<hr style="border:0;border-top:1px solid var(--border);margin:0.8rem 0;">');
      continue;
    }
    const hMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      closeList();
      const lvl = Math.min(4, hMatch[1].length + 1);
      html.push(`<h${lvl} style="margin:0.85rem 0 0.35rem;">${renderInlineMarkdown(escapeHtml(hMatch[2]))}</h${lvl}>`);
      continue;
    }
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        html.push('<ul style="margin:0.35rem 0 0.65rem;padding-left:1.25rem;">');
      }
      html.push(`<li>${renderInlineMarkdown(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    }
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        html.push('<ol style="margin:0.35rem 0 0.65rem;padding-left:1.25rem;">');
      }
      html.push(`<li>${renderInlineMarkdown(escapeHtml(olMatch[1]))}</li>`);
      continue;
    }
    closeList();
    if (line.startsWith('&gt; ') || line.startsWith('> ')) {
      const quoteTxt = line.startsWith('> ') ? line.slice(2) : line.slice(5);
      html.push(`<blockquote style="margin:0.5rem 0;padding:0.4rem 0.75rem;border-left:4px solid var(--primary);background:var(--surface-soft);border-radius:6px;">${renderInlineMarkdown(escapeHtml(quoteTxt))}</blockquote>`);
    } else {
      html.push(`<p style="margin:0.4rem 0;">${renderInlineMarkdown(escapeHtml(line))}</p>`);
    }
  }
  closeList();
  return html.join('');
}

async function openMarkdownDocViewer(path, title) {
  $('#doc-viewer-title').textContent = `📄 ${title || 'Document officiel'}`;
  $('#doc-viewer-body').innerHTML = '<p class="muted-text">Téléchargement sécurisé depuis Supabase…</p>';
  const dlLink = $('#doc-viewer-download');
  dlLink.href = '#';
  openDialog('dialog-doc-viewer');

  try {
    const [dlRes, signedUrl] = await Promise.all([
      sbClient.storage.from(STORAGE_BUCKET).download(path),
      getSignedDocUrl(path)
    ]);
    if (dlRes.error || !dlRes.data) {
      throw new Error(dlRes.error?.message || 'Impossible de charger ce document.');
    }
    const mdText = await dlRes.data.text();
    $('#doc-viewer-body').innerHTML = renderSimpleMarkdown(mdText);
    if (signedUrl) {
      dlLink.href = signedUrl;
      dlLink.download = path.split('/').pop() || 'document.md';
    }
  } catch (err) {
    $('#doc-viewer-body').innerHTML = `<p class="error-msg">${escapeHtml(err.message)}</p>`;
  }
}

function ensureMemberSelected(callback) {
  if (!hasActiveAuthSession()) {
    openProfileDialog();
    return;
  }
  if (currentMemberId && appState?.members?.some((m) => m.id === currentMemberId)) {
    callback(currentMemberId);
    return;
  }
  openProfileDialog();
}

// Fallback obligatoire pour <dialog closedby="any"> sur navigateurs sans support natif (ex: Safari)
function setupDialogFallbacks() {
  const dialogs = $$('dialog');
  for (const dialog of dialogs) {
    dialog.addEventListener('close', () => {
      dialog.returnValue = '';
    });
  }

  if (!('closedBy' in HTMLDialogElement.prototype)) {
    for (const dialog of dialogs) {
      dialog.addEventListener('click', (event) => {
        if (dialog.getAttribute('closedby') !== 'any') return;
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  }
}

function openDialog(id) {
  const dlg = document.getElementById(id);
  if (dlg && !dlg.open) {
    dlg.showModal();
  }
}

function closeDialog(id) {
  const dlg = document.getElementById(id);
  if (dlg && dlg.open) {
    dlg.close();
  }
}

// Navigation & Aide contextuelle
function switchTab(tabName) {
  activeTab = tabName;
  for (const view of $$('.tab-view')) {
    view.hidden = view.id !== `view-${tabName}`;
  }
  for (const btn of $$('.nav-btn')) {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle('is-active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function applyHelpVisibility() {
  for (const box of $$('[data-help-box]')) {
    box.hidden = !helpEnabled;
  }
  const btn = $('#btn-toggle-help');
  if (btn) btn.setAttribute('aria-pressed', String(helpEnabled));
}

// Profil Membre & Déverrouillage collectif
function openProfileDialog() {
  const unlocked = hasActiveAuthSession();
  const hasValidMember = Boolean(
    currentMemberId && appState?.members?.some((m) => m.id === currentMemberId)
  );
  const dlg = $('#dialog-profile');
  const closeForm = $('#profile-close-form');
  const authForm = $('#collective-auth-form');
  const pickerWrap = $('#member-picker-wrap');

  $('#code-error').hidden = true;

  if (!unlocked) {
    authForm.hidden = false;
    pickerWrap.hidden = true;
    $('#profile-title').textContent = '🔐 Accès réservé au collectif';
    $('#profile-subtitle').textContent = 'Saisissez le code partagé avec les 11 co-usagers pour accéder au tableau de bord de Tombola.';
    if (closeForm) closeForm.hidden = true;
    dlg.setAttribute('closedby', 'none');
    openDialog('dialog-profile');
    setTimeout(() => $('#collective-code-input')?.focus(), 50);
    return;
  }

  authForm.hidden = true;
  pickerWrap.hidden = false;

  if (hasValidMember) {
    $('#profile-title').textContent = '✏️ Changer de prénom';
    $('#profile-subtitle').textContent = 'Votre téléphone mémorise votre prénom automatiquement. Si vous vous êtes trompé(e), touchez un autre prénom ci-dessous pour le corriger.';
    if (closeForm) closeForm.hidden = false;
    dlg.setAttribute('closedby', 'any');
  } else {
    $('#profile-title').textContent = '👋 Première visite : choisissez votre prénom';
    $('#profile-subtitle').textContent = 'Vous n\'aurez à le faire qu\'une seule fois : votre téléphone le retiendra ensuite automatiquement (modifiable en cas d\'erreur).';
    if (closeForm) closeForm.hidden = true;
    dlg.setAttribute('closedby', 'none');
  }

  renderMemberPicker();
  openDialog('dialog-profile');
}

function renderMemberPicker() {
  const grid = $('#member-picker-grid');
  if (!grid || !appState) return;

  const uploadBox = $('#avatar-upload-box');
  const validMember = currentMemberId && appState.members.find((m) => m.id === currentMemberId);
  if (uploadBox) {
    if (validMember) {
      uploadBox.hidden = false;
      const preview = $('#profile-avatar-preview');
      if (validMember.avatarUrl) {
        preview.innerHTML = `<img src="${escapeHtml(validMember.avatarUrl)}" alt="${escapeHtml(validMember.name)}" class="avatar-img">`;
        preview.style.background = 'transparent';
        $('#btn-remove-avatar').hidden = false;
      } else {
        preview.textContent = validMember.short;
        preview.style.background = validMember.color;
        $('#btn-remove-avatar').hidden = true;
      }
      $('#profile-avatar-name').textContent = validMember.name;
    } else {
      uploadBox.hidden = true;
    }
  }

  grid.innerHTML = appState.members.map((m) => `
    <button type="button" class="member-pick-btn ${m.id === currentMemberId ? 'is-selected' : ''}" data-pick-member="${escapeHtml(m.id)}">
      ${renderAvatarDotHtml(m, 34, '0.82rem')}
      <span>${escapeHtml(m.name)}</span>
    </button>
  `).join('');
}

function renderHeaderProfile() {
  const validMember = currentMemberId && appState?.members?.find((m) => m.id === currentMemberId);
  const avatar = $('#header-avatar');
  const label = $('#header-member-name');
  if (validMember) {
    if (validMember.avatarUrl) {
      avatar.innerHTML = `<img src="${escapeHtml(validMember.avatarUrl)}" alt="${escapeHtml(validMember.name)}" class="avatar-img">`;
      avatar.style.background = 'transparent';
    } else {
      avatar.textContent = validMember.short;
      avatar.style.background = validMember.color;
    }
    label.textContent = `${validMember.name} ✎`;
    $('#btn-open-profile').title = 'Se corriger / changer de prénom ou photo';
  } else {
    avatar.textContent = '?';
    avatar.style.background = '#64748b';
    label.textContent = 'Choisir prénom';
  }
}

// Rendu Onglet 1 : Bateau & Écopage & Loire
function findActiveScheduledChantier() {
  if (!appState?.bookings) return null;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return appState.bookings.find((b) => {
    if (b.type !== 'chantier') return false;
    const endDate = b.endDate || b.date;
    if (todayIso < b.date || todayIso > endDate) return false;
    const start = b.startTime || '00:00';
    const end = b.endTime || '23:59';
    return nowTime >= start && nowTime <= end;
  }) || null;
}

function isWetWeatherCode(code) {
  const c = Number(code);
  return (c >= 51 && c <= 67) || (c >= 71 && c <= 77) || (c >= 80 && c <= 86) || c >= 95;
}

function getWeatherEmoji(code, isDay = 1, precipMm = 0) {
  const c = Number(code);
  const day = Number(isDay) !== 0;
  if (Number(precipMm) >= 0.1 && c <= 3) {
    return Number(precipMm) >= 0.5 ? '🌧️' : '🌦️';
  }
  if (c === 0) return day ? '☀️' : '🌙';
  if (c === 1) return day ? '🌤️' : '🌙';
  if (c === 2) return '⛅';
  if (c === 3) return '☁️';
  if (c === 45 || c === 48) return '🌫️';
  if (c >= 51 && c <= 57) return '🌦️';
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return '🌧️';
  if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return '🌨️';
  if (c >= 95) return '⛈️';
  return '🌤️';
}

function getWindCardinalFr(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const norm = ((Number(deg || 0) % 360) + 360) % 360;
  return dirs[Math.round(norm / 45) % 8];
}

function formatClockHm(isoLocalStr) {
  const hhmm = String(isoLocalStr || '').slice(11, 16);
  return hhmm ? hhmm.replace(':', 'h') : '';
}

function formatMmFr(mm) {
  const val = Number(mm || 0);
  if (val > 0 && val < 0.1) return '<0,1';
  return val.toFixed(1).replace('.', ',');
}

function parseOpenMeteoPayload(data) {
  const current = data?.current;
  const m15 = data?.minutely_15;
  if (!current || !Array.isArray(m15?.time) || m15.time.length === 0) {
    throw new Error('Données météo incomplètes');
  }

  let startIdx = m15.time.indexOf(current.time);
  if (startIdx < 0) startIdx = 0;

  const slots = [];
  for (let step = 0; step <= 4; step++) {
    const idx = startIdx + step * 2;
    if (idx >= m15.time.length) break;

    if (step === 0) {
      const precip = Math.max(Number(current.precipitation || 0), Number(m15.precipitation?.[idx] || 0));
      slots.push({
        isNow: true,
        label: 'Maint.',
        temp: Number(current.temperature_2m ?? m15.temperature_2m?.[idx] ?? 0),
        windSpeed: Number(current.wind_speed_10m ?? m15.wind_speed_10m?.[idx] ?? 0),
        windGusts: Number(current.wind_gusts_10m ?? m15.wind_gusts_10m?.[idx] ?? 0),
        windDir: Number(current.wind_direction_10m ?? m15.wind_direction_10m?.[idx] ?? 0),
        precip,
        weatherCode: Number(current.weather_code ?? m15.weather_code?.[idx] ?? 0),
        isDay: Number(current.is_day ?? m15.is_day?.[idx] ?? 1)
      });
    } else {
      const prevIdx = Math.max(startIdx, idx - 1);
      const precip = Number(m15.precipitation?.[prevIdx] || 0) + Number(m15.precipitation?.[idx] || 0);
      const gusts = Math.max(
        Number(m15.wind_gusts_10m?.[prevIdx] || 0),
        Number(m15.wind_gusts_10m?.[idx] || 0)
      );
      const c1 = Number(m15.weather_code?.[prevIdx] ?? 0);
      const c2 = Number(m15.weather_code?.[idx] ?? 0);
      const weatherCode = (isWetWeatherCode(c1) || isWetWeatherCode(c2)) ? Math.max(c1, c2) : c2;

      slots.push({
        isNow: false,
        label: formatClockHm(m15.time[idx]),
        temp: Number(m15.temperature_2m?.[idx] ?? 0),
        windSpeed: Number(m15.wind_speed_10m?.[idx] ?? 0),
        windGusts: gusts,
        windDir: Number(m15.wind_direction_10m?.[idx] ?? 0),
        precip,
        weatherCode,
        isDay: Number(m15.is_day?.[idx] ?? 1)
      });
    }
  }

  const endWindowIdx = Math.min(m15.time.length - 1, startIdx + 8);
  const isSlotWetAt = (i) => Number(m15.precipitation?.[i] || 0) >= 0.1 || isWetWeatherCode(m15.weather_code?.[i]);
  const nowWet = slots[0] ? (slots[0].precip >= 0.1 || isWetWeatherCode(slots[0].weatherCode)) : false;

  let rainSummary;
  if (nowWet) {
    let dryFromIdx = -1;
    for (let i = startIdx + 1; i <= endWindowIdx; i++) {
      if (!isSlotWetAt(i)) {
        let staysDry = true;
        for (let j = i; j <= endWindowIdx; j++) {
          if (isSlotWetAt(j)) {
            staysDry = false;
            break;
          }
        }
        if (staysDry) {
          dryFromIdx = i;
          break;
        }
      }
    }
    rainSummary = {
      kind: 'rain',
      text: dryFromIdx >= 0
        ? `🌧️ Pluie → fin ~${formatClockHm(m15.time[dryFromIdx])}`
        : '🌧️ Pluie en cours'
    };
  } else {
    let firstWetIdx = -1;
    for (let i = startIdx + 1; i <= endWindowIdx; i++) {
      if (isSlotWetAt(i)) {
        firstWetIdx = i;
        break;
      }
    }
    rainSummary = firstWetIdx >= 0
      ? { kind: 'rain-soon', text: `🌦️ Pluie ~${formatClockHm(m15.time[firstWetIdx])}` }
      : { kind: 'dry', text: `${Number(slots[0]?.isDay) !== 0 ? '☀️' : '🌙'} Sec (2h)` };
  }

  const maxWind = Math.max(0, ...slots.map((s) => s.windSpeed));
  const maxGusts = Math.max(0, ...slots.map((s) => s.windGusts));

  return {
    fetchedAt: Date.now(),
    updatedClock: formatClockHm(current.time),
    slots,
    rainSummary,
    maxWind,
    maxGusts
  };
}

function renderWeatherCard(isOffline = false) {
  const slotsEl = $('#weather-slots');
  const rainPill = $('#weather-rain-pill');
  const windPill = $('#weather-wind-pill');
  const updatedEl = $('#weather-updated');
  if (!slotsEl || !rainPill || !windPill || !updatedEl) return;

  if (!weatherState || !Array.isArray(weatherState.slots) || weatherState.slots.length === 0) {
    rainPill.className = 'weather-pill';
    rainPill.textContent = isOffline ? '📡 Hors-ligne' : '⏳ …';
    windPill.hidden = true;
    updatedEl.textContent = '';
    slotsEl.innerHTML = `<div class="weather-loading">${
      isOffline ? '📡 Météo indisponible (hors-ligne)' : 'Chargement météo…'
    }</div>`;
    return;
  }

  const { slots, rainSummary, updatedClock, maxWind, maxGusts } = weatherState;
  rainPill.className = `weather-pill is-${rainSummary.kind}`;
  rainPill.textContent = rainSummary.text;

  if (maxGusts >= 50) {
    windPill.hidden = false;
    windPill.className = 'weather-pill is-wind-danger';
    windPill.textContent = `💨 Raf. ${Math.round(maxGusts)} km/h`;
  } else if (maxGusts >= 35 || maxWind >= 25) {
    windPill.hidden = false;
    windPill.className = 'weather-pill is-wind-warn';
    windPill.textContent = `💨 Vent ${Math.round(Math.max(maxWind, maxGusts))} km/h`;
  } else {
    windPill.hidden = true;
  }

  updatedEl.textContent = updatedClock ? `${updatedClock}${isOffline ? ' (hors-ligne)' : ''}` : '';

  slotsEl.innerHTML = slots.map((s) => {
    const speed = Math.round(s.windSpeed);
    const gusts = Math.round(s.windGusts);
    const hasGust = gusts > speed + 2;
    const isWet = s.precip >= 0.1 || isWetWeatherCode(s.weatherCode);
    const card = getWindCardinalFr(s.windDir);
    const arrowDeg = (Math.round(s.windDir) + 180) % 360;
    const ico = getWeatherEmoji(s.weatherCode, s.isDay, s.precip);
    const windLevel = gusts >= 50 || speed >= 35 ? 'is-strong' : (gusts >= 35 || speed >= 25 ? 'is-mod' : '');

    const slotClasses = ['weather-slot'];
    if (s.isNow) slotClasses.push('is-now');
    else if (isWet) slotClasses.push('is-rain');
    if (windLevel === 'is-strong') slotClasses.push('is-wind-danger');
    else if (windLevel === 'is-mod') slotClasses.push('is-wind-warn');

    const rainTxt = s.precip >= 0.1
      ? `💧 ${formatMmFr(s.precip)} mm`
      : (isWet ? '💧 Pluie' : '—');
    const aria = `${s.isNow ? 'Maintenant' : s.label}, ${Math.round(s.temp)} degrés, vent ${card} ${speed} km/h${
      hasGust ? `, rafales ${gusts} km/h` : ''
    }, ${isWet ? `pluie ${formatMmFr(s.precip)} mm` : 'pas de pluie'}`;

    return `
      <div class="${slotClasses.join(' ')}" role="listitem" aria-label="${escapeHtml(aria)}">
        <span class="w-time">${escapeHtml(s.label)}</span>
        <span class="w-ico" aria-hidden="true">${ico}</span>
        <span class="w-temp">${Math.round(s.temp)}°</span>
        <div class="w-wind">
          <span class="w-dir ${windLevel}" title="Vent venant de ${card} (${Math.round(s.windDir)}°)">
            <svg class="wind-arrow-svg" aria-hidden="true" style="transform: rotate(${arrowDeg}deg)"><use href="#icon-wind-arrow"></use></svg>
            <span>${card}</span>
          </span>
          <span class="w-speed">${speed} km/h</span>
          <span class="w-gust ${windLevel}">${hasGust ? `raf. ${gusts}` : '&nbsp;'}</span>
        </div>
        <span class="w-rain ${isWet ? 'is-wet' : 'is-dry'}">${rainTxt}</span>
      </div>
    `;
  }).join('');
}

async function fetchOpenMeteoForecast(useMeteoFrance) {
  const pelio = LOIRE_SPOTS.find((s) => s.id === 'pelio') || { lat: 47.4065, lng: 0.7552 };
  const params = new URLSearchParams({
    latitude: String(pelio.lat),
    longitude: String(pelio.lng),
    current: 'temperature_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    minutely_15: 'temperature_2m,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    wind_speed_unit: 'kmh',
    timezone: 'Europe/Paris',
    forecast_minutely_15: '12'
  });
  if (useMeteoFrance) {
    params.set('models', 'meteofrance_seamless');
  }
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return parseOpenMeteoPayload(data);
}

async function loadWeather(force = false) {
  if (!weatherState) {
    try {
      const cached = JSON.parse(localStorage.getItem(STORAGE_WEATHER_CACHE_KEY) || 'null');
      if (cached && cached.fetchedAt && Date.now() - cached.fetchedAt < WEATHER_CACHE_MAX_AGE_MS) {
        weatherState = cached;
        weatherLastFetchAt = cached.fetchedAt;
        renderWeatherCard(false);
      }
    } catch {
      // ignorer cache corrompu
    }
  }

  if (weatherFetchInFlight) return;
  if (!force && weatherLastFetchAt && Date.now() - weatherLastFetchAt < WEATHER_REFRESH_MS) {
    return;
  }

  weatherFetchInFlight = true;
  const refreshBtn = $('#btn-refresh-weather');
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.classList.add('is-loading');
  }

  try {
    let parsed;
    try {
      parsed = await fetchOpenMeteoForecast(true);
    } catch {
      parsed = await fetchOpenMeteoForecast(false);
    }
    weatherState = parsed;
    weatherLastFetchAt = parsed.fetchedAt;
    try {
      localStorage.setItem(STORAGE_WEATHER_CACHE_KEY, JSON.stringify(parsed));
    } catch {
      // ignorer quota localStorage
    }
    renderWeatherCard(false);
  } catch {
    renderWeatherCard(true);
  } finally {
    weatherFetchInFlight = false;
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove('is-loading');
    }
  }
}

function renderBoatView() {
  if (!appState) return;
  const st = appState.boatStatus;
  const scheduledChantier = st.state === 'mooring' ? findActiveScheduledChantier() : null;
  const displayState = scheduledChantier ? 'chantier' : st.state;
  const displayCrew = scheduledChantier ? scheduledChantier.participants : (st.crew || []);
  const displayNote = scheduledChantier
    ? (scheduledChantier.note || 'Chantier planifié au calendrier.')
    : (st.note || '');

  const card = $('#boat-status-card');
  const badge = $('#boat-status-badge');
  const headline = $('#boat-status-headline');
  const note = $('#boat-status-note');
  const timeEl = $('#boat-status-time');
  const crewRow = $('#boat-crew-row');
  const crewChips = $('#boat-crew-chips');

  card.className = `card status-card is-${displayState}`;
  badge.className = `status-badge is-${displayState}`;

  const stateLabels = {
    mooring: '🟢 AU PORT DU PÉLIO — Libre',
    water: '🔵 SUR L\'EAU — En navigation',
    chantier: '🟠 EN CHANTIER — Travaux'
  };
  badge.textContent = stateLabels[displayState] || 'Statut';
  timeEl.textContent = st.updatedAt ? `Màj ${formatRelativeTime(st.updatedAt)}` : '';

  if (displayState === 'mooring') {
    headline.textContent = 'Tombola est amarré au Port du Pélio';
    $('#live-dot-label').textContent = '🟢 Libre au Pélio';
  } else if (displayState === 'water') {
    const typeTxt = st.outingType === 'open'
      ? `Sortie ouverte (${st.crew.length}/${st.maxSeats} places)`
      : 'Sortie privée / famille';
    headline.textContent = `En navigation • ${typeTxt}${st.returnTime ? ` • Retour ~${st.returnTime}` : ''}`;
    $('#live-dot-label').textContent = `🔵 Sur l'eau (${st.location?.name || 'Loire'})`;
  } else if (scheduledChantier) {
    headline.textContent = `Chantier planifié en cours : ${scheduledChantier.title}`;
    $('#live-dot-label').textContent = '🟠 En chantier (planning)';
  } else {
    headline.textContent = 'Travaux / chantier en cours sur le bateau';
    $('#live-dot-label').textContent = '🟠 En chantier';
  }

  note.textContent = displayNote;

  if (displayCrew.length > 0 && displayState !== 'mooring') {
    crewRow.hidden = false;
    crewChips.innerHTML = displayCrew.map((id) => {
      const m = getMember(id);
      return `<span class="member-chip">${renderAvatarDotHtml(m, 20, '0.68rem')} ${escapeHtml(m.name)}</span>`;
    }).join('');
  } else {
    crewRow.hidden = true;
  }

  const returnBtn = $('#btn-return-pelio');
  returnBtn.textContent = st.state === 'chantier'
    ? '⚓ Chantier terminé (bateau libre au Pélio)'
    : '⚓ Le bateau est rentré au Pélio';

  $('#btn-go-water').hidden = st.state === 'water';
  returnBtn.hidden = st.state === 'mooring';
  $('#btn-update-live-pos').hidden = st.state !== 'water';

  // Schéma illustré de la Loire + position de Tombola
  const curSpot = st.location || {};
  $('#current-spot-badge').textContent = curSpot.name || 'Port du Pélio';
  const matchedSpot = appState.loireSpots.find((s) => s.id === curSpot.spotId);

  let boatCoord = LOIRE_SCHEMATIC_POINTS.find((p) => p.id === 'pelio');
  let highlightedSpotId = curSpot.spotId || 'pelio';

  if (curSpot.isGps && typeof curSpot.lng === 'number') {
    const pts = LOIRE_SCHEMATIC_POINTS;
    const clampedLng = Math.max(pts[0].lng, Math.min(pts[pts.length - 1].lng, curSpot.lng));
    for (let i = 0; i < pts.length - 1; i++) {
      if (clampedLng >= pts[i].lng && clampedLng <= pts[i + 1].lng) {
        const t = (clampedLng - pts[i].lng) / (pts[i + 1].lng - pts[i].lng || 1);
        boatCoord = {
          x: Math.round(pts[i].x + t * (pts[i + 1].x - pts[i].x)),
          y: Math.round(pts[i].y + t * (pts[i + 1].y - pts[i].y))
        };
        break;
      }
    }
    const nearest = pts.reduce((best, p) => (
      Math.abs(p.lng - curSpot.lng) < Math.abs(best.lng - curSpot.lng) ? p : best
    ), pts[0]);
    highlightedSpotId = nearest.id;
  } else {
    const exactPt = LOIRE_SCHEMATIC_POINTS.find((p) => p.id === curSpot.spotId);
    if (exactPt) boatCoord = exactPt;
  }

  const boatEl = $('#svg-tombola-boat');
  if (boatEl && boatCoord) {
    boatEl.setAttribute('transform', `translate(${boatCoord.x}, ${boatCoord.y})`);
  }

  for (const pt of LOIRE_SCHEMATIC_POINTS) {
    const dot = document.getElementById(`spot-dot-${pt.id}`);
    if (!dot) continue;
    const isHere = pt.id === highlightedSpotId;
    dot.setAttribute('r', isHere ? '8' : '6');
    dot.setAttribute('fill', isHere ? '#fef08a' : '#ffffff');
    dot.setAttribute('stroke', isHere ? '#dc2626' : '#115e67');
  }

  $('#current-spot-tip').textContent = matchedSpot
    ? `Conseil du lieu : ${matchedSpot.tip}`
    : `Position GPS reçue : ${curSpot.name || 'sur la Loire'}.`;

  syncAutoGpsWatcher();

  // Écopage hebdomadaire
  const eco = appState.ecopage;
  const respId = eco.rotationOrder[eco.currentIndex] || 'fred';
  const resp = getMember(respId);
  const ecoAvatar = $('#ecopage-avatar');
  if (resp.avatarUrl) {
    ecoAvatar.innerHTML = `<img src="${escapeHtml(resp.avatarUrl)}" alt="${escapeHtml(resp.name)}" class="avatar-img">`;
    ecoAvatar.style.background = 'transparent';
  } else {
    ecoAvatar.textContent = resp.short;
    ecoAvatar.style.background = resp.color;
  }
  $('#ecopage-who').textContent = respId === currentMemberId
    ? `Responsable cette semaine : ${resp.name} (C'est votre tour !)`
    : `Responsable cette semaine : ${resp.name}`;
  if (eco.lastCheckedBy && eco.lastCheckedAt) {
    const lastBy = getMember(eco.lastCheckedBy);
    $('#ecopage-last').textContent = `Dernière visite : par ${lastBy.name} (${formatRelativeTime(eco.lastCheckedAt)})`;
  } else {
    $('#ecopage-last').textContent = 'Dernière visite : aucune pour le moment (démarrage après chantier)';
  }
  $('#ecopage-note').textContent = eco.stateNote || 'Aucun commentaire.';
  $('#ecopage-rotation-list').innerHTML = eco.rotationOrder.map((id, idx) => {
    const m = getMember(id);
    return `<li>${idx === eco.currentIndex ? '👉 <strong>' + escapeHtml(m.name) + ' (cette semaine)</strong>' : escapeHtml(m.name)}</li>`;
  }).join('');
}

// Rendu Onglet 2 : Planning (Liste / Semaine / Mois)
function toLocalIsoDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getMondayOfWeek(d) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function bookingCoversDate(booking, isoDate) {
  const end = booking.endDate || booking.date;
  return isoDate >= booking.date && isoDate <= end;
}

function getFilteredBookings() {
  return (appState?.bookings || []).filter((b) => {
    if (activeBookingFilter === 'chantier') return b.type === 'chantier';
    if (activeBookingFilter === 'navigation') return b.type !== 'chantier';
    if (activeBookingFilter === 'available') return b.type !== 'private' && b.participants.length < b.maxSeats;
    return true;
  });
}

function renderBookingActionButtons(b, compact = false) {
  const isJoined = currentMemberId && b.participants.includes(currentMemberId);
  const spotsLeft = Math.max(0, b.maxSeats - b.participants.length);
  const btnSize = compact ? 'btn-sm' : '';

  let actionBtn = '';
  if (b.type !== 'private') {
    if (isJoined) {
      actionBtn = `<button type="button" class="btn btn-secondary ${btnSize}" data-toggle-join="${escapeHtml(b.id)}">✓ Inscrit (me retirer)</button>`;
    } else if (spotsLeft > 0) {
      const label = b.type === 'chantier' ? '🛠️ Je viens aider !' : `✋ Je monte à bord ! (${spotsLeft} pl.)`;
      actionBtn = `<button type="button" class="btn btn-green ${btnSize}" data-toggle-join="${escapeHtml(b.id)}">${label}</button>`;
    } else {
      actionBtn = `<span class="badge-soft">Complet (${b.maxSeats}/${b.maxSeats})</span>`;
    }
  }

  const chantierLiveBtn = b.type === 'chantier'
    ? (appState.boatStatus.state === 'chantier' && (appState.boatStatus.note || '').includes(b.title)
        ? `<span class="badge-pill badge-chantier">🟠 Chantier en direct</span>`
        : `<button type="button" class="btn btn-outline btn-sm" data-activate-chantier="${escapeHtml(b.id)}">🟠 Activer en direct</button>`)
    : '';

  return `
    <div class="inline-actions">
      ${actionBtn}
      ${chantierLiveBtn}
      <button type="button" class="btn btn-outline btn-sm" data-delete-booking="${escapeHtml(b.id)}">🗑️ Annuler</button>
    </div>
  `;
}

function renderBookingCardHtml(b) {
  const weekend = isWeekendDate(b.date);

  let typeBadge = `<span class="badge-pill badge-open">${BOAT_ICO} Sortie ouverte</span>`;
  if (b.type === 'private') typeBadge = '<span class="badge-pill badge-private">👨‍👩‍👧 Privée / Famille</span>';
  if (b.type === 'chantier') typeBadge = '<span class="badge-pill badge-chantier">🛠️ Chantier</span>';

  let rarityBadge = '';
  if (b.type !== 'chantier') {
    rarityBadge = (weekend && !b.isLastMinute)
      ? '<span class="badge-pill badge-rare">🔴 Week-end précieux</span>'
      : '<span class="badge-pill badge-free">🟢 Semaine / libre</span>';
  }

  const dateText = b.endDate && b.endDate !== b.date
    ? `Du ${formatDateFr(b.date)} au ${formatDateFr(b.endDate)}`
    : `${formatDateFr(b.date)} • ${b.startTime}–${b.endTime}`;

  const participantsHtml = b.participants.map((id) => {
    const m = getMember(id);
    return `<span class="member-chip">${renderAvatarDotHtml(m, 20, '0.68rem')} ${escapeHtml(m.name)}</span>`;
  }).join('');

  return `
    <article class="card booking-card type-${escapeHtml(b.type)}">
      <div class="booking-badges">
        ${typeBadge}
        ${rarityBadge}
      </div>
      <div class="booking-meta">${escapeHtml(dateText)}</div>
      <h3>${escapeHtml(b.title)}</h3>
      ${b.note ? `<p class="muted-text">${escapeHtml(b.note)}</p>` : ''}
      <div class="crew-row">
        <span class="crew-label">${b.participants.length}/${b.maxSeats} inscrits :</span>
        <div class="chip-group">${participantsHtml}</div>
      </div>
      ${renderBookingActionButtons(b)}
    </article>
  `;
}

function renderWeekPlanning(items) {
  const weekEl = $('#planning-week-view');
  const monday = getMondayOfWeek(planningAnchorDate);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
  const todayIso = toLocalIsoDate(new Date());

  $('#planning-period-title').textContent = `Semaine du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;

  const dayCards = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const iso = toLocalIsoDate(d);
    const isToday = iso === todayIso;
    const isWk = d.getDay() === 0 || d.getDay() === 6;
    const dayItems = items.filter((b) => bookingCoversDate(b, iso));

    const label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    const bookingsHtml = dayItems.length === 0
      ? '<p class="week-empty">Libre — aucune sortie prévue</p>'
      : dayItems.map((b) => {
          const badge = b.type === 'chantier' ? '🛠️ Chantier' : (b.type === 'private' ? '👨‍👩‍👧 Privée' : `${BOAT_ICO} Ouverte (${b.participants.length}/${b.maxSeats})`);
          const names = b.participants.map((id) => getMember(id).name).join(', ');
          return `
            <div class="week-booking-mini type-${escapeHtml(b.type)}">
              <div style="display:flex;justify-content:space-between;gap:0.4rem;flex-wrap:wrap;font-size:0.86rem;">
                <strong>${escapeHtml(b.startTime)}–${escapeHtml(b.endTime)} • ${badge}</strong>
                <span class="muted-text">${escapeHtml(names)}</span>
              </div>
              <div style="font-weight:700;margin:0.2rem 0 0.45rem;">${escapeHtml(b.title)}</div>
              ${renderBookingActionButtons(b, true)}
            </div>
          `;
        }).join('');

    dayCards.push(`
      <div class="week-day-card ${isToday ? 'is-today' : ''} ${isWk ? 'is-weekend' : ''}">
        <div class="week-day-head">
          <span class="week-day-name">${escapeHtml(label)} ${isToday ? '<span class="badge-pill badge-open">Aujourd\'hui</span>' : ''}</span>
          <button type="button" class="btn btn-outline btn-sm" data-new-booking-date="${iso}">+ Réserver</button>
        </div>
        ${bookingsHtml}
      </div>
    `);
  }
  weekEl.innerHTML = dayCards.join('');
}

function renderMonthPlanning(items) {
  const year = planningAnchorDate.getFullYear();
  const month = planningAnchorDate.getMonth();
  const todayIso = toLocalIsoDate(new Date());
  if (!selectedMonthDate) selectedMonthDate = todayIso;

  $('#planning-period-title').textContent = planningAnchorDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push('<div class="month-cell-blank" aria-hidden="true"></div>');
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const d = new Date(year, month, dayNum);
    const iso = toLocalIsoDate(d);
    const isWk = d.getDay() === 0 || d.getDay() === 6;
    const isToday = iso === todayIso;
    const isSel = iso === selectedMonthDate;
    const dayItems = items.filter((b) => bookingCoversDate(b, iso));

    const dotsHtml = dayItems.slice(0, 3).map((b) => {
      const color = b.type === 'chantier' ? 'var(--amber)' : (b.type === 'private' ? '#64748b' : 'var(--green)');
      return `<span class="dot" style="background:${color};width:8px;height:8px"></span>`;
    }).join('');

    const miniLbl = dayItems[0]
      ? `<span class="month-mini-lbl" style="background:${dayItems[0].type === 'chantier' ? 'var(--amber-soft)' : 'var(--green-soft)'}">${escapeHtml(dayItems[0].title)}</span>`
      : '';

    cells.push(`
      <button type="button" class="month-cell ${isWk ? 'is-weekend' : ''} ${isToday ? 'is-today' : ''} ${isSel ? 'is-selected' : ''}" data-select-day="${iso}">
        <span class="month-day-num">${dayNum}</span>
        ${dotsHtml ? `<span class="month-dots">${dotsHtml}</span>` : ''}
        ${miniLbl}
      </button>
    `);
  }

  $('#month-grid').innerHTML = cells.join('');

  const selDateObj = new Date(`${selectedMonthDate}T12:00:00`);
  const selTitle = selDateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const selItems = items.filter((b) => bookingCoversDate(b, selectedMonthDate));

  $('#planning-day-detail').innerHTML = `
    <div class="inline-between" style="margin-top:0.2rem;margin-bottom:0.2rem;">
      <h3 style="margin:0;text-transform:capitalize;">📅 ${escapeHtml(selTitle)}</h3>
      <button type="button" class="btn btn-primary btn-sm" data-new-booking-date="${escapeHtml(selectedMonthDate)}">+ Réserver ce jour</button>
    </div>
    ${selItems.length > 0
      ? selItems.map((b) => renderBookingCardHtml(b)).join('')
      : '<div class="card"><p class="muted-text" style="margin:0">Journée libre — touchez « + Réserver ce jour » pour proposer une sortie ou un chantier.</p></div>'}
  `;
}

function computePriorityStats() {
  const cfg = appState?.priorityConfig || {
    weekdayPerHour: 1,
    weekendPerHour: 2.5,
    openDiscount: 0.5,
    lastMinuteFree: true,
    includeChantier: false
  };
  const stats = new Map();
  for (const m of appState?.members || []) {
    stats.set(m.id, { member: m, weekH: 0, weekendH: 0, waterH: 0, chantierH: 0, units: 0 });
  }

  for (const b of appState?.bookings || []) {
    const h = calcBookingHours(b);
    const wk = isWeekendDate(b.date);
    for (const pid of b.participants) {
      const s = stats.get(pid);
      if (!s) continue;
      if (b.type === 'chantier') {
        s.chantierH += h;
        if (cfg.includeChantier) {
          s.units -= h * 0.5;
        }
      } else {
        s.waterH += h;
        if (wk) s.weekendH += h;
        else s.weekH += h;
        if (!(cfg.lastMinuteFree && b.isLastMinute)) {
          const rate = wk ? cfg.weekendPerHour : cfg.weekdayPerHour;
          const mult = b.type === 'open' ? (1 - cfg.openDiscount) : 1;
          s.units += h * rate * mult;
        }
      }
    }
  }

  const ordered = Array.from(stats.values()).sort((a, b) => {
    if (Math.abs(a.units - b.units) > 0.01) return a.units - b.units;
    if (Math.abs(b.chantierH - a.chantierH) > 0.01) return b.chantierH - a.chantierH;
    return a.member.name.localeCompare(b.member.name, 'fr');
  });

  return { cfg, stats, ordered };
}

function renderPriorityOrder() {
  if (!appState) return;
  const listEl = $('#priority-order-list');
  if (!listEl) return;

  const { cfg, ordered } = computePriorityStats();
  listEl.innerHTML = ordered.map((s, idx) => {
    const unitsTxt = `${s.units.toFixed(1)} u`;
    const details = `Eau ${s.waterH.toFixed(1)}h (sem. ${s.weekH.toFixed(1)}h / WE ${s.weekendH.toFixed(1)}h) • Chantier ${s.chantierH.toFixed(1)}h`;
    return `
      <li class="priority-item">
        <div style="display:flex;align-items:center;gap:0.5rem;min-width:0;">
          <span class="priority-rank">#${idx + 1}</span>
          ${renderAvatarDotHtml(s.member, 26, '0.72rem')}
          <div style="min-width:0;">
            <div><strong>${escapeHtml(s.member.name)}</strong></div>
            <div class="muted-text" style="font-size:0.8rem;">${details}</div>
          </div>
        </div>
        <span class="badge-soft">${escapeHtml(unitsTxt)}</span>
      </li>
    `;
  }).join('');

  if (document.activeElement?.closest('#form-priority-config')) return;
  if ($('#prio-weekday')) $('#prio-weekday').value = String(cfg.weekdayPerHour);
  if ($('#prio-weekend')) $('#prio-weekend').value = String(cfg.weekendPerHour);
  if ($('#prio-open-discount')) $('#prio-open-discount').value = String(cfg.openDiscount);
  if ($('#prio-last-minute')) $('#prio-last-minute').checked = Boolean(cfg.lastMinuteFree);
  if ($('#prio-include-chantier')) $('#prio-include-chantier').checked = Boolean(cfg.includeChantier);
}

function renderPlanningView() {
  if (!appState) return;
  const items = getFilteredBookings();
  const listEl = $('#bookings-list');
  const weekEl = $('#planning-week-view');
  const monthEl = $('#planning-month-view');
  const periodBar = $('#planning-period-bar');

  for (const btn of $$('#planning-view-switch .view-tab')) {
    btn.classList.toggle('is-active', btn.dataset.planview === activePlanningView);
  }

  listEl.hidden = activePlanningView !== 'list';
  weekEl.hidden = activePlanningView !== 'week';
  monthEl.hidden = activePlanningView !== 'month';
  periodBar.hidden = activePlanningView === 'list';

  if (activePlanningView === 'list') {
    if (items.length === 0) {
      listEl.innerHTML = `<div class="card"><p class="muted-text">Aucun créneau dans cette catégorie pour le moment. Touchez le bouton ci-dessus pour en proposer un !</p></div>`;
    } else {
      listEl.innerHTML = items.map((b) => renderBookingCardHtml(b)).join('');
    }
  } else if (activePlanningView === 'week') {
    renderWeekPlanning(items);
  } else {
    renderMonthPlanning(items);
  }

  renderPriorityOrder();
}

// Rendu Onglet 3 : Essence & Mesure en heures
function renderFuelCrewPicker() {
  const container = $('#fuel-crew-picker');
  if (!container || !appState) return;
  container.innerHTML = appState.members.map((m) => {
    const checked = selectedFuelCrewSet.has(m.id);
    return `<button type="button" class="crew-toggle ${checked ? 'is-checked' : ''}" data-toggle-fuel-crew="${escapeHtml(m.id)}">${checked ? '✓ ' : ''}${escapeHtml(m.name)}</button>`;
  }).join('');
}

function renderEssenceView() {
  if (!appState) return;
  const fuel = appState.fuel;
  const fuelKg = Math.max(0, fuel.currentWeightKg - fuel.emptyTankKg);
  const litersLeft = Number((fuelKg / fuel.densityKgPerL).toFixed(1));
  const maxLiters = Number(((fuel.fullTankKg - fuel.emptyTankKg) / fuel.densityKgPerL).toFixed(1));
  const pct = Math.max(4, Math.min(100, Math.round((litersLeft / maxLiters) * 100)));

  $('#fuel-remaining-liters').textContent = `~${litersLeft} L restants`;
  $('#fuel-current-kg').textContent = `Poids actuel : ${fuel.currentWeightKg.toFixed(2)} kg`;
  $('#fuel-gauge-fill').style.width = `${pct}%`;

  const isScale = fuel.mode === 'scale';
  $('#fuel-mode-badge').textContent = isScale ? 'Option 1 : Peson' : 'Option 2 : Repère';
  $('#btn-mode-scale').classList.toggle('is-active', isScale);
  $('#btn-mode-mark').classList.toggle('is-active', !isScale);
  $('#fuel-mode-desc').textContent = isScale
    ? 'Option 1 activée : accrochez et soulevez la nourrice dans le vide au peson numérique au départ et au retour (densité : 0,75 kg/L).'
    : 'Option 2 activée : chacun refait le plein jusqu\'au repère depuis les bidons à La Rabouilleuse (vous pouvez quand même noter vos litres ici).';

  // Sélecteur de balade du planning & pré-remplissage des co-usagers
  const navBookings = appState.bookings.filter((b) => b.type !== 'chantier');
  const lastCrew = (appState.boatStatus.state === 'water' && appState.boatStatus.crew?.length)
    ? appState.boatStatus.crew
    : (appState.boatStatus.lastWaterCrew || []);
  const bookingSelect = $('#fuel-booking-select');
  const prevChoice = bookingSelect.value;

  const opts = ['<option value="">Saisie libre (cocher les co-usagers ci-dessous)</option>'];
  if (lastCrew.length > 0) {
    const names = lastCrew.map((id) => getMember(id).name).join(', ');
    opts.push(`<option value="__last__">Dernière sortie sur l'eau (${escapeHtml(names)})</option>`);
  }
  for (const b of navBookings) {
    opts.push(`<option value="${escapeHtml(b.id)}">${escapeHtml(formatDateFr(b.date))} — ${escapeHtml(b.title)} (${b.participants.length} co-usagers)</option>`);
  }
  bookingSelect.innerHTML = opts.join('');
  if (prevChoice && Array.from(bookingSelect.options).some((o) => o.value === prevChoice)) {
    bookingSelect.value = prevChoice;
  }

  if (!fuelCrewInitialized) {
    if (lastCrew.length > 0) {
      selectedFuelCrewSet = new Set(lastCrew);
      if (Array.from(bookingSelect.options).some((o) => o.value === '__last__')) {
        bookingSelect.value = '__last__';
      }
    } else if (currentMemberId) {
      selectedFuelCrewSet = new Set([currentMemberId]);
    }
    fuelCrewInitialized = true;
  }
  renderFuelCrewPicker();

  const startInput = $('#fuel-start-kg');
  if (!startInput.value || document.activeElement !== startInput) {
    startInput.value = fuel.currentWeightKg.toFixed(2);
  }
  updateFuelLivePreview();

  // Résumé par co-usager (division automatique par le nombre de participants de chaque balade)
  const byMember = new Map();
  for (const log of fuel.logs) {
    if (log.kind !== 'outing') continue;
    const shareUsers = (Array.isArray(log.participants) && log.participants.length > 0)
      ? log.participants
      : [log.memberId];
    const shareCount = Math.max(1, shareUsers.length);
    for (const uid of shareUsers) {
      const prev = byMember.get(uid) || { liters: 0, eur: 0 };
      prev.liters += log.litersUsed / shareCount;
      prev.eur += log.costEur / shareCount;
      byMember.set(uid, prev);
    }
  }
  const summaryHtml = Array.from(byMember.entries())
    .sort((a, b) => b[1].liters - a[1].liters)
    .map(([id, tot]) => {
      const m = getMember(id);
      return `<span class="member-chip"><strong>${escapeHtml(m.name)}</strong> : ${tot.liters.toFixed(2)} L (~${tot.eur.toFixed(2)} €)</span>`;
    }).join('');
  $('#fuel-member-summary').innerHTML = summaryHtml || '<span class="muted-text">Aucune consommation enregistrée pour l\'instant.</span>';

  $('#fuel-logs-list').innerHTML = fuel.logs.map((l) => {
    const m = getMember(l.memberId);
    const shareUsers = (Array.isArray(l.participants) && l.participants.length > 0)
      ? l.participants
      : [l.memberId];
    const shareNames = shareUsers.map((id) => getMember(id).name).join(', ');
    let title = '';
    if (l.kind === 'refill') {
      title = `⛽ Plein ajouté (+${Math.abs(l.litersUsed).toFixed(1)} L)`;
    } else if (shareUsers.length > 1) {
      const perPersonL = (l.litersUsed / shareUsers.length).toFixed(2);
      const perPersonEur = (l.costEur / shareUsers.length).toFixed(2);
      title = `${BOAT_ICO} ${l.litersUsed.toFixed(2)} L (~${l.costEur.toFixed(2)} €) ÷ ${shareUsers.length} = ${perPersonL} L (~${perPersonEur} €)/pers. • ${l.startKg} → ${l.endKg} kg`;
    } else {
      title = `${BOAT_ICO} ${l.litersUsed.toFixed(2)} L (~${l.costEur.toFixed(2)} €) — ${l.startKg} → ${l.endKg} kg`;
    }
    return `
      <li class="log-item">
        <div><strong>${escapeHtml(shareUsers.length > 1 ? shareNames : m.name)}</strong> (${escapeHtml(formatDateFr(l.date))}) : ${title}</div>
        ${l.note ? `<div class="muted-text">${escapeHtml(l.note)}</div>` : ''}
      </li>
    `;
  }).join('');

  // Mesure en heures passées sur l'eau et au chantier (Mode test sans points)
  const hoursByMember = new Map();
  for (const m of appState.members) {
    hoursByMember.set(m.id, { weekH: 0, weekendH: 0, waterH: 0, chantierH: 0 });
  }
  for (const b of appState.bookings) {
    const h = calcBookingHours(b);
    const wk = isWeekendDate(b.date);
    for (const pid of b.participants) {
      const s = hoursByMember.get(pid);
      if (!s) continue;
      if (b.type === 'chantier') {
        s.chantierH += h;
      } else {
        s.waterH += h;
        if (wk) s.weekendH += h;
        else s.weekH += h;
      }
    }
  }

  const maxH = Math.max(4, ...Array.from(hoursByMember.values()).map((s) => Math.max(s.waterH, s.chantierH)));
  $('#equity-bars-list').innerHTML = Array.from(hoursByMember.entries())
    .sort((a, b) => (b[1].waterH + b[1].chantierH) - (a[1].waterH + a[1].chantierH))
    .map(([id, s]) => {
      const m = getMember(id);
      const waterPct = Math.min(100, Math.round((s.waterH / maxH) * 100));
      const chantierPct = Math.min(100, Math.round((s.chantierH / maxH) * 100));
      return `
        <div class="equity-row">
          <div class="equity-row-top">
            <span><strong>${escapeHtml(m.name)}</strong></span>
            <span class="muted-text">${BOAT_ICO} Eau : <strong>${s.waterH.toFixed(1)}h</strong> (sem. ${s.weekH.toFixed(1)}h / WE ${s.weekendH.toFixed(1)}h) • 🛠️ Chantier : <strong>${s.chantierH.toFixed(1)}h</strong></span>
          </div>
          <div class="dual-bars">
            <div class="equity-bar-track" title="Heures sur l'eau"><div class="equity-bar-fill" style="width:${waterPct}%"></div></div>
            <div class="equity-bar-track" title="Heures au chantier"><div class="equity-bar-fill is-chantier" style="width:${chantierPct}%"></div></div>
          </div>
        </div>
      `;
    }).join('');
}

function updateFuelLivePreview() {
  if (!appState) return;
  const rawStart = ($('#fuel-start-kg').value || '').replace(',', '.');
  const rawEnd = ($('#fuel-end-kg').value || '').replace(',', '.');
  const startKg = parseFloat(rawStart);
  const endKg = parseFloat(rawEnd);
  const preview = $('#fuel-live-preview');

  if (!Number.isFinite(startKg) || !Number.isFinite(endKg)) {
    preview.textContent = 'Tapez le poids au retour (ex : 8.1) pour voir le calcul et le partage.';
    return;
  }
  if (endKg > startKg) {
    preview.textContent = '⚠️ Le poids au retour doit être inférieur ou égal au poids au départ.';
    return;
  }
  const kgUsed = startKg - endKg;
  const liters = kgUsed / appState.fuel.densityKgPerL;
  const cost = liters * appState.fuel.pricePerLiter;
  const shareCount = Math.max(1, selectedFuelCrewSet.size);
  if (shareCount > 1) {
    const perL = (liters / shareCount).toFixed(2);
    const perEur = (cost / shareCount).toFixed(2);
    preview.innerHTML = `Total : ${kgUsed.toFixed(2)} kg = ${liters.toFixed(2)} L (~${cost.toFixed(2)} €) → divisé entre <strong>${shareCount} co-usagers</strong> : <strong>${perL} L (~${perEur} €) par personne</strong>.`;
  } else {
    preview.textContent = `Calcul automatique : ${kgUsed.toFixed(2)} kg utilisés = ${liters.toFixed(2)} Litres (environ ${cost.toFixed(2)} €).`;
  }
}

// Rendu Onglet 4 : Vie quotidienne (9 dossiers façon Drive)
function switchDocsSubtab(subtab) {
  activeDocsTab = subtab;
  for (const b of $$('#docs-subtabs [data-docstab]')) {
    b.classList.toggle('is-active', b.dataset.docstab === activeDocsTab);
  }
  for (const pane of $$('.doc-pane')) {
    pane.hidden = pane.id !== `doc-pane-${activeDocsTab}`;
  }
}

function renderGuideAccordionHtml(guides, groupName) {
  return guides.map((g, idx) => `
    <details class="guide-details" name="${escapeHtml(groupName)}" ${idx === 0 ? 'open' : ''}>
      <summary>${g.icon === '⛵' ? BOAT_ICO : escapeHtml(g.icon)} ${escapeHtml(g.title)}</summary>
      <p class="muted-text" style="margin-top:0.5rem">${escapeHtml(g.summary)}</p>
      <ol class="guide-steps">
        ${g.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
      </ol>
    </details>
  `).join('');
}

function renderCharteView() {
  if (!appState) return;

  // 1. Journal de navigation (100 % nav)
  const entries = appState.logbookEntries || [];
  $('#logbook-list').innerHTML = entries.length === 0
    ? '<div class="card"><p class="muted-text" style="margin:0">Aucune navigation racontée pour l\'instant. Touchez « + Raconter une navigation » !</p></div>'
    : entries.map((entry) => {
        const author = getMember(entry.authorId);
        const crewChips = (entry.crew || [entry.authorId]).map((id) => {
          const m = getMember(id);
          return `<span class="member-chip">${renderAvatarDotHtml(m, 20, '0.68rem')} ${escapeHtml(m.name)}</span>`;
        }).join('');
        return `
          <article class="card">
            <div class="card-head">
              <span class="badge-soft">📅 ${escapeHtml(formatDateFr(entry.date))}</span>
              ${entry.weather ? `<span class="badge-pill badge-open">${escapeHtml(entry.weather)}</span>` : ''}
            </div>
            <h3>${escapeHtml(entry.title)}</h3>
            <p>${escapeHtml(entry.story)}</p>
            ${entry.boatNotes ? `<div class="logbook-notes"><strong>⛵ Notes nav / bateau :</strong> ${escapeHtml(entry.boatNotes)}</div>` : ''}
            ${entry.imageData ? `<img src="${entry.imageData}" alt="Souvenir de ${escapeHtml(entry.title)}" class="msg-photo" loading="lazy">` : ''}
            <div class="crew-row" style="margin-top:0.75rem;margin-bottom:0;">
              <span class="crew-label">Récit de ${escapeHtml(author.name)} • Équipage :</span>
              <div class="chip-group">${crewChips}</div>
            </div>
          </article>
        `;
      }).join('');

  // 2. To-Do & Liste de courses
  const todos = (appState.todos || []).filter((t) => {
    if (activeTodoFilter === 'open') return !t.done;
    if (activeTodoFilter === 'course') return t.kind === 'course';
    if (activeTodoFilter === 'tache') return t.kind === 'tache';
    return true;
  });
  $('#todos-list').innerHTML = todos.length === 0
    ? '<div class="card"><p class="muted-text" style="margin:0">Rien à afficher dans cette vue pour le moment.</p></div>'
    : todos.map((t) => {
        const author = getMember(t.authorId);
        const doneBy = t.doneBy ? getMember(t.doneBy).name : '';
        const badge = t.kind === 'course'
          ? '<span class="badge-pill badge-free">🛒 Achat / Course</span>'
          : '<span class="badge-pill badge-chantier">🛠️ Tâche</span>';
        return `
          <article class="card todo-item ${t.done ? 'is-done' : ''}">
            <div style="display:flex;align-items:flex-start;gap:0.75rem;min-width:0;flex:1;">
              <button type="button" class="todo-check-btn" data-toggle-todo="${escapeHtml(t.id)}" aria-label="${t.done ? 'Marquer à faire' : 'Marquer fait'}">${t.done ? '✓' : ''}</button>
              <div style="min-width:0;flex:1;">
                <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-bottom:0.25rem;">
                  ${badge}
                  <span class="muted-text" style="font-size:0.82rem;">Ajouté par ${escapeHtml(author.name)}</span>
                </div>
                <div class="todo-title" style="font-weight:700;">${escapeHtml(t.title)}</div>
                ${t.note ? `<p class="muted-text" style="margin:0.25rem 0 0;font-size:0.88rem;">${escapeHtml(t.note)}</p>` : ''}
                ${t.done && doneBy ? `<p class="muted-text" style="margin:0.25rem 0 0;font-size:0.82rem;">✅ Fait par ${escapeHtml(doneBy)}</p>` : ''}
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" data-delete-todo="${escapeHtml(t.id)}" aria-label="Supprimer">🗑️</button>
          </article>
        `;
      }).join('');

  // 3. Charte interne
  $('#charter-list').innerHTML = appState.charterSections.map((sec) => {
    const author = getMember(sec.updatedBy);
    const historyHtml = (sec.history || []).map((h) => {
      const hm = getMember(h.authorId);
      return `<li><strong>${escapeHtml(hm.name)}</strong> (${formatRelativeTime(h.date)}) : ${escapeHtml(h.note)}</li>`;
    }).join('');

    return `
      <article class="card">
        <div class="card-head">
          <h3>${escapeHtml(sec.title)}</h3>
          <button type="button" class="btn btn-outline btn-sm" data-edit-charter="${escapeHtml(sec.id)}">✏️ Modifier</button>
        </div>
        <p>${escapeHtml(sec.content)}</p>
        <p class="muted-text">Dernière mise à jour par <strong>${escapeHtml(author.name)}</strong> (${formatRelativeTime(sec.updatedAt)})</p>
        ${historyHtml ? `
          <details class="mini-details">
            <summary>Historique des modifications (${(sec.history || []).length})</summary>
            <ul class="clean-list">${historyHtml}</ul>
          </details>
        ` : ''}
      </article>
    `;
  }).join('');

  // 4. Frigo à idées
  const statusLabels = {
    discussion: '💬 En discussion',
    test: '🧪 En test',
    acte: '✅ Acté !'
  };

  $('#ideas-list').innerHTML = appState.ideas.length === 0
    ? '<div class="card"><p class="muted-text" style="margin:0">Le frigo est vide pour le moment. Touchez « 💡 Poser une idée » pour lancer une suggestion !</p></div>'
    : appState.ideas.map((idea) => {
        const author = getMember(idea.authorId);
        const hasVoted = currentMemberId && idea.votes.includes(currentMemberId);
        return `
          <article class="card">
            <div class="card-head">
              <span class="badge-soft">${statusLabels[idea.status] || idea.status}</span>
              <span class="muted-text">Proposé par ${escapeHtml(author.name)}</span>
            </div>
            <h3>${escapeHtml(idea.title)}</h3>
            ${idea.description ? `<p class="muted-text">${escapeHtml(idea.description)}</p>` : ''}
            <div class="inline-actions">
              <button type="button" class="btn ${hasVoted ? 'btn-primary' : 'btn-outline'} btn-sm" data-vote-idea="${escapeHtml(idea.id)}">
                👍 Moi aussi (${idea.votes.length})
              </button>
              <button type="button" class="btn btn-outline btn-sm" data-cycle-idea="${escapeHtml(idea.id)}">
                🔄 Changer statut
              </button>
            </div>
          </article>
        `;
      }).join('');

  // 5. Convention La Rabouilleuse (docs collaboratifs)
  const docStatusLabels = {
    draft: '📝 Brouillon',
    review: '💬 En relecture',
    validated: '✅ Validé'
  };
  const docs = appState.collabDocs || [];
  $('#collab-docs-list').innerHTML = docs.length === 0
    ? '<div class="card"><p class="muted-text" style="margin:0">Aucun document pour l\'instant.</p></div>'
    : docs.map((doc) => {
        const updAuthor = getMember(doc.updatedBy);
        const proposals = doc.proposals || [];
        const proposalsHtml = proposals.length === 0
          ? '<p class="muted-text" style="margin:0.35rem 0 0;">Aucune proposition supplémentaire pour l\'instant.</p>'
          : proposals.map((p) => {
              const pAuthor = getMember(p.authorId);
              const votes = Array.isArray(p.votes) ? p.votes : [];
              const hasVoted = currentMemberId && votes.includes(currentMemberId);
              return `
                <div class="proposal-item ${p.integrated ? 'is-integrated' : ''}">
                  <div class="proposal-head">
                    <div style="display:flex;align-items:center;gap:0.35rem;">
                      ${renderAvatarDotHtml(pAuthor, 22, '0.68rem')}
                      <strong>${escapeHtml(pAuthor.name)}</strong>
                      <span class="muted-text">• ${formatRelativeTime(p.createdAt)}</span>
                    </div>
                    ${p.integrated ? '<span class="badge-pill badge-open">✅ Intégrée</span>' : ''}
                  </div>
                  <p style="margin:0 0 0.45rem;">${escapeHtml(p.text)}</p>
                  <div class="inline-actions">
                    <button type="button" class="react-btn ${hasVoted ? 'is-active' : ''}" data-vote-proposal="${escapeHtml(doc.id)}|${escapeHtml(p.id)}">👍 D'accord (${votes.length})</button>
                    <button type="button" class="react-btn ${p.integrated ? 'is-active' : ''}" data-integrate-proposal="${escapeHtml(doc.id)}|${escapeHtml(p.id)}">${p.integrated ? '✓ Intégrée' : '✅ Marquer intégré'}</button>
                  </div>
                </div>
              `;
            }).join('');

        const historyHtml = (doc.history || []).map((h) => {
          const hm = getMember(h.authorId);
          return `<li><strong>${escapeHtml(hm.name)}</strong> (${formatRelativeTime(h.date)}) : ${escapeHtml(h.note)}</li>`;
        }).join('');

        return `
          <article class="card">
            <div class="card-head">
              <button type="button" class="badge-soft" style="border:1px solid var(--border);cursor:pointer;" data-cycle-doc="${escapeHtml(doc.id)}" title="Cliquer pour changer le statut">${docStatusLabels[doc.status] || doc.status} 🔄</button>
              <span class="muted-text">Dernière édit : <strong>${escapeHtml(updAuthor.name)}</strong></span>
            </div>
            <h3>${escapeHtml(doc.title)}</h3>
            <p>${escapeHtml(doc.content)}</p>
            <div class="inline-actions">
              <button type="button" class="btn btn-outline btn-sm" data-edit-collab-doc="${escapeHtml(doc.id)}">✏️ Éditer le document</button>
              <button type="button" class="btn btn-secondary btn-sm" data-add-proposal="${escapeHtml(doc.id)}">+ Ajouter une proposition</button>
            </div>

            <div class="proposals-box">
              <strong>💡 Propositions supplémentaires (${proposals.length})</strong>
              ${proposalsHtml}
            </div>

            ${historyHtml ? `
              <details class="mini-details">
                <summary>Historique des modifications (${(doc.history || []).length})</summary>
                <ul class="clean-list">${historyHtml}</ul>
              </details>
            ` : ''}
          </article>
        `;
      }).join('');

  // 6 & 7. Sécurité à bord & Fiches techniques
  const safetyGuides = appState.guides.filter((g) => g.section === 'safety');
  const techGuides = appState.guides.filter((g) => g.section === 'tech');
  $('#safety-guides-list').innerHTML = renderGuideAccordionHtml(safetyGuides, 'fiche-securite');
  $('#tech-guides-list').innerHTML = renderGuideAccordionHtml(techGuides, 'fiche-technique');

  // 8. Album photo
  const filteredPhotos = (appState.photos || []).filter((p) => (
    activePhotoFilter === 'all' ? true : p.category === activePhotoFilter
  ));
  const photoCatBadges = {
    navigation: '⛵ Navigation',
    chantier: '🛠️ Chantier',
    collectif: '🤝 Collectif'
  };
  $('#photos-grid').innerHTML = filteredPhotos.length === 0
    ? '<div class="card" style="grid-column:1/-1;"><p class="muted-text" style="margin:0">Aucune photo dans ce dossier pour le moment. Touchez « + Ajouter une photo » pour lancer l\'album du collectif !</p></div>'
    : filteredPhotos.map((p) => {
        const author = getMember(p.authorId);
        return `
          <article class="card photo-card">
            ${p.imageData ? `<img src="${p.imageData}" alt="${escapeHtml(p.title)}" loading="lazy">` : ''}
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.4rem;margin-bottom:0.25rem;">
              <span class="badge-soft">${photoCatBadges[p.category] || '📸 Photo'}</span>
              <span class="muted-text" style="font-size:0.8rem;">${escapeHtml(formatDateFr(p.takenOn))}</span>
            </div>
            <strong style="display:block;margin-bottom:0.4rem;">${escapeHtml(p.title)}</strong>
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.4rem;">
              <span class="member-chip">${renderAvatarDotHtml(author, 20, '0.68rem')} ${escapeHtml(author.name)}</span>
              <button type="button" class="btn btn-outline btn-sm" data-delete-photo="${escapeHtml(p.id)}" aria-label="Supprimer photo">🗑️</button>
            </div>
          </article>
        `;
      }).join('');
}

// Rendu Onglet 5 : Activité en direct & relais WhatsApp
function renderCarnetView() {
  if (!appState) return;
  const catBadges = {
    info: 'ℹ️ Doc / Info',
    sortie: `${BOAT_ICO} Nav / Sortie`,
    materiel: '🔧 Chantier / Courses',
    photo: '📸 Photo'
  };

  const pinnedMsgs = appState.messages.filter((m) => m.pinned);
  const pinnedBar = $('#pinned-messages-bar');
  if (pinnedMsgs.length > 0) {
    pinnedBar.hidden = false;
    pinnedBar.innerHTML = `<strong>📌 Épinglé (${pinnedMsgs.length}) :</strong> ${escapeHtml(pinnedMsgs[0].text)}`;
  } else {
    pinnedBar.hidden = true;
  }

  const filtered = appState.messages.filter((m) => {
    if (activeChatFilter === 'pinned') return Boolean(m.pinned);
    if (activeChatFilter === 'sortie') return m.category === 'sortie';
    if (activeChatFilter === 'materiel') return m.category === 'materiel';
    return true;
  });

  if (filtered.length === 0) {
    $('#messages-list').innerHTML = '<div class="card"><p class="muted-text" style="margin:0">Aucune activité dans cette vue pour le moment.</p></div>';
    return;
  }

  $('#messages-list').innerHTML = filtered.map((msg) => {
    const m = getMember(msg.authorId);
    const isMine = currentMemberId && msg.authorId === currentMemberId;
    const reactions = msg.reactions || { '👍': [], '⛵': [], '🛠️': [] };

    const reactButtons = ['👍', '⛵', '🛠️'].map((emoji) => {
      const voters = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
      const active = currentMemberId && voters.includes(currentMemberId);
      const titles = voters.map((id) => getMember(id).name).join(', ');
      const iconHtml = emoji === '⛵' ? BOAT_ICO : emoji;
      return `<button type="button" class="react-btn ${active ? 'is-active' : ''}" data-react-msg="${escapeHtml(msg.id)}" data-emoji="${emoji}" title="${escapeHtml(titles || 'Réagir')}">${iconHtml}${voters.length ? ' ' + voters.length : ''}</button>`;
    }).join('');

    const waText = `[Tombola] ${msg.text}\n👉 https://krieknini-hue.github.io/tombola/`;

    return `
      <article class="chat-bubble ${isMine ? 'is-mine' : 'is-other'} ${msg.pinned ? 'is-pinned' : ''}">
        <div class="chat-head">
          <div style="display:flex;align-items:center;gap:0.4rem;">
            ${renderAvatarDotHtml(m, 24, '0.7rem')}
            <strong>${escapeHtml(m.name)}</strong>
          </div>
          <span class="muted-text">${catBadges[msg.category] || 'ℹ️ Info'} • ${formatRelativeTime(msg.createdAt)}</span>
        </div>
        <p class="chat-text">${escapeHtml(msg.text)}</p>
        ${msg.imageData ? `<img src="${msg.imageData}" alt="Photo partagée par ${escapeHtml(m.name)}" class="msg-photo" loading="lazy">` : ''}
        <div class="chat-reactions">
          ${reactButtons}
          <button type="button" class="react-btn ${msg.pinned ? 'is-active' : ''}" data-pin-msg="${escapeHtml(msg.id)}">${msg.pinned ? '📌 Épinglé' : '📌 Épingler'}</button>
          <button type="button" class="react-btn" data-wa-msg="${escapeHtml(waText)}">📲 WhatsApp</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderAll() {
  renderHeaderProfile();
  renderBoatView();
  renderPlanningView();
  renderEssenceView();
  renderCharteView();
  renderCarnetView();
}

// Tour guidé
function updateTourUi() {
  for (const stepEl of $$('[data-tour-step]')) {
    stepEl.hidden = Number(stepEl.dataset.tourStep) !== tourStep;
  }
  $('#tour-dots').textContent = `Étape ${tourStep + 1} / 4`;
  $('#btn-tour-prev').disabled = tourStep === 0;
  $('#btn-tour-next').textContent = tourStep === 3 ? '✅ C\'est parti !' : 'Suivant ➡️';
}

// Créneaux par 15 minutes pré-calés sur les heures proches
function minutesToTimeStr(mins) {
  const clamped = Math.max(0, Math.min(23 * 60 + 45, mins));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeStrToMinutes(str) {
  const [h = 10, m = 0] = String(str || '10:00').split(':').map(Number);
  return h * 60 + m;
}

function formatDurationLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `+${m} min`;
  if (m === 0) return `+${h}h`;
  return `+${h}h${String(m).padStart(2, '0')}`;
}

function getAllQuarterSlots(minMins = 6 * 60, maxMins = 23 * 60 + 45) {
  const list = [];
  for (let m = minMins; m <= maxMins; m += 15) {
    list.push(m);
  }
  return list;
}

function populateNearbyStartSelect(selectEl, isToday) {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const roundedNow = Math.ceil(nowMins / 15) * 15;
  const allSlots = getAllQuarterSlots(6 * 60, 23 * 60 + 30);

  if (isToday && roundedNow <= 23 * 60) {
    const nearMin = Math.max(6 * 60, roundedNow);
    const nearMax = Math.min(23 * 60 + 30, nearMin + 180);
    const nearSlots = allSlots.filter((m) => m >= nearMin && m <= nearMax);
    const otherSlots = allSlots.filter((m) => m < nearMin || m > nearMax);
    selectEl.innerHTML = `
      <optgroup label="Heures proches">
        ${nearSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('')}
      </optgroup>
      <optgroup label="Autres horaires">
        ${otherSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('')}
      </optgroup>
    `;
    selectEl.value = minutesToTimeStr(nearSlots[0] || 14 * 60);
  } else {
    selectEl.innerHTML = allSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('');
    selectEl.value = '14:00';
  }
}

function populateEndTimeSelect(selectEl, startTimeStr, targetDurationMins = 180) {
  const startMins = timeStrToMinutes(startTimeStr);
  const firstEnd = Math.min(23 * 60 + 45, startMins + 15);
  const slots = getAllQuarterSlots(firstEnd, 23 * 60 + 45);
  selectEl.innerHTML = slots.map((m) => {
    const dur = m - startMins;
    const t = minutesToTimeStr(m);
    return `<option value="${t}">${t} (${formatDurationLabel(dur)})</option>`;
  }).join('');
  const preferred = Math.min(23 * 60 + 45, startMins + targetDurationMins);
  const snapped = Math.round(preferred / 15) * 15;
  selectEl.value = minutesToTimeStr(Math.max(firstEnd, snapped));
}

function populateDepartReturnSelect(selectEl) {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const nearStart = Math.max(6 * 60 + 30, Math.ceil((nowMins + 30) / 15) * 15);
  const nearEnd = Math.min(23 * 60 + 45, nearStart + 240);
  const allSlots = getAllQuarterSlots(6 * 60, 23 * 60 + 45);

  if (nearStart <= 23 * 60 + 30) {
    const nearSlots = allSlots.filter((m) => m >= nearStart && m <= nearEnd);
    const otherSlots = allSlots.filter((m) => m < nearStart || m > nearEnd);
    selectEl.innerHTML = `
      <optgroup label="Heures proches (retour estimé)">
        ${nearSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('')}
      </optgroup>
      <optgroup label="Autres horaires">
        ${otherSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('')}
      </optgroup>
    `;
    const preferred = Math.min(nearEnd, nearStart + 90); // ~2h après départ
    selectEl.value = minutesToTimeStr(Math.round(preferred / 15) * 15);
  } else {
    selectEl.innerHTML = allSlots.map((m) => `<option value="${minutesToTimeStr(m)}">${minutesToTimeStr(m)}</option>`).join('');
    selectEl.value = '23:45';
  }
}

// Modale Départ / Chantier
function openDepartDialog(mode) {
  ensureMemberSelected(() => {
    $('#depart-state-val').value = mode;
    $('#depart-title').innerHTML = mode === 'chantier' ? '🛠️ Je suis au chantier' : `${BOAT_ICO} Je pars sur l'eau`;
    $('#depart-type-fieldset').hidden = mode === 'chantier';
    selectedCrewSet = new Set([currentMemberId]);
    renderDepartCrewPicker();
    populateDepartReturnSelect($('#depart-return'));

    const spotSelect = $('#depart-spot');
    spotSelect.innerHTML = appState.loireSpots.map((s) => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join('');
    spotSelect.value = appState.boatStatus.location?.spotId || 'pelio';
    if (mode === 'chantier') spotSelect.value = 'pelio';

    $('#depart-note').value = mode === 'chantier'
      ? 'Au Port du Pélio pour bricoler / entretenir le bateau.'
      : '';
    openDialog('dialog-depart');
  });
}

function renderDepartCrewPicker() {
  $('#depart-crew-picker').innerHTML = appState.members.map((m) => {
    const checked = selectedCrewSet.has(m.id);
    return `<button type="button" class="crew-toggle ${checked ? 'is-checked' : ''}" data-toggle-crew="${escapeHtml(m.id)}">${checked ? '✓ ' : ''}${escapeHtml(m.name)}</button>`;
  }).join('');
}

// Compression photo côté client pour smartphone d'entrée de gamme
function compressImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function compressAvatarFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 120;
        const side = Math.min(img.width, img.height);
        const sx = Math.round((img.width - side) / 2);
        const sy = Math.round((img.height - side) / 2);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Attachement de tous les événements
function bindEvents() {
  // Navigation basse
  for (const btn of $$('.nav-btn')) {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  }

  // Toggle Aide
  $('#btn-toggle-help').addEventListener('click', () => {
    helpEnabled = !helpEnabled;
    localStorage.setItem(STORAGE_HELP_KEY, String(helpEnabled));
    applyHelpVisibility();
  });

  // Visite guidée
  $('#btn-open-tour').addEventListener('click', () => {
    tourStep = 0;
    updateTourUi();
    openDialog('dialog-onboarding');
  });
  $('#btn-tour-prev').addEventListener('click', () => {
    if (tourStep > 0) {
      tourStep -= 1;
      updateTourUi();
    }
  });
  $('#btn-tour-next').addEventListener('click', () => {
    if (tourStep < 3) {
      tourStep += 1;
      updateTourUi();
    } else {
      localStorage.setItem(STORAGE_TOUR_DONE, 'true');
      closeDialog('dialog-onboarding');
    }
  });

  // Déverrouillage collectif & Choix du profil membre (mémorisé durablement)
  $('#btn-open-profile').addEventListener('click', openProfileDialog);
  $('#dialog-profile').addEventListener('cancel', (e) => {
    const hasValidMember = Boolean(
      currentMemberId && appState?.members?.some((m) => m.id === currentMemberId)
    );
    if (!hasActiveAuthSession() || !hasValidMember) e.preventDefault();
  });

  $('#collective-auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codeInput = $('#collective-code-input');
    const errEl = $('#code-error');
    const submitBtn = $('#btn-unlock-collective');
    const code = (codeInput.value || '').trim();
    errEl.hidden = true;
    if (!code) {
      codeInput.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Vérification…';
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/collective-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_PUBLISHABLE_KEY
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.access_token || !data.refresh_token) {
        errEl.textContent = data.error || 'Code collectif incorrect.';
        errEl.hidden = false;
        codeInput.focus();
        codeInput.select();
        return;
      }

      const { data: sessionData, error: setErr } = await sbClient.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      });
      if (setErr || !sessionData?.session) {
        throw new Error('Impossible d\'ouvrir la session collective.');
      }

      currentAuthSession = sessionData.session;
      codeInput.value = '';
      await loadAllState();
      await connectRealtime();

      const hasValidMember = Boolean(
        currentMemberId && appState?.members?.some((m) => m.id === currentMemberId)
      );
      if (hasValidMember) {
        closeDialog('dialog-profile');
        showToast(`Bon retour ${getMember(currentMemberId).name} !`);
      } else {
        openProfileDialog();
      }
    } catch (err) {
      errEl.textContent = err.message || 'Impossible de contacter le serveur d\'authentification.';
      errEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '🔓 Déverrouiller l\'accès collectif';
    }
  });

  $('#member-picker-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pick-member]');
    if (!btn) return;
    if (!hasActiveAuthSession()) {
      openProfileDialog();
      return;
    }
    currentMemberId = btn.dataset.pickMember;
    savePersistentValue(STORAGE_MEMBER_KEY, currentMemberId);
    renderAll();
    closeDialog('dialog-profile');
    showToast(`Bonjour ${getMember(currentMemberId).name} ! Votre prénom est mémorisé sur ce téléphone.`);
  });

  $('#member-avatar-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentMemberId) return;
    try {
      const avatarUrl = await compressAvatarFile(file);
      await apiPost('/api/member/avatar', { memberId: currentMemberId, avatarUrl });
      e.target.value = '';
      renderMemberPicker();
      showToast('Photo de profil mise à jour !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#btn-remove-avatar').addEventListener('click', async () => {
    if (!currentMemberId) return;
    try {
      await apiPost('/api/member/avatar', { memberId: currentMemberId, avatarUrl: '' });
      renderMemberPicker();
      showToast('Photo de profil retirée.');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Statut Bateau
  $('#btn-go-water').addEventListener('click', () => openDepartDialog('water'));
  $('#btn-update-live-pos').addEventListener('click', () => openDepartDialog('water'));
  $('#btn-depart-cancel').addEventListener('click', () => closeDialog('dialog-depart'));

  $('#depart-crew-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle-crew]');
    if (!btn) return;
    const id = btn.dataset.toggleCrew;
    if (selectedCrewSet.has(id)) selectedCrewSet.delete(id);
    else selectedCrewSet.add(id);
    renderDepartCrewPicker();
  });

  $('#form-depart').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = $('#depart-state-val').value;
    const outingType = document.querySelector('input[name="outingType"]:checked')?.value || 'open';
    const spotId = $('#depart-spot').value;
    const returnTime = $('#depart-return').value;
    const maxSeats = Number($('#depart-seats').value || 4);
    const note = $('#depart-note').value;
    const crew = selectedCrewSet.size > 0 ? Array.from(selectedCrewSet) : [currentMemberId];
    try {
      fuelCrewInitialized = false;
      await apiPost('/api/status', {
        state: mode,
        outingType,
        spotId,
        returnTime,
        maxSeats,
        note,
        crew,
        memberId: currentMemberId
      });
      closeDialog('dialog-depart');
      showToast(mode === 'chantier' ? 'Statut passé en Chantier !' : 'Bonne navigation ! Voyant passé en direct.');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#btn-return-pelio').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#return-checklist-note').value = '';
      $('#return-checklist-title').textContent = appState?.boatStatus?.state === 'chantier'
        ? '⚓ Fin de chantier & retour au Pélio'
        : '⚓ Check-list retour au Port du Pélio';
      openDialog('dialog-return-checklist');
    });
  });

  $('#btn-return-cancel').addEventListener('click', () => closeDialog('dialog-return-checklist'));

  $('#form-return-checklist').addEventListener('submit', async (e) => {
    e.preventDefault();
    const goToFuel = e.submitter?.dataset.returnAction === 'fuel';
    const noteVal = ($('#return-checklist-note').value || '').trim();
    ensureMemberSelected(async (memberId) => {
      try {
        fuelCrewInitialized = false;
        await apiPost('/api/status', {
          state: 'mooring',
          resetToPelio: true,
          note: noteVal || `Rentré et amarré au Port du Pélio par ${getMember(memberId).name} (check-list retour vérifiée).`,
          memberId
        });
        closeDialog('dialog-return-checklist');
        showToast('Tombola est de retour au Pélio (voyant vert) !');
        if (goToFuel) {
          renderEssenceView();
          switchTab('essence');
        }
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  // GPS manuel & Suivi GPS auto "Équipage à bord"
  const autoGpsCheckbox = $('#toggle-auto-gps');
  if (autoGpsCheckbox) {
    autoGpsCheckbox.checked = autoGpsEnabled;
    autoGpsCheckbox.addEventListener('change', () => {
      autoGpsEnabled = autoGpsCheckbox.checked;
      localStorage.setItem(STORAGE_AUTO_GPS_KEY, String(autoGpsEnabled));
      if (autoGpsEnabled) {
        ensureMemberSelected(() => {
          syncAutoGpsWatcher();
          showToast('Suivi GPS auto activé : il ne s\'allumera que si vous êtes déclaré à bord !');
        });
      } else {
        syncAutoGpsWatcher();
        showToast('Suivi GPS automatique désactivé.');
      }
    });
  }

  $('#btn-share-gps').addEventListener('click', () => {
    ensureMemberSelected((memberId) => {
      if (!navigator.geolocation) {
        showToast('Votre téléphone ne permet pas le GPS ici : mettez à jour le lieu via "Je pars sur l\'eau".', true);
        return;
      }
      showToast('Recherche de votre position GPS…');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await sendGpsStatus(pos.coords.latitude, pos.coords.longitude, memberId, true);
        },
        () => {
          showToast('GPS refusé ou indisponible sur ce téléphone.', true);
        },
        { enableHighAccuracy: false, timeout: 7000 }
      );
    });
  });

  $('#btn-refresh-weather')?.addEventListener('click', () => {
    loadWeather(true);
  });

  // Écopage
  $('#btn-ecopage-done').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#ecopage-state-note').value = '';
      $('#ecopage-advance').checked = false;
      openDialog('dialog-ecopage');
    });
  });
  $('#btn-ecopage-cancel').addEventListener('click', () => closeDialog('dialog-ecopage'));
  $('#form-ecopage').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/ecopage', {
        memberId: currentMemberId,
        stateNote: $('#ecopage-state-note').value,
        advanceRotation: $('#ecopage-advance').checked
      });
      closeDialog('dialog-ecopage');
      showToast('Merci ! Visite d\'écopage enregistrée.');
    } catch (err) {
      showToast(err.message, true);
    }
  });
  $('#btn-ecopage-next').addEventListener('click', () => {
    ensureMemberSelected(async (memberId) => {
      try {
        await apiPost('/api/ecopage', { action: 'next_person', memberId });
        showToast('Tour de rôle avancé à la personne suivante.');
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  // Planning (Liste / Semaine / Mois + filtres + actions)
  $('#planning-view-switch').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-planview]');
    if (!btn) return;
    activePlanningView = btn.dataset.planview;
    if (activePlanningView === 'month' && !selectedMonthDate) {
      selectedMonthDate = toLocalIsoDate(new Date());
    }
    renderPlanningView();
  });

  $('#btn-period-prev').addEventListener('click', () => {
    if (activePlanningView === 'week') {
      planningAnchorDate.setDate(planningAnchorDate.getDate() - 7);
    } else {
      planningAnchorDate = new Date(planningAnchorDate.getFullYear(), planningAnchorDate.getMonth() - 1, 1);
      selectedMonthDate = toLocalIsoDate(planningAnchorDate);
    }
    renderPlanningView();
  });

  $('#btn-period-next').addEventListener('click', () => {
    if (activePlanningView === 'week') {
      planningAnchorDate.setDate(planningAnchorDate.getDate() + 7);
    } else {
      planningAnchorDate = new Date(planningAnchorDate.getFullYear(), planningAnchorDate.getMonth() + 1, 1);
      selectedMonthDate = toLocalIsoDate(planningAnchorDate);
    }
    renderPlanningView();
  });

  $('#btn-period-today').addEventListener('click', () => {
    planningAnchorDate = new Date();
    selectedMonthDate = toLocalIsoDate(planningAnchorDate);
    renderPlanningView();
  });

  $('#month-grid').addEventListener('click', (e) => {
    const cell = e.target.closest('[data-select-day]');
    if (!cell) return;
    selectedMonthDate = cell.dataset.selectDay;
    renderPlanningView();
  });

  $('#booking-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    activeBookingFilter = btn.dataset.filter;
    for (const b of $$('#booking-filters .chip-filter')) {
      b.classList.toggle('is-active', b === btn);
    }
    renderPlanningView();
  });

  $('#form-priority-config').addEventListener('submit', async (e) => {
    e.preventDefault();
    ensureMemberSelected(async (memberId) => {
      try {
        await apiPost('/api/priority-config', {
          weekdayPerHour: Number($('#prio-weekday').value || 1),
          weekendPerHour: Number($('#prio-weekend').value || 2.5),
          openDiscount: Number($('#prio-open-discount').value || 0.5),
          lastMinuteFree: $('#prio-last-minute').checked,
          includeChantier: $('#prio-include-chantier').checked,
          memberId
        });
        showToast('Règles de priorité mises à jour pour tout le collectif !');
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  function syncMultiDayUi() {
    const isMulti = $('#bk-multiday-toggle').checked;
    $('#bk-end-date-wrap').hidden = !isMulti;
    const startVal = $('#bk-date').value || toLocalIsoDate(new Date());
    $('#bk-end-date').min = startVal;
    if (isMulti && (!$('#bk-end-date').value || $('#bk-end-date').value <= startVal)) {
      const nextDay = new Date(`${startVal}T12:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      $('#bk-end-date').value = toLocalIsoDate(nextDay);
    }
  }

  function refreshBookingStartEndForDate(dateStr) {
    const todayIso = toLocalIsoDate(new Date());
    populateNearbyStartSelect($('#bk-start-time'), dateStr === todayIso);
    populateEndTimeSelect($('#bk-end-time'), $('#bk-start-time').value, 180);
  }

  function openNewBookingForDate(isoDate) {
    ensureMemberSelected(() => {
      const targetDate = isoDate || toLocalIsoDate(new Date());
      $('#bk-date').value = targetDate;
      $('#bk-multiday-toggle').checked = false;
      $('#bk-end-date').value = '';
      syncMultiDayUi();
      refreshBookingStartEndForDate(targetDate);
      $('#bk-title').value = '';
      $('#bk-note').value = '';
      openDialog('dialog-booking');
    });
  }

  $('#bk-multiday-toggle').addEventListener('change', syncMultiDayUi);
  $('#bk-date').addEventListener('change', () => {
    syncMultiDayUi();
    refreshBookingStartEndForDate($('#bk-date').value);
  });
  $('#bk-start-time').addEventListener('change', () => {
    populateEndTimeSelect($('#bk-end-time'), $('#bk-start-time').value, 180);
  });
  $('#form-booking').addEventListener('click', (e) => {
    const qBtn = e.target.closest('[data-quick-date]');
    if (!qBtn) return;
    const d = new Date();
    const mode = qBtn.dataset.quickDate;
    if (mode === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (mode === 'saturday') {
      const diff = (6 - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff);
    } else if (mode === 'sunday') {
      const diff = (0 - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff);
    }
    const iso = toLocalIsoDate(d);
    $('#bk-date').value = iso;
    syncMultiDayUi();
    refreshBookingStartEndForDate(iso);
  });

  $('#btn-new-booking').addEventListener('click', () => openNewBookingForDate());
  $('#btn-booking-cancel').addEventListener('click', () => closeDialog('dialog-booking'));

  $('#form-booking').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const isMulti = $('#bk-multiday-toggle').checked;
    try {
      await apiPost('/api/bookings', {
        type: document.querySelector('input[name="type"]:checked')?.value || 'open',
        title: $('#bk-title').value,
        date: $('#bk-date').value,
        endDate: isMulti ? ($('#bk-end-date').value || $('#bk-date').value) : $('#bk-date').value,
        startTime: $('#bk-start-time').value,
        endTime: $('#bk-end-time').value,
        maxSeats: Number($('#bk-seats').value || 4),
        isLastMinute: $('#bk-last-minute').checked,
        note: $('#bk-note').value,
        authorId: currentMemberId
      });
      closeDialog('dialog-booking');
      showToast('Créneau ajouté au planning !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#view-planning').addEventListener('click', (e) => {
    const newForDateBtn = e.target.closest('[data-new-booking-date]');
    if (newForDateBtn) {
      openNewBookingForDate(newForDateBtn.dataset.newBookingDate);
      return;
    }

    const joinBtn = e.target.closest('[data-toggle-join]');
    if (joinBtn) {
      ensureMemberSelected(async (memberId) => {
        try {
          await apiPost('/api/bookings/toggle-join', {
            bookingId: joinBtn.dataset.toggleJoin,
            memberId
          });
          showToast('Inscription mise à jour !');
        } catch (err) {
          showToast(err.message, true);
        }
      });
      return;
    }

    const activateBtn = e.target.closest('[data-activate-chantier]');
    if (activateBtn) {
      ensureMemberSelected(async (memberId) => {
        const b = appState.bookings.find((item) => item.id === activateBtn.dataset.activateChantier);
        if (!b) return;
        try {
          await apiPost('/api/status', {
            state: 'chantier',
            crew: b.participants.length > 0 ? b.participants : [memberId],
            spotId: 'pelio',
            returnTime: b.endTime || '',
            note: `Chantier : ${b.title}${b.note ? ' — ' + b.note : ''}`,
            memberId
          });
          showToast('Voyant passé en orange (Chantier en cours) !');
        } catch (err) {
          showToast(err.message, true);
        }
      });
      return;
    }

    const delBtn = e.target.closest('[data-delete-booking]');
    if (delBtn) {
      ensureMemberSelected(() => {
        $('#confirm-title').textContent = 'Annuler ce créneau ?';
        $('#confirm-message').textContent = 'Ce créneau sera retiré du planning partagé pour tout le collectif.';
        pendingConfirmAction = async () => {
          await apiPost('/api/bookings/delete', { bookingId: delBtn.dataset.deleteBooking });
          showToast('Créneau annulé.');
        };
        openDialog('dialog-confirm');
      });
    }
  });

  $('#dialog-confirm').addEventListener('close', async () => {
    const val = $('#dialog-confirm').returnValue;
    $('#dialog-confirm').returnValue = '';
    if (val === 'confirm' && typeof pendingConfirmAction === 'function') {
      const fn = pendingConfirmAction;
      pendingConfirmAction = null;
      try {
        await fn();
      } catch (err) {
        showToast(err.message, true);
      }
    } else {
      pendingConfirmAction = null;
    }
  });

  // Essence
  $('#fuel-booking-select').addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === '__last__') {
      const lastCrew = (appState.boatStatus.state === 'water' && appState.boatStatus.crew?.length)
        ? appState.boatStatus.crew
        : (appState.boatStatus.lastWaterCrew || []);
      selectedFuelCrewSet = new Set(lastCrew);
    } else if (val) {
      const b = appState.bookings.find((item) => item.id === val);
      if (b) {
        selectedFuelCrewSet = new Set(b.participants);
        if (!$('#fuel-note').value) {
          $('#fuel-note').value = b.title;
        }
      }
    }
    renderFuelCrewPicker();
    updateFuelLivePreview();
  });

  $('#fuel-crew-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle-fuel-crew]');
    if (!btn) return;
    const id = btn.dataset.toggleFuelCrew;
    if (selectedFuelCrewSet.has(id)) selectedFuelCrewSet.delete(id);
    else selectedFuelCrewSet.add(id);
    renderFuelCrewPicker();
    updateFuelLivePreview();
  });

  $('#fuel-start-kg').addEventListener('input', (e) => {
    e.target.setCustomValidity('');
    updateFuelLivePreview();
  });
  $('#fuel-end-kg').addEventListener('input', (e) => {
    e.target.setCustomValidity('');
    updateFuelLivePreview();
  });

  $('#btn-mode-scale').addEventListener('click', () => ensureMemberSelected(async () => {
    try { await apiPost('/api/fuel', { action: 'config', mode: 'scale' }); } catch (err) { showToast(err.message, true); }
  }));
  $('#btn-mode-mark').addEventListener('click', () => ensureMemberSelected(async () => {
    try { await apiPost('/api/fuel', { action: 'config', mode: 'mark' }); } catch (err) { showToast(err.message, true); }
  }));

  $('#form-fuel-weigh').addEventListener('submit', async (e) => {
    e.preventDefault();
    const startVal = parseFloat($('#fuel-start-kg').value.replace(',', '.'));
    const endVal = parseFloat($('#fuel-end-kg').value.replace(',', '.'));
    const endInput = $('#fuel-end-kg');
    if (!Number.isFinite(endVal) || !Number.isFinite(startVal)) {
      endInput.setCustomValidity('Merci d\'indiquer un poids valide (ex: 8.1).');
      endInput.reportValidity();
      return;
    }
    if (endVal > startVal) {
      endInput.setCustomValidity('Le poids au retour ne peut pas dépasser le poids au départ.');
      endInput.reportValidity();
      return;
    }
    ensureMemberSelected(async (memberId) => {
      const participants = selectedFuelCrewSet.size > 0
        ? Array.from(selectedFuelCrewSet)
        : [memberId];
      try {
        await apiPost('/api/fuel', {
          startKg: startVal,
          endKg: endVal,
          bookingId: $('#fuel-booking-select').value,
          participants,
          note: $('#fuel-note').value,
          memberId
        });
        $('#fuel-end-kg').value = '';
        $('#fuel-note').value = '';
        showToast(participants.length > 1
          ? `Pesée enregistrée et partagée entre ${participants.length} co-usagers !`
          : 'Pesée enregistrée ! La jauge a été mise à jour.');
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });

  $('#btn-open-refill').addEventListener('click', () => {
    ensureMemberSelected(() => openDialog('dialog-fuel-refill'));
  });
  $('#btn-refill-cancel').addEventListener('click', () => closeDialog('dialog-fuel-refill'));
  $('#form-fuel-refill').addEventListener('submit', async (e) => {
    e.preventDefault();
    const liters = parseFloat($('#refill-liters').value.replace(',', '.'));
    if (!Number.isFinite(liters) || liters <= 0) return;
    try {
      await apiPost('/api/fuel', {
        action: 'refill',
        liters,
        note: $('#refill-note').value,
        memberId: currentMemberId
      });
      closeDialog('dialog-fuel-refill');
      $('#refill-note').value = '';
      showToast('Plein enregistré dans le journal !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Documents officiels (Supabase Storage privé : PDF signé + lecteur Markdown dans chaque dossier)
  $('#view-charte').addEventListener('click', async (e) => {
    const docEl = e.target.closest('[data-storage-doc]');
    if (!docEl) return;
    const path = docEl.dataset.storageDoc;
    const title = docEl.dataset.docTitle || 'Document officiel';
    const docType = docEl.dataset.docType;

    if (!hasActiveAuthSession()) {
      e.preventDefault();
      openProfileDialog();
      return;
    }

    if (docType === 'pdf') {
      const cached = signedUrlCache.get(path);
      if (cached && cached.expiresAt > Date.now() && docEl.href.startsWith('https://')) {
        return; // laisser le lien <a target="_blank"> ouvrir le PDF nativement
      }
      e.preventDefault();
      try {
        const freshUrl = await getSignedDocUrl(path);
        if (!freshUrl) throw new Error('Lien PDF indisponible.');
        docEl.href = freshUrl;
        window.open(freshUrl, '_blank', 'noopener');
      } catch (err) {
        showToast(err.message, true);
      }
      return;
    }

    if (docType === 'md') {
      e.preventDefault();
      await openMarkdownDocViewer(path, title);
    }
  });

  // Dossiers façon Drive
  $('#docs-subtabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-docstab]');
    if (!btn) return;
    switchDocsSubtab(btn.dataset.docstab);
  });

  // To-Do & Liste de courses
  $('#todo-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-todofilter]');
    if (!btn) return;
    activeTodoFilter = btn.dataset.todofilter;
    for (const b of $$('#todo-filters .chip-filter')) {
      b.classList.toggle('is-active', b === btn);
    }
    renderCharteView();
  });

  $('#btn-add-todo').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#todo-title').value = '';
      $('#todo-note').value = '';
      $('#todo-kind-course').checked = true;
      openDialog('dialog-todo');
    });
  });
  $('#btn-todo-cancel').addEventListener('click', () => closeDialog('dialog-todo'));

  $('#form-todo').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/todos', {
        action: 'add',
        kind: document.querySelector('#form-todo input[name="kind"]:checked')?.value || 'course',
        title: $('#todo-title').value,
        note: $('#todo-note').value,
        memberId: currentMemberId
      });
      closeDialog('dialog-todo');
      showToast('Ajouté à la liste du collectif !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#todos-list').addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-toggle-todo]');
    if (toggleBtn) {
      ensureMemberSelected(async (memberId) => {
        try {
          await apiPost('/api/todos', {
            action: 'toggle',
            todoId: toggleBtn.dataset.toggleTodo,
            memberId
          });
        } catch (err) {
          showToast(err.message, true);
        }
      });
      return;
    }
    const delBtn = e.target.closest('[data-delete-todo]');
    if (delBtn) {
      ensureMemberSelected(() => {
        $('#confirm-title').textContent = 'Retirer de la liste ?';
        $('#confirm-message').textContent = 'Cet élément sera supprimé de la liste du collectif.';
        pendingConfirmAction = async () => {
          await apiPost('/api/todos', {
            action: 'delete',
            todoId: delBtn.dataset.deleteTodo,
            memberId: currentMemberId
          });
          showToast('Élément retiré.');
        };
        openDialog('dialog-confirm');
      });
    }
  });

  // Album photo
  $('#photo-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-photofilter]');
    if (!btn) return;
    activePhotoFilter = btn.dataset.photofilter;
    for (const b of $$('#photo-filters .chip-filter')) {
      b.classList.toggle('is-active', b === btn);
    }
    renderCharteView();
  });

  $('#btn-add-album-photo').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#album-photo-title').value = '';
      $('#album-photo-date').value = toLocalIsoDate(new Date());
      $('#album-photo-cat').value = 'navigation';
      $('#album-photo-file').value = '';
      pendingAlbumPhotoData = '';
      openDialog('dialog-photo');
    });
  });
  $('#btn-photo-cancel').addEventListener('click', () => closeDialog('dialog-photo'));

  $('#album-photo-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    pendingAlbumPhotoData = file ? await compressImageFile(file) : '';
  });

  $('#form-album-photo').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/photos', {
        action: 'add',
        title: $('#album-photo-title').value,
        category: $('#album-photo-cat').value,
        takenOn: $('#album-photo-date').value,
        imageData: pendingAlbumPhotoData,
        memberId: currentMemberId
      });
      pendingAlbumPhotoData = '';
      closeDialog('dialog-photo');
      showToast('Photo ajoutée à l\'album du collectif !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#photos-grid').addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-delete-photo]');
    if (!delBtn) return;
    ensureMemberSelected(() => {
      $('#confirm-title').textContent = 'Supprimer cette photo ?';
      $('#confirm-message').textContent = 'Elle sera retirée de l\'album photo du collectif.';
      pendingConfirmAction = async () => {
        await apiPost('/api/photos', {
          action: 'delete',
          photoId: delBtn.dataset.deletePhoto,
          memberId: currentMemberId
        });
        showToast('Photo supprimée.');
      };
      openDialog('dialog-confirm');
    });
  });

  // Journal de bord
  function renderLogCrewPicker() {
    $('#log-crew-picker').innerHTML = appState.members.map((m) => {
      const checked = selectedLogCrewSet.has(m.id);
      return `<button type="button" class="crew-toggle ${checked ? 'is-checked' : ''}" data-toggle-log-crew="${escapeHtml(m.id)}">${checked ? '✓ ' : ''}${escapeHtml(m.name)}</button>`;
    }).join('');
  }

  $('#btn-add-logbook').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#log-title').value = '';
      $('#log-date').value = toLocalIsoDate(new Date());
      $('#log-weather').value = '';
      $('#log-story').value = '';
      $('#log-notes').value = '';
      $('#log-photo').value = '';
      pendingLogPhotoData = '';
      selectedLogCrewSet = new Set([currentMemberId]);
      renderLogCrewPicker();
      openDialog('dialog-logbook');
    });
  });
  $('#btn-logbook-cancel').addEventListener('click', () => closeDialog('dialog-logbook'));

  $('#log-crew-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-toggle-log-crew]');
    if (!btn) return;
    const id = btn.dataset.toggleLogCrew;
    if (selectedLogCrewSet.has(id)) selectedLogCrewSet.delete(id);
    else selectedLogCrewSet.add(id);
    renderLogCrewPicker();
  });

  $('#log-photo').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    pendingLogPhotoData = file ? await compressImageFile(file) : '';
  });

  $('#form-logbook').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/logbook', {
        title: $('#log-title').value,
        date: $('#log-date').value,
        weather: $('#log-weather').value,
        story: $('#log-story').value,
        boatNotes: $('#log-notes').value,
        imageData: pendingLogPhotoData,
        crew: selectedLogCrewSet.size > 0 ? Array.from(selectedLogCrewSet) : [currentMemberId],
        authorId: currentMemberId
      });
      closeDialog('dialog-logbook');
      showToast('Récit ajouté au Journal de bord !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Documents collaboratifs & Propositions (type Trello)
  $('#btn-add-collab-doc').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#collab-doc-dialog-title').textContent = '+ Nouveau document collaboratif';
      $('#collab-doc-id').value = '';
      $('#collab-doc-title').value = '';
      $('#collab-doc-content').value = '';
      $('#collab-doc-edit-note').value = '';
      openDialog('dialog-collab-doc');
    });
  });
  $('#btn-collab-doc-cancel').addEventListener('click', () => closeDialog('dialog-collab-doc'));

  $('#form-collab-doc').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/collab-docs', {
        action: 'save_doc',
        id: $('#collab-doc-id').value,
        title: $('#collab-doc-title').value,
        content: $('#collab-doc-content').value,
        editNote: $('#collab-doc-edit-note').value,
        memberId: currentMemberId
      });
      closeDialog('dialog-collab-doc');
      showToast('Document enregistré sous votre prénom !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#btn-proposal-cancel').addEventListener('click', () => closeDialog('dialog-proposal'));
  $('#form-proposal').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/collab-docs', {
        action: 'add_proposal',
        docId: $('#proposal-doc-id').value,
        text: $('#proposal-text').value,
        memberId: currentMemberId
      });
      closeDialog('dialog-proposal');
      showToast('Proposition ajoutée sous votre prénom !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#collab-docs-list').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-collab-doc]');
    if (editBtn) {
      ensureMemberSelected(() => {
        const doc = (appState.collabDocs || []).find((d) => d.id === editBtn.dataset.editCollabDoc);
        if (!doc) return;
        $('#collab-doc-dialog-title').textContent = '✏️ Éditer le document';
        $('#collab-doc-id').value = doc.id;
        $('#collab-doc-title').value = doc.title;
        $('#collab-doc-content').value = doc.content;
        $('#collab-doc-edit-note').value = '';
        openDialog('dialog-collab-doc');
      });
      return;
    }

    const addPropBtn = e.target.closest('[data-add-proposal]');
    if (addPropBtn) {
      ensureMemberSelected(() => {
        const doc = (appState.collabDocs || []).find((d) => d.id === addPropBtn.dataset.addProposal);
        if (!doc) return;
        $('#proposal-doc-id').value = doc.id;
        $('#proposal-doc-label').textContent = `Document : ${doc.title}`;
        $('#proposal-text').value = '';
        openDialog('dialog-proposal');
      });
      return;
    }

    const cycleBtn = e.target.closest('[data-cycle-doc]');
    if (cycleBtn) {
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/collab-docs', {
          action: 'cycle_status',
          docId: cycleBtn.dataset.cycleDoc,
          memberId
        });
      });
      return;
    }

    const votePropBtn = e.target.closest('[data-vote-proposal]');
    if (votePropBtn) {
      const [docId, proposalId] = votePropBtn.dataset.voteProposal.split('|');
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/collab-docs', {
          action: 'toggle_proposal',
          docId,
          proposalId,
          memberId
        });
      });
      return;
    }

    const integBtn = e.target.closest('[data-integrate-proposal]');
    if (integBtn) {
      const [docId, proposalId] = integBtn.dataset.integrateProposal.split('|');
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/collab-docs', {
          action: 'toggle_proposal',
          docId,
          proposalId,
          toggleIntegrated: true,
          memberId
        });
      });
    }
  });

  // Édition Charte
  $('#btn-add-charter').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#charter-dialog-title').textContent = '➕ Nouvel article de la Charte';
      $('#charter-id').value = '';
      $('#charter-title').value = '';
      $('#charter-content').value = '';
      $('#charter-edit-note').value = '';
      openDialog('dialog-charter');
    });
  });
  $('#btn-charter-cancel').addEventListener('click', () => closeDialog('dialog-charter'));

  $('#charter-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-edit-charter]');
    if (!btn) return;
    ensureMemberSelected(() => {
      const sec = appState.charterSections.find((s) => s.id === btn.dataset.editCharter);
      if (!sec) return;
      $('#charter-dialog-title').textContent = '✏️ Modifier cet article';
      $('#charter-id').value = sec.id;
      $('#charter-title').value = sec.title;
      $('#charter-content').value = sec.content;
      $('#charter-edit-note').value = '';
      openDialog('dialog-charter');
    });
  });

  $('#form-charter').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/charter', {
        id: $('#charter-id').value,
        title: $('#charter-title').value,
        content: $('#charter-content').value,
        editNote: $('#charter-edit-note').value,
        memberId: currentMemberId
      });
      closeDialog('dialog-charter');
      showToast('Charte mise à jour avec votre prénom !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  // Frigo à idées
  $('#btn-add-idea').addEventListener('click', () => {
    ensureMemberSelected(() => {
      $('#idea-title').value = '';
      $('#idea-desc').value = '';
      openDialog('dialog-idea');
    });
  });
  $('#btn-idea-cancel').addEventListener('click', () => closeDialog('dialog-idea'));
  $('#form-idea').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/ideas', {
        title: $('#idea-title').value,
        description: $('#idea-desc').value,
        authorId: currentMemberId
      });
      closeDialog('dialog-idea');
      showToast('Idée collée sur le frigo !');
    } catch (err) {
      showToast(err.message, true);
    }
  });

  $('#ideas-list').addEventListener('click', (e) => {
    const voteBtn = e.target.closest('[data-vote-idea]');
    if (voteBtn) {
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/ideas/vote', { ideaId: voteBtn.dataset.voteIdea, memberId });
      });
      return;
    }
    const cycleBtn = e.target.closest('[data-cycle-idea]');
    if (cycleBtn) {
      ensureMemberSelected(async (memberId) => {
        const idea = appState.ideas.find((i) => i.id === cycleBtn.dataset.cycleIdea);
        if (!idea) return;
        const order = ['discussion', 'test', 'acte'];
        const nextStatus = order[(order.indexOf(idea.status) + 1) % order.length];
        await apiPost('/api/ideas/vote', { ideaId: idea.id, memberId, status: nextStatus });
      });
    }
  });

  // Activité en direct & relais WhatsApp
  $('#btn-share-whatsapp-summary').addEventListener('click', () => {
    const latest = (appState?.messages || []).slice(0, 5).map((m) => `• ${m.text}`).join('\n');
    const summary = `⛵ *Activité Collectif Tombola*\n${latest || 'Nouvelles mises à jour sur l\'appli.'}\n\n👉 Ouvrir l'appli : https://krieknini-hue.github.io/tombola/`;
    openWhatsAppShare(summary);
  });

  $('#chat-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-chatfilter]');
    if (!btn) return;
    activeChatFilter = btn.dataset.chatfilter;
    for (const b of $$('#chat-filters .chip-filter')) {
      b.classList.toggle('is-active', b === btn);
    }
    renderCarnetView();
  });

  $('#view-carnet').addEventListener('click', (e) => {
    const waBtn = e.target.closest('[data-wa-msg]');
    if (waBtn) {
      openWhatsAppShare(waBtn.dataset.waMsg);
      return;
    }

    const reactBtn = e.target.closest('[data-react-msg]');
    if (reactBtn) {
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/messages/react', {
          messageId: reactBtn.dataset.reactMsg,
          emoji: reactBtn.dataset.emoji,
          memberId
        });
      });
      return;
    }

    const pinBtn = e.target.closest('[data-pin-msg]');
    if (pinBtn) {
      ensureMemberSelected(async (memberId) => {
        await apiPost('/api/messages/react', {
          messageId: pinBtn.dataset.pinMsg,
          togglePin: true,
          memberId
        });
      });
    }
  });

  $('#msg-photo').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      pendingPhotoData = '';
      $('#msg-photo-status').textContent = '';
      return;
    }
    pendingPhotoData = await compressImageFile(file);
    $('#msg-photo-status').textContent = '✓ Photo prête';
  });

  $('#msg-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      $('#form-message').requestSubmit();
    }
  });

  $('#form-message').addEventListener('submit', async (e) => {
    e.preventDefault();
    ensureMemberSelected(async (memberId) => {
      try {
        await apiPost('/api/messages', {
          category: document.querySelector('input[name="category"]:checked')?.value || 'info',
          text: $('#msg-text').value,
          imageData: pendingPhotoData,
          authorId: memberId
        });
        $('#msg-text').value = '';
        $('#msg-photo').value = '';
        $('#msg-photo-status').textContent = '';
        pendingPhotoData = '';
        showToast('Message envoyé sur le fil !');
      } catch (err) {
        showToast(err.message, true);
      }
    });
  });
}

function findNearestSpotLabel(lng) {
  if (!appState?.loireSpots?.length) return 'sur la Loire';
  const nearest = appState.loireSpots.reduce((best, s) => (
    Math.abs(s.lng - lng) < Math.abs(best.lng - lng) ? s : best
  ), appState.loireSpots[0]);
  return nearest.name;
}

async function sendGpsStatus(lat, lng, memberId, showConfirmToast = false) {
  if (!appState) return;
  const st = appState.boatStatus;
  const nearestName = findNearestSpotLabel(lng);
  try {
    await apiPost('/api/status', {
      lat,
      lng,
      locationName: `Près de ${nearestName} (GPS)`,
      outingType: st.outingType,
      maxSeats: st.maxSeats,
      returnTime: st.returnTime,
      note: st.note,
      memberId
    });
    if (showConfirmToast) {
      showToast(`Position GPS envoyée : près de ${nearestName} !`);
    }
  } catch (err) {
    if (showConfirmToast) showToast(err.message, true);
  }
}

function syncAutoGpsWatcher() {
  const hintEl = $('#auto-gps-hint');
  const st = appState?.boatStatus;
  const isOnBoard = Boolean(
    st?.state === 'water' &&
    currentMemberId &&
    Array.isArray(st.crew) &&
    st.crew.includes(currentMemberId)
  );

  if (hintEl) {
    if (autoGpsEnabled && isOnBoard) {
      hintEl.innerHTML = '🟢 <strong>Suivi actif :</strong> vous êtes à bord sur l\'eau, votre position mettra Tombola à jour automatiquement.';
    } else if (autoGpsEnabled) {
      hintEl.innerHTML = '⏸️ <strong>En veille :</strong> le suivi est armé, mais ne s\'activera que lorsque vous serez déclaré à bord (statut « Sur l\'eau »).';
    } else {
      hintEl.innerHTML = 'Anti-conflit : même activé ici, votre téléphone n\'envoie sa position que si Tombola est <strong>« Sur l\'eau »</strong> et que vous êtes inscrit dans l\'équipage à bord.';
    }
  }

  const shouldWatch = autoGpsEnabled && isOnBoard && 'geolocation' in navigator;
  if (shouldWatch && gpsWatchId === null) {
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastAutoGpsSentAt < 60000) return;
        lastAutoGpsSentAt = now;
        sendGpsStatus(pos.coords.latitude, pos.coords.longitude, currentMemberId, false);
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
    );
  } else if (!shouldWatch && gpsWatchId !== null) {
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
}

// Temps réel via Supabase Realtime (postgres_changes)
function scheduleReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(async () => {
    if (!hasActiveAuthSession()) return;
    try {
      await loadAllState();
    } catch {
      // ignorer les erreurs réseau transitoires lors du resync
    }
  }, 250);
}

async function connectRealtime() {
  if (!hasActiveAuthSession()) return;
  if (realtimeChannel) {
    await sbClient.removeChannel(realtimeChannel).catch(() => {});
    realtimeChannel = null;
  }

  sbClient.realtime.setAuth(currentAuthSession.access_token);
  realtimeChannel = sbClient
    .channel('tombola-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      () => scheduleReload()
    )
    .subscribe();
}

async function init() {
  setupDialogFallbacks();
  applyHelpVisibility();
  bindEvents();
  loadWeather(false);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  sbClient.auth.onAuthStateChange((_event, session) => {
    currentAuthSession = session;
    if (session?.access_token) {
      sbClient.realtime.setAuth(session.access_token);
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      loadWeather(false);
      if (hasActiveAuthSession()) scheduleReload();
    }
  });

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      loadWeather(false);
    }
  }, WEATHER_REFRESH_MS);

  try {
    const loaded = await loadAllState();
    if (!loaded) {
      renderHeaderProfile();
      openProfileDialog();
      return;
    }

    await connectRealtime();
    if (!currentMemberId) {
      openProfileDialog();
    }
  } catch (err) {
    showToast(err.message || 'Impossible de joindre Supabase.', true);
    renderHeaderProfile();
    openProfileDialog();
  }
}

document.addEventListener('DOMContentLoaded', init);
