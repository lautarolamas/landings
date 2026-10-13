import { reveal, reducedMotion } from '../shared/reveal.js'

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

$$('.hero h1 .w').forEach((w, i) => w.style.setProperty('--i', i))

/* ------------------------------------------------------------------
   Datos
------------------------------------------------------------------- */
const icons = {
  limpieza: '<path d="M4 20l6-6M14 4l6 6-8 8-6-6 8-8Z"/><path d="M11 7l6 6"/>',
  ortodoncia: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M8 9v6M12 9v6M16 9v6"/>',
  implantes: '<path d="M8 3h8l-1 6H9L8 3Z"/><path d="M9 9h6M10 12h4M10 15h4M11 18h2M12 18v3"/>',
  blanqueamiento: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
  odontopediatria: '<circle cx="12" cy="8" r="4"/><path d="M5 21c0-4 3-7 7-7s7 3 7 7"/><path d="M10 7.5h.01M14 7.5h.01M10.5 9.5c1 .7 2 .7 3 0"/>',
  urgencias: '<path d="M12 3l9 16H3L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
}

const treatments = [
  { id: 'limpieza', name: 'Limpieza y control', text: 'Control completo, limpieza con ultrasonido y flúor.', meta: '40 min' },
  { id: 'ortodoncia', name: 'Ortodoncia invisible', text: 'Alineadores transparentes con escaneo 3D y simulación.', meta: '6 a 18 meses' },
  { id: 'implantes', name: 'Implantes', text: 'Implantes de titanio con cirugía guiada por computadora.', meta: 'Consulta sin cargo' },
  { id: 'blanqueamiento', name: 'Blanqueamiento', text: 'Blanqueamiento LED en consultorio, sin sensibilidad.', meta: '60 min' },
  { id: 'odontopediatria', name: 'Odontopediatría', text: 'Primeras visitas tranquilas para chicos de todas las edades.', meta: 'Desde 1 año' },
  { id: 'urgencias', name: 'Urgencias', text: 'Dolor, golpes o roturas. Te atendemos el mismo día.', meta: 'Guardia 24 h' },
]

const pros = [
  { id: 'lb', name: 'Dra. Lucía Benítez', role: 'Ortodoncia', mat: 'MN 31.204', does: ['ortodoncia', 'limpieza'], c1: '#e3f3ee', c2: '#bfe6da' },
  { id: 'mo', name: 'Dr. Martín Okada', role: 'Implantes y cirugía', mat: 'MN 28.877', does: ['implantes', 'urgencias'], c1: '#ffe6de', c2: '#ffb8a3' },
  { id: 'sq', name: 'Dra. Sofía Quiroga', role: 'Odontopediatría', mat: 'MN 35.610', does: ['odontopediatria', 'limpieza'], c1: '#eef0ff', c2: '#c9cdfa' },
  { id: 'ep', name: 'Dr. Ezequiel Paz', role: 'Estética dental', mat: 'MN 33.015', does: ['blanqueamiento', 'limpieza', 'urgencias'], c1: '#fff5d6', c2: '#ffe08a' },
]
const initials = (n) => n.replace(/^Dra?\. /, '').split(' ').map((p) => p[0]).join('')

$('[data-services]').innerHTML = treatments
  .map(
    (t, i) => `<article class="svc" data-reveal style="--d:${(i % 3) * 0.08}s">
      <span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[t.id]}</svg></span>
      <h3>${t.name}</h3><p>${t.text}</p><span class="meta">${t.meta}</span>
    </article>`,
  )
  .join('')

$('[data-team]').innerHTML = pros
  .map(
    (p, i) => `<article class="doc" data-reveal style="--d:${i * 0.08}s">
      <div class="blob" style="--c1:${p.c1};--c2:${p.c2}"><i></i><b>${initials(p.name)}</b></div>
      <h3>${p.name}</h3><p>${p.role}</p><small>${p.mat}</small>
    </article>`,
  )
  .join('')

reveal()

/* ------------------------------------------------------------------
   Firma: la sonrisa. El borde del hero se curva más cuanto más cerca
   está el cursor del centro y a medida que bajás; tira destellos.
------------------------------------------------------------------- */
const smile = $('.smile')
const fill = $('.smile-fill')
const line = $('.smile-line')
const sparkles = $('.sparkles')
const hero = $('.hero')
let depth = 40
let targetDepth = 110
let pointerBoost = 0
let scrollBoost = 0
let mouthX = 500
let targetX = 500
let animating = false

