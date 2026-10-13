// Revela elementos con [data-reveal] cuando entran en pantalla.
export function reveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]:not(.is-in)')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )
  els.forEach((el) => io.observe(el))
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
