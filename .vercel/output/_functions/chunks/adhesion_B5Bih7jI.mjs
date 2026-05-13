import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { T as renderTemplate, B as maybeRenderHead } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { $ as $$AdherentMemberLayout } from './AdherentMemberLayout_vGO4grhH.mjs';
import { $ as $$Card } from './Card_CrioVrA5.mjs';
import { $ as $$Badge } from './Badge_XqW2HorT.mjs';
import { g as getAdhesion } from './store_Bz098f4M.mjs';

const $$Adhesion = createComponent(($$result, $$props, $$slots) => {
  const mockAdhesion = getAdhesion();
  const dateDebutFormatee = new Date(mockAdhesion.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const dateFinFormatee = new Date(mockAdhesion.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const joursRestants = Math.ceil((new Date(mockAdhesion.dateFin).getTime() - Date.now()) / 864e5);
  const totalPaye = mockAdhesion.paiements.reduce((acc, p) => acc + p.montant, 0);
  return renderTemplate`${renderComponent($$result, "AdherentMemberLayout", $$AdherentMemberLayout, { "titre": "Mon adhésion" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-8"> <h2 class="text-2xl font-bold" style="color: #0b1f3a;">Mon adhésion</h2> <p class="text-sm text-gray-500 mt-1">Suivi de votre adhésion et historique des paiements.</p> </div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"> <!-- Statut principal --> <div class="lg:col-span-2"> ${renderComponent($$result2, "Card", $$Card, {}, { "default": ($$result3) => renderTemplate` <div class="flex items-start justify-between mb-6"> <div> <p class="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Programme</p> <h3 class="text-lg font-bold" style="color: #0b1f3a;">${mockAdhesion.programme}</h3> <p class="text-xs text-gray-400 mt-1">N° ${mockAdhesion.numero}</p> </div> ${renderComponent($$result3, "Badge", $$Badge, { "variant": "vert" }, { "default": ($$result4) => renderTemplate`Active` })} </div> <div class="grid grid-cols-2 gap-6 pt-5" style="border-top: 1px solid #f1f3f5;"> <div> <p class="text-xs text-gray-400 mb-1">Date de début</p> <p class="text-sm font-semibold" style="color: #0b1f3a;">${dateDebutFormatee}</p> </div> <div> <p class="text-xs text-gray-400 mb-1">Date de fin</p> <p class="text-sm font-semibold" style="color: #0b1f3a;">${dateFinFormatee}</p> </div> </div> ${joursRestants > 0 && joursRestants <= 90 && renderTemplate`<div class="mt-5 rounded-xl px-4 py-3 flex items-center gap-3" style="background-color: rgba(212,167,98,0.08); border: 1px solid rgba(212,167,98,0.2);"> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#d4a762" stroke-width="2"> <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round"></line><circle cx="12" cy="16" r="0.5" fill="#d4a762"></circle> </svg> <p class="text-xs" style="color: #d4a762;">Votre adhésion expire dans <strong>${joursRestants} jours</strong>. Contactez JCBO Conseil pour le renouvellement.</p> </div>`}` })} </div> <!-- Total payé --> ${renderComponent($$result2, "Card", $$Card, { "class": "flex flex-col justify-between" }, { "default": ($$result3) => renderTemplate` <div> <p class="text-xs text-gray-400 uppercase tracking-wide mb-3">Total réglé</p> <p class="text-3xl font-bold" style="color: #0b1f3a;">${totalPaye} €</p> <p class="text-xs text-gray-400 mt-1">${mockAdhesion.paiements.length} paiement${mockAdhesion.paiements.length > 1 ? "s" : ""}</p> </div> <a href="/adherent/contact" class="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition hover:opacity-90" style="background-color: rgba(212,167,98,0.1); color: #d4a762;">
Contacter JCBO
</a> ` })} </div>  ${renderComponent($$result2, "Card", $$Card, {}, { "default": ($$result3) => renderTemplate` <h3 class="text-sm font-semibold mb-5" style="color: #0b1f3a;">Historique des paiements</h3> <div class="overflow-x-auto"> <table class="w-full"> <thead> <tr style="border-bottom: 1px solid #f1f3f5;"> <th class="text-left text-xs font-medium text-gray-400 uppercase tracking-widest pb-3">Référence</th> <th class="text-left text-xs font-medium text-gray-400 uppercase tracking-widest pb-3">Date</th> <th class="text-left text-xs font-medium text-gray-400 uppercase tracking-widest pb-3">Méthode</th> <th class="text-right text-xs font-medium text-gray-400 uppercase tracking-widest pb-3">Montant</th> <th class="text-center text-xs font-medium text-gray-400 uppercase tracking-widest pb-3">Statut</th> </tr> </thead> <tbody class="divide-y divide-gray-50"> ${mockAdhesion.paiements.map((p) => renderTemplate`<tr class="hover:bg-gray-50 transition-colors"> <td class="py-3.5 font-mono text-xs text-gray-400">${p.reference}</td> <td class="py-3.5 text-sm" style="color: #0b1f3a;"> ${new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} </td> <td class="py-3.5 text-sm text-gray-500">${p.methode}</td> <td class="py-3.5 text-sm font-semibold text-right" style="color: #0b1f3a;">${p.montant} €</td> <td class="py-3.5 text-center"> ${renderComponent($$result3, "Badge", $$Badge, { "variant": "vert" }, { "default": ($$result4) => renderTemplate`Réglé` })} </td> </tr>`)} </tbody> </table> </div> ` })} ` })}`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/adhesion.astro", void 0);

const $$file = "C:/Users/NWAHA/adhesion-jcbo/src/pages/adherent/adhesion.astro";
const $$url = "/adherent/adhesion";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Adhesion,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
