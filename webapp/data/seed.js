// Données initiales du Collectif Tombola (issues du cadrage de novembre 2026)

function addDaysISO(baseDate, days) {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getNextWeekdayOffset(fromDate, targetDay) {
  // targetDay: 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  const current = fromDate.getDay();
  let diff = (targetDay - current + 7) % 7;
  if (diff === 0) diff = 7;
  return diff;
}

function createInitialState(now = new Date()) {
  const dimOffset = getNextWeekdayOffset(now, 0); // Dimanche prochain
  const marOffset = dimOffset + 2; // Mardi suivant
  const venOffset = dimOffset + 5; // Vendredi suivant
  const samOffset = dimOffset + 6; // Samedi suivant
  const dim2Offset = dimOffset + 7; // Dimanche d'après
  const mer2Offset = dimOffset + 10; // Mercredi suivant
  const sam2Offset = dimOffset + 13; // Week-end d'après

  const members = [
    { id: 'amande', name: 'Amande', short: 'Am', color: '#2a7f62', role: 'Animation & Chantier' },
    { id: 'anthony', name: 'Anthony', short: 'An', color: '#1b5e7a', role: 'Chantier & Web App' },
    { id: 'jeanne', name: 'Jeanne', short: 'Je', color: '#8f4f2b', role: 'Convention & Charte' },
    { id: 'julie', name: 'Julie', short: 'Ju', color: '#6b4c9a', role: 'Navigation & Armement' },
    { id: 'tom', name: 'Tom', short: 'To', color: '#2b6cb0', role: 'Voile & Coque' },
    { id: 'fred', name: 'Fred', short: 'Fr', color: '#b45309', role: 'Finitions & Équité' },
    { id: 'didi', name: 'Lydie (Didi)', short: 'Di', color: '#be185d', role: 'Co-utilisatrice' },
    { id: 'nicolas', name: 'Nicolas', short: 'Ni', color: '#0f766e', role: 'Co-utilisateur' },
    { id: 'dimitri', name: 'Dimitri', short: 'Dm', color: '#4338ca', role: 'Co-utilisateur' },
    { id: 'pascal', name: 'Pascal', short: 'Pa', color: '#047857', role: 'Co-utilisateur' },
    { id: 'stephane', name: 'Stéphane', short: 'St', color: '#475569', role: 'Co-utilisateur' }
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
      state: 'mooring', // 'mooring' | 'water' | 'chantier'
      crew: [],
      lastWaterCrew: [],
      outingType: 'open', // 'open' | 'private'
      maxSeats: 4,
      returnTime: '',
      note: 'Amarré au Port du Pélio (Rochecorbon). Prêt pour les chantiers de carénage avant remise à l\'eau.',
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
      weekLabel: 'Semaine en cours',
      lastCheckedBy: 'julie',
      lastCheckedAt: addDaysISO(now, -2) + 'T17:30:00.000Z',
      stateNote: 'Caillebotis inspectés, fonds secs. Petite durite renifleur moteur réparée.'
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
        maxSeats: 5,
        isLastMinute: false,
        note: 'Confection, ajustement et pose de la pièce de bois sur la coque avant tribord.',
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
        participants: ['amande', 'dimitri'],
        maxSeats: 6,
        isLastMinute: false,
        note: 'Nettoyage complet puis première couche de goudron de Norvège (brai de pin) sur les bois.',
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
        participants: ['amande', 'anthony', 'jeanne', 'julie', 'fred', 'nicolas'],
        maxSeats: 10,
        isLastMinute: false,
        note: 'Produit très épais qui sèche vite : venez nombreux avec des vieux vêtements et gros pinceaux !',
        createdAt: nowIso
      },
      {
        id: 'bk-chantier-4',
        title: 'Finitions, armement & pose cadenas trappe moteur',
        date: addDaysISO(now, samOffset),
        endDate: addDaysISO(now, samOffset),
        startTime: '09:30',
        endTime: '12:30',
        type: 'chantier',
        authorId: 'fred',
        participants: ['fred', 'julie'],
        maxSeats: 6,
        isLastMinute: false,
        note: 'Vérification du matériel de sécurité (gilets, rames, bout, écope) et installation balance + cadenas.',
        createdAt: nowIso
      },
      {
        id: 'bk-nav-1',
        title: 'Balade voile & moteur vers Vouvray',
        date: addDaysISO(now, dim2Offset),
        endDate: addDaysISO(now, dim2Offset),
        startTime: '14:00',
        endTime: '17:30',
        type: 'open',
        authorId: 'tom',
        participants: ['tom', 'anthony'],
        maxSeats: 4,
        isLastMinute: false,
        note: 'Sortie ouverte au collectif pour tester la voile tranquillement.',
        createdAt: nowIso
      },
      {
        id: 'bk-nav-2',
        title: 'Sortie famille en après-midi',
        date: addDaysISO(now, mer2Offset),
        endDate: addDaysISO(now, mer2Offset),
        startTime: '14:30',
        endTime: '17:00',
        type: 'private',
        authorId: 'amande',
        participants: ['amande'],
        maxSeats: 4,
        isLastMinute: false,
        note: 'Sortie privée en famille (4 personnes à bord).',
        createdAt: nowIso
      },
      {
        id: 'bk-nav-3',
        title: 'Itinérance & Bivouac 2 jours vers l\'Île d\'Or (Amboise)',
        date: addDaysISO(now, sam2Offset),
        endDate: addDaysISO(now, sam2Offset + 1),
        startTime: '09:30',
        endTime: '18:00',
        type: 'open',
        authorId: 'jeanne',
        participants: ['jeanne', 'julie'],
        maxSeats: 4,
        isLastMinute: false,
        note: 'Bivouac sur une île de Loire vers Amboise. On mettra notre position sur la carte pour nous rejoindre !',
        createdAt: nowIso
      }
    ],
    fuel: {
      mode: 'scale', // 'scale' (Option 1 : Pesée balance) | 'mark' (Option 2 : Complément au repère)
      emptyTankKg: 1.8,
      fullTankKg: 10.8, // 1.8 kg nourrice + 12 L * 0.75 kg/L = 10.8 kg
      densityKgPerL: 0.75,
      pricePerLiter: 1.85,
      currentWeightKg: 9.3, // ~10 L dans la nourrice
      logs: [
        {
          id: 'fuel-1',
          kind: 'outing',
          date: addDaysISO(now, -4),
          memberId: 'tom',
          participants: ['tom', 'anthony'],
          crewNames: 'Tom, Anthony',
          startKg: 10.2,
          endKg: 9.3,
          litersUsed: 1.2,
          costEur: 2.22,
          note: 'Sortie essai voile par 55 km/h de vent (moteur laissé au ralenti en sécurité).'
        },
        {
          id: 'fuel-2',
          kind: 'outing',
          date: addDaysISO(now, -8),
          memberId: 'julie',
          participants: ['julie', 'anthony'],
          crewNames: 'Julie, Anthony',
          startKg: 10.8,
          endKg: 10.2,
          litersUsed: 0.8,
          costEur: 1.48,
          note: 'Test moteur et inspection coque au Port du Pélio.'
        }
      ]
    },
    equityConfig: {
      enabled: true, // Peut être mis en pause en 1 clic pour en discuter
      note: 'Outil d\'auto-mesure bienveillante (pas de blocage rigide) : aide chacun à voir la rareté des créneaux.',
      weights: {
        weekdayPerHour: 0.5,
        weekendPerHour: 2.0,
        lastMinuteFree: true,
        openOutingDiscount: 0.5,
        chantierBonusPerHour: 1.0
      }
    },
    charterSections: [
      {
        id: 'ch-1',
        title: '1. Esprit du collectif & Co-utilisation (La Rabouilleuse)',
        content: 'Tombola appartient à une aventure collective en partenariat avec l\'association La Rabouilleuse (statut de membres co-utilisateurs). Ce bateau n\'est pas une location commerciale : on en prend soin ensemble, dans la confiance et l\'entraide.',
        updatedBy: 'jeanne',
        updatedAt: nowIso,
        history: [{ authorId: 'jeanne', date: nowIso, note: 'Première trame issue du cadrage' }]
      },
      {
        id: 'ch-2',
        title: '2. Sécurité sur la Loire & Navigation sous voile',
        content: 'Gilets de sauvetage obligatoires pour tout le monde. Par vent soutenu (> 30-40 km/h), TOUJOURS laisser le moteur tourner au ralenti sous voile pour pouvoir redresser l\'étrave immédiatement si le courant pousse vers les branches. À la voile, celui qui tient la barre donne les ordres clairs et l\'équipage exécute sans attendre. Prévenir sur l\'appli (statut Vert/Rouge) dès qu\'on part.',
        updatedBy: 'tom',
        updatedAt: nowIso,
        history: [{ authorId: 'tom', date: nowIso, note: 'Ajout de la consigne moteur au ralenti (conseil Clément & Titouan)' }]
      },
      {
        id: 'ch-3',
        title: '3. Partage du planning : sorties ouvertes, famille & dernière minute',
        content: 'On distingue les sorties "Ouvertes" (où les autres membres peuvent monter s\'il reste des places sur 4-5 max) et les sorties "Privées / Famille" (pour inviter ses proches). Les week-ends et jours fériés sont des créneaux précieux à partager équitablement ; en semaine ou à la dernière minute (quelques heures avant), la liberté est totale !',
        updatedBy: 'amande',
        updatedAt: nowIso,
        history: [{ authorId: 'amande', date: nowIso, note: 'Équilibre semaine / week-end et sorties ouvertes' }]
      },
      {
        id: 'ch-4',
        title: '4. Gestion de l\'essence (Balance vs Repère)',
        content: 'Deux options sont en discussion et testées dans l\'appli : soit peser la nourrice au départ et au retour sur la balance numérique embarquée (l\'appli calcule les litres au réel), soit refaire systématiquement le plein jusqu\'au repère depuis les bidons à La Rabouilleuse.',
        updatedBy: 'anthony',
        updatedAt: nowIso,
        history: [{ authorId: 'anthony', date: nowIso, note: 'Règle de trois balance numérique' }]
      },
      {
        id: 'ch-5',
        title: '5. Écopage hebdomadaire & Soin après chaque sortie',
        content: 'Après chaque navigation : ranger le matériel, nettoyer le pont, fermer la trappe moteur avec le cadenas à code, et signaler le retour sur l\'appli. En plus, un membre différent est responsable chaque semaine de passer vérifier et écoper le bateau.',
        updatedBy: 'julie',
        updatedAt: nowIso,
        history: [{ authorId: 'julie', date: nowIso, note: 'Rotation d\'écopage d\'une semaine par une semaine' }]
      }
    ],
    ideas: [
      {
        id: 'idea-1',
        title: 'Retailler la bourde (gaffe) qui touche les haubans',
        description: 'Lors des manœuvres, la bourde actuelle est trop grande pour le bateau et tape dans les haubans. La raccourcir ou en emprunter une plus adaptée.',
        authorId: 'tom',
        status: 'discussion', // 'discussion' | 'test' | 'acte'
        votes: ['tom', 'anthony', 'julie'],
        createdAt: nowIso
      },
      {
        id: 'idea-2',
        title: 'Ramener toutes les drisses au poste de pilotage (voile solo)',
        description: 'Installer des taquets coinceurs près du barreur pour pouvoir affaler d\'urgence même seul ou avec des enfants à bord.',
        authorId: 'anthony',
        status: 'discussion',
        votes: ['anthony', 'tom', 'amande'],
        createdAt: nowIso
      },
      {
        id: 'idea-3',
        title: 'Pondération des créneaux précieux (week-end vs semaine)',
        description: 'Utiliser les couleurs (Vert = semaine libre, Rouge = week-end précieux) comme boussole personnelle plutôt qu\'un blocage strict. À tester puis ajuster en janvier.',
        authorId: 'fred',
        status: 'test',
        votes: ['fred', 'anthony', 'nicolas', 'amande'],
        createdAt: nowIso
      },
      {
        id: 'idea-4',
        title: 'Cadenas à code résistant + balance numérique dans la trappe',
        description: 'Sécuriser la trappe sous le moteur pour y laisser la nourrice et la petite balance de pesée.',
        authorId: 'amande',
        status: 'acte',
        votes: ['amande', 'anthony', 'julie', 'jeanne'],
        createdAt: nowIso
      }
    ],
    guides: [
      {
        id: 'guide-moteur',
        icon: '⚙️',
        title: 'Démarrer le moteur & points de vigilance',
        summary: 'Vérifier la durite de refroidissement, l\'essence et la sécurité trappe.',
        steps: [
          'Ouvrir le cadenas à code de la trappe sous le moteur et vérifier le niveau d\'essence (ou peser la nourrice avant de partir).',
          'Brancher le tuyau d\'essence avec la poire flèche vers le moteur, pomper jusqu\'à ce qu\'elle soit ferme, et ouvrir la vis d\'évent du bouchon.',
          'Vérifier la petite durite renifleur de refroidissement (maintenue par le collier Colson) : de l\'eau doit pisser dès que le moteur tourne.',
          'Penser à relever l\'embase si on approche d\'un banc de sable peu profond.'
        ]
      },
      {
        id: 'guide-voile',
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
        icon: '⚓',
        title: 'Check-list retour au Port du Pélio',
        summary: 'Les 5 gestes simples pour laisser Tombola nickel au suivant.',
        steps: [
          'Amarrer proprement à l\'emplacement prévu (double amarre si crue ou vent annoncé).',
          'Écoper si besoin et nettoyer les traces de boue/sable sur les caillebotis.',
          'Couper l\'évent de la nourrice, peser la nourrice sur la balance et noter le poids dans l\'appli (onglet Essence).',
          'Refermer la trappe moteur avec le cadenas à code.',
          'Cliquer sur « Je suis rentré au Pélio » sur l\'appli pour que le voyant repasse au vert.'
        ]
      }
    ],
    logbookEntries: [
      {
        id: 'log-1',
        date: addDaysISO(now, -4),
        title: 'Première navigation sous voile par 55 km/h de vent',
        authorId: 'tom',
        crew: ['tom', 'anthony'],
        weather: 'Vent fort ~55 km/h • Loire agitée',
        story: 'Superbes sensations de glisse sous voile ! Le bateau prend bien le vent et gîte de façon marquée. Belle réaction en équipage pour éviter un banc de sable et affaler proprement.',
        boatNotes: 'À retenir : garder le moteur au ralenti par vent soutenu pour redresser l\'étrave rapidement. La bourde est trop grande et heurte les haubans.',
        imageData: '',
        createdAt: addDaysISO(now, -4) + 'T17:15:00.000Z'
      },
      {
        id: 'log-2',
        date: addDaysISO(now, -8),
        title: 'Test moteur & inspection de la coque au Port du Pélio',
        authorId: 'julie',
        crew: ['julie', 'anthony'],
        weather: 'Temps calme • Courant modéré',
        story: 'Descente au Port du Pélio, inspection sous tous les caillebotis et premier essai moteur sur l\'eau.',
        boatNotes: 'Aucune voie d\'eau détectée. Petite durite renifleur de refroidissement réparée avec un collier Colson. Prévoir pièce de bois sur coque avant tribord.',
        imageData: '',
        createdAt: addDaysISO(now, -8) + 'T16:30:00.000Z'
      }
    ],
    collabDocs: [
      {
        id: 'doc-convention',
        title: 'Projet de Convention de co-utilisation — La Rabouilleuse',
        status: 'review', // 'draft' | 'review' | 'validated'
        authorId: 'jeanne',
        updatedBy: 'jeanne',
        updatedAt: nowIso,
        content: 'Cadre juridique proposé à l\'association La Rabouilleuse : statut de membres co-utilisateurs associatifs (et non location commerciale) pour 1 an, intégration des 11 membres sous la Responsabilité Civile (RCP) de l\'association, distinction claire entre usure normale du bateau et négligence.',
        history: [
          { authorId: 'jeanne', date: nowIso, note: 'Première trame issue du cadrage de novembre' }
        ],
        proposals: [
          {
            id: 'prop-1',
            authorId: 'amande',
            text: 'Préciser la marche à suivre et qui prévenir en priorité en cas d\'avarie ou de choc sur un banc de sable.',
            votes: ['amande', 'jeanne', 'tom'],
            integrated: false,
            createdAt: addDaysISO(now, -1) + 'T19:00:00.000Z'
          },
          {
            id: 'prop-2',
            authorId: 'anthony',
            text: 'Joindre notre Charte interne en annexe officielle de la convention avant validation en CA / AG.',
            votes: ['anthony', 'jeanne'],
            integrated: true,
            createdAt: nowIso
          }
        ]
      },
      {
        id: 'doc-cr',
        title: 'Compte-rendu & Plan d\'action (Réunion fondatrice)',
        status: 'validated',
        authorId: 'anthony',
        updatedBy: 'anthony',
        updatedAt: nowIso,
        content: 'Synthèse des 5 points validés : retour d\'expérience essais, 4 demi-journées de chantier (pièce de bois tribord, goudron de Norvège, produit gras, armement), gestion essence (balance numérique vs repère), convention La Rabouilleuse, et lancement de la Web App.',
        history: [
          { authorId: 'anthony', date: nowIso, note: 'Publication du compte-rendu officiel (PDF + Markdown)' }
        ],
        proposals: [
          {
            id: 'prop-3',
            authorId: 'jeanne',
            text: 'Caler une réunion collective mi-janvier pour acter les règles définitives après les premiers tests.',
            votes: ['jeanne', 'amande', 'pascal'],
            integrated: false,
            createdAt: nowIso
          }
        ]
      },
      {
        id: 'doc-materiel',
        title: 'Liste matériel & Sécurisation (Trappe, Bourde, Voile solo)',
        status: 'draft',
        authorId: 'fred',
        updatedBy: 'fred',
        updatedAt: nowIso,
        content: 'À équiper sur Tombola : cadenas à code résistant sur la trappe sous moteur, petite balance numérique pour peser la nourrice, gilets pour 5 personnes, bout de remorquage, rames et écope.',
        history: [
          { authorId: 'fred', date: nowIso, note: 'Liste initiale du chantier finitions' }
        ],
        proposals: [
          {
            id: 'prop-4',
            authorId: 'tom',
            text: 'Ajouter des taquets coinceurs au poste de pilotage pour pouvoir affaler d\'urgence même seul.',
            votes: ['tom', 'anthony'],
            integrated: false,
            createdAt: nowIso
          }
        ]
      }
    ],
    messages: [
      {
        id: 'msg-1',
        authorId: 'amande',
        category: 'info',
        pinned: true,
        reactions: { '👍': ['anthony', 'jeanne', 'tom'], '⛵': [], '🛠️': [] },
        text: 'Bienvenue sur notre discussion Tombola ! On garde ici nos échanges du quotidien et on épingle (📌) les infos importantes pour qu\'elles ne se perdent pas.',
        createdAt: addDaysISO(now, -1) + 'T18:10:00.000Z'
      },
      {
        id: 'msg-2',
        authorId: 'tom',
        category: 'materiel',
        pinned: false,
        reactions: { '👍': ['anthony'], '⛵': [], '🛠️': ['anthony', 'amande'] },
        text: 'Pour le chantier de dimanche matin avec Anthony : j\'apporte les outils pour ajuster la pièce de bois sur la coque avant tribord.',
        createdAt: addDaysISO(now, -1) + 'T19:45:00.000Z'
      },
      {
        id: 'msg-3',
        authorId: 'jeanne',
        category: 'info',
        pinned: false,
        reactions: { '👍': ['amande', 'tom'], '⛵': [], '🛠️': [] },
        text: 'J\'ai posé les premières bases de la Charte dans l\'onglet Charte. N\'hésitez pas à cliquer sur « Modifier » ou à ajouter vos idées dans le Frigo avant notre prochaine rencontre !',
        createdAt: nowIso
      }
    ]
  };
}

module.exports = { createInitialState };
