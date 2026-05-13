import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { T as renderTemplate, B as maybeRenderHead } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { $ as $$AdherentMemberLayout } from './AdherentMemberLayout_vGO4grhH.mjs';
import { $ as $$LogoJCBO } from './global_BNFpsslX.mjs';
import { a as getCertificat } from './store_Bz098f4M.mjs';

const $$Certificat = createComponent(($$result, $$props, $$slots) => {
  const mockCertificat = getCertificat();
  const dateFormatee = new Date(mockCertificat.dateDelivrance).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return renderTemplate`${renderComponent($$result, "AdherentMemberLayout", $$AdherentMemberLayout, { "titre": "Mon certificat", "data-astro-cid-ikpuxjuw": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8" data-astro-cid-ikpuxjuw> <div data-astro-cid-ikpuxjuw> <h2 class="text-2xl font-bold" style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>Mon certificat</h2> <p class="text-sm text-gray-500 mt-1" data-astro-cid-ikpuxjuw>Certificat de compétences MINDSET ENTREPRENEURIAL™</p> </div> <button id="btn-print" onclick="window.print()" class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition hover:opacity-90 active:scale-[0.98] self-start" style="background-color: #0b1f3a; color: white;" data-astro-cid-ikpuxjuw> <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-astro-cid-ikpuxjuw> <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" data-astro-cid-ikpuxjuw></path> </svg>
Télécharger / Imprimer
</button> </div>  <div id="certificat-card" class="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden" style="border: 1px solid rgba(212,167,98,0.3);" data-astro-cid-ikpuxjuw> <!-- Bandeau doré supérieur --> <div class="h-2 w-full" style="background: linear-gradient(90deg, #0b1f3a 0%, #d4a762 50%, #0b1f3a 100%);" data-astro-cid-ikpuxjuw></div> <div class="px-8 py-10 lg:px-14 lg:py-14" data-astro-cid-ikpuxjuw> <!-- En-tête : logo + cabinet --> <div class="flex flex-col items-center text-center mb-8" data-astro-cid-ikpuxjuw> ${renderComponent($$result2, "LogoJCBO", $$LogoJCBO, { "size": 72, "data-astro-cid-ikpuxjuw": true })} <p class="text-xs font-medium uppercase tracking-[0.25em] mt-4" style="color: #d4a762;" data-astro-cid-ikpuxjuw>JCBO-CONSEIL</p> <p class="text-xs text-gray-400 tracking-widest mt-0.5" data-astro-cid-ikpuxjuw>Stratégie · Mindset · Performance</p> </div> <!-- Séparateur doré --> <div class="flex items-center gap-4 mb-8" data-astro-cid-ikpuxjuw> <div class="flex-1 h-px" style="background-color: rgba(212,167,98,0.3);" data-astro-cid-ikpuxjuw></div> <div class="w-1.5 h-1.5 rounded-full" style="background-color: #d4a762;" data-astro-cid-ikpuxjuw></div> <div class="flex-1 h-px" style="background-color: rgba(212,167,98,0.3);" data-astro-cid-ikpuxjuw></div> </div> <!-- Titre --> <div class="text-center mb-8" data-astro-cid-ikpuxjuw> <h1 class="text-3xl lg:text-4xl font-bold tracking-wide mb-2" style="color: #0b1f3a; font-family: 'Playfair Display', Georgia, serif;" data-astro-cid-ikpuxjuw>
CERTIFICAT DE COMPÉTENCES
</h1> <p class="text-sm font-semibold tracking-[0.2em] uppercase" style="color: #d4a762;" data-astro-cid-ikpuxjuw>
MINDSET ENTREPRENEURIAL™ by JCBO-CONSEIL
</p> </div> <!-- Corps du certificat --> <div class="text-center mb-8" data-astro-cid-ikpuxjuw> <p class="text-sm text-gray-500 mb-4" data-astro-cid-ikpuxjuw>Le cabinet <strong style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>JCBO-CONSEIL</strong> certifie que :</p> <div class="my-6 py-4" style="border-top: 1px solid #f1f3f5; border-bottom: 1px solid #f1f3f5;" data-astro-cid-ikpuxjuw> <p class="text-2xl lg:text-3xl font-bold" style="color: #0b1f3a; font-family: 'Playfair Display', Georgia, serif;" data-astro-cid-ikpuxjuw> ${mockCertificat.nom} </p> </div> <p class="text-sm text-gray-500 mb-2" data-astro-cid-ikpuxjuw>a suivi avec succès le programme de formation :</p> <p class="text-lg font-bold tracking-wide" style="color: #d4a762;" data-astro-cid-ikpuxjuw>${mockCertificat.programme}</p> <p class="text-xs text-gray-400 mt-1" data-astro-cid-ikpuxjuw>et a validé l'ensemble des modules, exercices et évaluations associés.</p> </div> <!-- Compétences développées --> <div class="mb-8 rounded-xl p-6" style="background-color: rgba(248,246,242,0.8); border: 1px solid rgba(212,167,98,0.15);" data-astro-cid-ikpuxjuw> <p class="text-xs font-semibold uppercase tracking-widest mb-4" style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>Compétences développées</p> <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" data-astro-cid-ikpuxjuw> ${mockCertificat.competences.map((c) => renderTemplate`<div class="flex items-start gap-2.5" data-astro-cid-ikpuxjuw> <div class="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style="background-color: rgba(212,167,98,0.15);" data-astro-cid-ikpuxjuw> <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#d4a762" stroke-width="3" data-astro-cid-ikpuxjuw> <polyline points="20 6 9 17 4 12" data-astro-cid-ikpuxjuw></polyline> </svg> </div> <p class="text-xs text-gray-600 leading-relaxed" data-astro-cid-ikpuxjuw>${c}</p> </div>`)} </div> </div> <!-- Attestation --> <div class="text-center mb-8" data-astro-cid-ikpuxjuw> <p class="text-xs text-gray-500 leading-relaxed max-w-xl mx-auto" data-astro-cid-ikpuxjuw>
Ce certificat atteste de la capacité du participant à mobiliser les fondamentaux du
<strong style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>MINDSET ENTREPRENEURIAL™</strong> dans un contexte professionnel,
          entrepreneurial ou managérial.
</p> </div> <!-- Infos certificat + signature --> <div class="flex flex-col sm:flex-row justify-between items-start gap-6 pt-6" style="border-top: 1px solid #f1f3f5;" data-astro-cid-ikpuxjuw> <div data-astro-cid-ikpuxjuw> <p class="text-xs text-gray-400 mb-1" data-astro-cid-ikpuxjuw>Délivré le</p> <p class="text-sm font-semibold" style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>${dateFormatee}</p> <p class="text-xs text-gray-400 mt-3 mb-1" data-astro-cid-ikpuxjuw>Numéro du certificat</p> <p class="text-sm font-mono font-semibold" style="color: #d4a762;" data-astro-cid-ikpuxjuw>${mockCertificat.numero}</p> </div> <div class="text-center sm:text-right" data-astro-cid-ikpuxjuw> <div class="w-32 h-px mb-3 sm:ml-auto" style="background-color: #0b1f3a;" data-astro-cid-ikpuxjuw></div> <p class="text-sm font-bold" style="color: #0b1f3a;" data-astro-cid-ikpuxjuw>Jean-Christophe BOYANG-TSANG</p> <p class="text-xs text-gray-400 mt-0.5" data-astro-cid-ikpuxjuw>Consultant en Business Development</p> <p class="text-xs text-gray-400" data-astro-cid-ikpuxjuw>Fondateur du cabinet JCBO-CONSEIL</p> </div> </div> </div> <!-- Bandeau doré inférieur --> <div class="h-2 w-full" style="background: linear-gradient(90deg, #0b1f3a 0%, #d4a762 50%, #0b1f3a 100%);" data-astro-cid-ikpuxjuw></div> </div> ` })}`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/certificat.astro", void 0);

const $$file = "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/certificat.astro";
const $$url = "/adherent/certificat";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Certificat,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
