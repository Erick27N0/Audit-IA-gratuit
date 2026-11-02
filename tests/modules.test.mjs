import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listerModules, genererTout, dureeTotale } from "../scripts/build.mjs";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const modules = listerModules(RACINE);

const nonVide = (v, chemin) => {
  if (v === null || v === undefined) assert.fail(`${chemin} est vide`);
  if (typeof v === "string") assert.ok(v.trim().length > 0, `${chemin} est une chaîne vide`);
  else if (Array.isArray(v)) { assert.ok(v.length > 0, `${chemin} est une liste vide`); v.forEach((x, i) => nonVide(x, `${chemin}[${i}]`)); }
  else if (typeof v === "object") { assert.ok(Object.keys(v).length > 0, `${chemin} est un objet vide`); Object.entries(v).forEach(([k, x]) => nonVide(x, `${chemin}.${k}`)); }
};

test("au moins un module est présent", () => assert.ok(modules.length >= 1));

for (const { dir, module: m } of modules) {
  test(`${dir} : schéma complet et aucun champ vide`, () => {
    for (const k of ["id", "titre", "statut", "public", "objectif", "resultat", "prerequis", "avertissement", "etapes", "consignes", "exemples", "pieges", "controleQualite", "autoevaluation", "aTester", "video"]) assert.ok(k in m, `clé manquante : ${k}`);
    nonVide(m, dir);
    assert.match(m.id, /^I\d{2}$/);
    assert.ok(dir.startsWith(m.id.toLowerCase() + "-"), "le dossier doit commencer par l'identifiant");
    assert.match(m.statut, /brouillon, consignes à tester/);
    for (const k of ["titre", "points", "relecture"]) assert.ok(m.avertissement[k]);
    assert.match(m.avertissement.titre, /Ce qu'on ne colle jamais dans un assistant IA/);
    assert.match(m.avertissement.relecture, /[Rr]elisez/);
    for (const e of m.etapes) {
      for (const k of ["titre", "minutes", "description", "actions", "fiche"]) assert.ok(e[k], `étape sans ${k}`);
      assert.ok(Number.isInteger(e.minutes) && e.minutes > 0);
    }
    for (const q of ["question", "oui", "non"]) assert.ok(m.autoevaluation[q]);
  });

  test(`${dir} : durée totale entre 30 et 60 minutes`, () => {
    const t = dureeTotale(m);
    assert.ok(t >= 30 && t <= 60, `durée = ${t}`);
  });

  test(`${dir} : consignes, champs et exemples cohérents`, () => {
    const ids = new Set(m.consignes.map((c) => c.id));
    assert.equal(ids.size, m.consignes.length, "identifiants de consigne en double");
    for (const c of m.consignes) {
      assert.ok(Array.isArray(c.champs) && c.champs.length > 0);
      for (const ch of c.champs) assert.ok(c.texte.includes(`[${ch}]`), `${c.id} : champ [${ch}] absent du texte`);
    }
    const utilisees = m.etapes.flatMap((e) => e.consignes || []);
    for (const u of utilisees) assert.ok(ids.has(u), `consigne inconnue : ${u}`);
    for (const c of m.consignes) assert.ok(utilisees.includes(c.id), `consigne ${c.id} jamais utilisée dans une étape`);
    assert.ok(new Set(m.exemples.map((x) => x.metier)).size >= 3, "au moins 3 métiers");
    for (const x of m.exemples) {
      const c = m.consignes.find((y) => y.id === x.consigne);
      assert.ok(c, `exemple vers consigne inconnue ${x.consigne}`);
      for (const ch of c.champs) assert.ok(x.valeurs[ch], `${x.metier} : valeur manquante pour [${ch}]`);
      for (const k of Object.keys(x.valeurs)) assert.ok(c.champs.includes(k), `${x.metier} : champ inconnu ${k}`);
      for (const k of ["lieu", "contexte", "resultat"]) assert.ok(x[k]);
    }
  });

  test(`${dir} : script vidéo de 5 à 10 minutes, débit plausible`, () => {
    const s = m.video.reduce((t, x) => t + x.secondes, 0);
    assert.ok(s >= 300 && s <= 600, `durée vidéo = ${s} s`);
    const mots = m.video.reduce((t, x) => t + x.texte.split(/\s+/).length, 0);
    const debit = mots / s;
    assert.ok(debit > 1.4 && debit < 3.2, `débit = ${debit.toFixed(2)} mots/s`);
    for (const x of m.video) assert.ok(x.titre && x.texte && x.ecran && x.secondes > 0);
  });

  test(`${dir} : vouvoiement, pas de promesse chiffrée de gain`, () => {
    const texte = JSON.stringify({ ...m, aTester: 0 });
    assert.doesNotMatch(texte, /gagnez \d|\d+ ?% de (temps|gain)|économisez|gain de temps garanti/i);
  });
}

test("sortie générée à jour (npm run build à relancer sinon)", () => {
  for (const [chemin, contenu] of genererTout(RACINE)) {
    assert.ok(existsSync(join(RACINE, chemin)), `fichier généré manquant : ${chemin}`);
    assert.equal(readFileSync(join(RACINE, chemin), "utf8"), contenu, `${chemin} n'est pas à jour`);
  }
});

function fichiers(d, sortie = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? fichiers(p, sortie) : sortie.push(p);
  }
  return sortie;
}

test("site : aucun lien externe, aucune ressource distante, aucun cookie", () => {
  for (const f of fichiers(join(RACINE, "site")).filter((p) => /\.(html|css|js|md)$/.test(p))) {
    const t = readFileSync(f, "utf8");
    assert.doesNotMatch(t, /https?:\/\//i, `URL absolue dans ${f}`);
    assert.doesNotMatch(t, /(src|href)=["']\/\//i, `URL protocole-relative dans ${f}`);
    assert.doesNotMatch(t, /@import|url\(\s*["']?https?/i, `import distant dans ${f}`);
    assert.doesNotMatch(t, /document\.cookie|XMLHttpRequest|sendBeacon|googletagmanager|analytics/i, `traqueur potentiel dans ${f}`);
  }
});

test("site : liens internes valides", () => {
  for (const f of fichiers(join(RACINE, "site")).filter((p) => p.endsWith(".html"))) {
    const t = readFileSync(f, "utf8");
    for (const [, lien] of t.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      if (lien.startsWith("mailto:")) continue;
      assert.ok(existsSync(join(dirname(f), lien)), `${f} : lien cassé ${lien}`);
    }
  }
});

test("config.json : offre et envoi d'auto-évaluation inexistants (null)", () => {
  const c = JSON.parse(readFileSync(join(RACINE, "site/config.json"), "utf8"));
  assert.deepEqual(Object.keys(c).sort(), ["autoevaluationUrl", "offreUrl"]);
  assert.equal(c.offreUrl, null);
  assert.equal(c.autoevaluationUrl, null);
});

test("dépôt public : pas de prix de formation ni de donnée personnelle évidente", () => {
  for (const f of fichiers(join(RACINE, "modules")).concat(fichiers(join(RACINE, "site")))) {
    if (!/\.(json|md|html)$/.test(f)) continue;
    const t = readFileSync(f, "utf8");
    assert.doesNotMatch(t, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, `adresse e-mail dans ${f}`);
    assert.doesNotMatch(t, /(?:\+33|0)[1-9](?:[ .]?\d{2}){4}/, `numéro de téléphone dans ${f}`);
  }
});
