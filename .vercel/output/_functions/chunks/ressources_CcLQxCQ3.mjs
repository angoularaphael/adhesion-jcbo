import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { T as renderTemplate, B as maybeRenderHead, a4 as addAttribute } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { $ as $$AdherentLayout } from './AdherentLayout_CuUsU77u.mjs';
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
  return renderTemplate`${renderComponent($$result, "AdherentLayout", $$AdherentLayout, { "titre": "Ressources" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8"> <h2 class="text-2xl font-bold" style="color: #0b1f3a;">Ressources</h2> <p class="text-sm text-gray-500 mt-1">Documents et outils mis à disposition par JCBO Conseil.</p> </div> ${renderComponent($$result2, "Card", $$Card, {}, { "default": ($$result3) => renderTemplate` <div class="flex flex-col divide-y divide-gray-100"> ${mockRessources.map((r) => renderTemplate`<div class="flex items-center justify-between py-4 first:pt-0 last:pb-0"> <div class="flex items-center gap-4"> <!-- Icône --> <div class="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0" style="background-color: rgba(212,167,98,0.1);">
📄
</div> <div> <p class="text-sm font-medium" style="color: #0b1f3a;">${r.titre}</p> <p class="text-xs text-gray-400 mt-0.5"> ${new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} </p> </div> </div> <div class="flex items-center gap-3"> ${renderComponent($$result3, "Badge", $$Badge, { "variant": variantByCategorie[r.categorie] ?? "gris" }, { "default": ($$result4) => renderTemplate`${r.categorie}` })} <a${addAttribute(r.fichier, "href")} class="text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80" style="background-color: #0b1f3a; color: white;">
Télécharger
</a> </div> </div>`)} </div> ` })} ` })}`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/pages/dashboard/ressources.astro", void 0);

const $$file = "C:/Users/NWAHA/adhesion-jcbo/src/pages/dashboard/ressources.astro";
const $$url = "/dashboard/ressources";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ressources,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
