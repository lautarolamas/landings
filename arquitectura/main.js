import { reveal, reducedMotion } from '../shared/reveal.js'

reveal()

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

/* ------------------------------------------------------------------
   Obras. Cada "render" es una elevación generada en SVG (sin fotos,
   carga instantánea) y cada planta se dibuja trazo a trazo.
------------------------------------------------------------------- */
const works = [
  {
    slug: 'casa-delta', name: 'Casa Delta', loc: 'Tigre, Buenos Aires', year: 2024, area: '320 m²', program: 'Vivienda unifamiliar', status: 'Construida',
    text: 'Una casa elevada sobre pilotes que deja pasar la crecida del río. Dos losas desfasadas arman una galería profunda que filtra el sol del oeste y enmarca el juncal.',
    sky: ['#c4d0d3', '#ebe7dd'], ground: '#76825f', seed: 11,
    parts: [
      { box: [60, 112, 230, 54], c: '#f1efe9', win: 'band' },
      { box: [150, 166, 200, 48], c: '#d5cfc1', win: 'grid' },
      { piles: [160, 340, 214, 6] },
      { tree: [40, 200, 30] },
    ],
  },
  {
    slug: 'pabellon-arenal', name: 'Pabellón Arenal', loc: 'Punta del Este, Uruguay', year: 2023, area: '180 m²', program: 'Pabellón de verano', status: 'Construido',
    text: 'Una cubierta finísima flota sobre la arena y una caja de vidrio se abre por completo hacia el mar. En verano desaparecen los límites entre adentro y afuera.',
    sky: ['#f0c39c', '#f6eadb'], ground: '#d6bd95', seed: 23,
    parts: [
      { box: [112, 132, 176, 100], c: '#9db2b6', win: 'mullions' },
      { box: [36, 118, 328, 14], c: '#2f2f2d' },
      { piles: [48, 352, 132, 2] },
    ],
  },
  {
    slug: 'torre-lavalle', name: 'Torre Lavalle', loc: 'Rosario, Santa Fe', year: 2025, area: '6.400 m²', program: 'Vivienda colectiva', status: 'En obra',
    text: 'Catorce pisos de hormigón visto con balcones que giran medio módulo en cada nivel. La fachada cambia con la hora y cada departamento tiene doble orientación.',
    sky: ['#a6b5c3', '#e3e5e1'], ground: '#87877f', seed: 37,
    parts: [
      { box: [136, 26, 124, 206], c: '#d6d1c8', win: 'grid' },
      { box: [260, 118, 84, 114], c: '#bab2a5', win: 'slits' },
      { box: [70, 168, 66, 64], c: '#c9c3b8', win: 'band' },
    ],
  },
  {
    slug: 'escuela-los-molles', name: 'Escuela Los Molles', loc: 'Malargüe, Mendoza', year: 2022, area: '2.100 m²', program: 'Educación', status: 'Construida',
    text: 'Un muro largo de ladrillo protege del viento y organiza las aulas alrededor de un patio de sombra. Las ventanas angostas miden lo justo para el sol de montaña.',
    sky: ['#e8c39b', '#f3e2cd'], ground: '#b59870', seed: 41,
    parts: [
      { box: [28, 150, 344, 82], c: '#b2603c', win: 'slits' },
      { box: [196, 108, 148, 42], c: '#c4775a', win: 'band' },
      { tree: [70, 152, 26] },
      { tree: [372, 160, 22] },
    ],
  },
  {
    slug: 'mercado-norte', name: 'Mercado Norte', loc: 'Córdoba', year: 2021, area: '3.800 m²', program: 'Rehabilitación', status: 'Construida',
    text: 'Recuperamos la bóveda original de 1928 y liberamos la planta baja para puestos, plaza cubierta y un paso público que vuelve a coser el barrio.',
    sky: ['#b7c2c7', '#e8e3d8'], ground: '#76736c', seed: 53,
    parts: [
      { vault: [44, 96, 312, 70], c: '#cdbfa5' },
      { box: [44, 150, 312, 82], c: '#ddd0b6', win: 'arches' },
    ],
  },
  {
    slug: 'refugio-lanin', name: 'Refugio Lanín', loc: 'Junín de los Andes, Neuquén', year: 2026, area: '95 m²', program: 'Refugio de montaña', status: 'Proyecto',
    text: 'Un volumen negro de madera quemada con una sola ventana enorme apuntada al volcán. Prefabricado en taller y montado en cuatro semanas.',
    sky: ['#9cb1c6', '#e5eaee'], ground: '#e9edf0', seed: 67,
    parts: [
      { mountain: true },
      { gable: [146, 112, 112, 120], c: '#2b2b29' },
    ],
  },
]

