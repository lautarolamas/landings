import { reveal, reducedMotion } from '../shared/reveal.js'

reveal()

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => 1 - Math.pow(1 - t, 3)

/* ------------------------------------------------------------------
   Fotos reales: cualquier imagen en cirilo/fotos/ con el nombre de un
   data-foto reemplaza su placeholder. Vite las detecta al compilar
   (con hash y caché larga), así que no hay pedidos que den 404.
------------------------------------------------------------------- */
const files = import.meta.glob('./fotos/*.{avif,webp,jpg,jpeg,png}', { eager: true, query: '?url', import: 'default' })
const photos = {}
for (const [path, url] of Object.entries(files)) photos[path.split('/').pop().replace(/\.\w+$/, '')] ??= url

for (const fig of $$('.foto[data-foto]')) {
  const url = photos[fig.dataset.foto]
  if (!url) continue
  const img = new Image()
  img.alt = fig.dataset.alt || ''
  img.loading = 'lazy'
  img.decoding = 'async'
  img.onload = () => fig.classList.add('has-img')
  img.src = url
  fig.prepend(img)
}

/* ------------------------------------------------------------------
   Hero: harina tamizada. El cursor espolvorea harina que cae, se mece
   y se apoya en el piso del hero; además cae un poco sola.
------------------------------------------------------------------- */
const hero = $('.hero')
const canvas = $('.flour')
const ctx = canvas.getContext('2d')
const grains = []
let dpr = 1
let W = 0
let H = 0
let heroVisible = true
let flourRunning = false

function sizeCanvas() {
  dpr = Math.min(2, devicePixelRatio || 1)
  W = hero.clientWidth
  H = hero.clientHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function sprinkle(x, y, n, spread = 14) {
  for (let i = 0; i < n && grains.length < 900; i++) {
    grains.push({
      x: x + (Math.random() - 0.5) * spread,
      y: y + (Math.random() - 0.5) * spread,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 0.6 + 0.2,
      r: Math.random() * 1.8 + 0.6,
      ph: Math.random() * 6.28,
      life: 1,
      rest: false,
    })
  }
}

function drawFlour() {
  ctx.clearRect(0, 0, W, H)
  if (Math.random() < 0.35) sprinkle(Math.random() * W, -6, 1, 0)
  const floor = H - 4
  for (let i = grains.length - 1; i >= 0; i--) {
    const g = grains[i]
    if (!g.rest) {
      g.ph += 0.05
      g.vy = Math.min(g.vy + 0.012, 1.4)
      g.x += g.vx + Math.sin(g.ph) * 0.35
      g.y += g.vy
      if (g.y >= floor - g.r) { g.y = floor - g.r - Math.random() * 3; g.rest = true }
    } else {
      g.life -= 0.004
    }
    if (g.life <= 0 || g.x < -10 || g.x > W + 10) { grains.splice(i, 1); continue }
    ctx.globalAlpha = g.life * 0.9
    ctx.fillStyle = g.r > 1.8 ? '#fffdf8' : '#efe2c9'
    ctx.beginPath()
    ctx.arc(g.x, g.y, g.r, 0, 6.283)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  if (heroVisible) requestAnimationFrame(drawFlour)
  else flourRunning = false
}

function startFlour() {
  if (flourRunning || reducedMotion()) return
  flourRunning = true
  requestAnimationFrame(drawFlour)
}

if (!reducedMotion()) {
  sizeCanvas()
  addEventListener('resize', sizeCanvas)
  let lx = 0
  let ly = 0
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const d = Math.hypot(x - lx, y - ly)
    lx = x
    ly = y
    sprinkle(x, y, Math.min(8, 1 + d / 6))
  })
  hero.addEventListener('pointerdown', (e) => {
    const r = hero.getBoundingClientRect()
    sprinkle(e.clientX - r.left, e.clientY - r.top, 60, 50)
  })
  new IntersectionObserver(([e]) => {
    heroVisible = e.isIntersecting
    if (heroVisible) startFlour()
  }).observe(hero)
}

