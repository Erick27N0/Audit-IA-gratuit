// Maquette de la nouvelle présentation d'un module (parcours court en 3 étapes).
// Lit modules/<id>/module.json sans le modifier et écrit site/maquette-<id>/index.html.
// Usage : node scripts/maquette.mjs [dossier-du-module]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossier = process.argv[2] || "i01-reponses-mails";
const m = JSON.parse(readFileSync(join(RACINE, "modules", dossier, "module.json"), "utf8"));

// Textes courts propres à la maquette (à valider avant de les reporter dans module.json).
const COURT = {
  "i01-reponses-mails": {
    promesse: "En 15 minutes, obtenez 5 modèles de réponse aux mails clients, écrits dans le ton de votre entreprise.",
    livrable: "5 modèles de mail",
    couleur: "#0f766e",
  },
}[dossier] || { promesse: m.objectif, livrable: "Votre résultat", couleur: "#1d4ed8" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const [principale, suite, ...autres] = m.consignes;
const champs = [...new Set([...principale.champs, ...(suite?.champs || [])])];
const libre = "COLLEZ ICI VOS MAILS ANONYMISÉS";
const aDecrire = (c) => c.charAt(0) + c.slice(1).toLowerCase();
const nonCourt = m.avertissement.points.map((p) => p.split(" : ")[0].replace(/\.$/, ""));

const donnees = {
  module: m.id,
  titre: m.titre,
  consignes: [principale, suite].filter(Boolean).map((c) => ({ id: c.id, titre: c.titre, aide: c.aide, texte: c.texte })),
  exemples: m.exemples.map((e) => ({ metier: e.metier, lieu: e.lieu, valeurs: e.valeurs, resultat: e.resultat })),
  controle: m.controleQualite,
};

const icone = {
  bouclier: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  horloge: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cadeau: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3.5-2-5 1"/></svg>',
  outil: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M7 9h6M7 13h10"/></svg>',
  copier: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/></svg>',
};

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(m.titre)} – maquette</title>
<meta name="description" content="${esc(COURT.promesse)}">
<style>
:root{--accent:${COURT.couleur};--accent-doux:color-mix(in srgb,var(--accent) 10%,var(--fond));--fond:#f7f7f4;--carte:#fff;--texte:#1c1f23;--discret:#5b6168;--bord:#e2e2dc;--marque:#fff1b8;--ok:#15803d;--ombre:0 1px 2px rgb(0 0 0/.05),0 4px 16px rgb(0 0 0/.05)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--fond:#15171a;--carte:#1e2125;--texte:#eceae4;--discret:#a4a9ae;--bord:#33373c;--marque:#5a4a12;--ok:#4ade80;--accent:color-mix(in srgb,${COURT.couleur} 60%,#fff)}}
:root[data-theme="dark"]{--fond:#15171a;--carte:#1e2125;--texte:#eceae4;--discret:#a4a9ae;--bord:#33373c;--marque:#5a4a12;--ok:#4ade80;--accent:color-mix(in srgb,${COURT.couleur} 60%,#fff)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--fond);color:var(--texte);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.page{max-width:46rem;margin:0 auto;padding:0 16px 4rem}
a{color:var(--accent)}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.skip{position:absolute;left:-999px}.skip:focus{left:16px;top:8px;background:var(--carte);padding:.5rem}
svg{width:1.2em;height:1.2em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
.retour{display:inline-block;margin:1.2rem 0 0;color:var(--discret);text-decoration:none;font-size:.9rem}
.hero{margin:1rem 0 1.5rem;padding:2rem 1.5rem;border-radius:1.2rem;background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 70%,#000));color:#fff}
.badge{display:inline-block;font-size:.8rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;background:rgb(255 255 255/.18);padding:.2rem .6rem;border-radius:99px}
.hero h1{font-size:clamp(1.6rem,5vw,2.2rem);line-height:1.2;margin:.7rem 0 .5rem}
.hero p{margin:0;font-size:1.08rem;opacity:.95}
.puces{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.2rem 0 0;padding:0;list-style:none}
.puces li{display:flex;align-items:center;gap:.4rem;background:rgb(255 255 255/.15);padding:.35rem .75rem;border-radius:99px;font-size:.92rem}
.alerte{display:flex;gap:.8rem;align-items:flex-start;background:var(--carte);border:1px solid var(--bord);border-left:4px solid #d97706;border-radius:.8rem;padding:.9rem 1rem;margin-bottom:1.5rem;font-size:.95rem}
.alerte svg{color:#d97706;margin-top:.2rem}.alerte p{margin:0}
.progression{position:sticky;top:0;z-index:5;background:var(--fond);padding:.6rem 0;margin-bottom:.5rem}
.barre{height:.45rem;background:var(--bord);border-radius:99px;overflow:hidden}
.barre span{display:block;height:100%;width:0;background:var(--accent);transition:width .3s}
.progression small{color:var(--discret);font-size:.82rem}
.etape{background:var(--carte);border:1px solid var(--bord);border-radius:1rem;padding:1.4rem;margin:1rem 0;box-shadow:var(--ombre)}
.etape>header{display:flex;gap:.8rem;align-items:center;margin-bottom:.6rem}
.num{display:grid;place-items:center;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--accent);color:#fff;font-weight:700;flex:none}
.etape h2{font-size:1.25rem;margin:0;line-height:1.25}
.etape .intro{color:var(--discret);margin:.2rem 0 1rem}
.metiers{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1rem}
.metiers button{font:inherit;font-size:.9rem;border:1px solid var(--bord);background:var(--fond);color:var(--texte);border-radius:99px;padding:.35rem .85rem;cursor:pointer}
.metiers button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.champs{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:.8rem 1rem}
label{display:block;font-size:.88rem;font-weight:600;margin-bottom:.25rem}
input,textarea{width:100%;font:inherit;font-size:.95rem;color:var(--texte);background:var(--fond);border:1px solid var(--bord);border-radius:.55rem;padding:.55rem .7rem}
textarea{min-height:6rem;resize:vertical}
.pleine{grid-column:1/-1}
.note{font-size:.82rem;color:var(--discret);margin:.3rem 0 0}
.consigne{border:1px solid var(--bord);border-radius:.8rem;margin:1rem 0;overflow:hidden}
.consigne>div:first-child{display:flex;justify-content:space-between;align-items:center;gap:.8rem;padding:.7rem 1rem;background:var(--accent-doux)}
.consigne h3{font-size:1rem;margin:0}
.consigne .aide{font-size:.85rem;color:var(--discret);margin:.1rem 0 0}
.texte{margin:0;padding:1rem;white-space:pre-wrap;overflow-wrap:anywhere;font:.9rem/1.55 ui-monospace,Menlo,Consolas,monospace;max-height:18rem;overflow:auto}
.texte mark{background:var(--marque);color:inherit;border-radius:.2rem;padding:0 .15rem}
.bouton{display:inline-flex;align-items:center;gap:.4rem;font:inherit;font-size:.9rem;font-weight:600;border:0;border-radius:.6rem;padding:.5rem .9rem;background:var(--accent);color:#fff;cursor:pointer;white-space:nowrap}
.bouton.secondaire{background:transparent;color:var(--accent);border:1px solid var(--accent)}
.bouton.fait{background:var(--ok)}
.exemple{background:var(--fond);border-radius:.7rem;padding:.8rem 1rem;font-size:.92rem;margin-top:1rem}
.exemple strong{display:block;font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--discret);margin-bottom:.2rem}
.liste{list-style:none;padding:0;margin:0}
.liste li{border-bottom:1px solid var(--bord)}.liste li:last-child{border:0}
.liste label{display:flex;gap:.7rem;align-items:flex-start;font-weight:400;font-size:.97rem;padding:.6rem 0;margin:0;cursor:pointer}
.liste input{width:1.2rem;height:1.2rem;margin-top:.2rem;accent-color:var(--accent);flex:none}
.bravo{display:none;margin-top:1rem;padding:1rem;border-radius:.8rem;background:color-mix(in srgb,var(--ok) 12%,var(--carte));border:1px solid var(--ok)}
.bravo.visible{display:block}.bravo p{margin:0 0 .7rem}
.actions{display:flex;flex-wrap:wrap;gap:.6rem}
details{background:var(--carte);border:1px solid var(--bord);border-radius:.8rem;margin:.7rem 0}
summary{cursor:pointer;padding:.8rem 1rem;font-weight:600}
details>div{padding:0 1rem 1rem;font-size:.95rem}
details dl{margin:0}details dt{font-weight:600;margin-top:.6rem}details dd{margin:0;color:var(--discret)}
h2.section{font-size:1.1rem;margin:2rem 0 .5rem}
footer{margin-top:2.5rem;color:var(--discret);font-size:.85rem;text-align:center}
@media (max-width:30rem){.etape{padding:1.1rem}.consigne>div:first-child{flex-direction:column;align-items:flex-start}}
@media print{.hero{background:none;color:#000;padding:0}.puces li,.badge{background:none;padding:0}.progression,.metiers,.bouton,.retour,.champs,.alerte,details,.skip,footer{display:none!important}.etape{box-shadow:none;break-inside:avoid}.texte{max-height:none}body{font-size:11pt}}
</style>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<div class="page">
<a class="retour" href="../index.html">← Tous les modules gratuits</a>
<header class="hero">
  <span class="badge">Module gratuit · ${esc(m.id)}</span>
  <h1>${esc(m.titre)}</h1>
  <p>${esc(COURT.promesse)}</p>
  <ul class="puces">
    <li>${icone.horloge}15 minutes</li>
    <li>${icone.cadeau}Vous repartez avec : ${esc(COURT.livrable)}</li>
    <li>${icone.outil}ChatGPT, Claude, Copilot ou Gemini</li>
  </ul>
</header>

<main id="contenu">
<aside class="alerte" aria-label="Précaution">${icone.bouclier}<p><strong>Ne collez jamais dans un assistant IA :</strong> ${nonCourt.map(esc).join(", ").toLowerCase()}. ${esc(m.avertissement.relecture)}</p></aside>

<div class="progression" aria-hidden="true"><div class="barre"><span id="barre"></span></div><small id="etat">Étape 1 sur 3</small></div>

<section class="etape" aria-labelledby="t1">
  <header><span class="num">1</span><h2 id="t1">Décrivez votre entreprise</h2></header>
  <p class="intro">Remplissez les cases : les consignes de l'étape 2 se complètent toutes seules. Rien n'est envoyé, tout reste dans votre navigateur.</p>
  <p class="note" id="lmetier">Pas d'inspiration ? Partez d'un exemple :</p>
  <div class="metiers" role="group" aria-labelledby="lmetier">
    ${m.exemples.map((e, i) => `<button type="button" data-exemple="${i}" aria-pressed="false">${esc(e.metier)}</button>`).join("\n    ")}
  </div>
  <div class="champs">
    ${champs.map((c) => `<div><label for="c-${slug(c)}">${esc(aDecrire(c))}</label><input id="c-${slug(c)}" data-champ="${esc(c)}" autocomplete="off"></div>`).join("\n    ")}
    <div class="pleine"><label for="c-mails">Deux ou trois de vos anciens mails, sans noms ni coordonnées</label><textarea id="c-mails" data-champ="${esc(libre)}" placeholder="Remplacez les noms par « Madame X », les adresses par « [ADRESSE] »…"></textarea><p class="note">Facultatif ici : vous pouvez aussi les coller directement dans l'assistant.</p></div>
  </div>
</section>

<section class="etape" aria-labelledby="t2">
  <header><span class="num">2</span><h2 id="t2">Copiez les consignes dans votre assistant</h2></header>
  <p class="intro">Ouvrez une nouvelle conversation. Collez la consigne A, corrigez le profil de ton s'il ne vous ressemble pas, puis collez la consigne B dans la même conversation.</p>
  ${donnees.consignes.map((c, i) => `<div class="consigne">
    <div><div><h3>${"AB"[i]}. ${esc(c.titre)}</h3><p class="aide">${esc(c.aide)}</p></div><button type="button" class="bouton" data-copier="${i}">${icone.copier}<span>Copier</span></button></div>
    <pre class="texte" id="consigne-${i}" tabindex="0"></pre>
  </div>`).join("\n  ")}
  <div class="exemple" id="exemple" hidden><strong>Exemple de profil obtenu</strong><span></span></div>
</section>

<section class="etape" aria-labelledby="t3">
  <header><span class="num">3</span><h2 id="t3">Vérifiez avant d'utiliser vos modèles</h2></header>
  <p class="intro">Cochez chaque point. L'assistant peut se tromper ou inventer : vous restez responsable de ce qui part.</p>
  <ul class="liste">
    ${m.controleQualite.map((q, i) => `<li><label><input type="checkbox" data-controle="${i}">${esc(q)}</label></li>`).join("\n    ")}
  </ul>
  <div class="bravo" id="bravo" role="status">
    <p><strong>C'est prêt.</strong> Gardez vos consignes personnalisées pour la prochaine fois.</p>
    <div class="actions"><button type="button" class="bouton" id="telecharger">Télécharger ma fiche</button><button type="button" class="bouton secondaire" id="imprimer">Imprimer</button></div>
  </div>
</section>

<h2 class="section">Pour aller plus loin</h2>
<details><summary>Ça ne marche pas comme prévu ?</summary><div><dl>
  ${m.pieges.map((p) => `<dt>${esc(p.piege)}</dt><dd>${esc(p.solution)}</dd>`).join("\n  ")}
</dl></div></details>
${autres.map((c) => `<details><summary>Bonus : ${esc(c.titre.charAt(0).toLowerCase() + c.titre.slice(1))}</summary><div><p>${esc(c.aide)}</p><pre class="texte">${esc(c.texte)}</pre></div></details>`).join("\n")}
<details><summary>Où ranger vos modèles</summary><div><ul>${m.etapes.at(-1).actions.slice(0, 2).map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div></details>
</main>
<footer>MadeInFormation.fr · Modules gratuits d'intégration simple de l'IA · Maquette de présentation</footer>
</div>
<script type="application/json" id="donnees">${JSON.stringify(donnees).replace(/</g, "\\u003c")}</script>
<script>
(() => {
  const D = JSON.parse(document.getElementById("donnees").textContent);
  const cle = "maquette-" + D.module;
  const champs = [...document.querySelectorAll("[data-champ]")];
  const controles = [...document.querySelectorAll("[data-controle]")];
  const copiees = new Set();
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const valeurs = () => Object.fromEntries(champs.map((c) => [c.dataset.champ, c.value.trim()]));
  const remplir = (t, v, html) => (html ? esc(t) : t).replace(/\\[([^\\]]+)\\]/g, (x, n) => {
    const k = html ? n.replace(/&amp;/g, "&") : n;
    return v[k] ? (html ? esc(v[k]) : v[k]) : (html ? "<mark>[" + n + "]</mark>" : x);
  });
  function sauver() { try { localStorage.setItem(cle, JSON.stringify({ v: valeurs(), c: controles.map((c) => c.checked) })); } catch (e) {} }
  function rendre() {
    const v = valeurs();
    D.consignes.forEach((c, i) => { document.getElementById("consigne-" + i).innerHTML = remplir(c.texte, v, true); });
    const pleins = champs.filter((c) => c.value.trim()).length / champs.length;
    const coches = controles.filter((c) => c.checked).length;
    const p = (pleins + copiees.size / D.consignes.length + coches / controles.length) / 3;
    document.getElementById("barre").style.width = Math.round(p * 100) + "%";
    const etape = coches === controles.length ? "Terminé" : copiees.size ? "Étape 3 sur 3" : pleins > .5 ? "Étape 2 sur 3" : "Étape 1 sur 3";
    document.getElementById("etat").textContent = etape;
    document.getElementById("bravo").classList.toggle("visible", coches === controles.length);
  }
  champs.forEach((c) => c.addEventListener("input", () => { rendre(); sauver(); }));
  controles.forEach((c) => c.addEventListener("change", () => { rendre(); sauver(); }));
  document.querySelectorAll("[data-exemple]").forEach((b) => b.addEventListener("click", () => {
    const e = D.exemples[b.dataset.exemple];
    document.querySelectorAll("[data-exemple]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    champs.forEach((c) => { if (c.dataset.champ in e.valeurs) c.value = e.valeurs[c.dataset.champ]; });
    const ex = document.getElementById("exemple");
    ex.hidden = false;
    ex.querySelector("strong").textContent = "Exemple de profil obtenu · " + e.metier + " (" + e.lieu + ")";
    ex.querySelector("span").textContent = e.resultat;
    rendre(); sauver();
  }));
  document.querySelectorAll("[data-copier]").forEach((b) => b.addEventListener("click", async () => {
    const t = remplir(D.consignes[b.dataset.copier].texte, valeurs(), false);
    try { await navigator.clipboard.writeText(t); }
    catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById("consigne-" + b.dataset.copier)); getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand("copy"); }
    copiees.add(b.dataset.copier);
    b.classList.add("fait"); b.querySelector("span").textContent = "Copié";
    setTimeout(() => { b.classList.remove("fait"); b.querySelector("span").textContent = "Copier"; }, 2000);
    rendre();
  }));
  document.getElementById("telecharger").addEventListener("click", () => {
    const v = valeurs();
    const t = [D.titre.toUpperCase(), ""].concat(
      D.consignes.flatMap((c, i) => ["== Consigne " + "AB"[i] + " : " + c.titre + " ==", remplir(c.texte, v, false), ""]),
      ["== Avant d'utiliser un modèle ==", ...D.controle.map((q) => "[ ] " + q)]).join("\\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/plain;charset=utf-8" }));
    a.download = "fiche-" + D.module.toLowerCase() + ".txt";
    a.click(); URL.revokeObjectURL(a.href);
  });
  document.getElementById("imprimer").addEventListener("click", () => print());
  try {
    const s = JSON.parse(localStorage.getItem(cle) || "null");
    if (s) { champs.forEach((c) => { if (s.v[c.dataset.champ]) c.value = s.v[c.dataset.champ]; }); controles.forEach((c, i) => { c.checked = !!s.c[i]; }); }
  } catch (e) {}
  rendre();
})();
</script>
</body>
</html>
`;

const sortie = join(RACINE, "site", `maquette-${dossier.split("-")[0]}`);
mkdirSync(sortie, { recursive: true });
writeFileSync(join(sortie, "index.html"), html);
console.log(`Maquette écrite : site/maquette-${dossier.split("-")[0]}/index.html`);
