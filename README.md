# Collectif Tombola ⛵️

Projet de navigation fluviale sur la Loire en toue sablière, au départ de **Rochecorbon (Port du Pélio)** en partenariat avec l'association **La Rabouilleuse**.

---

## 🌐 Application Web en ligne (PWA)

- **Accès direct pour les 11 co-usagers** : **https://krieknini-hue.github.io/tombola/**
- **Installer sur smartphone (en 1 touche)** :
  - **iPhone / iPad (Safari)** : ouvrir l'adresse ci-dessus, toucher le bouton **Partager** (`⬆️`) puis **« Sur l'écran d'accueil »**.
  - **Android (Chrome)** : ouvrir l'adresse ci-dessus, toucher le menu `⋮` puis **« Ajouter à l'écran d'accueil »** (ou **« Installer l'application »**).

---

## 🧱 Architecture technique

- **Frontend statique (GitHub Pages)** : `webapp/public/` (HTML5, CSS3, Vanilla JS, Service Worker PWA, `@supabase/supabase-js` v2).
- **Backend & Temps réel (Supabase)** :
  - **PostgreSQL + RLS strict** : 9 tables collaboratives protégées par Row Level Security (`TO authenticated`).
  - **Edge Function (`collective-auth`)** : vérifie le code partagé côté serveur et délivre une session Supabase Auth sans mot de passe individuel ni exposition de clé secrète.
  - **Supabase Realtime (`postgres_changes`)** : synchronisation instantanée entre les téléphones du collectif.
  - **Supabase Storage (`tombola-docs`, bucket privé)** : stockage sécurisé des photos de bord/discussion et des documents officiels (compte-rendu PDF et trames juridiques), accessibles uniquement via URL signées après authentification.

> **Confidentialité** : les enregistrements/transcriptions des réunions (`reunions/`) et les trames juridiques sources (`juridique/`) sont exclus du dépôt public GitHub et restent en local / dans le bucket Storage privé Supabase.

---

## 📁 Organisation du dépôt

- 📄 **[SYNTHESE_WEBAPP_TOMBOLA.md](./SYNTHESE_WEBAPP_TOMBOLA.md)** : synthèse fonctionnelle et architecture de la Web App.
- ⛵ **[webapp/](./webapp/)** :
  - `webapp/public/` : application statique déployée automatiquement sur GitHub Pages via `.github/workflows/deploy-pages.yml`.
  - `webapp/supabase_schema.sql` : schéma PostgreSQL, privilèges, RLS, Realtime et Storage.
  - `webapp/data/seed.js` : données initiales des 11 membres, chantiers et sorties types.
  - `webapp/server.js` : serveur Node.js local de secours (`node webapp/server.js` sur `http://localhost:3000`).
- ⚡ **[supabase/functions/collective-auth/index.ts](./supabase/functions/collective-auth/index.ts)** : Edge Function d'authentification du collectif.

### Fonctionnalités principales (5 onglets)
- **Bateau** : statut en direct (`Vert / Bleu / Orange`), schéma illustré de la Loire (`Tours ↔ Amboise`), suivi GPS anti-conflit (« Équipage à bord ») et tour de rôle d'écopage (11 membres).
- **Planning** : 3 vues (**Liste**, **Semaine**, **Mois**), chantiers de carénage, sorties ouvertes/privées, bivouacs et activation directe du statut chantier.
- **Essence & Mesure** : jauge nourrice, calculateur par pesée (ou complément au repère) avec division automatique entre co-usagers, et encart réductible `* Mesure du temps passé` (heures sur l'eau et chantier, mode test sans points).
- **Journal** : Journal de bord des sorties, Charte collaborative, Frigo à idées, Documents collaboratifs façon Trello (`Convention & Docs` + accès sécurisé aux documents officiels), et fiches pratiques bateau.
- **Discussion** : messagerie temps réel (bulles, messages épinglés, réactions `👍`/`⛵`/`🛠️`, messages rapides et photos compressées).
