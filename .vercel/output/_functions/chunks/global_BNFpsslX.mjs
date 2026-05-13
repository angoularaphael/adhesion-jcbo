import { U as createRenderInstruction, B as maybeRenderHead, a4 as addAttribute, T as renderTemplate } from './sequence_CDEARiL7.mjs';
import { c as createComponent } from './astro-component_BTNVx6SL.mjs';
import 'piccolore';
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$LogoJCBO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$LogoJCBO;
  const { size = 48, class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<img src="/images/logo.png" alt="JCBO Conseil"${addAttribute(size, "width")}${addAttribute(Math.round(size * 1.17), "height")}${addAttribute(`object-contain flex-shrink-0 ${className}`, "class")}>`;
}, "C:/Users/NWAHA/adhesion-jcbo/src/components/ui/LogoJCBO.astro", void 0);

export { $$LogoJCBO as $, renderScript as r };
