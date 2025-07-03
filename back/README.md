<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">Secure Docs - Backend</h1>

## Description

Ce dépôt contient le backend de l'application **Secure Docs**. C'est une application côté serveur robuste, évolutive et sécurisée, construite avec le framework [NestJS](https://nestjs.com/).

Le backend gère l'authentification des utilisateurs, la gestion des documents et le stockage sécurisé des fichiers. Il expose une API GraphQL destinée à être consommée par le client front-end.

## Technologies Principales

- **[NestJS](https://nestjs.com/):** Un framework Node.js progressif pour construire des applications côté serveur efficaces et évolutives.
- **[GraphQL](https://graphql.org/):** Un langage de requête pour les API et un environnement d'exécution pour répondre à ces requêtes avec vos données existantes.
- **[Prisma](https://www.prisma.io/):** Un ORM de nouvelle génération pour Node.js et TypeScript.
- **[PostgreSQL](https://www.postgresql.org/):** Un système de base de données relationnel-objet open-source et puissant.
- **[Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/):** Pour un stockage de documents cloud sécurisé et évolutif.
- **[Redis](https://redis.io/):** Utilisé comme file d'attente pour le traitement des tâches en arrière-plan avec BullMQ.
- **[Passport-JWT](https://www.passportjs.org/):** Pour gérer l'authentification à l'aide de JSON Web Tokens.

## Architecture

### Approche Code-First de GraphQL

Ce projet utilise l'approche **code-first** pour GraphQL, une fonctionnalité puissante de NestJS. Au lieu d'écrire manuellement le schéma GraphQL (fichiers `.graphql`), nous utilisons des décorateurs et des classes TypeScript pour le générer automatiquement.

**Comment ça marche :**

1.  **Modèles & DTOs :** Nous définissons la structure de nos données à l'aide de classes TypeScript (par exemple, `UserDTO`, `DocumentDTO`).
2.  **Décorateurs :** Nous utilisons des décorateurs comme `@ObjectType()`, `@Field()`, `@Query()` et `@Mutation()` directement dans nos résolveurs et modèles.
3.  **Génération de Schéma :** NestJS lit ces décorateurs à la compilation et génère automatiquement le fichier `schema.gql`.

**Avantages :**

- **Source Unique de Vérité :** Votre code TypeScript est la seule source de vérité, éliminant les problèmes de synchronisation entre votre code et votre schéma.
- **Sécurité des Types :** Il offre une forte sécurité des types entre vos résolveurs et votre schéma.
- **Expérience de Développement :** Il simplifie le développement en gardant la logique associée (modèles, résolveurs) au même endroit.

### Base de Données & Prisma

Nous utilisons **Prisma** comme ORM pour interagir avec la base de données PostgreSQL. Le schéma de la base de données est défini dans `prisma/schema.prisma`. Prisma fournit :

- Un constructeur de requêtes auto-généré et typé.
- Un système de migration facile à utiliser (`prisma migrate`).
- Une source unique de vérité pour les modèles de base de données.

### Tâches d'Arrière-plan & Workers

Pour les tâches longues ou gourmandes en ressources comme le traitement et le téléversement de fichiers sur Azure Blob Storage, nous utilisons un système de **worker** alimenté par **BullMQ** et **Redis**.

1.  Lorsqu'un utilisateur téléverse un fichier, une nouvelle tâche est ajoutée à la file d'attente.
2.  Un processus worker distinct (`main.worker.ts`) écoute les nouvelles tâches.
3.  Le worker traite la tâche en arrière-plan, garantissant que l'application principale reste réactive.

## Fonctionnalités

- **Gestion des Utilisateurs :** Inscription et connexion des utilisateurs.
- **Authentification :** Authentification sécurisée basée sur JWT et contrôle d'accès basé sur les rôles (Admin, Utilisateur).
- **Gestion des Documents :** Opérations CRUD pour les documents.
- **Téléversement Sécurisé de Fichiers :** Téléversements de fichiers asynchrones et sécurisés vers Azure Blob Storage.
- **Journalisation en Temps Réel :** Journalisation en temps réel des activités via WebSockets.

## Prérequis

- [Node.js](https://nodejs.org/en/) (v18 ou supérieur)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/docs/getting-started/installation/)
- Un [Compte de Stockage Azure](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-create)

## Démarrage

### 1. Cloner le dépôt

```bash
git clone <url-du-depot>
cd secure-docs/back
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` en copiant le fichier d'exemple :

```bash
cp .env.exemple .env
```

Ensuite, mettez à jour le fichier `.env` avec votre configuration :

```
DATABASE_URL="postgresql://UTILISATEUR:MOTDEPASSE@HOTE:PORT/BASEDEDONNEES?schema=public"
JWT_SECRET="votre-cle-jwt-super-secrete"
REDIS_URL="redis://localhost:6379"
AZURE_BLOB_STORAGE="votre-chaine-de-connexion-azure-storage"
```

### 4. Lancer les migrations de la base de données

Cette commande appliquera toutes les migrations en attente à votre base de données.

```bash
npx prisma migrate dev
```

## Lancement de l'Application

L'application se compose de deux processus principaux : le serveur API et le worker d'arrière-plan. Vous devez lancer les deux pour que l'application soit pleinement fonctionnelle.

```bash
# Lancer le serveur API principal (en mode watch)
npm run start:dev

# Dans un autre terminal, lancer le worker
npm run start:worker
```

L'API GraphQL sera disponible à l'adresse `http://localhost:3000/graphql`.

## Lancement des Tests

```bash
# Tests unitaires
npm run test

# Couverture des tests
npm run test:cov
```

### Communication en Temps Réel avec les WebSockets

L'application utilise les WebSockets pour fournir une communication en temps réel entre le serveur et le client. Ceci est principalement utilisé pour :

- **Journalisation en Temps Réel :** Le `LogGateway` diffuse les journaux en temps réel aux utilisateurs administrateurs connectés.
- **Mises à Jour du Statut des Documents :** Le `DocumentGateway` notifie les utilisateurs de l'état de leurs téléversements et mises à jour de documents.

Cela garantit une expérience utilisateur dynamique et interactive, car les clients reçoivent un retour immédiat sans avoir besoin d'interroger le serveur.

### Conteneurisation avec Docker

Pour simplifier le déploiement et garantir la cohérence entre les différents environnements, ce projet inclut le support de Docker.

- **`Dockerfile` :** Ce fichier définit le conteneur pour l'application NestJS principale.
- **`Dockerfile.worker` :** Ce fichier définit le conteneur pour le worker d'arrière-plan.

Ces Dockerfiles vous permettent de construire et d'exécuter l'application et son worker en tant que conteneurs isolés, rendant le processus de déploiement plus prévisible et évolutif.

#### Lancer avec Docker

1.  **Construire les images Docker :**

    ```bash
    docker build -t secure-docs-backend -f Dockerfile .
    docker build -t secure-docs-worker -f Dockerfile.worker .
    ```

2.  **Lancer les conteneurs :**

    Assurez-vous que votre base de données PostgreSQL et votre instance Redis sont accessibles depuis les conteneurs (par exemple, en utilisant Docker Compose ou en configurant correctement les variables d'environnement).

    ```bash
    docker run -d --name secure-docs-backend -p 3000:3000 secure-docs-backend
    docker run -d --name secure-docs-worker secure-docs-worker
    ```

    Vous pouvez vérifier les logs des conteneurs avec `docker logs secure-docs-backend` et `docker logs secure-docs-worker`.
