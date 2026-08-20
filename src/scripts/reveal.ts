type RevealEl = HTMLElement & { _revealed?: boolean }

const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches
const observerRootMargin = '0px 0px 20% 0px'

// A reveal must not force-load its image when the section is not actually
// displayed (e.g. the home grid inside `hidden md:grid` on mobile, or the
// carousel inside `md:hidden` on desktop): img.decode() would download the
// image anyway, wasting bandwidth for content the user never sees at that
// viewport. Those images load naturally once the media query makes them
// visible (loading=lazy) (FK-030).
function isHidden(el: Element): boolean {
  let node: Element | null = el
  while (node) {
    if (getComputedStyle(node).display === 'none') return true
    node = node.parentElement
  }
  return false
}

function reveal(el: RevealEl) {
  if (el._revealed) return
  el._revealed = true
  el.setAttribute('data-revealed', '')
  // Per-section stagger (SSR data-delay on heim/kontakt sections). The
  // gallery cascade sets its own inline delay before calling reveal — only
  // apply the data-delay when the caller hasn't.
  if (!el.style.transitionDelay) {
    el.style.transitionDelay = el.dataset.delay
      ? `${el.dataset.delay}ms`
      : '0ms'
  }
  // Clear the hidden state forced inline by the astro:before-swap handler
  // (see below) — on the wrapper AND on the named frames inside it (the
  // frames can otherwise be captured at full opacity by the view-transition
  // snapshot even while the wrapper is transparent). The CSS classes take
  // over and the transition animates opacity 0.01 → 1.
  el.style.opacity = ''
  for (const named of el.querySelectorAll<HTMLElement>(
    '[data-astro-transition-scope]',
  )) {
    named.style.opacity = ''
  }
  el.classList.remove('translate-y-8', 'opacity-[0.01]')
  el.classList.add('translate-y-0', 'opacity-100')
}

function revealWhenReady(el: RevealEl) {
  const img = el.querySelector<HTMLImageElement>('img')
  if (
    !img ||
    prefersReduced ||
    isHidden(el) ||
    (img.complete && img.naturalWidth > 0)
  ) {
    requestAnimationFrame(() => reveal(el))
    return
  }

  let timer = 0
  const triggerReveal = () => {
    window.clearTimeout(timer)
    requestAnimationFrame(() => reveal(el))
  }

  timer = window.setTimeout(triggerReveal, 500)

  if (typeof img.decode === 'function') {
    img.decode().then(triggerReveal).catch(triggerReveal)
  } else {
    img.addEventListener('load', triggerReveal, { once: true })
    img.addEventListener('error', triggerReveal, { once: true })
  }
}

function inViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect()
  return rect.top < window.innerHeight && rect.bottom > 0
}

/*
 * Scroll-triggered reveal: reveal the element the frame it enters the
 * viewport, plus a passive scroll fallback (FK-029) so an instant
 * jump-scroll that skips intersection-state changes can never leave an
 * element stuck invisible. Non-gallery sections use a bottom margin so the
 * animation starts just before the element becomes visible; the gallery
 * passes '0px' so its fade-up plays exactly as the card appears at the
 * bottom of the screen (see revealGallery).
 */
function observeInView(
  el: RevealEl,
  onEnter: () => void,
  rootMargin = observerRootMargin,
) {
  if (inViewport(el)) {
    onEnter()
    return
  }
  if (typeof IntersectionObserver === 'undefined') {
    onEnter()
    return
  }

  let io: IntersectionObserver | null = null
  const cleanup = () => {
    window.removeEventListener('scroll', onScroll)
    io?.disconnect()
  }
  const onScroll = () => {
    if (el._revealed) return
    if (el.getBoundingClientRect().top < window.innerHeight) {
      cleanup()
      onEnter()
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  io = new IntersectionObserver(
    entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        cleanup()
        onEnter()
      }
    },
    { rootMargin },
  )
  io.observe(el)
}

