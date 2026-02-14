# •M• NFT Library

Bibliothèque NFT de souveraineté numérique québécoise. Collections M-Vox (politique/souveraineté) et M-Numeris (numérologie).

## Stack technique

- **Frontend** : HTML/CSS/JS vanilla (aucun build nécessaire)
- **CMS** : Decap CMS v3 (interface admin)
- **Auth** : Netlify Identity
- **Hosting** : Netlify (gratuit)
- **Storage** : Git-based (tout dans le repo)

## Structure

```
nft-library/
├── index.html              # Site public
├── admin/index.html        # Interface Decap CMS
├── static/admin/config.yml # Configuration CMS
├── data/
│   ├── nfts.json           # Base de données NFTs
│   ├── about.json          # Contenu section About
│   └── settings.json       # Paramètres du site
├── images/                 # Images NFT
├── pdfs/                   # PDFs téléchargeables
├── css/styles.css          # Styles (dark/light mode)
├── js/app.js               # Application principale
├── netlify.toml            # Config Netlify
└── .gitignore
```

## Déploiement

### 1. Créer le repo GitHub

```bash
git init
git add .
git commit -m "Initial commit - NFT Library"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/nft-library.git
git push -u origin main
```

### 2. Déployer sur Netlify

1. Connectez-vous sur [netlify.com](https://netlify.com)
2. "Add new site" → "Import an existing project"
3. Sélectionnez votre repo GitHub `nft-library`
4. Publish directory : `.` (racine)
5. Cliquez "Deploy"

### 3. Activer Netlify Identity (requis pour l'admin)

1. Dashboard Netlify → Site settings → Identity
2. Cliquez "Enable Identity"
3. Sous Registration → "Invite only"
4. Sous Services → Git Gateway → "Enable Git Gateway"
5. Invitez-vous en tant qu'utilisateur via Identity → Invite users

### 4. Accéder à l'admin

- URL : `https://votre-site.netlify.app/admin`
- Connectez-vous avec votre compte Identity
- Vous pouvez ajouter/modifier/supprimer des NFTs

## Utilisation de l'admin CMS

### Ajouter un NFT

1. Allez sur `/admin`
2. Cliquez "NFTs" dans la sidebar
3. Cliquez "New NFT"
4. Remplissez les champs :
   - **Titre** (requis)
   - **Description courte** (200 chars max, affichée sur les cartes)
   - **Description complète** (markdown, page détail)
   - **Collection** : M-Vox, M-Numeris ou Autre
   - **Blockchain** : Ethereum ou Polygon
   - **Tags** : ajoutez des tags libres
   - **Image** : upload drag & drop
   - **PDF** : upload du document
   - **Lien OpenSea** (optionnel)
   - **Date** : date de publication
   - **Statut** : Publié ou Brouillon
   - **Ordre** : numéro pour le tri personnalisé
5. Cliquez "Publish"

### Modifier le contenu About

1. Dans l'admin → Pages → "À propos de •M•"
2. Modifiez vision, mission, explication Balance Éthique
3. Publiez

## Site public - Features

- **Click sur image** → Téléchargement direct du PDF
- **Filtres** : Collection, Blockchain, Tags
- **Recherche** temps réel (titre, description, tags)
- **Tri** : Plus récent / Plus ancien / A-Z / Z-A
- **Stats** dans le header (compteurs animés)
- **Dark/Light mode** avec toggle (dark par défaut)
- **Share buttons** : X/Twitter + copier le lien
- **Liens OpenSea** sur chaque carte
- **Contact form** intégré (via Netlify Forms)
- **Section About** avec philosophie Balance Éthique
- **Responsive** mobile-first

## Format des données (nfts.json)

```json
{
  "title": "Titre du NFT",
  "description_short": "Description courte (max 200 chars)",
  "description_full": "Description complète en markdown",
  "collection": "M-Vox",
  "blockchain": "Ethereum",
  "tags": ["Politique", "Souveraineté"],
  "image": "/images/mon-image.png",
  "pdf": "/pdfs/mon-document.pdf",
  "opensea_url": "https://opensea.io/...",
  "date": "2025-12-01",
  "status": "published",
  "order": 1
}
```

## Option GitHub OAuth

Si vous préférez GitHub OAuth au lieu de Netlify Identity :

1. Éditez `static/admin/config.yml`
2. Commentez la section "OPTION 1: Netlify Identity"
3. Décommentez la section "OPTION 2: GitHub OAuth"
4. Remplacez `YOUR_USERNAME/nft-library` par votre repo
5. Suivez la doc Decap CMS pour configurer OAuth sur Netlify

## Licence

Documentation libre sous licence ouverte - •M• 2025-2026
