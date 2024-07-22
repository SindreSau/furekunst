/* empty css                                   */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_BN26aiQn.mjs';
import 'kleur/colors';
import { $ as $$MainLayout } from '../chunks/MainLayout_D-soJsAX.mjs';
export { renderers } from '../renderers.mjs';

const $$Om = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Om" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>Om</h1> ` })}`;
}, "/Users/sindre/Library/CloudStorage/Dropbox/00Prog/01webapp/furekunst/src/pages/om.astro", void 0);

const $$file = "/Users/sindre/Library/CloudStorage/Dropbox/00Prog/01webapp/furekunst/src/pages/om.astro";
const $$url = "/om";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Om,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