/*
 * Gallery reveal: the masonry is CSS columns, which fill DOWN each column
 * (column-major), so the SSR index order is NOT the visual order. Here every
 * gallery card is ordered by its actual layout position (top-left → right →
 * down).
 *
 * Cards animate in exactly like the rest of the site: the ones in the
 * viewport at load fade up as soon as their own image is ready (a small
 * position-based wave keeps the row-by-row stagger, FK-030), while cards
 * below the fold stay hidden and reveal individually as they scroll into
 * view — the gallery reads as an infinite scroll of fading artwork instead
 * of a single mass reveal. Below-fold images are no longer force-decoded at
 * load; they load naturally (loading=lazy).
 *
 * The observer uses a ZERO bottom margin (the 20% pre-roll used elsewhere
 * would start the fade-up ~a fifth of the viewport below the fold, so the
 * 300ms animation is over before the card becomes visible). With '0px' the
 * fade-up starts the frame the card touches the bottom edge of the screen
 * and is fully visible while it plays.
 */
const CASCADE_SPACING_MS = 100
const CASCADE_IMAGE_CAP_MS = 700
const CASCADE_WAVE_CAP_MS = 600

function revealGallery(els: RevealEl[], skipAnimation: boolean) {
  const cards = els
    .map(el => ({
      el,
      top: el.getBoundingClientRect().top,
      left: el.getBoundingClientRect().left,
    }))
    .sort((a, b) => a.top - b.top || a.left - b.left)

  // Wave floor at reveal time: among the cards currently in the viewport and
  // still unrevealed, stagger by vertical position — a row of cards entering
  // together still animates as a wave, while cards scrolled into view one at
  // a time get no delay.
  const waveFor = (el: RevealEl) => {
    const visible = cards.filter(card => {
      if (card.el._revealed) return false
      return card.el.getBoundingClientRect().top < window.innerHeight
    })
    const index = visible.findIndex(card => card.el === el)
    return Math.min(
      Math.max(index, 0) * CASCADE_SPACING_MS,
      CASCADE_WAVE_CAP_MS,
    )
  }

  for (const [index, { el }] of cards.entries()) {
    // Precomputed wave for the initial above-the-fold batch (stable, ordered
    // stagger); scroll-revealed cards compute a fresh, small wave instead.
    const baseWave = Math.min(index * CASCADE_SPACING_MS, CASCADE_WAVE_CAP_MS)
    const wasInViewport = inViewport(el)

    if (skipAnimation && wasInViewport) {
      el.style.transition = 'none'
      reveal(el)
      continue
    }

    const img = el.querySelector<HTMLImageElement>('img')

    const enter = () => {
      const wave = wasInViewport ? baseWave : waveFor(el)
      const play = () => {
        el.style.transitionDelay = '0ms'
        reveal(el)
      }
      if (!img || isHidden(el) || (img.complete && img.naturalWidth > 0)) {
        window.setTimeout(play, wave)
        return
      }

      let timer = 0
      const trigger = () => {
        window.clearTimeout(timer)
        window.setTimeout(play, wave)
      }
      timer = window.setTimeout(trigger, CASCADE_IMAGE_CAP_MS)

      if (typeof img.decode === 'function') {
        // No chaining: the visible cards' decodes all start at once, so the
        // previous card's load never stalls the ones behind it.
        img.decode().then(trigger).catch(trigger)
      } else {
        img.addEventListener('load', trigger, { once: true })
        img.addEventListener('error', trigger, { once: true })
      }
    }

    observeInView(el, enter, '0px')
  }
}

