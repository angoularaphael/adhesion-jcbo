import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { T as renderTemplate, B as maybeRenderHead, a4 as addAttribute } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { r as renderScript } from './global_BNFpsslX.mjs';
import { $ as $$AdherentMemberLayout } from './AdherentMemberLayout_vGO4grhH.mjs';
import { $ as $$Card } from './Card_CrioVrA5.mjs';
import { $ as $$Badge } from './Badge_XqW2HorT.mjs';
import { c as getRessources } from './store_Bz098f4M.mjs';

const $$Ressources = createComponent(($$result, $$props, $$slots) => {
  const mockRessources = getRessources();
  const variantByCategorie = {
    Guide: "or",
    Modèle: "vert",
    Outil: "gris"
  };
  const categories = ["Tous", ...new Set(mockRessources.map((r) => r.categorie))];
  return renderTemplate`${renderComponent($$result, "AdherentMemberLayout", $$AdherentMemberLayout, { "titre": "Ressources" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"> <div> <h2 class="text-2xl font-bold" style="color: #0b1f3a;">Ressources</h2> <p class="text-sm text-gray-500 mt-1">Documents et outils mis à disposition par JCBO Conseil.</p> </div> <div class="flex gap-2 flex-wrap"> ${categories.map((cat, i) => renderTemplate`<button${addAttribute(cat, "data-cat")}${addAttribute(`filtre-btn px-4 py-1.5 rounded-full text-xs font-semibold transition ${i === 0 ? "text-white" : "text-gray-500 bg-white border border-gray-200 hover:border-gray-300"}`, "class")}${addAttribute(i === 0 ? "background-color: #0b1f3a;" : "", "style")}> ${cat} </button>`)} </div> </div> ${renderComponent($$result2, "Card", $$Card, {}, { "default": ($$result3) => renderTemplate` <div id="ressources-list" class="flex flex-col divide-y divide-gray-100"> ${mockRessources.map((r) => renderTemplate`<div class="ressource-item flex items-center justify-between py-4 first:pt-0 last:pb-0"${addAttribute(r.categorie, "data-cat")}> <div class="flex items-center gap-4"> <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: rgba(212,167,98,0.1);"> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#d4a762" stroke-width="1.8"> <path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"></path><polyline points="14 2 14 8 20 8"></polyline> </svg> </div> <div> <p class="text-sm font-medium" style="color: #0b1f3a;">${r.titre}</p> <p class="text-xs text-gray-400 mt-0.5"> ${new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} </p> </div> </div> <div class="flex items-center gap-3 flex-shrink-0"> ${renderComponent($$result3, "Badge", $$Badge, { "variant": variantByCategorie[r.categorie] ?? "gris" }, { "default": ($$result4) => renderTemplate`${r.categorie}` })} <a${addAttribute(r.fichier, "href")} class="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80 flex items-center gap-1.5" style="background-color: #0b1f3a; color: white;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"> <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"></path> </svg>
Télécharger
</a> </div> </div>`)} </div> ` })} ${renderScript($$result2, "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/ressources.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/ressources.astro", void 0);

const $$file = "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/ressources.astro";
const $$url = "/adherent/ressources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ressources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
