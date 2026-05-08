# JCBO Conseil — Espace Administration

Interface d'administration pour la gestion des adhérents de **JCBO Conseil**, cabinet de conseil aux entreprises.

## Stack technique

- [Astro 6](https://astro.build/) — framework web statique/SSR
- [Tailwind CSS v4](https://tailwindcss.com/) — styles utilitaires
- Données mock (MySQL local prévu)

## Fonctionnalités

| Page | Description |
|---|---|
| `/login` | Authentification administrateur |
| `/dashboard` | Tableau de bord — stats, actualités récentes, messages |
| `/dashboard/actualites` | Gestion et publication des actualités |
| `/dashboard/statistiques` | Indicateurs clés et progression des adhésions |
| `/dashboard/messagerie` | Messagerie style WhatsApp avec les adhérents (IDs uniques) |
| `/dashboard/identifiants` | Génération d'accès pour les nouveaux adhérents |

## Identifiants de démo

```
Email    : jc.boyang@jcbo-conseil.fr
Mot de passe : Jcbo2025!
```

## Structure du projet

```
src/
├── components/
│   ├── navigation/
│   │   ├── Sidebar.astro     # Navigation latérale super admin
│   │   └── Header.astro      # Barre supérieure
│   └── ui/
│       ├── Card.astro        # Conteneur réutilisable
│       ├── Badge.astro       # Étiquette colorée (statuts)
│       └── LogoJCBO.astro    # Logo officiel JCBO Conseil
├── data/
│   └── mock.ts               # Données de démonstration
├── layouts/
│   └── AdherentLayout.astro  # Shell commun (sidebar + header)
├── pages/
│   ├── index.astro           # Redirection → /login
│   ├── login.astro           # Page de connexion
│   └── dashboard/
│       ├── index.astro       # Tableau de bord
│       ├── actualites.astro  # Actualités
│       ├── statistiques.astro
│       ├── messagerie.astro
│       └── identifiants.astro
└── styles/
    └── global.css            # Tailwind + Google Fonts
```

## Charte graphique

Alignée sur [jcboyang-conseil-1.onrender.com](https://jcboyang-conseil-1.onrender.com/)

| Rôle | Valeur |
|---|---|
| Marine (primaire) | `#0b1f3a` |
| Or (accent) | `#d4a762` |
| Fond clair | `#f8f6f2` |
| Police titres | Playfair Display |
| Police corps | Inter |

## Démarrage

```bash
npm install
npm run dev
# → http://localhost:4321
```

```bash
npm run build    # Build de production
npm run preview  # Prévisualisation du build
```

## Variables d'environnement

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=adhesion_jcbo
DB_USER=root
DB_PASSWORD=root
```
