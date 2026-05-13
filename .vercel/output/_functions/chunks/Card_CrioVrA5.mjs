import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import { B as maybeRenderHead, a4 as addAttribute, D as renderSlot, T as renderTemplate } from './sequence_CDEARiL7.mjs';
import 'clsx';

const $$Card = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Card;
  const { class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`bg-white rounded-xl shadow-sm p-6 ${className}`, "class")}> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/components/ui/Card.astro", void 0);

export { $$Card as $ };