function rng(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function windows(x, y, w, h, kind, r) {
  let s = ''
  if (kind === 'band') {
    s += `<rect x="${x}" y="${y + h * 0.3}" width="${w}" height="${h * 0.42}" fill="#2a3034"/>`
    for (let i = x + 18; i < x + w; i += 22) s += `<rect x="${i}" y="${y + h * 0.3}" width="1.2" height="${h * 0.42}" fill="#cfd5d6" opacity=".55"/>`
    s += `<rect x="${x}" y="${y + h * 0.3}" width="${w * 0.35}" height="${h * 0.42}" fill="#fff" opacity=".07"/>`
  } else if (kind === 'grid') {
    for (let j = y + 10; j < y + h - 12; j += 20)
      for (let i = x + 9; i < x + w - 12; i += 17)
        s += `<rect x="${i}" y="${j}" width="9" height="11" fill="${r() > 0.82 ? '#f0c27a' : '#2a3034'}"/>`
  } else if (kind === 'slits') {
    for (let i = x + 12; i < x + w - 6; i += 16) s += `<rect x="${i}" y="${y + h * 0.22}" width="4" height="${h * 0.56}" fill="#2a3034"/>`
  } else if (kind === 'mullions') {
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/>`
    for (let i = x; i <= x + w; i += w / 6) s += `<rect x="${i - 0.8}" y="${y}" width="1.6" height="${h}" fill="#2f2f2d"/>`
  } else if (kind === 'arches') {
    for (let i = x + 14; i < x + w - 30; i += 38)
      s += `<path d="M${i} ${y + h} V${y + 36} a14 14 0 0 1 28 0 V${y + h} Z" fill="#2a3034"/>`
  }
  return s
}

function renderSVG(wk) {
  const r = rng(wk.seed)
  const G = 232
  let body = ''
  for (const p of wk.parts) {
    if (p.box) {
      const [x, y, w, h] = p.box
      body += `<polygon points="${x + w * 0.15},${G} ${x + w},${G} ${x + w + h * 0.55},${G + 22} ${x + w * 0.15 + h * 0.55},${G + 22}" fill="#000" opacity=".16"/>`
      body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${p.c}"/>`
      body += windows(x, y, w, h, p.win, r)
      body += `<rect x="${x + w * 0.72}" y="${y}" width="${w * 0.28}" height="${h}" fill="url(#shade)"/>`
      body += `<rect x="${x}" y="${y}" width="${w}" height="2" fill="#fff" opacity=".35"/>`
    }
    if (p.piles) {
      const [x1, x2, y, n] = p.piles
      for (let i = 0; i < n; i++) {
        const x = x1 + ((x2 - x1) / (n - 1)) * i
        body += `<rect x="${x - 1.5}" y="${y}" width="3" height="${G - y}" fill="#2f2f2d"/>`
      }
    }
    if (p.tree) {
      const [x, y, rad] = p.tree
      body += `<rect x="${x - 1.5}" y="${y}" width="3" height="${G - y}" fill="#3b3a30"/>`
      body += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#55613f" opacity=".92"/><circle cx="${x - rad * 0.3}" cy="${y - rad * 0.3}" r="${rad * 0.55}" fill="#6d7a52"/>`
    }
    if (p.vault) {
      const [x, y, w, h] = p.vault
      body += `<path d="M${x} ${y + h} Q${x + w / 2} ${y - h * 0.9} ${x + w} ${y + h} Z" fill="${p.c}"/>`
      for (let i = 1; i < 8; i++) body += `<path d="M${x + (w / 8) * i} ${y + h} L${x + (w / 8) * i} ${y + h - Math.sin((i / 8) * Math.PI) * h * 0.95}" stroke="#a89a80" stroke-width="1"/>`
    }
    if (p.mountain) {
      body += `<polygon points="0,${G} 120,120 175,150 250,60 330,140 400,110 400,${G}" fill="#8aa0b4"/>`
      body += `<polygon points="226,92 250,60 275,94 262,90 250,98 240,90" fill="#f4f6f8"/>`
    }
    if (p.gable) {
      const [x, y, w, h] = p.gable
      body += `<polygon points="${x + w * 0.2},${G} ${x + w},${G} ${x + w + 60},${G + 20} ${x + w * 0.2 + 60},${G + 20}" fill="#000" opacity=".18"/>`
      body += `<polygon points="${x},${y + h * 0.4} ${x + w / 2},${y} ${x + w},${y + h * 0.4} ${x + w},${y + h} ${x},${y + h}" fill="${p.c}"/>`
      body += `<rect x="${x + w * 0.22}" y="${y + h * 0.42}" width="${w * 0.56}" height="${h * 0.44}" fill="#f0c27a"/>`
      body += `<rect x="${x + w * 0.22}" y="${y + h * 0.42}" width="${w * 0.56}" height="${h * 0.44}" fill="url(#glass)" opacity=".6"/>`
    }
  }
  const id = wk.slug
  return `<svg class="render" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wk.sky[0]}"/><stop offset="1" stop-color="${wk.sky[1]}"/></linearGradient>
      <linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f1f2" stop-opacity=".5"/><stop offset=".5" stop-color="#4d6166" stop-opacity=".6"/><stop offset="1" stop-color="#20282b" stop-opacity=".8"/></linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#sky-${id})"/>
    <circle cx="${70 + wk.seed * 4}" cy="70" r="70" fill="#fff" opacity=".25"/>
    <rect y="${G}" width="400" height="${300 - G}" fill="${wk.ground}"/>
    ${body}
  </svg>`
}

