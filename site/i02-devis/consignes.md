# Préparer un devis à partir d'une description de chantier ou de prestation : consignes à copier-coller

Module I02. Remplacez chaque [CHAMP] par vos informations, puis relisez toujours le résultat avant envoi.

> Ce qu'on ne colle jamais dans un assistant IA
> - Les données personnelles de vos clients : nom, adresse du chantier, téléphone, e-mail. Écrivez « le client » ou « [ADRESSE DU CHANTIER] ».
> - Vos secrets commerciaux : marges, coûts d'achat, tarifs négociés avec un fournisseur ou un client, liste de vos clients.
> - Vos mots de passe et accès à votre logiciel de facturation.
> - Les prix : l'assistant n'en invente aucun dans ce module. Vous les saisissez vous-même, hors de l'assistant.

## Structurer un devis sans prix

À coller dans une nouvelle conversation. Ne mettez aucun prix ni donnée client dans les champs.

```text
Tu es un assistant qui m'aide à préparer le brouillon d'un devis. Mon activité : [ACTIVITÉ]. Type de client : [TYPE DE CLIENT].

Description du chantier ou de la prestation :
[DESCRIPTION DU CHANTIER OU DE LA PRESTATION]

Quantités et dimensions que je connais : [QUANTITÉS ET DIMENSIONS CONNUES]
Délai souhaité par le client : [DÉLAI SOUHAITÉ]
Ce qui est exclu : [CE QUI EST EXCLU]

Ta mission :
1. Présente un tableau de devis avec les colonnes : désignation, unité, quantité, prix unitaire HT, total HT. Regroupe les lignes par grandes étapes.
2. RÈGLE ABSOLUE : n'invente aucun prix, aucun taux de TVA, aucune remise. Écris « [PRIX À COMPLÉTER] » dans chaque case de prix.
3. Si une quantité n'est pas donnée, écris « [QUANTITÉ À CONFIRMER] » au lieu de l'estimer.
4. Ajoute une rubrique « Hypothèses » (ce que tu as supposé) et une rubrique « Exclusions ».
5. Termine par la liste des informations manquantes sous forme de questions courtes.

Ne donne aucun conseil juridique. Je vérifie moi-même les mentions obligatoires.
```

## Rédiger la lettre d'accompagnement

À coller dans la même conversation, une fois les lignes du devis validées.

```text
Rédige un message d'accompagnement de 8 à 12 lignes pour joindre à mon devis. Ton : professionnel, simple, vouvoiement. Mon activité : [ACTIVITÉ].

Résumé de la prestation : [RÉSUMÉ DE LA PRESTATION]
Durée de validité de l'offre : [DURÉE DE VALIDITÉ DE L'OFFRE]

Règles :
- Ne cite aucun prix ni total.
- N'invente aucun délai, garantie ou engagement : utilise [À COMPLÉTER] si une information manque.
- Laisse [NOM DU CLIENT], [DATE] et [MES COORDONNÉES] entre crochets.
- Termine en proposant un échange pour répondre aux questions.
```
