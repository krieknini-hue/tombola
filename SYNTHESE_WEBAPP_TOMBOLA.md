# ⛵ Synthèse complète — Web App « Collectif Tombola »

Document de référence et de passation à la racine du projet. Il récapitule l'état exact de la Web App construite en local, son architecture, ses routes API et la feuille de route pour l'intégration **GitHub + Supabase** lors de la prochaine session.

---

## 1. Philosophie & choix techniques

- **Public cible (11 co-usagers)** : `Amande`, `Anthony`, `Jeanne`, `Julie`, `Tom`, `Fred`, `Lydie (Didi)`, `Nicolas`, `Dimitri`, `Pascal`, `Stéphane` *(Clément et Titouan restent cités dans les consignes historiques en tant qu'encadrants de La Rabouilleuse, non comme co-usagers)*.
- **Ultra-légèreté (smartphones d'entrée de gamme)** : HTML5 / CSS3 / JavaScript Vanilla pur sans framework ni police externe à télécharger, photos compressées côté téléphone avant envoi (`max 800 px`, JPEG `0.7`), zéro dépendance npm externe pour le serveur local (`node:http`, `node:fs`, `node:path`).
- **Didactique** :
  - Bandeau d'aide contextuel (`💡 Aide`) sur chaque onglet (affiché par défaut, masquable en 1 touche).
  - Visite guidée interactive en 4 étapes (`📖 Guide`).
  - Identification simplifiée une bonne fois pour toutes à la première visite (code collectif vérifié côté serveur, mémorisation durable via `localStorage` + cookie 1 an, et correction possible en touchant son prénom en haut à droite `✎`).
- **Temps réel** : flux Server-Sent Events (`GET /api/stream`) côté local, prêt à être remplacé par `supabase.channel(...).on('postgres_changes', ...)` avec Supabase Realtime.

---

## 2. Les 5 onglets fonctionnels de l'application

### ⛵ 1. Bateau (Temps réel, Loire & Écopage)
- **Voyant 3 couleurs sans bouton superflu** :
  - `🟢 AU PORT DU PÉLIO — Libre` : seul le bouton **« ⛵ Je pars sur l'eau »** est affiché.
  - `🔵 SUR L'EAU — En navigation` : équipage à bord, sortie ouverte/privée, heure de retour estimée, boutons **« ⚓ Le bateau est rentré au Pélio »** (qui ouvre une pop-up interactive avec la **check-list retour au port en 5 points** et un accès direct à la pesée d'essence) et **« 📍 Mettre à jour notre position »**.
  - `🟠 EN CHANTIER — Travaux` : déclenché depuis le Planning (`🟠 Activer en direct` sur une carte chantier) ou automatiquement si un chantier du planning tombe sur le créneau horaire actuel, avec bouton **« ⚓ Chantier terminé (bateau libre au Pélio) »**.
- **Schéma illustré de la Loire (`Tours ↔ Amboise`)** : dessin SVG léger avec les 7 repères (`Tours`, `Marmoutier`, `★ Port du Pélio`, `Vouvray`, `Montlouis`, `Lussault`, `Amboise`) et la toue *Tombola* placée dynamiquement sur le fleuve.
- **GPS sans conflit d'usage** : bouton manuel *« 📍 Envoyer la position GPS de mon téléphone »* + case **« 📡 Suivi GPS auto quand je suis à bord »** qui ne s'active que si `state === 'water'` **et** si le membre fait partie de `crew` à bord.
- **Écopage hebdomadaire** : responsable de la semaine (tour de rôle des 11 co-usagers), date et note de la dernière visite, validation ou passage au suivant.

### 📅 2. Planning (Liste / Semaine / Mois)
- **3 visualisations** :
  - **📋 Liste** : vue chronologique avec pastilles de rareté (`🟢 Semaine / libre`, `🔴 Week-end précieux`, `🛠️ Chantier`).
  - **📆 Semaine** : agenda sur 7 jours (`Lun` → `Dim`) avec navigation `◀ / Aujourd'hui / ▶` et bouton `+ Réserver` par jour.
  - **🗓️ Mois** : grille 7 colonnes adaptée mobile + détail complet du jour sélectionné juste en dessous.
- **Actions** : création de sortie ouverte, sortie privée/famille, bivouac multi-jours ou chantier ; inscription/désinscription en 1 touche ; activation en direct d'un chantier.
- **Pré-remplissage initial** : les 4 demi-journées de chantier (pièce de bois tribord, goudron de Norvège, produit gras, finitions/cadenas) + 3 sorties types.

### ⛽ 3. Essence & Mesure du temps passé
- **Nourrice & Balance numérique** : jauge (12 L, vide `1.8 kg` / pleine `10.8 kg`, densité `0.75 kg/L`), bascule *Option 1 : Pesée balance* vs *Option 2 : Complément au repère*, plein/complément.
- **Partage égalitaire entre co-usagers** : sélecteur de balade relié au **Planning** et à la dernière sortie rentrée au port (`lastWaterCrew`), pastilles co-usagers ajustables, division automatique des litres et du coût par le nombre de participants (en aperçu direct, dans les cumuls par membre et dans l'historique).
- **Bloc réductible `* ⏱️ Mesure du temps passé (sur l'eau & au chantier) — Mode test`** :
  - Encart `<details>` réductible avec astérisque (`*`) expliquant explicitement qu'il s'agit d'un mode test d'observation uniquement.
  - Aucun système de points : affichage simple des heures mesurées sur l'eau (`Semaine` / `Week-end`) et au chantier par co-usager.

### 📓 4. Journal (Journal de bord & Espace collaboratif)
Regroupe 5 sous-onglets :
1. **📓 Journal de bord** : récits des sorties et chantiers avec météo, équipage, notes techniques sur le bateau et photo compressée.
2. **📜 Charte** : 5 articles co-éditables avec auteur de dernière modification et historique.
3. **🧊 Frigo à idées** : dépôt d'idées, votes `👍 Moi aussi` et statuts (`En discussion` → `En test` → `Acté`).
4. **📄 Convention & Docs** (esprit Trello) : dossiers collaboratifs éditables (*Projet de Convention La Rabouilleuse*, *Compte-rendu & Plan d'action*, *Liste matériel & Sécurisation*) avec statuts (`📝 Brouillon` → `💬 En relecture` → `✅ Validé`), historique des éditions, propositions supplémentaires signées par chaque auteur (`👍 D'accord`, `✅ Marquer intégré`), plus liens directs vers le PDF de cadrage et les 4 documents juridiques (hébergés dans le bucket Storage privé).
5. **🦺 Fiches bateau** : 4 fiches techniques dépliables (`<details name="fiche-technique">`) pour moteur, voile/affalage d'urgence, matériel de sécurité et check-list retour.

### 💬 5. Discussion (En direct, remplace WhatsApp)
- Bulles en temps réel (alignement droite/gauche selon l'auteur), filtres (`Tout le fil`, `📌 Épinglés`, `⛵ Sorties`, `🔧 Chantier / Matériel`), bandeau des messages épinglés, réactions rapides (`👍`, `⛵`, `🛠️`), 3 messages rapides en 1 clic, envoi photo compressée et validation par `Entrée` (`!e.isComposing`).

---

## 3. Architecture des fichiers et routes API

```text
Tombolla/
├── README.md                              # Sommaire général du projet
├── SYNTHESE_WEBAPP_TOMBOLA.md             # Ce document de synthèse & passation
├── juridique/                             # Documents juridiques & trames convention/charte
├── reunions/2026-11_cadrage/              # Audio, transcriptions, CR HTML/MD/PDF
└── webapp/
    ├── server.js                          # Serveur Node.js autonome (port 3000 par défaut)
    ├── supabase_schema.sql                # Schéma PostgreSQL + index FK + RLS + Realtime + Storage
    ├── data/
    │   ├── seed.js                        # Données initiales (11 membres, chantiers, guides, etc.)
    │   └── state.json                     # État local persisté (à exclure de Git)
    └── public/
        ├── index.html                     # Structure sémantique, onglets & modales <dialog>
        ├── styles.css                     # Design mobile-first Loire & Toue
        ├── app.js                         # Logique client Vanilla JS
        ├── manifest.json                  # Manifeste PWA
        ├── sw.js                          # Service Worker (cache shell + network-first)
        └── icon.svg                       # Icône vectorielle Tombola
```

### Routes servies par [webapp/server.js](./webapp/server.js) (mode local historique)
- **Statiques & Docs** : `/`, `/styles.css`, `/app.js`, `/manifest.json`, `/sw.js`, `/icon.svg`, `/docs/Compte_Rendu_Tombolla_Rochecorbon.pdf`, `/docs/compte_rendu_tombolla.md`, `/docs/juridique/<fichier>.md`
- **API Temps réel & lecture** : `GET /api/state`, `GET /api/stream` (SSE)
- **API Mutations (`POST`)** :
  - `/api/status` (statut bateau, équipage, `lastWaterCrew`, position Loire/GPS)
  - `/api/ecopage` (valider une visite ou passer au suivant)
  - `/api/bookings`, `/api/bookings/toggle-join`, `/api/bookings/delete`
  - `/api/fuel` (pesée partagée entre `participants`, plein/complément, option Balance vs Repère)
  - `/api/charter`, `/api/ideas`, `/api/ideas/vote`
  - `/api/logbook` (nouveau récit au journal de bord)
  - `/api/collab-docs` (`save_doc`, `add_proposal`, `toggle_proposal`, `cycle_status`)
  - `/api/messages`, `/api/messages/react` (réactions `👍`/`⛵`/`🛠️` et épinglage `pinned`)

---

## 4. Guide de passation pour la suite : GitHub + Supabase

Pour la prochaine discussion dédiée au déploiement sur **GitHub** et **Supabase** :

### ⚠️ Sécurité avant `git push` sur GitHub
1. **Mot de passe en clair** : le fichier [README.md](./README.md) contenait initialement une ligne `MDP supabase : ...` qui doit impérativement être retirée avant tout push sur GitHub (et changée dans les paramètres Database de Supabase).
2. **Fichier `.gitignore` recommandé** à créer à la racine avant le premier `git commit` :
   ```gitignore
   .env
   .env.*
   node_modules/
   webapp/data/state.json
   webapp/data/state.json.tmp
   reunions/**/Enregistrement standard 5.mp3
   ```
   *(L'audio `.mp3` de 2h24 et `state.json` de travail local n'ont pas besoin d'alourdir GitHub).*

### 🗄️ Mise en place sur Supabase
1. **Exécuter le schéma SQL** : copier-coller le contenu de [webapp/supabase_schema.sql](./webapp/supabase_schema.sql) dans **SQL Editor** de votre projet Supabase. Il crée les 9 tables (`members` pré-remplie avec les 11 co-usagers, `boat_status`, `bookings`, `fuel_logs`, `charter_sections`, `ideas`, `logbook_entries`, `collab_docs`, `messages`), les index sur clés étrangères, la publication `supabase_realtime`, le bucket Storage `tombola-docs` et active le RLS.
2. **Ajouter les politiques RLS** adaptées au mode choisi :
   - Soit une Edge Function / API Node utilisant `SUPABASE_SERVICE_ROLE_KEY` (ou secret key) côté serveur (vérifiant le code collectif sans exposer la clé secrète côté navigateur),
   - Soit des politiques RLS basées sur Supabase Auth (ou JWT collectif) pour un appel direct depuis le frontend avec `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY`.
3. **Brancher les données initiales (`seed.js`)** : lors du premier démarrage sur Supabase, insérer la ligne initiale `boat_status (id = 1)` et les enregistrements de départ (`bookings`, `charter_sections`, `ideas`, `logbook_entries`, `collab_docs`, `messages`, `fuel_logs`) depuis `webapp/data/seed.js`.
4. **Déploiement** : héberger le frontend statique (`webapp/public/`) + documents (ou migrer les PDF dans le bucket `tombola-docs`) sur **GitHub Pages / Vercel / Netlify / Hostinger**, en connectant le client `@supabase/supabase-js` à la place de `fetch('/api/...')` et `EventSource('/api/stream')`.