function planSVG(wk) {
  const r = rng(wk.seed * 7)
  const els = []
  els.push(`<rect x="4" y="4" width="92" height="62" pathLength="1"/>`)
  const vx = [24 + r() * 16, 56 + r() * 18]
  vx.forEach((x, i) => {
    const gap = 10 + r() * 30
    els.push(`<path d="M${x.toFixed(1)} 4 V${gap.toFixed(1)} M${x.toFixed(1)} ${(gap + 9).toFixed(1)} V66" pathLength="1"/>`)
    els.push(`<path class="door" d="M${x.toFixed(1)} ${gap.toFixed(1)} h${i ? -9 : 9} M${x.toFixed(1)} ${(gap + 9).toFixed(1)} a9 9 0 0 ${i ? 1 : 0} ${i ? -9 : 9} -9" pathLength="1"/>`)
  })
  const hy = 30 + r() * 14
  els.push(`<path d="M${vx[1].toFixed(1)} ${hy.toFixed(1)} H96" pathLength="1"/>`)
  els.push(`<path d="M4 ${(hy + 6).toFixed(1)} H${(vx[0] - 8).toFixed(1)}" pathLength="1"/>`)
  let stairs = ''
  for (let i = 0; i < 7; i++) stairs += `M${(vx[1] + 6 + i * 3.6).toFixed(1)} ${(hy + 6).toFixed(1)} v14 `
  els.push(`<path d="${stairs}" pathLength="1"/>`)
  els.push(`<path class="acc" d="M4 70 H96 M4 68 v4 M96 68 v4" pathLength="1"/>`)
  els.push(`<path class="acc" d="M88 12 l3 -6 l3 6 M91 6 v10" pathLength="1"/>`)
  return `<svg class="plan" viewBox="0 0 100 74" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${els
    .map((e, i) => e.replace(/^<(\w+)/, `<$1 style="--i:${i}"`))
    .join('')}</svg>`
}

const grid = $('[data-works]')
grid.innerHTML = works
  .map(
    (w, i) => `
  <button class="work" type="button" data-i="${i}" data-reveal style="--d:${(i % 2) * 0.12}s" aria-label="Ver obra ${w.name}">
    <span class="work-media">${renderSVG(w)}${planSVG(w)}</span>
    <span class="work-info">
      <span class="mono">${String(i + 1).padStart(2, '0')}</span>
      <span class="w-title">${w.name}</span>
      <span class="loc">${w.loc} · ${w.year}</span>
      <span class="arrow">↗</span>
    </span>
  </button>`,
  )
  .join('')
reveal(grid)

// Trazado inicial del axonométrico del hero
$$('.axo .draw path:not(.dash)').forEach((p, i) => {
  p.setAttribute('pathLength', '1')
  p.style.setProperty('--i', i)
})

/* ------------------------------------------------------------------
   Ficha de obra con View Transitions: la imagen de la tarjeta "vuela"
   hasta ocupar la pantalla.
------------------------------------------------------------------- */
const detail = $('[data-detail]')
const dMedia = $('[data-d-media]')
let current = -1

