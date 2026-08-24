type RevealEl = HTMLElement & { _revealed?: boolean }

const prefersReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches
// Stagger cap: below-fold cards reveal on scroll with their SSR index delay,
// which grows unbounded (index * 25ms). Cap it so a deep card never waits
// half a second before starting its fade-up.
const MAX_STAGGER_MS = 80

function reveal(el: RevealEl) {
  if (el._revealed) return
  el._revealed = true
  el.setAttribute('data-revealed', '')
  const rawDelay = Number(el.dataset.delay) || 0
  const delay = Math.min(Math.round(rawDelay * 0.4), MAX_STAGGER_MS)
  el.style.transitionDelay = `${delay}ms`
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

let io: IntersectionObserver | null = null
let scrollHandler: (() => void) | null = null

function initReveal(skipAnimation = false) {
  // Fresh DOM after a navigation: drop the observers bound to the old page.
  io?.disconnect()
  io = null
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }

  const els = Array.from(document.querySelectorAll<RevealEl>('[data-reveal]'))

  if (prefersReduced) {
    for (const el of els) reveal(el)
  } else {
    // Reveal everything already in the viewport (with its stagger); observe
    // the rest and reveal them as they scroll in.
    const toObserve: RevealEl[] = []
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Back-navigation skip (below): the in-viewport gallery cards are
        // revealed INSTANTLY while the transition still runs, so the
        // view-transition snapshot captures them at full opacity — the
        // detail→gallery morph lands on a visible card and the gallery is
        // fully populated the moment the overlay lifts. No replayed stagger.
        if (skipAnimation && el.closest('.gallery-masonry')) {
          el.style.transition = 'none'
        }
        reveal(el)
      } else {
        toObserve.push(el)
      }
    }
    if (toObserve.length > 0 && typeof IntersectionObserver !== 'undefined') {
      // Passive scroll fallback (FK-029): an instant scroll (trackpad flick,
      // scrollTo, restored position) can take a below-fold element straight
      // past the viewport in one frame — no intersection-state change, so the
      // observer never fires and the element stays stuck invisible. Reveal it
      // the frame its top reaches the viewport edge instead.
      const onScroll = () => {
        for (const el of toObserve) {
          if (
            !el._revealed &&
            el.getBoundingClientRect().top < window.innerHeight
          ) {
            reveal(el)
          }
        }
        if (toObserve.every(el => el._revealed)) {
          window.removeEventListener('scroll', onScroll)
          scrollHandler = null
        }
      }
      scrollHandler = onScroll
      window.addEventListener('scroll', onScroll, { passive: true })

      io = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const el = entry.target as RevealEl
              if (!el._revealed) reveal(el)
              io?.unobserve(el)
            }
          }
        },
        // Non-gallery sections get a small pre-roll so the fade-up starts just
        // before the element becomes visible. Gallery cards use the exact
        // bottom edge so their fade-up plays as the card appears on screen.
        {
          rootMargin: els.some(el => el.closest('.gallery-masonry'))
            ? '0px'
            : '0px 0px 20% 0px',
        },
      )
      for (const el of toObserve) io.observe(el)
    }
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
    } else if (typeof img.decode === 'function') {
      img.decode().then(sharpen).catch(sharpen)
    } else {
      img.addEventListener('load', sharpen, { once: true })
      img.addEventListener('error', sharpen, { once: true })
    }
  }
}

// Initial load only: astro:page-load fires on the window load event. On
// navigations it fires again inside the swap callback — while the view
// transition is still running — and revealing there would play the fade-up
// invisibly behind the frozen snapshot overlay (see after-swap below).
let initialLoadDone = false
document.addEventListener('astro:page-load', () => {
  if (initialLoadDone) return
  initialLoadDone = true
  initReveal()
})

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
  // INLINE styles: the view-transition snapshot of the new page is captured
  // right after the swap, and relying on the SSR class alone can capture
  // the cards fully visible on some engines (Safari/fallback timing) — the
  // content then flashes before the cascade plays. The hidden state is
  // applied BOTH to the reveal wrapper AND to the named frames inside it:
  // the frames' own opacity is what the snapshot captures, and some engines
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
  // Coming BACK from a detail page (or via browser back) the reveal runs
  // instantly: the snapshot must capture the gallery fully populated so the
  // artwork morph lands on a visible card — an animated stagger here would
  // play behind the overlay and pop when it lifts.
  const fromDetail = navFromPath.startsWith('/galleri/')
  if (navDirection === 'back' || fromDetail) {
    initReveal(true)
    return
  }

  // Forward navigations play the staggered fade-up as soon as the view
  // transition overlay finishes (Astro removes data-astro-transition from <html>).
  // Use a MutationObserver for 0ms event-driven response rather than polling.
  const html = document.documentElement
  if (!html.hasAttribute('data-astro-transition')) {
    initReveal()
    return
  }

  let done = false
  const run = () => {
    if (done) return
    done = true
    observer.disconnect()
    clearTimeout(safetyTimer)
    initReveal()
  }

  const observer = new MutationObserver(() => {
    if (!html.hasAttribute('data-astro-transition')) {
      run()
    }
  })

  observer.observe(html, {
    attributes: true,
    attributeFilter: ['data-astro-transition'],
  })
  const safetyTimer = setTimeout(run, 600)
})
