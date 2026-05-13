import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { B as maybeRenderHead, a4 as addAttribute, D as renderSlot, T as renderTemplate } from './sequence_CDEARiL7.mjs';
import 'clsx';

const $$Badge = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Badge;
  const { variant = "or", class: className = "" } = Astro2.props;
  const styles = {
    or: "background-color: rgba(212,167,98,0.15); color: #d4a762;",
    vert: "background-color: rgba(34,197,94,0.15); color: #16a34a;",
    gris: "background-color: rgba(107,114,128,0.15); color: #6b7280;",
    rouge: "background-color: rgba(239,68,68,0.15); color: #dc2626;"
  };
  return renderTemplate`${maybeRenderHead()}<span${addAttribute(`inline-block text-xs font-semibold px-3 py-1 rounded-full ${className}`, "class")}${addAttribute(styles[variant], "style")}> ${renderSlot($$result, $$slots["default"])} </span>`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/components/ui/Badge.astro", void 0);

export { $$Badge as $ };