function setTarget() {
  targetDepth = 70 + pointerBoost * 70 + scrollBoost * 60
  if (!animating) {
    animating = true
    requestAnimationFrame(step)
  }
}
function step() {
  depth += (targetDepth - depth) * 0.09
  mouthX += (targetX - mouthX) * 0.08
  const d = `M0 0 Q${mouthX.toFixed(1)} ${(depth * 2).toFixed(1)} 1000 0`
  line.setAttribute('d', d)
  fill.setAttribute('d', `${d} V200 H0 Z`)
  if (Math.abs(targetDepth - depth) > 0.2 || Math.abs(targetX - mouthX) > 0.2) requestAnimationFrame(step)
  else animating = false
}
hero.addEventListener('pointermove', (e) => {
  const r = hero.getBoundingClientRect()
  const nx = (e.clientX - r.left) / r.width
  pointerBoost = 1 - Math.min(1, Math.abs(nx - 0.5) * 2)
  targetX = 300 + nx * 400
  setTarget()
})
hero.addEventListener('pointerleave', () => {
  pointerBoost = 0
  targetX = 500
  setTarget()
})
addEventListener(
  'scroll',
  () => {
    scrollBoost = Math.min(1, scrollY / 400)
    setTarget()
  },
  { passive: true },
)
setTarget()

// Punto sobre la curva cuadrática para ubicar los destellos
function sparkle() {
  if (document.hidden || reducedMotion()) return
  const t = 0.15 + Math.random() * 0.7
  const x = 2 * (1 - t) * t * mouthX + t * t * 1000
  const y = 2 * (1 - t) * t * depth * 2
  const el = document.createElement('span')
  el.className = 'spark'
  el.style.left = `${x / 10}%`
  el.style.top = `${(y / 200) * 100 - 4}%`
  el.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z"/></svg>'
  el.style.color = Math.random() > 0.5 ? '#ff7a59' : '#0d3b3e'
  sparkles.append(el)
  el.addEventListener('animationend', () => el.remove())
}
setInterval(sparkle, 900)

