// Générateur sans dépendance : modules/<dossier>/module.json -> site, fiche PDF (source HTML), consignes (markdown),
// script vidéo et README du module. Usage : npm run build
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const champs = (texte) => esc(texte).replace(/\[([^\]\n]+)\]/g, '<span class="champ">[$1]</span>');
export const remplir = (texte, valeurs) => texte.replace(/\[([^\]\n]+)\]/g, (m, k) => (k in valeurs ? valeurs[k] : m));
const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
export const dureeTotale = (m) => m.etapes.reduce((t, e) => t + e.minutes, 0);

export function listerModules(racine = RACINE) {
  const dossier = join(racine, "modules");
  return readdirSync(dossier, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dossier, d.name, "module.json")))
    .map((d) => ({ dir: d.name, ...{ module: JSON.parse(readFileSync(join(dossier, d.name, "module.json"), "utf8")) } }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
}

const entete = (titre, desc, chemin) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="stylesheet" href="${chemin}assets/style.css">
</head>`;

const piedDePage = `<footer><p>Contenu gratuit fourni à titre pédagogique. Les consignes sont des brouillons à adapter ; vous restez responsable des documents que vous envoyez. Votre progression est enregistrée uniquement dans votre navigateur ; ce site n'utilise ni cookie ni traqueur.</p></footer>`;

function blocConsigne(c, idHtml, titreNiveau = "h3", valeurs = null) {
  const texte = valeurs ? remplir(c.texte, valeurs) : c.texte;
  return `<div class="consigne">
<${titreNiveau}>${esc(c.titre)}</${titreNiveau}>
<p>${esc(c.aide)}</p>
<pre id="${idHtml}" tabindex="0">${champs(texte)}</pre>
<div class="outils"><button type="button" class="copier" data-js hidden data-cible="${idHtml}">Copier la consigne</button><span class="etat" role="status" aria-live="polite"></span></div>
</div>`;
}

export function pageModule(dir, m) {
  const cons = Object.fromEntries(m.consignes.map((c) => [c.id, c]));
  const etapes = m.etapes.map((e, i) => `<section class="etape" id="etape-${i + 1}" aria-labelledby="t-etape-${i + 1}">
<h2 id="t-etape-${i + 1}"><span class="num">Étape ${i + 1} sur ${m.etapes.length}</span>${esc(e.titre)} <span class="duree">${e.minutes} min</span></h2>
<p>${esc(e.description)}</p>
<ul>${e.actions.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
${(e.consignes || []).map((id) => blocConsigne(cons[id], `consigne-${id}`)).join("\n")}
<div class="outils"><button type="button" class="minuteur secondaire" data-js hidden data-minutes="${e.minutes}">Démarrer le minuteur (${e.minutes} min)</button><output aria-live="off"></output></div>
<label class="case"><input type="checkbox" class="fait" data-id="e${i + 1}"> <span>J'ai terminé l'étape ${i + 1}</span></label>
</section>`).join("\n");

  const exemples = m.exemples.map((x, i) => {
    const c = cons[x.consigne];
    return `<details>
<summary>${esc(x.metier)} (${esc(x.lieu)})</summary>
<p>${esc(x.contexte)}</p>
${blocConsigne({ ...c, titre: `Consigne remplie : ${c.titre}`, aide: "Exemple de consigne déjà personnalisée. Reprenez la structure, remplacez par vos propres informations." }, `exemple-${i + 1}`, "h4", x.valeurs)}
<h4>Résultat attendu (exemple illustratif)</h4>
<pre tabindex="0">${esc(x.resultat)}</pre>
</details>`;
  }).join("\n");

  return `${entete(`${m.titre} – module ${m.id}`, m.objectif, "../")}
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header>
<p><a href="../index.html">← Tous les modules</a></p>
<h1>${esc(m.titre)}</h1>
<p class="lead">${esc(m.objectif)}</p>
<ul class="meta"><li>Module ${esc(m.id)}</li><li>Durée : ${dureeTotale(m)} min environ</li><li>${m.etapes.length} étapes</li><li>Aucune compétence technique requise</li></ul>
</header>
<main id="contenu" data-module="${esc(m.id)}">
<section class="alerte" aria-labelledby="t-alerte">
<h2 id="t-alerte">${esc(m.avertissement.titre)}</h2>
<ul>${m.avertissement.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
<p><strong>${esc(m.avertissement.relecture)}</strong></p>
</section>
<section aria-labelledby="t-resultat">
<h2 id="t-resultat">Ce que vous aurez à la fin</h2>
<p>${esc(m.resultat)}</p>
<h3>Avant de commencer</h3>
<ul>${m.prerequis.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
<p><a href="fiche.html">Version imprimable (fiche d'une à deux pages)</a> · <a href="consignes.md">Toutes les consignes (texte brut)</a></p>
</section>
<nav class="sommaire" aria-label="Sommaire"><h2>Les étapes</h2><ol>${m.etapes.map((e, i) => `<li><a href="#etape-${i + 1}">${esc(e.titre)}</a> (${e.minutes} min)</li>`).join("")}</ol>
<p id="progression" role="status" aria-live="polite"></p></nav>
${etapes}
<section aria-labelledby="t-exemples"><h2 id="t-exemples">Exemples par métier</h2>
<p>Trois situations d'entreprises d'Occitanie pour vous inspirer. Ouvrez celle qui ressemble à la vôtre.</p>
${exemples}
</section>
<section aria-labelledby="t-pieges"><h2 id="t-pieges">Erreurs fréquentes</h2>
${m.pieges.map((p) => `<div class="piege"><strong>${esc(p.piege)}</strong>${esc(p.solution)}</div>`).join("\n")}
</section>
<section aria-labelledby="t-qc"><h2 id="t-qc">Contrôle qualité avant tout envoi</h2>
${m.controleQualite.map((q, i) => `<label class="case"><input type="checkbox" class="controle" data-id="q${i + 1}"> <span>${esc(q)}</span></label>`).join("\n")}
</section>
<section aria-labelledby="t-eval"><h2 id="t-eval">Votre bilan</h2>
<form id="autoeval">
<fieldset><legend>${esc(m.autoevaluation.question)}</legend>
<label><input type="radio" name="resultat" value="oui"> <span>${esc(m.autoevaluation.oui)}</span></label>
<label><input type="radio" name="resultat" value="non"> <span>${esc(m.autoevaluation.non)}</span></label>
</fieldset>
<button type="submit">Enregistrer ma réponse</button>
<p id="autoeval-retour" role="status" aria-live="polite">Votre réponse est mémorisée uniquement dans ce navigateur.</p>
</form>
</section>
<section id="aller-plus-loin" hidden aria-labelledby="t-plus"><h2 id="t-plus">Aller plus loin</h2>
<p><a id="lien-offre" class="bouton" href="#">Découvrir l'offre de formation</a></p></section>
</main>
${piedDePage}
<script src="../assets/app.js" defer></script>
</body>
</html>
`;
}

export function pageFiche(m) {
  const c = m.consignes.find((x) => x.fiche) || m.consignes[0];
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fiche ${esc(m.id)} – ${esc(m.titre)}</title>
<style>
@page{size:A4;margin:11mm 12mm}
*{box-sizing:border-box}
body{font:9.6pt/1.4 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#111;margin:0 auto;max-width:190mm;padding:8px}
h1{font-size:15pt;margin:0 0 2px}h2{font-size:11pt;margin:10px 0 3px;color:#0b4f8a}
.sous{margin:0 0 4px;color:#333}
.alerte{border:1.5px solid #9a4a00;background:#fff4e5;padding:4px 9px;margin:6px 0;break-inside:avoid}
.alerte h2{color:#7a3a00;margin-top:2px}.alerte ul{margin:2px 0;padding-left:16px}.alerte p{margin:2px 0}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #777;padding:2px 6px;text-align:left;vertical-align:top}
td:first-child,th:first-child{white-space:nowrap}
pre{white-space:pre-wrap;font:8.6pt/1.35 ui-monospace,Menlo,Consolas,monospace;border:1px solid #777;padding:5px 7px;margin:3px 0;break-inside:avoid}
.champ{font-weight:700;background:#ffe9a8}
ul{margin:2px 0;padding-left:16px}li{margin:1px 0}
.bas{margin-top:8px;font-size:8pt;color:#333}
section{break-inside:avoid}
</style>
</head>
<body>
<h1>${esc(m.titre)}</h1>
<p class="sous">Module ${esc(m.id)} · ${dureeTotale(m)} minutes · ${esc(m.objectif)}</p>
<div class="alerte"><h2>${esc(m.avertissement.titre)}</h2>
<ul>${m.avertissement.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
<p><strong>${esc(m.avertissement.relecture)}</strong></p></div>
<section><h2>Les étapes</h2>
<table><tr><th>Durée</th><th>Étape</th><th>À faire</th></tr>
${m.etapes.map((e, i) => `<tr><td>${e.minutes} min</td><td>${i + 1}. ${esc(e.titre)}</td><td>${esc(e.fiche)}</td></tr>`).join("\n")}
</table></section>
<section><h2>Consigne principale : ${esc(c.titre)}</h2>
<p>${esc(c.aide)}</p>
<pre>${champs(c.texte)}</pre></section>
<section><h2>Erreurs fréquentes</h2>
<ul>${m.pieges.map((p) => `<li><strong>${esc(p.piege)}</strong> ${esc(p.solution)}</li>`).join("")}</ul></section>
<section><h2>Contrôle qualité avant envoi</h2>
<ul>${m.controleQualite.map((q) => `<li>☐ ${esc(q)}</li>`).join("")}</ul></section>
<p class="bas">Pas à pas complet, exemples par métier et toutes les consignes : voir le site du module ${esc(m.id)}. Les consignes sont des brouillons à adapter à votre activité.</p>
</body>
</html>
`;
}

export function markdownConsignes(m) {
  const sortie = [`# ${m.titre} : consignes à copier-coller`, "", `Module ${m.id}. Remplacez chaque [CHAMP] par vos informations, puis relisez toujours le résultat avant envoi.`, "", `> ${m.avertissement.titre}`, ...m.avertissement.points.map((p) => `> - ${p}`), ""];
  for (const c of m.consignes) sortie.push(`## ${c.titre}`, "", c.aide, "", "```text", c.texte, "```", "");
  return sortie.join("\n");
}

export function markdownVideo(m) {
  let t = 0;
  const lignes = [`# Script vidéo : ${m.titre} (module ${m.id})`, "", `Durée visée : ${mm(m.video.reduce((s, x) => s + x.secondes, 0))}. Texte dit à voix posée, vouvoiement. Plans d'écran à filmer par l'équipe.`, ""];
  for (const s of m.video) {
    lignes.push(`## ${mm(t)} – ${mm(t + s.secondes)} · ${s.titre}`, "", `**Texte dit**`, "", s.texte, "", `**Plan d'écran à filmer** : ${s.ecran}`, "");
    t += s.secondes;
  }
  return lignes.join("\n");
}

export function readmeModule(dir, m) {
  return `# ${m.id} – ${m.titre}

**Statut : ${m.statut}.** Les consignes n'ont pas été testées avec un assistant externe.

${m.objectif}

- Durée : ${dureeTotale(m)} minutes en ${m.etapes.length} étapes
- Public : ${m.public}
- Source unique : \`module.json\` (ne pas modifier les fichiers générés à la main)
- Site : \`site/${dir}/index.html\` · Fiche (source PDF) : \`site/${dir}/fiche.html\` · Consignes : \`site/${dir}/consignes.md\`
- Script vidéo : \`script-video.md\`

## À tester à la main

${m.aTester.map((x) => `- ${x}`).join("\n")}
`;
}

export function pageAccueil(mods) {
  return `${entete("Modules gratuits d'intégration de l'IA", "Modules gratuits pas à pas pour intégrer simplement l'IA dans une TPE/PME.", "")}
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header><h1>Modules gratuits d'intégration de l'IA</h1>
<p class="lead">Chaque module se réalise seul, en 30 à 60 minutes, avec un assistant IA grand public de votre choix. Vous repartez avec un résultat utilisable le jour même.</p></header>
<main id="contenu">
<section class="alerte" aria-labelledby="t-alerte"><h2 id="t-alerte">Ce qu'on ne colle jamais dans un assistant IA</h2>
<ul><li>Les données personnelles de vos clients (noms, adresses, téléphones, e-mails).</li><li>Vos secrets commerciaux (marges, conditions négociées, listes de clients).</li><li>Vos mots de passe et codes d'accès.</li></ul>
<p><strong>Relisez toujours avant d'envoyer.</strong></p></section>
<h2>Les modules disponibles</h2>
<ul class="grille">
${mods.map(({ dir, module: m }) => `<li><a class="carte" href="${dir}/index.html"><strong>${esc(m.id)} · ${esc(m.titre)}</strong>${esc(m.objectif)} <br>Durée : ${dureeTotale(m)} min</a></li>`).join("\n")}
</ul>
</main>
${piedDePage}
</body>
</html>
`;
}

export function genererTout(racine = RACINE) {
  const mods = listerModules(racine);
  const sortie = new Map();
  sortie.set("site/index.html", pageAccueil(mods));
  for (const { dir, module: m } of mods) {
    sortie.set(`site/${dir}/index.html`, pageModule(dir, m));
    sortie.set(`site/${dir}/fiche.html`, pageFiche(m));
    sortie.set(`site/${dir}/consignes.md`, markdownConsignes(m));
    sortie.set(`modules/${dir}/script-video.md`, markdownVideo(m));
    sortie.set(`modules/${dir}/README.md`, readmeModule(dir, m));
  }
  return sortie;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const [chemin, contenu] of genererTout()) {
    const cible = join(RACINE, chemin);
    mkdirSync(dirname(cible), { recursive: true });
    writeFileSync(cible, contenu);
  }
  console.log("Génération terminée.");
}
