// Données initiales du Collectif Tombola (remise à zéro : uniquement les éléments réels du cadrage de novembre 2026)

function addDaysISO(baseDate, days) {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getNextWeekdayOffset(fromDate, targetDay) {
  // targetDay: 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const current = fromDate.getDay();
  return (targetDay - current + 7) % 7;
}

function createInitialState(now = new Date()) {
  const dimOffset = getNextWeekdayOffset(now, 0);
  const marOffset = dimOffset + 2;
  const venOffset = dimOffset + 5;
  const samOffset = dimOffset + 6;

  const members = [
    { id: 'amande', name: 'Amande', short: 'Am', color: '#2a7f62', role: 'Animation & Chantier', avatarUrl: '' },
    { id: 'anthony', name: 'Anthony', short: 'An', color: '#1b5e7a', role: 'Chantier & Web App', avatarUrl: '' },
    { id: 'jeanne', name: 'Jeanne', short: 'Je', color: '#8f4f2b', role: 'Convention & Charte', avatarUrl: '' },
    { id: 'julie', name: 'Julie', short: 'Ju', color: '#6b4c9a', role: 'Navigation & Armement', avatarUrl: '' },
    { id: 'tom', name: 'Tom', short: 'To', color: '#2b6cb0', role: 'Voile & Coque', avatarUrl: '' },
    { id: 'fred', name: 'Fred', short: 'Fr', color: '#b45309', role: 'Finitions & Mesure', avatarUrl: '' },
    { id: 'didi', name: 'Lydie (Didi)', short: 'Di', color: '#be185d', role: 'Co-utilisatrice', avatarUrl: '' },
    { id: 'nicolas', name: 'Nicolas', short: 'Ni', color: '#0f766e', role: 'Co-utilisateur', avatarUrl: '' },
    { id: 'dimitri', name: 'Dimitri', short: 'Dm', color: '#4338ca', role: 'Co-utilisateur', avatarUrl: '' },
    { id: 'pascal', name: 'Pascal', short: 'Pa', color: '#047857', role: 'Co-utilisateur', avatarUrl: '' },
    { id: 'stephane', name: 'Stéphane', short: 'St', color: '#475569', role: 'Co-utilisateur', avatarUrl: '' }
  ];

  const loireSpots = [
    { id: 'tours', name: 'Tours (Pont Wilson / Île Aucard)', kmIndex: 0, lat: 47.3982, lng: 0.6845, tip: 'Attention au courant sous les piles des ponts.' },
    { id: 'marmoutier', name: 'Sainte-Radegonde / Marmoutier', kmIndex: 1, lat: 47.4034, lng: 0.7180, tip: 'Belle vue sur les coteaux et calme le matin.' },
    { id: 'pelio', name: 'Port du Pélio (Rochecorbon)', kmIndex: 2, lat: 47.4065, lng: 0.7552, tip: 'Port d\'attache habituel de Tombola. Trappe moteur cadenassée.' },
    { id: 'vouvray', name: 'Île de la Métairie / Vouvray', kmIndex: 3, lat: 47.4048, lng: 0.7931, tip: 'Bancs de sable changeants selon la hauteur d\'eau.' },
    { id: 'montlouis', name: 'Montlouis-sur-Loire (La Bourdaisière)', kmIndex: 4, lat: 47.3905, lng: 0.8240, tip: 'Halte abritée possible rive gauche.' },
    { id: 'lussault', name: 'Lussault-sur-Loire', kmIndex: 5, lat: 47.3970, lng: 0.9165, tip: 'Bivouac sauvage facile sur les grèves.' },
    { id: 'amboise', name: 'Île d\'Or (Amboise)', kmIndex: 6, lat: 47.4139, lng: 0.9825, tip: 'Escales de 2 jours / nuit au mouillage.' }
  ];

  const nowIso = now.toISOString();

  return {
    collectiveCode: process.env.COLLECTIVE_CODE || '',
    boatName: 'Tombola',
    boatSubtitle: 'Toue sablière • Port du Pélio (Rochecorbon) • La Rabouilleuse',
    members,
    loireSpots,
    boatStatus: {
      state: 'chantier',
      crew: [],
      lastWaterCrew: [],
      outingType: 'open',
      maxSeats: 4,
      returnTime: '',
      note: 'Bateau en chantier au Port du Pélio (préparation, pièce de bois et carénage avant remise à l\'eau).',
      location: {
        spotId: 'pelio',
        name: 'Port du Pélio (Rochecorbon)',
        kmIndex: 2,
        lat: 47.4065,
        lng: 0.7552,
        isGps: false,
        updatedAt: nowIso
      },
      updatedBy: 'anthony',
      updatedAt: nowIso
    },
    ecopage: {
      rotationOrder: ['fred', 'amande', 'anthony', 'jeanne', 'julie', 'tom', 'didi', 'nicolas', 'dimitri', 'pascal', 'stephane'],
      currentIndex: 0,
      weekLabel: 'Au démarrage après chantier',
      lastCheckedBy: '',
      lastCheckedAt: '',
      stateNote: 'Bateau actuellement en chantier — le tour de rôle d\'écopage démarrera à la remise à l\'eau.'
    },
    priorityConfig: {
      weekdayPerHour: 1,
      weekendPerHour: 2.5,
      openDiscount: 0.5,
      lastMinuteFree: true,
      includeChantier: false
    },
    bookings: [
      {
        id: 'bk-chantier-1',
        title: 'Chantier pièce de bois (coque tribord avant)',
        date: addDaysISO(now, dimOffset),
        endDate: addDaysISO(now, dimOffset),
        startTime: '09:30',
        endTime: '12:30',
        type: 'chantier',
        authorId: 'anthony',
        participants: ['anthony', 'tom'],
        maxSeats: 6,
        isLastMinute: false,
        note: 'Fabrication, ajustement et pose de la pièce de bois sur la coque avant tribord.',
        createdAt: nowIso
      },
      {
        id: 'bk-chantier-2',
        title: 'Carénage Étape 1 : Décapage & Goudron de Norvège',
        date: addDaysISO(now, marOffset),
        endDate: addDaysISO(now, marOffset),
        startTime: '09:00',
        endTime: '12:30',
        type: 'chantier',
        authorId: 'amande',
        participants: ['amande'],
        maxSeats: 8,
        isLastMinute: false,
        note: 'Nettoyage complet puis première couche de goudron de Norvège (brai de pin) sur les bois. Ouvert aux dispos.',
        createdAt: nowIso
      },
      {
        id: 'bk-chantier-3',
        title: 'Carénage Étape 2 : Produit gras étanche (Gros coup de main)',
        date: addDaysISO(now, venOffset),
        endDate: addDaysISO(now, venOffset),
        startTime: '14:00',
        endTime: '18:00',
        type: 'chantier',
        authorId: 'amande',
        participants: ['amande'],
        maxSeats: 11,
        isLastMinute: false,
        note: 'Produit très épais qui sèche vite : appel au maximum de bras avec vieux vêtements et gros pinceaux.',
        createdAt: nowIso
      },
      {
        id: 'bk-chantier-4',
        title: 'Finitions, armement & sécurisation trappe moteur',
        date: addDaysISO(now, samOffset),
        endDate: addDaysISO(now, samOffset),
        startTime: '09:30',
        endTime: '12:30',
        type: 'chantier',
        authorId: 'fred',
        participants: ['fred', 'julie'],
        maxSeats: 8,
        isLastMinute: false,
        note: 'Vérification du matériel de sécurité, installation du cadenas à code et rangement du bateau.',
        createdAt: nowIso
      }
    ],
    fuel: {
      mode: 'scale',
      emptyTankKg: 1.8,
      fullTankKg: 10.8,
      densityKgPerL: 0.75,
      pricePerLiter: 1.85,
      currentWeightKg: 9.3,
      logs: []
    },
    todos: [
      {
        id: 'todo-1',
        title: 'Peson électronique à crochet (pesée nourrice suspendue)',
        kind: 'course',
        done: false,
        authorId: 'anthony',
        note: 'Permet de peser la nourrice dans le vide sans avoir besoin de la sortir ni de surface plane.',
        createdAt: nowIso
      },
      {
        id: 'todo-2',
        title: 'Cadenas à code résistant pour la trappe sous moteur',
        kind: 'course',
        done: false,
        authorId: 'amande',
        note: 'Pour sécuriser la nourrice et le peson dans la trappe.',
        createdAt: nowIso
      },
      {
        id: 'todo-3',
        title: 'Goudron de Norvège (brai de pin), produit gras & gros pinceaux',
        kind: 'course',
        done: false,
        authorId: 'amande',
        note: 'Nécessaire pour les chantiers de mardi et vendredi.',
        createdAt: nowIso
      },
      {
        id: 'todo-4',
        title: 'Retailler ou adapter la bourde (gaffe)',
        kind: 'tache',
        done: false,
        authorId: 'tom',
        note: 'Actuellement trop longue et tape dans les haubans lors des manœuvres.',
        createdAt: nowIso
      }
    ],
    charterSections: [
      {
        id: 'ch-1',
        title: '1. Esprit du collectif & Co-utilisation (La Rabouilleuse)',
        content: 'Tombola appartient à une aventure collective en partenariat avec l\'association La Rabouilleuse (statut de membres co-utilisateurs). Ce bateau n\'est pas une location commerciale : on en prend soin ensemble, dans la confiance et l\'entraide.',
        updatedBy: 'jeanne',
        updatedAt: nowIso,
        history: []
      },
      {
        id: 'ch-2',
        title: '2. Sécurité sur la Loire & Navigation sous voile',
        content: 'Gilets de sauvetage obligatoires pour tout le monde. Par vent soutenu (> 30-40 km/h), TOUJOURS laisser le moteur tourner au ralenti sous voile pour pouvoir redresser l\'étrave immédiatement si le courant pousse vers les branches. À la voile, celui qui tient la barre donne les ordres clairs et l\'équipage exécute sans attendre. Prévenir sur l\'appli dès qu\'on part.',
        updatedBy: 'tom',
        updatedAt: nowIso,
        history: []
      },
      {
        id: 'ch-3',
        title: '3. Partage du planning : sorties ouvertes, famille & priorité',
        content: 'On distingue les sorties "Ouvertes" (où les autres membres peuvent monter s\'il reste des places sur 4-5 max) et les sorties "Privées / Famille". Les week-ends et jours fériés sont des créneaux précieux dont l\'ordre de priorité se calcule selon la qualité des jours ; en semaine ou à la dernière minute, la liberté est totale.',
        updatedBy: 'amande',
        updatedAt: nowIso,
        history: []
      },
      {
        id: 'ch-4',
        title: '4. Gestion de l\'essence (Peson à crochet vs Repère)',
        content: 'Deux options sont en test : soit accrocher et soulever la nourrice dans le vide avec le peson numérique au départ et au retour (pas besoin de surface plane ni de sortir la nourrice, l\'appli calcule les litres au réel), soit refaire le plein jusqu\'au repère depuis les bidons à La Rabouilleuse.',
        updatedBy: 'anthony',
        updatedAt: nowIso,
        history: []
      },
      {
        id: 'ch-5',
        title: '5. Écopage hebdomadaire & Soin après chaque sortie',
        content: 'Après chaque navigation : ranger le matériel, nettoyer le pont, fermer la trappe moteur avec le cadenas à code, et signaler le retour sur l\'appli. En plus, un membre différent est responsable chaque semaine de passer vérifier et écoper le bateau.',
        updatedBy: 'julie',
        updatedAt: nowIso,
        history: []
      }
    ],
    ideas: [],
    photos: [],
    logbookEntries: [
      {
        id: 'log-1',
        date: addDaysISO(now, -5),
        title: 'Essai navigation sous voile par 55 km/h de vent',
        authorId: 'tom',
        crew: ['tom', 'anthony'],
        weather: 'Vent fort ~55 km/h • Loire agitée',
        story: 'Très belles sensations de glisse sous voile ! Le bateau prend bien le vent et gîte de façon marquée. Belle réactivité pour affaler et éviter un banc de sable.',
        boatNotes: 'Consigne Clément & Titouan : par vent fort, garder le moteur au ralenti sous voile pour redresser l\'étrave immédiatement. Bourde trop grande (heurte les haubans).',
        imageData: '',
        createdAt: addDaysISO(now, -5) + 'T17:15:00.000Z'
      },
      {
        id: 'log-2',
        date: addDaysISO(now, -9),
        title: 'Test moteur & inspection de la coque au Port du Pélio',
        authorId: 'julie',
        crew: ['julie', 'anthony'],
        weather: 'Temps calme • Courant modéré',
        story: 'Descente au Port du Pélio avec Clément, inspection sous tous les caillebotis et essai du moteur d\'appoint sur l\'eau.',
        boatNotes: 'Aucune voie d\'eau détectée. Petite durite renifleur de refroidissement réparée. Prévoir pièce de bois sur coque avant tribord.',
        imageData: '',
        createdAt: addDaysISO(now, -9) + 'T16:30:00.000Z'
      },
      {
        id: 'log-3',
        date: addDaysISO(now, -3),
        title: 'Sortie navigation en solo',
        authorId: 'anthony',
        crew: ['anthony'],
        weather: 'Conditions clémentes',
        story: 'Sortie en solo sur la Loire qui s\'est très bien faite, bonne prise en main du bateau seul à bord.',
        boatNotes: 'Confirme l\'intérêt de ramener les drisses à portée du barreur pour faciliter les manœuvres en solo.',
        imageData: '',
        createdAt: addDaysISO(now, -3) + 'T16:00:00.000Z'
      }
    ],
    collabDocs: [
      {
        id: 'doc-convention',
        title: 'Projet de Convention de co-utilisation — La Rabouilleuse',
        status: 'draft',
        authorId: 'jeanne',
        updatedBy: 'jeanne',
        updatedAt: nowIso,
        content: 'Cadre juridique proposé à l\'association La Rabouilleuse : statut de membres co-utilisateurs associatifs (et non location commerciale) pour 1 an, intégration des 11 membres sous la Responsabilité Civile (RCP) de l\'association, distinction claire entre usure normale du bateau et négligence.',
        history: [],
        proposals: []
      }
    ],
    messages: [
      {
        id: 'msg-init',
        authorId: 'anthony',
        category: 'info',
        pinned: true,
        reactions: { '👍': [], '⛵': [], '🛠️': [] },
        text: '🚧 Version démo remise à zéro : seuls les 4 chantiers de la réunion, les 3 premières navigations et la liste des achats/tâches sont enregistrés. Utilisez WhatsApp pour discuter, ce fil trace l\'activité de l\'appli !',
        createdAt: nowIso
      }
    ]
  };
}

module.exports = { createInitialState };
