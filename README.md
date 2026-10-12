# Audit IA — Modules gratuits

Modules gratuits d'**intégration simple de l'IA** pour les TPE/PME, proposés après le diagnostic de maturité IA de MadeInFormation.fr.

Chaque module se réalise **en autonomie en 30 à 60 minutes** et répond à une micro-tâche concrète du quotidien (réponses aux mails, devis, fiches produit, réseaux sociaux, avis clients, tri de la boîte mail…).

## Arborescence

```
modules/
  i01-reponses-mails/
    module.json        # SOURCE UNIQUE (à modifier à la main)
    README.md          # généré : statut, points à tester
    script-video.md    # généré : script vidéo minuté
  i02-devis/           # idem
  i04-fiches-produit/, i05-reseaux-sociaux/  # idem
  i06-avis-clients/, i08-tri-mails/          # idem
scripts/build.mjs      # générateur Node, sans dépendance
tests/                 # tests node:test
site/                  # servi par GitHub Pages (sortie générée, versionnée)
  index.html           # catalogue des modules
  config.json          # liens et envois pas encore disponibles (valeurs null)
  assets/              # style.css, app.js (copier, minuteur, mémorisation)
  <module>/index.html  # site pas à pas
  <module>/fiche.html  # source du PDF (1 à 2 pages A4, impression navigateur)
  <module>/consignes.md
```

Les vidéos et les PDF finaux sont diffusés via SharePoint ; seules les sources sont dans ce dépôt.

## Utilisation

```
npm run build   # régénère site/, fiches, consignes, scripts vidéo, README de module
npm test        # schéma, durées, liens externes, sortie générée à jour
```

Ne modifiez jamais à la main les fichiers générés : modifiez `module.json` puis `npm run build`. Les tests échouent si la sortie n'est pas à jour. Node 20 ou plus, aucune dépendance.

Pour publier : réglages du dépôt, Pages, source « branche, dossier `/site` ».

## Configuration (`site/config.json`)

| Clé | Rôle | Valeur actuelle |
|---|---|---|
| `offreUrl` | Lien « Aller plus loin » vers l'offre de formation. Le bloc reste masqué tant que la valeur est `null`. | `null` |
| `autoevaluationUrl` | Point d'envoi (POST JSON : module, résultat, date) de l'auto-évaluation. Tant que la valeur est `null`, rien n'est envoyé ; la réponse reste dans le navigateur. | `null` |

Les deux valeurs doivent être des URL en `https://`. Aucune donnée personnelle n'est envoyée. Les tests exigent `null` tant que l'offre et le point d'envoi n'existent pas : adapter le test au moment de les renseigner.

## Statut des modules

| Module | Statut |
|---|---|
| I01 Réponses aux mails clients | brouillon, consignes à tester |
| I02 Devis et propositions | brouillon, consignes à tester |
| I04 Fiches produit | brouillon, consignes à tester |
| I05 Réseaux sociaux et Google Business | brouillon, consignes à tester |
| I06 Réponses aux avis clients | brouillon, consignes à tester |
| I08 Tri et résumé de la boîte mail | brouillon, consignes à tester |

## Ce dépôt est public

N'y déposer **que** du contenu publiable : pas de donnée personnelle, pas de clé ou mot de passe, pas de contenu de formation payante.

## Licence

À définir. Tant qu'aucune licence n'est précisée, tous droits réservés par MadeInFormation.fr.

## Contact

MadeInFormation.fr — https://madeinformation.fr