function fillDetail(i) {
  const w = works[i]
  const next = works[(i + 1) % works.length]
  dMedia.innerHTML = renderSVG(w)
  $('[data-d-index]').textContent = `Obra ${String(i + 1).padStart(2, '0')} / ${String(works.length).padStart(2, '0')}`
  $('[data-d-title]').textContent = w.name
  $('[data-d-specs]').innerHTML = [
    ['Ubicación', w.loc],
    ['Año', w.year],
    ['Superficie', w.area],
    ['Programa', w.program],
    ['Estado', w.status],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('')
  $('[data-d-text]').textContent = w.text
  $('[data-d-plan]').innerHTML = planSVG(w)
  $('[data-d-next]').innerHTML = `<span><small>Siguiente obra</small><br>${next.name}</span><span>→</span>`
  $('.d-scroll').scrollTop = 0
}

function cardParts(i) {
  const card = grid.children[i]
  return [$('.work-media', card), $('.w-title', card)]
}
function nameCard(i, on) {
  const [m, t] = cardParts(i)
  m.style.viewTransitionName = on ? 'obra-media' : ''
  t.style.viewTransitionName = on ? 'obra-title' : ''
}

function transition(update) {
  if (!document.startViewTransition || reducedMotion()) {
    update()
    return Promise.resolve()
  }
  return document.startViewTransition(update).finished
}

async function openWork(i, push = true) {
  if (i === current) return
  const fromCard = current === -1
  if (push) history.pushState(null, '', `#obra-${works[i].slug}`)
  if (fromCard) nameCard(i, true)
  await transition(() => {
    if (fromCard) nameCard(i, false)
    fillDetail(i)
    detail.hidden = false
    document.documentElement.style.overflow = 'hidden'
  })
  current = i
  $('[data-d-close]').focus({ preventScroll: true })
}

async function closeWork(push = true) {
  if (current === -1) return
  const i = current
  current = -1
  if (push) history.pushState(null, '', '#obras')
  const card = grid.children[i]
  card.scrollIntoView({ block: 'center', behavior: 'instant' })
  await transition(() => {
    detail.hidden = true
    document.documentElement.style.overflow = ''
    nameCard(i, true)
  })
  nameCard(i, false)
  card.focus({ preventScroll: true })
}

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.work')
  if (card) openWork(+card.dataset.i)
})
$('[data-d-close]').addEventListener('click', () => closeWork())
$('[data-d-next]').addEventListener('click', () => {
  const n = (current + 1) % works.length
  history.pushState(null, '', `#obra-${works[n].slug}`)
  transition(() => {
    fillDetail(n)
    current = n
  })
})
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWork()
})
function route() {
  const m = location.hash.match(/^#obra-(.+)$/)
  const i = m ? works.findIndex((w) => w.slug === m[1]) : -1
  if (i >= 0) openWork(i, false)
  else closeWork(false)
}
addEventListener('popstate', route)
route()

/* ------------------------------------------------------------------
   Mira CAD, reloj, cotas y contadores
------------------------------------------------------------------- */
const ch = $('.crosshair')
const label = $('.ch-label')
if (matchMedia('(pointer: fine)').matches) {
  addEventListener('pointermove', (e) => {
    ch.classList.add('on')
    ch.style.setProperty('--x', e.clientX + 'px')
    ch.style.setProperty('--y', e.clientY + 'px')
    const work = !detail.hidden ? null : e.target.closest('.work')
    const link = e.target.closest('a, button')
    ch.classList.toggle('hot', !!(work || link))
    if (work) label.textContent = `Ver obra ↗ ${works[work.dataset.i].name}`
    else if (link) label.textContent = '[ clic ]'
    else label.textContent = `X ${String(Math.round(e.clientX)).padStart(4, '0')} · Y ${String(Math.round(e.clientY + scrollY)).padStart(4, '0')}`
  }, { passive: true })
  document.addEventListener('pointerleave', () => ch.classList.remove('on'))
}

const clock = $('[data-clock]')
const fmt = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' })
const tick = () => (clock.textContent = fmt.format(new Date()))
tick()
setInterval(tick, 15000)

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      io.unobserve(e.target)
      if (e.target.matches('.dim-head')) e.target.classList.add('is-in')
      if (e.target.dataset.count) {
        const end = +e.target.dataset.count
        const t0 = performance.now()
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1400)
          e.target.textContent = Math.round(end * (1 - (1 - k) ** 3))
          if (k < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      }
    }
  },
  { threshold: 0.4 },
)
$$('.dim-head, [data-count]').forEach((el) => io.observe(el))
