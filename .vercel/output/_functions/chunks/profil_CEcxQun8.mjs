import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { T as renderTemplate, B as maybeRenderHead } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { $ as $$AdherentLayout } from './AdherentLayout_CuUsU77u.mjs';
import { $ as $$Card } from './Card_CrioVrA5.mjs';
import { $ as $$Badge } from './Badge_XqW2HorT.mjs';
import { a as mockAdmin } from './mock_DQYpfraV.mjs';

const $$Profil = createComponent(($$result, $$props, $$slots) => {
  const champs = [
    { label: "Prénom", valeur: mockAdmin.prenom },
    { label: "Nom", valeur: mockAdmin.nom },
    { label: "E-mail", valeur: mockAdmin.email }
  ];
  return renderTemplate`${renderComponent($$result, "AdherentLayout", $$AdherentLayout, { "titre": "Mon profil" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8"> <h2 class="text-2xl font-bold" style="color: #0b1f3a;">Mon profil</h2> <p class="text-sm text-gray-500 mt-1">Informations liées à votre adhésion.</p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"> <!-- Carte identité --> ${renderComponent($$result2, "Card", $$Card, { "class": "flex flex-col items-center text-center gap-3" }, { "default": ($$result3) => renderTemplate` <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" style="background-color: #0b1f3a;"> ${mockAdmin.prenom[0]}${mockAdmin.nom[0]} </div> <div> <p class="font-semibold" style="color: #0b1f3a;">${mockAdmin.prenom} ${mockAdmin.nom}</p> <p class="text-xs text-gray-400 mt-0.5">JCBO Conseil</p> </div> ${renderComponent($$result3, "Badge", $$Badge, { "variant": "or" }, { "default": ($$result4) => renderTemplate`Super Admin` })} <p class="text-xs text-gray-400">${mockAdmin.email}</p> ` })} <!-- Informations détaillées --> <div class="lg:col-span-2"> ${renderComponent($$result2, "Card", $$Card, {}, { "default": ($$result3) => renderTemplate` <h3 class="text-sm font-semibold mb-5" style="color: #0b1f3a;">Informations personnelles</h3> <div class="grid grid-cols-1 sm:grid-cols-2 gap-5"> ${champs.map((c) => renderTemplate`<div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">${c.label}</p> <p class="text-sm font-medium" style="color: #0b1f3a;">${c.valeur}</p> </div>`)} </div> ` })} </div> </div> ` })}`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/pages/dashboard/profil.astro", void 0);

const $$file = "C:/Users/NWAHA/adhesion-jcbo/src/pages/dashboard/profil.astro";
const $$url = "/dashboard/profil";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Profil,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
