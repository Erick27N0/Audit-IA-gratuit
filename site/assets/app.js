/* Améliorations facultatives : copier, chronométrer, mémoriser. La lecture fonctionne sans ce script. */
(function () {
  "use strict";
  var racine = document.querySelector("[data-module]");
  if (!racine) return;
  var idModule = racine.getAttribute("data-module");
  var cle = "audit-ia:" + idModule;
  var etat = { etapes: {}, controle: {}, evaluation: null, date: null };

  function lire() {
    try {
      var brut = window.localStorage.getItem(cle);
      if (brut) { var o = JSON.parse(brut); if (o && typeof o === "object") etat = Object.assign(etat, o); }
    } catch (e) { /* stockage indisponible : on continue sans mémoriser */ }
  }
  function ecrire() {
    try { window.localStorage.setItem(cle, JSON.stringify(etat)); } catch (e) { /* ignoré */ }
  }
  lire();

  /* Éléments réservés au JavaScript */
  Array.prototype.forEach.call(document.querySelectorAll("[data-js]"), function (el) { el.hidden = false; });

  /* Cases à cocher : étapes et contrôle qualité */
  function lier(selecteur, groupe) {
    Array.prototype.forEach.call(document.querySelectorAll(selecteur), function (c) {
      var id = c.getAttribute("data-id");
      c.checked = !!etat[groupe][id];
      c.addEventListener("change", function () { etat[groupe][id] = c.checked; ecrire(); majProgression(); });
    });
  }
  lier("input.fait", "etapes");
  lier("input.controle", "controle");

  function majProgression() {
    var cases = document.querySelectorAll("input.fait");
    var faites = document.querySelectorAll("input.fait:checked").length;
    var sortie = document.getElementById("progression");
    if (sortie) sortie.textContent = faites + " étape(s) sur " + cases.length + " terminée(s)";
  }
  majProgression();

  /* Copier */
  function message(bouton, texte) {
    var cible = bouton.parentNode.querySelector(".etat");
    if (cible) cible.textContent = texte;
    window.setTimeout(function () { if (cible) cible.textContent = ""; }, 5000);
  }
  function selectionner(pre) {
    var r = document.createRange(); r.selectNodeContents(pre);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  function repli(pre, bouton) {
    selectionner(pre);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    message(bouton, ok ? "Consigne copiée." : "Copie automatique impossible : le texte est sélectionné, copiez-le avec Ctrl+C (ou en appui long sur mobile).");
  }
  Array.prototype.forEach.call(document.querySelectorAll("button.copier"), function (b) {
    b.addEventListener("click", function () {
      var pre = document.getElementById(b.getAttribute("data-cible"));
      if (!pre) return;
      var texte = pre.textContent;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texte).then(function () { message(b, "Consigne copiée."); }, function () { repli(pre, b); });
      } else { repli(pre, b); }
    });
  });

  /* Minuteur par étape */
  Array.prototype.forEach.call(document.querySelectorAll("button.minuteur"), function (b) {
    var prevu = parseInt(b.getAttribute("data-minutes"), 10) * 60;
    var sortie = b.parentNode.querySelector("output");
    var debut = null, tic = null;
    function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return m + " min " + (r < 10 ? "0" : "") + r + " s"; }
    b.addEventListener("click", function () {
      if (tic) {
        window.clearInterval(tic); tic = null; b.textContent = "Reprendre le minuteur"; return;
      }
      var ecoule = debut === null ? 0 : debut;
      var t0 = Date.now() - ecoule * 1000;
      b.textContent = "Mettre en pause";
      function maj() {
        debut = Math.floor((Date.now() - t0) / 1000);
        sortie.textContent = fmt(debut) + " sur " + (prevu / 60) + " min prévues" + (debut > prevu ? " (temps dépassé, ce n'est pas grave)" : "");
      }
      maj(); tic = window.setInterval(maj, 1000);
    });
  });

  /* Auto-évaluation */
  var form = document.getElementById("autoeval");
  if (form) {
    var radios = form.querySelectorAll("input[name=resultat]");
    Array.prototype.forEach.call(radios, function (r) { r.checked = etat.evaluation === r.value; });
    var retour = document.getElementById("autoeval-retour");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var choix = form.querySelector("input[name=resultat]:checked");
      if (!choix) { retour.textContent = "Choisissez « oui » ou « non » avant d'enregistrer."; return; }
      etat.evaluation = choix.value; etat.date = new Date().toISOString().slice(0, 10); ecrire();
      retour.textContent = "Réponse enregistrée dans ce navigateur uniquement.";
      envoyer(choix.value);
    });
  }

  /* Configuration facultative (site/config.json) : lien vers l'offre et envoi de l'auto-évaluation. */
  var config = { offreUrl: null, autoevaluationUrl: null };
  function charger() {
    if (!window.fetch) return;
    window.fetch("../config.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
      if (!c) return;
      config = c;
      var bloc = document.getElementById("aller-plus-loin");
      var lien = document.getElementById("lien-offre");
      if (bloc && lien && typeof c.offreUrl === "string" && /^https:\/\//.test(c.offreUrl)) {
        lien.href = c.offreUrl; bloc.hidden = false;
      }
    }).catch(function () { /* fichier absent : bloc masqué */ });
  }
  function envoyer(valeur) {
    if (typeof config.autoevaluationUrl !== "string" || !/^https:\/\//.test(config.autoevaluationUrl)) return;
    try {
      window.fetch(config.autoevaluationUrl, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: idModule, resultat: valeur, date: etat.date })
      }).catch(function () { /* échec silencieux : la réponse reste mémorisée localement */ });
    } catch (e) { /* ignoré */ }
  }
  charger();
})();
