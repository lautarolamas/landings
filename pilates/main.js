import { reveal, reducedMotion } from '../shared/reveal.js'

reveal()

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const money = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

/* ------------------------------------------------------------------
   Firma: tipografía elástica. Cada letra es un resorte: el cursor la
   "flexiona" (más ancha y pesada) y el scroll le da un impulso que
   rebota hasta volver al reposo.
------------------------------------------------------------------- */
const REST_W = 70
const MAX_W = 150
const MIN_W = 50
const letters = []

$$('[data-elastic]').forEach((el) => {
  const text = el.textContent
  el.textContent = ''
  el.setAttribute('aria-hidden', 'true')
  for (const c of text) {
    const s = document.createElement('span')
    s.className = c === ' ' ? 'ch sp' : 'ch'
    s.textContent = c === ' ' ? ' ' : c
    el.append(s)
    if (c !== ' ') letters.push({ el: s, w: REST_W, vw: 0, g: 800, vg: 0, tw: REST_W, tg: 800, cx: 0, cy: 0 })
  }
})
const finalLink = $('.final-cta')
if (finalLink) finalLink.setAttribute('aria-label', 'Movete: reservá tu clase')

let pointer = null
let running = false
let lastScroll = scrollY

function measure() {
  for (const l of letters) {
    const r = l.el.getBoundingClientRect()
    l.cx = r.left + r.width / 2
    l.cy = r.top + r.height / 2
  }
}

function wake() {
  if (running || reducedMotion()) return
  running = true
  requestAnimationFrame(tick)
}

function tick() {
  let moving = false
  if (pointer) measure()
  for (const l of letters) {
    let f = 0
    if (pointer) {
      const d = Math.hypot(pointer.x - l.cx, (pointer.y - l.cy) * 1.4)
      f = Math.max(0, 1 - d / 320) ** 2
    }
    l.tw = REST_W + (MAX_W - REST_W) * f
    l.tg = 800 + 100 * f
    // Resorte subamortiguado: rebota antes de asentarse
    l.vw += (l.tw - l.w) * 0.09
    l.vw *= 0.8
    l.w += l.vw
    l.vg += (l.tg - l.g) * 0.12
    l.vg *= 0.78
    l.g += l.vg
    const w = Math.max(MIN_W, Math.min(MAX_W, l.w))
    l.el.style.fontVariationSettings = `'wdth' ${w.toFixed(1)}, 'wght' ${Math.min(900, l.g).toFixed(0)}`
    if (Math.abs(l.vw) > 0.02 || Math.abs(l.tw - l.w) > 0.1) moving = true
  }
  if (moving || pointer) requestAnimationFrame(tick)
  else running = false
}

addEventListener(
  'pointermove',
  (e) => {
    if (e.pointerType !== 'mouse') return
    pointer = { x: e.clientX, y: e.clientY }
    wake()
  },
  { passive: true },
)
document.addEventListener('pointerleave', () => {
  pointer = null
})
addEventListener(
  'scroll',
  () => {
    const v = scrollY - lastScroll
    lastScroll = scrollY
    const kick = Math.max(-26, Math.min(26, v * 0.6))
    // Bajando se estiran, subiendo se comprimen
    for (const l of letters) l.vw += kick * (0.6 + Math.random() * 0.4)
    measure()
    wake()
  },
  { passive: true },
)
addEventListener('resize', measure)

// Ola de entrada (y al tocar en pantallas táctiles)
function wave() {
  letters.forEach((l, i) => setTimeout(() => {
    l.vw += 28
    wake()
  }, i * 55))
}
document.fonts.ready.then(() => {
  measure()
  setTimeout(wave, 300)
})
$('.hero').addEventListener('pointerdown', (e) => e.pointerType !== 'mouse' && wave())

// Títulos de sección: se estiran al entrar en pantalla
const headIO = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.target.classList.toggle('is-in', e.isIntersecting)),
  { threshold: 0.6 },
)
$$('.head').forEach((h) => headIO.observe(h))