/* ------------------------------------------------------------------
   Antes / después
------------------------------------------------------------------- */
function mouth(tooth, gum) {
  const upper = []
  const lower = []
  const n = 10
  for (let i = 0; i < n; i++) {
    const k = (i - (n - 1) / 2) / ((n - 1) / 2)
    const w = 64 - Math.abs(k) * 22
    const h = 92 - Math.abs(k) ** 1.6 * 34
    const x = 400 + k * 300 - w / 2
    const y = 180 + Math.abs(k) ** 2 * 50
    upper.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w - 3}" height="${h.toFixed(1)}" rx="${w / 3}" fill="url(#tooth-${tooth.id})"/>`)
    const lh = h * 0.78
    lower.push(`<rect x="${(x + 3).toFixed(1)}" y="${(y + h + 4).toFixed(1)}" width="${w - 9}" height="${lh.toFixed(1)}" rx="${w / 3.4}" fill="url(#tooth-${tooth.id})"/>`)
  }
  return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="tooth-${tooth.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${tooth.top}"/><stop offset="1" stop-color="${tooth.bottom}"/></linearGradient>
      <radialGradient id="skin-${tooth.id}" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#f6dccd"/><stop offset="1" stop-color="#e7bca6"/></radialGradient>
    </defs>
    <rect width="800" height="500" fill="url(#skin-${tooth.id})"/>
    <path d="M70 230 Q400 40 730 230 Q400 520 70 230 Z" fill="#d76a5d"/>
    <path d="M100 236 Q400 120 700 236 Q400 450 100 236 Z" fill="#4a1a20"/>
    <path d="M100 236 Q400 150 700 236 L700 200 Q400 120 100 200 Z" fill="${gum}"/>
    <g clip-path="url(#m-${tooth.id})">${upper.join('')}${lower.join('')}</g>
    <clipPath id="m-${tooth.id}"><path d="M100 236 Q400 120 700 236 Q400 450 100 236 Z"/></clipPath>
    <path d="M70 230 Q400 40 730 230 Q400 150 70 230 Z" fill="#c95a4f"/>
    <path d="M70 230 Q400 520 730 230 Q400 400 70 230 Z" fill="#d97366"/>
    <path d="M300 395 Q400 420 500 395" stroke="#fff" stroke-opacity=".35" stroke-width="10" fill="none" stroke-linecap="round"/>
  </svg>`
}
$('.cmp-before').insertAdjacentHTML('afterbegin', mouth({ id: 'a', top: '#e9d39b', bottom: '#cdb071' }, '#e08f8a'))
$('.cmp-after').insertAdjacentHTML('afterbegin', mouth({ id: 'b', top: '#ffffff', bottom: '#e8eef0' }, '#ee9d97'))
const cmp = $('[data-cmp]')
$('.cmp-range').addEventListener('input', (e) => cmp.style.setProperty('--pos', e.target.value + '%'))

/* ------------------------------------------------------------------
   Turnos
------------------------------------------------------------------- */
const state = { step: 0, treatment: null, pro: null, day: null, slot: null }
const form = $('[data-booking]')
const steps = $$('.bk-step', form)
const side = $$('[data-steps] li')
const nextBtn = $('[data-next]')
const prevBtn = $('[data-prev]')
const dayFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })
const longFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

function hash(s) {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}
function nextDays(n = 14) {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  while (out.length < n) {
    if (d.getDay() !== 0) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
function slotsFor(date, proId) {
  const sat = date.getDay() === 6
  const out = []
  const now = new Date()
  for (let m = 9 * 60; m < (sat ? 13 : 20) * 60; m += 30) {
    const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
    const at = new Date(date)
    at.setHours(Math.floor(m / 60), m % 60)
    const taken = hash(date.toDateString() + t + proId) % 3 === 0 || at < now
    out.push({ t, taken })
  }
  return out
}

$('[data-treatments]').innerHTML = treatments
  .map(
    (t) => `<label class="opt"><input type="radio" name="treatment" value="${t.id}"/>
      <span class="mini"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[t.id]}</svg></span>
      <span><b>${t.name}</b><small>${t.meta}</small></span></label>`,
  )
  .join('')

function renderPros() {
  const list = pros.filter((p) => p.does.includes(state.treatment))
  $('[data-pros]').innerHTML =
    list
      .map(
        (p) => `<label class="opt"><input type="radio" name="pro" value="${p.id}" ${state.pro === p.id ? 'checked' : ''}/>
        <span class="mini" style="background:${p.c2}">${initials(p.name)}</span>
        <span><b>${p.name}</b><small>${p.role} · ${p.mat}</small></span></label>`,
      )
      .join('') +
    `<label class="opt"><input type="radio" name="pro" value="any" ${state.pro === 'any' ? 'checked' : ''}/>
      <span class="mini">✦</span><span><b>El primero disponible</b><small>Te asignamos quien tenga lugar</small></span></label>`
}

const days = nextDays()
function renderDays() {
  $('[data-days]').innerHTML = days
    .map((d, i) => `<button type="button" class="day" data-day="${i}" aria-pressed="${state.day === i}"><small>${i === 0 && d.toDateString() === new Date().toDateString() ? 'Hoy' : dayFmt.format(d).replace('.', '')}</small><b>${d.getDate()}</b></button>`)
    .join('')
}
function renderSlots() {
  const box = $('[data-slots]')
  if (state.day === null) {
    box.innerHTML = '<p class="slots-empty">Elegí un día para ver los horarios.</p>'
    return
  }
  const list = slotsFor(days[state.day], state.pro)
  box.innerHTML = list.some((s) => !s.taken)
    ? list.map((s, i) => `<button type="button" class="slot" style="--i:${i}" data-slot="${s.t}" ${s.taken ? 'disabled' : ''} aria-pressed="${state.slot === s.t}">${s.t}</button>`).join('')
    : '<p class="slots-empty">No quedan horarios este día. Probá con otro.</p>'
}

function proName() {
  return state.pro === 'any' ? 'Primer profesional disponible' : pros.find((p) => p.id === state.pro)?.name
}
function summaryRows() {
  const t = treatments.find((x) => x.id === state.treatment)
  return [
    ['Tratamiento', t?.name],
    ['Profesional', proName()],
    ['Día', state.day !== null ? longFmt.format(days[state.day]) : ''],
    ['Horario', state.slot ? state.slot + ' h' : ''],
  ]
}

function valid() {
  if (state.step === 0) return !!state.treatment
  if (state.step === 1) return !!state.pro
  if (state.step === 2) return !!state.slot
  if (state.step === 3) return form.nombre.value.trim().length > 2 && form.tel.value.replace(/\D/g, '').length >= 8
  return true
}

function go(n) {
  const back = n < state.step
  state.step = n
  steps.forEach((s, i) => {
    s.classList.toggle('is-on', i === n)
    s.classList.toggle('back', back)
  })
  side.forEach((li, i) => {
    li.classList.toggle('is-on', i === n)
    li.classList.toggle('is-done', i < n)
  })
  $('[data-progress]').style.width = `${((n + 1) / 4) * 100}%`
  nextBtn.textContent = n === 3 ? 'Confirmar turno' : 'Continuar'
  if (n === 1) renderPros()
  if (n === 2) {
    renderDays()
    renderSlots()
  }
  if (n === 3) {
    $('[data-summary]').innerHTML = summaryRows()
      .map(([k, v]) => `<div><b>${k}:</b> ${v}</div>`)
      .join('')
  }
  if (n === 4) {
    $('[data-ticket]').innerHTML = [...summaryRows(), ['Paciente', form.nombre.value], ['Cobertura', form.cobertura.value]]
      .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`)
      .join('')
  }
  nextBtn.disabled = !valid()
  if (n > 0) form.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' })
}

