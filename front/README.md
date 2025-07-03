# Secure Docs - Frontend

Ce projet est l'interface utilisateur pour l'application Secure Docs, développée avec React et Vite.

## Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Scripts disponibles](#scripts-disponibles)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Technologies clés](#technologies-clés)

## Prérequis

- Node.js (version 20.x ou supérieure)
- npm / yarn / pnpm

## Installation

1.  Clonez le dépôt :
    ```bash
    git clone <URL_DU_REPO>
    cd front
    ```

2.  Installez les dépendances :
    ```bash
    npm install
    ```

3.  Créez un fichier `.env` à la racine du projet en vous basant sur le fichier `.env.exemple` et remplissez les variables d'environnement.

4.  Lancez le serveur de développement :
    ```bash
    npm run dev
    ```

L'application sera disponible à l'adresse `http://localhost:5173`.

## Scripts disponibles

- `npm run dev`: Lance le serveur de développement Vite.
- `npm run build`: Compile le projet pour la production.
- `npm run lint`: Lance ESLint pour analyser le code.
- `npm run preview`: Lance un serveur local pour prévisualiser le build de production.
- `npm run compile`: Génère les types TypeScript à partir du schéma GraphQL.
- `npm run watch`: Surveille les changements dans les fichiers GraphQL et régénère les types automatiquement.

## Variables d'environnement

Le fichier `.env` doit contenir les variables suivantes :

- `VITE_BACK_URL`: L'URL du serveur backend (ex: `http://localhost:3000`).
- `VITE_WORKER_URL`: L'URL du service worker (ex: `http://localhost:3001`).

## Structure du projet

```
/
├── public/          # Fichiers statiques
├── src/
│   ├── assets/      # Images, polices, etc.
│   ├── components/  # Composants React réutilisables
│   ├── gql/         # Fichiers générés par GraphQL Code Generator
│   ├── hooks/       # Hooks React personnalisés
│   ├── pages/       # Composants de page (associés aux routes)
│   ├── services/    # Logique métier, appels API
│   ├── App.tsx      # Composant racine de l'application et routing
│   └── main.tsx     # Point d'entrée de l'application
├── .env             # Fichier d'environnement (non versionné)
├── .env.exemple     # Exemple de fichier d'environnement
├── package.json     # Dépendances et scripts
└── vite.config.ts   # Configuration de Vite
```

## Technologies clés

- **Framework**: [React](https://react.dev/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Client GraphQL**: [Apollo Client](https://www.apollographql.com/docs/react/)
- **Génération de code GraphQL**: [GraphQL Code Generator](https://www.the-guild.dev/graphql/codegen)
- **Styling**: CSS (avec une approche composant)
- **Linting**: [ESLint](https://eslint.org/)
- **Langage**: [TypeScript](https://www.typescriptlang.org/)

## Documentation des Composants

### Composants principaux

- **`ProtectedRoute.tsx`**: Un composant d'ordre supérieur qui protège les routes. Il vérifie la présence d'un token d'authentification dans le `localStorage` et l'identité de l'utilisateur avant de rendre les composants enfants. Si l'utilisateur n'est pas authentifié, il est redirigé vers la page de connexion.

- **`TextFileEditor.tsx`**: Un éditeur de texte simple pour les fichiers `.txt`. Il récupère le contenu du fichier via une requête GraphQL, permet à l'utilisateur de le modifier et de le sauvegarder.

### Composants d'interface utilisateur (`ui`)

Le dossier `src/components/ui` contient des composants d'interface utilisateur réutilisables, stylisés avec Tailwind CSS :

- **`Avatar.tsx`**: Affiche une image d'avatar ou un fallback.
- **`Badge.tsx`**: Affiche un badge avec différents styles (par défaut, secondaire, destructif).
- **`Button.tsx`**: Un bouton personnalisable avec différents styles et tailles.
- **`Card.tsx`**: Un conteneur de carte avec en-tête, contenu, titre et description.
- **`DropdownMenu.tsx`**: Un menu déroulant personnalisable.
- **`Input.tsx`**: Un champ de saisie avec gestion des erreurs.
- **`Label.tsx`**: Une étiquette pour les éléments de formulaire.
- **`Select.tsx`**: Un composant de sélection déroulante.
- **`Separator.tsx`**: Un séparateur horizontal ou vertical.
- **`Skeleton.tsx`**: Un composant de chargement squelette.
- **`Switch.tsx`**: Un interrupteur à bascule.
- **`Tabs.tsx`**: Un composant d'onglets pour afficher du contenu différent.

### Pages

- **`AdminPage.tsx`**: La page d'administration. Elle affiche la liste des utilisateurs et les journaux système. Elle utilise les onglets pour basculer entre les deux vues et se connecte à un socket pour recevoir les journaux en temps réel.

- **`Login.tsx`**: La page de connexion et d'inscription. Elle contient deux formulaires, un pour la connexion et un pour l'inscription, et gère l'authentification de l'utilisateur.

- **`dashboard/Home.tsx`**: La page d'accueil du tableau de bord. Elle affiche la liste des documents de l'utilisateur, permet de les filtrer, de les visualiser, de les modifier et de les supprimer. Elle se connecte également à un socket pour recevoir des mises à jour en temps réel sur les documents.

- **`dashboard/Layout.tsx`**: La mise en page principale du tableau de bord. Elle inclut la barre latérale de navigation, l'en-tête et le contenu principal. Elle gère également le chatbot IA et le menu utilisateur.

### Hooks

- **`useAuth.ts`**: Un hook personnalisé pour gérer l'authentification. Il récupère les informations de l'utilisateur et le token depuis le `localStorage`, et fournit une fonction de déconnexion qui nettoie le `localStorage` et redirige vers la page de connexion.

## Dépendances du projet

Le fichier `package.json` définit les dépendances et les scripts du projet.

### Dépendances principales

- **`@apollo/client`**: Client GraphQL pour React.
- **`lucide-react`**: Bibliothèque d'icônes.
- **`react`**, **`react-dom`**: Bibliothèque de base pour la construction d'interfaces utilisateur.
- **`react-hot-toast`**: Notifications toast.
- **`react-router-dom`**: Gestion des routes.
- **`socket.io-client`**: Client pour la communication en temps réel avec le serveur.

### Dépendances de développement

- **`@graphql-codegen/cli`**: Outil pour générer du code à partir de schémas GraphQL.
- **`@vitejs/plugin-react`**: Plugin Vite pour les projets React.
- **`eslint`**: Outil d'analyse de code statique.
- **`typescript`**: Sur-ensemble de JavaScript qui ajoute des types.
- **`vite`**: Outil de build et de développement rapide.

## Déploiement avec Docker

Le projet peut être conteneurisé à l'aide de Docker. Le `Dockerfile` à la racine du projet définit les étapes pour construire l'image Docker.

1.  **Construire l'image Docker :**

    ```bash
    docker build -t secure-docs-front .
    ```

2.  **Lancer le conteneur Docker :**

    ```bash
    docker run -p 5173:5173 secure-docs-front
    ```

L'application sera alors accessible à l'adresse `http://localhost:5173`.