/* ------------------------------------------------------------------
   Clases
------------------------------------------------------------------- */
const classes = [
  { id: 'reformer', name: 'Reformer', c: 'var(--lime)', dur: '50 min', lvl: 3, text: 'Máquina con resortes para fuerza, control y movilidad. La estrella del estudio.' },
  { id: 'mat', name: 'Mat', c: 'var(--lilac)', dur: '45 min', lvl: 2, text: 'Pilates clásico en colchoneta. Centro firme, columna feliz.' },
  { id: 'barre', name: 'Barre', c: 'var(--peach)', dur: '45 min', lvl: 3, text: 'Ballet, pilates y pulsos cortos que hacen temblar hasta las pestañas.' },
  { id: 'funcional', name: 'Funcional', c: 'var(--sky)', dur: '55 min', lvl: 4, text: 'Circuitos de fuerza y cardio con kettlebells, TRX y mucha energía.' },
]
const byId = Object.fromEntries(classes.map((c) => [c.id, c]))

$('[data-classes]').innerHTML = classes
  .map(
    (k, i) => `<article class="klass" style="--c:${k.c};--d:${i * 0.08}s" data-reveal>
      <span class="tag">${k.dur}</span>
      <h3 style="--len:${k.name.length}">${k.name}</h3>
      <p>${k.text}</p>
      <div class="intensity">Intensidad <i>${[1, 2, 3, 4].map((n) => `<b class="${n <= k.lvl ? 'on' : ''}"></b>`).join('')}</i></div>
    </article>`,
  )
  .join('')
