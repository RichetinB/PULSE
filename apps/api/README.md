# API PULSE

L'API est une fondation optionnelle pour les futurs usages en ligne. L'import
et l'analyse locale des replays restent disponibles sans compte ni connexion
au backend.

## Développement local

Prérequis : Node.js 22+, pnpm 9.15.5 et Docker Compose.

Depuis `apps/api` :

```powershell
Copy-Item .env.example .env
```

Remplace le mot de passe fictif par une valeur locale aléatoire composée de
caractères compatibles avec une URL, dans `POSTGRES_PASSWORD` et
`DATABASE_URL`. Le fichier `.env` est ignoré par Git.

```powershell
corepack pnpm install
docker compose up -d postgres
corepack pnpm prisma:validate
corepack pnpm prisma:generate
corepack pnpm prisma:migrate:dev --name initial_user_identity
corepack pnpm start:dev
```

L'API répond sur `http://localhost:3000/api/health`. PostgreSQL est publié
uniquement sur `127.0.0.1:54329`. `docker compose down` arrête les conteneurs
sans supprimer le volume nommé.

Pour ouvrir la base avec Prisma Studio :

```powershell
corepack pnpm prisma:studio
```

## Modèle de données initial

Prisma a été choisi pour son schéma déclaratif lisible, son client typé généré
et ses migrations SQL versionnées. L'adaptateur PostgreSQL officiel permet de
l'utiliser avec NestJS sans couche générique de dépôts.

- **User** représente un compte PULSE indépendamment d'osu!. Le nom affiché et
  l'avatar sont facultatifs; le nom osu! n'est pas une clé d'identité.
- **OAuthAccount** relie un utilisateur à un fournisseur externe. Le couple
  fournisseur / identifiant osu! stable est unique; `userId` est indexé et la
  suppression de l'utilisateur supprime ses liens OAuth.
- **Session** est préparé pour une future authentification. Seul `tokenHash`
  est stocké, jamais le jeton brut. Il est unique; `userId` et `expiresAt`
  sont indexés; la suppression de l'utilisateur supprime ses sessions.

Les modèles OAuth ne stockent aucun access token ni refresh token. Aucun flux
OAuth, endpoint utilisateur ou émission de session n'est implémenté.

À terme, osu! OAuth pourra retrouver le compte externe à partir de son
identifiant osu! stable, puis relier ce compte à un `User` PULSE. La gestion
chiffrée des jetons et leur renouvellement feront l'objet d'un travail séparé.

## Migrations

En développement, `prisma migrate dev` crée et applique une migration. Cette
commande ne doit être utilisée que sur une base de développement jetable ou
personnelle. Si Prisma propose un reset, arrête-toi et examine l'écart; ne lance
pas `migrate reset` sur une base contenant des données à conserver.

En production, appliquer uniquement les migrations versionnées avec :

```powershell
corepack pnpm prisma:migrate:deploy
```

Cette commande applique les migrations en attente sans les générer. Les
migrations sont conservées dans `prisma/migrations`; ne modifie pas une
migration déjà appliquée.

## Vérifications

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm build
```

Le préfixe HTTP actuel est `/api`. Les futurs clients Web utiliseront des
endpoints HTTP/JSON depuis une origine autorisée par `CORS_ORIGINS`. Le client
Desktop pourra appeler l'API uniquement pour des fonctions explicitement en
ligne; le parsing Rust et l'analyse locale ne dépendront pas du backend.