/* ------------------------------------------------------------------
   Firma: el pan se hace con el scroll. Amasado → corte → fermenta y
   crece → se dora en el horno con las greñas abriéndose → humea.
------------------------------------------------------------------- */
const bake = $('.bake')
const steps = $$('.step')
const clockLabel = $('.clock-label')
const clockNum = $('.clock-num')
const dough = [[246, 234, 210], [236, 217, 182], [214, 188, 144]]
const crust = [[226, 160, 88], [168, 90, 36], [94, 44, 14]]
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(' ')})`
const seg = (p, a, b) => clamp((p - a) / (b - a))
const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })
let shown = -1
let target = 0
let current = 0
let bakeRunning = false

function bakeTarget() {
  const r = bake.getBoundingClientRect()
  target = clamp(-r.top / (r.height - innerHeight))
  if (!bakeRunning) { bakeRunning = true; requestAnimationFrame(bakeFrame) }
}

function bakeFrame() {
  current += (target - current) * 0.14
  if (Math.abs(target - current) < 0.0005) current = target
  paint(current)
  if (current !== target) requestAnimationFrame(bakeFrame)
  else bakeRunning = false
}

function paint(p) {
  const knead = seg(p, 0, 0.12)
  const shape = ease(seg(p, 0.12, 0.28))
  const cut = seg(p, 0.24, 0.34)
  const rise = ease(seg(p, 0.34, 0.6))
  const brown = seg(p, 0.62, 0.88)
  const open = ease(seg(p, 0.62, 0.86))
  const glow = seg(p, 0.58, 0.64) * (1 - seg(p, 0.88, 0.94))
  const steam = seg(p, 0.9, 0.96)
  const wobble = knead < 1 ? Math.sin(knead * 18) * 0.04 * (1 - knead) : 0
  const s = bake.style
  s.setProperty('--p', p.toFixed(4))
  s.setProperty('--shape', (shape + wobble).toFixed(4))
  s.setProperty('--cut', cut.toFixed(4))
  s.setProperty('--rise', rise.toFixed(4))
  s.setProperty('--open', open.toFixed(4))
  s.setProperty('--glow', glow.toFixed(4))
  s.setProperty('--steam', steam.toFixed(4))
  s.setProperty('--c1', mix(dough[0], crust[0], brown))
  s.setProperty('--c2', mix(dough[1], crust[1], brown))
  s.setProperty('--c3', mix(dough[2], crust[2], brown))

  const idx = p < 0.12 ? 0 : p < 0.34 ? 1 : p < 0.6 ? 2 : p < 0.9 ? 3 : 4
  if (idx !== shown) {
    shown = idx
    steps.forEach((el, i) => {
      el.classList.toggle('is-active', i === idx)
      el.classList.toggle('is-past', i < idx)
    })
  }
  const clock = [
    ['Amasando', `${Math.round(knead * 100)}<small>%</small>`],
    ['Armado y corte', `${Math.round(seg(p, 0.12, 0.34) * 100)}<small>%</small>`],
    ['Fermentando', `${fmt.format(rise * 6)}<small>h</small>`],
    ['En el horno', `${Math.round(brown * 21)}<small>min</small>`],
    ['¡Listo!', 'Pan<small>del día</small>'],
  ][idx]
  if (clockLabel.textContent !== clock[0]) clockLabel.textContent = clock[0]
  if (clockNum.innerHTML !== clock[1]) clockNum.innerHTML = clock[1]
}

if (reducedMotion()) {
  paint(1)
  steps.forEach((el) => el.classList.add('is-active'))
} else {
  addEventListener('scroll', bakeTarget, { passive: true })
  addEventListener('resize', bakeTarget)
  bakeTarget()
}

/* ------------------------------------------------------------------
   Momentos del día: el sol recorre el arco y cambia el cielo.
------------------------------------------------------------------- */
const moments = [
  { time: '7:00', title: 'Desayuno para llevar', text: 'Un café y medialunas al paso, camino al trabajo o al colegio.', sky1: '#f6c27a', sky2: '#f4ecdf', sun: '#ffd27a' },
  { time: '9:30', title: 'Desayuno en casa', text: 'Llevate el pan de masa madre del día para tostar con calma.', sky1: '#a9d3e8', sky2: '#f4ecdf', sun: '#ffe08a' },
  { time: '13:00', title: 'Almuerzo', text: 'Baguettes y panes con semillas para armar el sándwich que quieras.', sky1: '#7fc0e6', sky2: '#eaf2ee', sun: '#fff1b0' },
  { time: '17:30', title: 'Merienda', text: 'La promo de siempre: café con leche y dos medialunas en el local.', sky1: '#f0a46b', sky2: '#f6dcc0', sun: '#ffb062' },
  { time: '20:30', title: 'Cena', text: 'Panes de hamburguesa artesanales, de brioche o de papa, y pan de campo para la mesa.', sky1: '#3d3566', sky2: '#a86b6b', sun: '#f3e6c4' },
]
const panel = $('.m-panel')
const mCopy = $('.m-copy')
const tabs = $$('.dial [role="tab"]')

function setMoment(i) {
  const m = moments[i]
  tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === i)))
  panel.style.setProperty('--a', String(i / (moments.length - 1)))
  panel.style.setProperty('--sky1', m.sky1)
  panel.style.setProperty('--sky2', m.sky2)
  panel.style.setProperty('--sun', m.sun)
  panel.style.color = i === 4 ? '#fbf7ef' : ''
  $('.m-time', mCopy).textContent = m.time
  $('.m-title', mCopy).textContent = m.title
  $('.m-text', mCopy).textContent = m.text
  mCopy.classList.remove('swap')
  void mCopy.offsetWidth
  mCopy.classList.add('swap')
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => setMoment(i))
  t.addEventListener('keydown', (e) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    const n = (i + d + tabs.length) % tabs.length
    tabs[n].focus()
    setMoment(n)
  })
})

// Arranca en el momento del día que es ahora en Buenos Aires.
const baHour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()))
const baMin = Number(new Intl.DateTimeFormat('en-GB', { minute: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()))
setMoment(baHour < 9 ? 0 : baHour < 12 ? 1 : baHour < 16 ? 2 : baHour < 20 ? 3 : 4)

/* Abierto ahora (de 7 a 21 h, todos los días) */
const openNow = $('.open-now')
const mins = baHour * 60 + baMin
const isOpen = mins >= 7 * 60 && mins < 21 * 60
openNow.textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora'
openNow.classList.toggle('closed', !isOpen)
openNow.hidden = false