form.addEventListener('change', (e) => {
  if (e.target.name === 'treatment') {
    state.treatment = e.target.value
    state.pro = null
    state.slot = null
  }
  if (e.target.name === 'pro') {
    state.pro = e.target.value
    state.slot = null
  }
  nextBtn.disabled = !valid()
})
form.addEventListener('input', () => (nextBtn.disabled = !valid()))
form.addEventListener('click', (e) => {
  const day = e.target.closest('[data-day]')
  const slot = e.target.closest('[data-slot]')
  if (day) {
    state.day = +day.dataset.day
    state.slot = null
    renderDays()
    renderSlots()
  }
  if (slot) {
    state.slot = slot.dataset.slot
    $$('[data-slot]').forEach((b) => b.setAttribute('aria-pressed', b === slot))
  }
  nextBtn.disabled = !valid()
})
nextBtn.addEventListener('click', () => valid() && go(state.step + 1))
prevBtn.addEventListener('click', () => state.step > 0 && go(state.step - 1))
form.addEventListener('submit', (e) => e.preventDefault())
$('[data-restart]').addEventListener('click', () => {
  Object.assign(state, { treatment: null, pro: null, day: null, slot: null })
  form.reset()
  go(0)
})

// Archivo .ics para sumar el turno al calendario
$('[data-ics]').addEventListener('click', () => {
  const d = days[state.day]
  const [h, m] = state.slot.split(':').map(Number)
  const start = new Date(d)
  start.setHours(h, m)
  const end = new Date(start.getTime() + 40 * 60000)
  const f = (x) => `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, '0')}${String(x.getDate()).padStart(2, '0')}T${String(x.getHours()).padStart(2, '0')}${String(x.getMinutes()).padStart(2, '0')}00`
  const t = treatments.find((x) => x.id === state.treatment)
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Alba Odontologia//Turnos//ES', 'BEGIN:VEVENT',
    `UID:${Date.now()}@alba`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:Turno ${t.name} · Alba Odontología`, `DESCRIPTION:${proName()}`, 'LOCATION:Av. Cabildo 2150\\, piso 3\\, CABA',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'turno-alba.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
})

go(0)

// Próximo turno libre real, a partir de la misma agenda
;(() => {
  for (const d of days) {
    for (const p of pros) {
      const s = slotsFor(d, p.id).find((x) => !x.taken)
      if (s) {
        const today = d.toDateString() === new Date().toDateString()
        $('[data-next-slot]').textContent = `${today ? 'Hoy' : longFmt.format(d).split(',')[0]} ${s.t} h`
        return
      }
    }
  }
})()