reveal($('[data-classes]'))
$$('.klass').forEach((card) =>
  card.addEventListener('pointerenter', (e) => {
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${e.clientX - r.left}px`)
    card.style.setProperty('--my', `${e.clientY - r.top}px`)
  }),
)

/* ------------------------------------------------------------------
   Horarios con reserva
------------------------------------------------------------------- */
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const coaches = ['Flor', 'Juli', 'Meli', 'Nico', 'Caro']
const times = ['07:00', '08:30', '10:00', '12:30', '18:00', '19:30', '21:00']
function seeded(n) {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
const sessions = []
days.forEach((d, di) => {
  times.forEach((t, ti) => {
    if (di === 5 && ti > 3) return
    if (seeded(di * 10 + ti) < 0.22) return
    const k = classes[Math.floor(seeded(di * 31 + ti * 7) * classes.length)]
    sessions.push({
      key: `${di}-${t}`,
      day: di,
      t,
      cls: k.id,
      coach: coaches[Math.floor(seeded(di + ti * 13) * coaches.length)],
      spots: Math.floor(seeded(di * 3 + ti * 5) * 6),
    })
  })
})

const load = () => {
  try { return new Set(JSON.parse(localStorage.getItem('pulso-reservas')) || []) } catch { return new Set() }
}
const mine = load()
const save = () => {
  try { localStorage.setItem('pulso-reservas', JSON.stringify([...mine])) } catch {}
}
let filter = 'all'
const today = Math.min(5, Math.max(0, (new Date().getDay() + 6) % 7))
let activeDay = today

$('[data-filters]').innerHTML =
  `<button type="button" class="filter" data-f="all" aria-pressed="true">Todas</button>` +
  classes.map((k) => `<button type="button" class="filter" data-f="${k.id}" aria-pressed="false" style="--c:${k.c}"><span class="dot"></span>${k.name}</button>`).join('')

$('[data-day-tabs]').innerHTML = days
  .map((d, i) => `<button type="button" role="tab" data-tab="${i}" aria-selected="${i === activeDay}">${d}</button>`)
  .join('')

function renderWeek() {
  $('[data-week]').innerHTML = days
    .map(
      (d, di) => `<div class="day-col ${di === activeDay ? 'is-on' : ''}">
      <h3>${d}${di === today ? '<small>hoy</small>' : ''}</h3>
      ${sessions
        .filter((s) => s.day === di)
        .map((s) => {
          const k = byId[s.cls]
          const isMine = mine.has(s.key)
          const left = s.spots - (isMine ? 1 : 0)
          const full = s.spots === 0 && !isMine
          const dim = filter !== 'all' && filter !== s.cls
          return `<button type="button" class="slot ${isMine ? 'mine' : ''} ${full ? 'full' : ''} ${dim ? 'dim' : ''}" style="--c:${k.c}" data-key="${s.key}" ${full ? 'aria-disabled="true"' : ''} aria-pressed="${isMine}">
            <time>${s.t}</time><b>${k.name}</b><span>con ${s.coach}</span>
            <span class="left">${full ? 'Completa' : isMine ? 'Tu lugar está guardado' : `${left} ${left === 1 ? 'lugar' : 'lugares'}`}</span>
          </button>`
        })
        .join('')}
    </div>`,
    )
    .join('')
}
renderWeek()

const toastEl = $('[data-toast]')
let tt
function toast(m) {
  toastEl.textContent = m
  toastEl.classList.add('show')
  clearTimeout(tt)
  tt = setTimeout(() => toastEl.classList.remove('show'), 2800)
}

$('[data-filters]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-f]')
  if (!b) return
  filter = b.dataset.f
  $$('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b))
  renderWeek()
})
$('[data-day-tabs]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]')
  if (!b) return
  activeDay = +b.dataset.tab
  $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === b))
  renderWeek()
})
$('[data-week]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-key]')
  if (!b) return
  const s = sessions.find((x) => x.key === b.dataset.key)
  if (b.classList.contains('full')) return toast('Esa clase está completa. Probá otro horario.')
  const k = byId[s.cls]
  if (mine.has(s.key)) {
    mine.delete(s.key)
    toast(`Liberaste tu lugar en ${k.name}.`)
  } else {
    mine.add(s.key)
    toast(`¡Listo! ${k.name}, ${days[s.day]} ${s.t} h con ${s.coach}.`)
  }
  save()
  renderWeek()
  $(`[data-key="${s.key}"]`)?.classList.add('pop')
})

/* ------------------------------------------------------------------
   Planes con toggle mensual / anual
------------------------------------------------------------------- */
const plans = [
  { name: 'Suelto', desc: 'Para venir cuando puedas.', price: 38000, perks: ['4 clases por mes', 'Cualquier disciplina', 'Reserva con 24 h'] },
  { name: 'Constante', desc: 'El favorito de la comunidad.', price: 62000, perks: ['8 clases por mes', 'Cualquier disciplina', 'Reserva con 72 h', '1 clase de recupero'], hot: true },
  { name: 'Sin límite', desc: 'Para las que no paran.', price: 85000, perks: ['Clases ilimitadas', 'Reserva prioritaria', 'Evaluación postural', 'Toalla y agua incluidas'] },
]
let period = 'm'
$('[data-plans]').innerHTML = plans
  .map(
    (p, i) => `<article class="plan ${p.hot ? 'hot' : ''}" data-reveal style="--d:${i * 0.08}s">
      ${p.hot ? '<span class="badge">Más elegido</span>' : ''}
      <h3>${p.name}</h3><p class="desc">${p.desc}</p>
      <div class="price"><span>$</span><b data-price="${p.price}">${money.format(p.price)}</b><small>/mes</small></div>
      <p class="save" data-save="${p.price}"></p>
      <ul>${p.perks.map((x) => `<li>${x}</li>`).join('')}</ul>
      <a class="btn ${p.hot ? '' : 'btn-line'}" href="#horarios">Empezar</a>
    </article>`,
  )
  .join('')
reveal($('[data-plans]'))

function countTo(el, to) {
  const from = Number(el.textContent.replace(/\D/g, '')) || 0
  if (reducedMotion()) return (el.textContent = money.format(to))
  const t0 = performance.now()
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 700)
    const e = 1 - (1 - k) ** 4
    el.textContent = money.format(Math.round((from + (to - from) * e) / 10) * 10)
    el.style.fontStretch = `${85 + Math.sin(k * Math.PI) * 50}%`
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const pill = $('.toggle-pill')
function placePill() {
  const b = $(`[data-period="${period}"]`)
  pill.style.setProperty('--w', `${b.offsetWidth}px`)
  pill.style.setProperty('--x', `${b.offsetLeft - 5}px`)
}
$$('[data-period]').forEach((b) =>
  b.addEventListener('click', () => {
    period = b.dataset.period
    $$('[data-period]').forEach((x) => x.setAttribute('aria-checked', x === b))
    placePill()
    $$('[data-price]').forEach((el) => countTo(el, period === 'a' ? +el.dataset.price * 0.8 : +el.dataset.price))
    $$('[data-save]').forEach((el) => {
      el.textContent = period === 'a' ? `Ahorrás $${money.format(+el.dataset.save * 0.2 * 12)} al año` : ''
    })
  }),
)
document.fonts.ready.then(placePill)
addEventListener('resize', placePill)