function initReveal(skipAnimation = false) {
  const revealEls = Array.from(
    document.querySelectorAll<RevealEl>('[data-reveal]'),
  )

  const galleryEls: RevealEl[] = []
  const otherEls: RevealEl[] = []
  for (const el of revealEls) {
    if (el.closest('.gallery-masonry')) galleryEls.push(el)
    else otherEls.push(el)
  }

  if (prefersReduced) {
    for (const el of revealEls) reveal(el)
  } else if (galleryEls.length > 0) {
    // The skip only ever applies to the gallery (e.g. coming back from a
    // detail page): the in-viewport cards appear instantly, no replayed
    // stagger, while below-fold cards keep their scroll reveal. Heim/kontakt
    // sections are never short-circuited — they keep their individual scroll
    // reveals below.
    revealGallery(galleryEls, skipAnimation)
  }

  // Non-gallery reveals (home/kontakt sections): reveal when scrolled into
  // view, waiting for their own image.
  for (const el of otherEls) {
    if (prefersReduced || el.dataset.reveal === 'no-scroll') {
      revealWhenReady(el)
      continue
    }
    observeInView(el, () => revealWhenReady(el))
  }

  // Fade-in images (data-fade-img). Reduced-motion users skip the animation
  // but must still get the sharp image — blur-none is applied immediately.
  const fadeImgs = Array.from(
    document.querySelectorAll<HTMLImageElement>('[data-fade-img]'),
  )
  for (const img of fadeImgs) {
    const sharpen = () => img.classList.add('blur-none')
    if (prefersReduced || (img.complete && img.naturalWidth > 0)) {
      sharpen()
    } else {
      img.addEventListener('load', sharpen)
    }
  }
}

// Initial load: astro:page-load fires on the window load event.
let initialLoadDone = false
document.addEventListener('astro:page-load', () => {
  if (initialLoadDone) return
  initialLoadDone = true
  initReveal()
})

/*
 * Navigations: the reveal must not start on astro:page-load — that event
 * fires right after the DOM swap, while the view-transition overlay is still
 * up, so the fade-up would play behind the frozen snapshot and pop when the
 * transition ends. On astro:after-swap we wait until the router's transition
 * is actually over (the router sets data-astro-transition on <html> and
 * removes it when the animations finish — Astro 7 has no
 * astro:page-transition-ready event), then play the reveal. Coming BACK from
 * a detail page skips the stagger: the in-viewport cards are revealed
 * instantly behind the still-running transition, so the gallery is fully
 * visible (no pop) the moment the overlay lifts — below-fold cards still
 * keep their scroll reveal.
 */
let navDirection = ''
let navFromPath = ''

document.addEventListener('astro:before-swap', event => {
  const e = event as Event & {
    direction?: string
    from?: URL
    newDocument?: Document
  }
  navDirection = e.direction ?? ''
  navFromPath = e.from?.pathname ?? ''

  // Force the reveal elements of the incoming page to start hidden via
  // INLINE styles: the view-transition snapshot is captured right after the
  // swap, and relying on the CSS class alone can capture the cards fully
  // visible on some engines (Safari/fallback timing) — the images then
  // flash before the cascade plays. The hidden state is applied BOTH to the
  // reveal wrapper AND to the named frames inside it: the frames' own
  // opacity is what the view-transition snapshot captures, and some engines
  // capture it at full strength while ignoring the wrapper's transparency.
  // reveal() clears both inline styles.
  const newDocument = e.newDocument
  if (!newDocument) return
  for (const el of newDocument.querySelectorAll<HTMLElement>('[data-reveal]')) {
    el.style.opacity = '0.01'
    for (const named of el.querySelectorAll<HTMLElement>(
      '[data-astro-transition-scope]',
    )) {
      named.style.opacity = '0.01'
    }
  }
})

document.addEventListener('astro:after-swap', () => {
  const fromDetail = navFromPath.startsWith('/galleri/')
  if (navDirection === 'back' || fromDetail) {
    initReveal(true)
    return
  }
  void (async () => {
    const html = document.documentElement
    const started = performance.now()
    while (
      html.hasAttribute('data-astro-transition') &&
      performance.now() - started < 2000
    ) {
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    }
    initReveal()
  })()
})
