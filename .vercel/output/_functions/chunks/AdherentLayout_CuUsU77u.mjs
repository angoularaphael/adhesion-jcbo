import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { B as maybeRenderHead, a4 as addAttribute, T as renderTemplate, b9 as unescapeHTML, D as renderSlot, bb as renderHead } from './sequence_CDEARiL7.mjs';
import { r as renderComponent } from './entrypoint_BJKBuh4g.mjs';
import { $ as $$LogoJCBO, r as renderScript } from './global_BNFpsslX.mjs';
import 'clsx';

const $$Sidebar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Sidebar;
  const navLinks = [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
    },
    {
      label: "Actualités",
      href: "/dashboard/actualites",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><line x1="9" y1="13" x2="15" y2="13" stroke-linecap="round"/><line x1="9" y1="17" x2="13" y2="17" stroke-linecap="round"/></svg>`
    },
    {
      label: "Statistiques",
      href: "/dashboard/statistiques",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 18V10M8 18V6M13 18v-5M18 18V9"/></svg>`
    },
    {
      label: "Messagerie",
      href: "/dashboard/messagerie",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4-4 7-9 7a9.9 9.9 0 01-4-.8L3 20l1.8-4A7 7 0 013 12c0-4 4-7 9-7s9 3 9 7z"/></svg>`
    },
    {
      label: "Identifiants",
      href: "/dashboard/identifiants",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M15 7a4 4 0 010 8m-4 1H5a4 4 0 010-8h6m4 4H9"/></svg>`
    }
  ];
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<aside id="sidebar" class="w-64 min-h-screen flex flex-col flex-shrink-0 fixed lg:static inset-y-0 left-0 z-30 -translate-x-full lg:translate-x-0 transition-transform duration-300" style="background-color: #0b1f3a;"> <!-- Logo --> <div class="px-6 py-6 flex items-center gap-3" style="border-bottom: 1px solid rgba(212,167,98,0.15);"> ${renderComponent($$result, "LogoJCBO", $$LogoJCBO, { "size": 44 })} <div> <p class="text-sm font-semibold text-white tracking-wide">JCBO Conseil</p> <p class="text-xs mt-0.5" style="color: #d4a762;">Super Admin</p> </div> </div> <!-- Navigation --> <nav class="flex-1 px-3 py-5 flex flex-col gap-0.5"> ${navLinks.map((link) => {
    const isActive = currentPath === link.href;
    return renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "text-white" : "hover:text-white hover:bg-white/5"}`, "class")}${addAttribute(isActive ? "background-color: rgba(212,167,98,0.12); color: #d4a762;" : "color: rgba(255,255,255,0.55);", "style")}> ${isActive && renderTemplate`<span class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style="background-color: #d4a762;"></span>`} <span class="flex-shrink-0">${unescapeHTML(link.icon)}</span> <span>${link.label}</span> </a>`;
  })} </nav> <!-- Déconnexion --> <div class="px-3 py-5" style="border-top: 1px solid rgba(212,167,98,0.15);"> <button id="btn-logout" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 w-full text-left" style="color: rgba(255,255,255,0.4);"> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"> <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"></path> </svg> <span>Déconnexion</span> </button> </div> ${renderScript($$result, "C:/Users/NWAHA/adhesion-jcbo/src/components/navigation/Sidebar.astro?astro&type=script&index=0&lang.ts")} </aside> <!-- Overlay mobile --> <div id="sidebar-overlay" class="fixed inset-0 z-20 bg-black/50 hidden lg:hidden" onclick="document.getElementById('sidebar').classList.add('-translate-x-full'); this.classList.add('hidden');"></div>`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/components/navigation/Sidebar.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<header class="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-200 flex-shrink-0"> <!-- Titre dynamique via slot --> ${renderSlot($$result, $$slots["default"])} <!-- Profil admin --> <div class="flex items-center gap-3"> <div class="text-right"> <p class="text-sm font-semibold" style="color: #0b1f3a;">Super Admin</p> <p class="text-xs text-gray-400">JCBO Conseil</p> </div> <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background-color: #0b1f3a;">
SA
</div> </div> </header>`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/components/navigation/Header.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$AdherentLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$AdherentLayout;
  const { titre } = Astro2.props;
  return renderTemplate(_a || (_a = __template([`<html lang="fr"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="description" content="Espace d'administration JCBO Conseil — gestion des adhérents, actualités et messagerie."><title>`, ' — JCBO Conseil</title><script type="application/ld+json">\n    {\n      "@context": "https://schema.org",\n      "@type": "Organization",\n      "name": "JCBO Conseil",\n      "description": "Cabinet de conseil aux entreprises spécialisé en accompagnement stratégique, fiscal et organisationnel.",\n      "url": "https://jcboyang-conseil-1.onrender.com"\n    }\n    <\/script>', '</head> <body class="flex" style="background-color: #f8f6f2; min-height: 100vh;"> ', ' <div class="flex flex-col flex-1 min-w-0"> ', ' <main class="p-4 lg:p-8 flex-1"> ', " </main> </div> ", " </body> </html>"])), titre, renderHead(), renderComponent($$result, "Sidebar", $$Sidebar, {}), renderComponent($$result, "Header", $$Header, {}, { "default": ($$result2) => renderTemplate`  <div class="flex items-center gap-3"> <button id="menu-toggle" class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition" style="color: #0b1f3a;"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> <h1 class="text-lg font-semibold font-heading" style="color: #0b1f3a;">${titre}</h1> </div> ` }), renderSlot($$result, $$slots["default"]), renderScript($$result, "C:/Users/NWAHA/adhesion-jcbo/src/layouts/AdherentLayout.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/NWAHA/adhesion-jcbo/src/layouts/AdherentLayout.astro", void 0);

export { $$AdherentLayout as $ };
