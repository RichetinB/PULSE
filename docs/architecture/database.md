# Architecture de la base de données

## Choix de Prisma

L'API NestJS utilise Prisma ORM avec PostgreSQL. Son schéma déclaratif décrit
les relations et contraintes au même endroit; le client TypeScript généré
fournit des types vérifiés et les migrations SQL versionnées rendent les
changements de structure révisables. L'adaptateur `@prisma/adapter-pg` connecte
Prisma au pilote PostgreSQL `pg`.

NestJS expose un `DatabaseModule` et un `PrismaService`. Ce service initialise
le client à l'ouverture du module et le déconnecte à sa fermeture. Il n'y a pas
de couche générique de dépôt ni de synchronisation automatique du schéma.

## Modèles initiaux

- **User** : identité PULSE indépendante d'osu!, avec nom affiché et avatar
  facultatifs. Aucun nom osu! n'est utilisé comme identifiant unique.
- **OAuthAccount** : associe un utilisateur à un fournisseur externe; le
  fournisseur et l'identifiant osu! stable forment une contrainte unique.
  `userId` est indexé et la suppression du parent supprime ses comptes liés.
- **Session** : modèle préparatoire à l'authentification; seul le hash du jeton
  est conservé. Le hash est unique; `userId` et `expiresAt` sont indexés; la
  suppression de l'utilisateur supprime ses sessions.

Les dates sont stockées avec fuseau horaire. Aucun access token ou refresh
token n'est stocké. Les modèles ne donnent pas accès à des endpoints et
n'implémentent ni OAuth, ni émission de session.

## Migrations et outils

La source est [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma);
les migrations SQL appliquées sont conservées dans
`apps/api/prisma/migrations`.

Depuis `apps/api`, `pnpm prisma:generate` génère le client dans
`src/generated/prisma` (répertoire ignoré par Git). `pnpm prisma:validate`
valide le schéma.

En développement, utiliser `pnpm prisma:migrate:dev --name <nom>` sur une base
locale dédiée. Cette commande peut demander un reset si elle détecte une
divergence : ne pas accepter le reset sans avoir établi que la base est
jetable. Ne pas utiliser `migrate reset` pour ce flux.

En production, une étape de déploiement dédiée applique les migrations déjà
commitées avec `pnpm prisma:migrate:deploy`; elle ne génère pas de migration.
`pnpm prisma:studio` ouvre une interface locale pour inspecter les données.
La connexion est configurée par `DATABASE_URL` dans un `.env` local ignoré par
Git.

## Futur OAuth osu!

Lors d'un futur flux OAuth, l'identifiant osu! stable servira à retrouver ou
créer un `OAuthAccount`, relié à un `User` PULSE. Le nom osu! pourra évoluer et
ne sera donc pas une clé d'identité. Le code d'authentification devra traiter
les jetons séparément et ne jamais les conserver en clair; cette responsabilité
n'est pas incluse ici.

La base API ne participe pas à l'import ni à l'analyse locale des replays. Le
client Desktop et un futur client Web pourront consommer l'API uniquement pour
des fonctionnalités en ligne explicitement activées.
