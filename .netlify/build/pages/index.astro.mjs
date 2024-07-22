/* empty css                                   */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_BN26aiQn.mjs';
import 'kleur/colors';
import '@astrojs/internal-helpers/path';
import { $ as $$Image } from '../chunks/_astro_assets_QGg4tSv1.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_D-soJsAX.mjs';
export { renderers } from '../renderers.mjs';

const heroImage = new Proxy({"src":"/_astro/Lazy Dogs.DKIWygCU.jpg","width":1754,"height":1241,"format":"jpg","orientation":8}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "/Users/sindre/Library/CloudStorage/Dropbox/00Prog/01webapp/furekunst/src/assets/images/Lazy Dogs.jpg";
							}
							
							return target[name];
						}
					});

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const title = "Hjem";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="relative"> ${renderComponent($$result2, "Image", $$Image, { "src": heroImage, "alt": "Bilde av ", "class": "w-full object-cover" })} </div> <section class="py-12"> <h2 class="text-3xl font-semibold mb-6 text-center">Populære kunstverk</h2> <!-- Add your featured artworks or other content here --> </section> ` })}`;
}, "/Users/sindre/Library/CloudStorage/Dropbox/00Prog/01webapp/furekunst/src/pages/index.astro", void 0);

const $$file = "/Users/sindre/Library/CloudStorage/Dropbox/00Prog/01webapp/furekunst/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
