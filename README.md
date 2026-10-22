# Pletosie — boutique Next.js

Voir ../README-PLETOSIE.md pour les parcours, les limites et la configuration.

Démarrage : npm run dev (API sur le port 4000). Compilation : npm run build.

Les variables publiques sont décrites dans .env.example. Les secrets restent exclusivement dans NestJS.

## Composition de la page d’accueil

Dans Administration → Accueil, choisir le visuel principal, les cartes superposées, les catégories illustrées, la sélection et les bannières. Les emplacements peuvent être ajoutés, retirés et réordonnés. Publier l’accueil enregistre la composition en base. Les articles non publiés ne sont jamais affichés. Les titres de l’accueil sont également modifiables.

Tests de la sélection (Node 24) : `node --experimental-strip-types --test tests/homepage.test.cjs`.
