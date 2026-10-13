import { reveal, reducedMotion } from '../shared/reveal.js'

reveal()

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

/* ------------------------------------------------------------------
   Firma: "el vertido". La pantalla se llena de café con una ola que
   reacciona a la velocidad del scroll; el texto cambia de color al
   quedar sumergido porque la capa líquida es un clon recortado.
------------------------------------------------------------------- */
const pour = $('.pour')
const base = $('.pour-base')
const liquid = $('.pour-liquid')
liquid.append(base.cloneNode(true))
const chapterSets = [$$('.chapter', base), $$('.chapter', liquid)]
const pcts = $$('.pour-pct')

let level = 0
let target = 0
let lastY = scrollY
let slosh = 0
let phase = 0
let running = false
let activeChapter = 0

function measure() {
  const r = pour.getBoundingClientRect()
  const travel = r.height - innerHeight
  const p = Math.min(1, Math.max(0, -r.top / travel))
  target = p
  const idx = Math.min(3, Math.floor(p * 4.0001))
  if (idx !== activeChapter) {
    activeChapter = idx
    for (const set of chapterSets) {
      set.forEach((c, i) => {
        c.classList.toggle('is-active', i === idx)
        c.classList.toggle('is-past', i < idx)
      })
    }
  }
}

function frame() {
  if (!running) return
  const v = scrollY - lastY
  lastY = scrollY
  slosh += (Math.min(60, Math.abs(v)) - slosh) * 0.08
  level += (target - level) * 0.12
  phase += 0.035 + slosh * 0.004

  const w = liquid.clientWidth
  const h = liquid.clientHeight
  const fill = Math.min(1, level * 1.06)
  pcts.forEach((el) => (el.textContent = Math.round(fill * 100) + '%'))

  if (fill <= 0.002) {
    liquid.style.clipPath = 'inset(100% 0 0 0)'
  } else if (fill >= 0.999 && slosh < 0.5) {
    liquid.style.clipPath = 'inset(0)'
  } else {
    const y0 = h * (1 - fill)
    const amp = (10 + slosh * 1.2) * Math.min(1, fill * 6) * Math.min(1, (1 - fill) * 8 + 0.15)
    const steps = 28
    let d = `M0 ${h} L0 ${y0.toFixed(1)}`
    for (let i = 0; i <= steps; i++) {
      const x = (w / steps) * i
      const k = x / w
      const y = y0 + Math.sin(k * 7 + phase) * amp * 0.6 + Math.sin(k * 15 - phase * 1.4) * amp * 0.4
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`
    }
    d += ` L${w} ${h} Z`
    liquid.style.clipPath = `path('${d}')`
  }
  requestAnimationFrame(frame)
}

new IntersectionObserver(([e]) => {
  running = e.isIntersecting
  if (running) {
    lastY = scrollY
    requestAnimationFrame(frame)
  }
}).observe(pour)
addEventListener('scroll', measure, { passive: true })
addEventListener('resize', measure)
measure()
if (reducedMotion()) level = target

/* ------------------------------------------------------------------
   Tienda + carrito
------------------------------------------------------------------- */
const products = [
  { id: 'huila', name: 'Huila', origin: 'Colombia · lavado', notes: ['panela', 'cereza', 'cacao'], price: 14500, tint: '#d9774a', label: '#f2c4a0' },
  { id: 'sidama', name: 'Sidama', origin: 'Etiopía · natural', notes: ['jazmín', 'durazno', 'té negro'], price: 16800, tint: '#c9a24e', label: '#f4e2a9' },
  { id: 'cerrado', name: 'Cerrado', origin: 'Brasil · pulped natural', notes: ['avellana', 'chocolate', 'caramelo'], price: 12900, tint: '#8f6a4a', label: '#e3cdb3' },
  { id: 'casa', name: 'Blend Casa', origin: 'Para espresso', notes: ['cacao amargo', 'nuez', 'frutos rojos'], price: 11700, tint: '#7b3b2c', label: '#f0b8a6' },
]
const grinds = ['Grano', 'Filtro', 'Espresso']

const bagSVG = (p) => `
<svg class="bag" viewBox="0 0 150 200" aria-hidden="true">
  <path d="M18 26 L132 26 L140 186 Q140 194 132 194 L18 194 Q10 194 10 186 Z" fill="${p.tint}"/>
  <path d="M18 26 L132 26 L130 12 Q129 6 123 6 L27 6 Q21 6 20 12 Z" fill="${p.tint}" style="filter:brightness(.82)"/>
  <rect x="14" y="26" width="122" height="7" fill="#000" opacity=".12"/>
  <rect x="32" y="70" width="86" height="96" rx="6" fill="${p.label}"/>
  <text x="75" y="104" text-anchor="middle" font-family="Fraunces Variable, serif" font-size="19" font-weight="600" fill="#2b1a12">${p.name.split(' ')[0]}</text>
  <text x="75" y="122" text-anchor="middle" font-family="Inter Tight Variable, sans-serif" font-size="7.5" letter-spacing="1.6" fill="#2b1a12">GRANO LENTO</text>
  <ellipse cx="75" cy="146" rx="9" ry="12.5" fill="#2b1a12"/>
  <path d="M75 134c-3.5 5 3.5 19 0 25" stroke="${p.label}" stroke-width="1.6" fill="none"/>
  <path d="M110 26 L118 194" stroke="#fff" stroke-width="10" opacity=".1"/>
</svg>`

const grid = $('[data-products]')
grid.innerHTML = products
  .map(
    (p, i) => `
  <article class="product" data-reveal style="--tint:${p.tint};--d:${i * 0.08}s" data-id="${p.id}">
    <div class="bag-wrap">${bagSVG(p)}</div>
    <h3>${p.name}</h3>
    <p class="origin">${p.origin}</p>
    <ul class="notes">${p.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
    <fieldset class="grind" style="border:0;margin:0 0 16px;min-width:0">
      <legend class="sr-only">Molienda</legend>
      ${grinds.map((g, j) => `<label><input type="radio" name="g-${p.id}" value="${g}" ${j === 0 ? 'checked' : ''}/>${g}</label>`).join('')}
    </fieldset>
    <div class="product-foot">
      <span class="price">${money.format(p.price)}</span>
      <button class="add" type="button">Agregar</button>
    </div>
  </article>`,
  )
  .join('')
reveal(grid)

// Bolsa que se inclina siguiendo al puntero
$$('.product').forEach((card) => {
  const bag = $('.bag', card)
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    bag.style.setProperty('--ry', `${x * 28}deg`)
    bag.style.setProperty('--rx', `${-y * 18}deg`)
  })
  card.addEventListener('pointerleave', () => {
    bag.style.setProperty('--ry', '0deg')
    bag.style.setProperty('--rx', '0deg')
  })
})

const store = {
  get() {
    try { return JSON.parse(localStorage.getItem('grano-cart')) || [] } catch { return [] }
  },
  set(v) {
    try { localStorage.setItem('grano-cart', JSON.stringify(v)) } catch {}
  },
}
let cart = store.get()

const cartBtn = $('.cart-btn')
const dialog = $('#cart')
const toastEl = $('[data-toast]')
let toastTimer
function toast(msg) {
  toastEl.textContent = msg
  toastEl.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200)
}

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0)
  $('.cart-count').textContent = count
  const total = cart.reduce((n, i) => n + i.qty * products.find((p) => p.id === i.id).price, 0)
  $('[data-cart-total]').textContent = money.format(total)
  $('[data-cart-ship]').textContent = count === 0 ? '' : count >= 2 ? 'Tenés envío gratis en CABA.' : 'Sumá una bolsa más y el envío es gratis.'
  $('[data-cart-items]').innerHTML = cart
    .map((i, idx) => {
      const p = products.find((x) => x.id === i.id)
      return `<li class="cart-item">
        <span class="swatch" style="background:linear-gradient(160deg, ${p.tint}, ${p.label})"></span>
        <div><h3>${p.name}</h3><small>${i.grind} · 250 g</small>
          <div class="qty"><button type="button" data-dec="${idx}" aria-label="Quitar uno">−</button><span>${i.qty}</span><button type="button" data-inc="${idx}" aria-label="Agregar uno">+</button></div>
        </div>
        <span class="line-total">${money.format(p.price * i.qty)}</span>
      </li>`
    })
    .join('')
  store.set(cart)
}

$('[data-cart-items]').addEventListener('click', (e) => {
  const inc = e.target.closest('[data-inc]')
  const dec = e.target.closest('[data-dec]')
  if (inc) cart[+inc.dataset.inc].qty++
  if (dec) {
    const i = +dec.dataset.dec
    if (--cart[i].qty <= 0) cart.splice(i, 1)
  }
  if (inc || dec) renderCart()
})

// Un grano vuela en arco desde el botón hasta el carrito
function flyBean(fromEl) {
  const a = fromEl.getBoundingClientRect()
  const b = cartBtn.getBoundingClientRect()
  const sx = a.left + a.width / 2 - 11
  const sy = a.top + a.height / 2 - 15
  const ex = b.left + b.width / 2 - 11
  const ey = b.top + b.height / 2 - 15
  const cx = (sx + ex) / 2
  const cy = Math.min(sy, ey) - 160
  const bean = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  bean.setAttribute('viewBox', '0 0 22 30')
  bean.classList.add('flying-bean')
  bean.innerHTML = '<ellipse cx="11" cy="15" rx="10" ry="14" fill="#2b1a12"/><path d="M11 2c-4 6 4 20 0 26" stroke="#c98b4e" stroke-width="2" fill="none"/>'
  document.body.append(bean)
  const frames = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const x = (1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t ** 2 * ex
    const y = (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t ** 2 * ey
    frames.push({ transform: `translate(${x}px, ${y}px) rotate(${t * 540}deg) scale(${1 - t * 0.4})` })
  }
  const anim = bean.animate(frames, { duration: 750, easing: 'cubic-bezier(.4,0,.6,1)' })
  anim.onfinish = () => {
    bean.remove()
    cartBtn.classList.remove('bump')
    void cartBtn.offsetWidth
    cartBtn.classList.add('bump')
  }
}

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.add')
  if (!btn) return
  const card = btn.closest('.product')
  const id = card.dataset.id
  const grind = $('input:checked', card).value
  const found = cart.find((i) => i.id === id && i.grind === grind)
  found ? found.qty++ : cart.push({ id, grind, qty: 1 })
  if (!reducedMotion()) flyBean(btn)
  btn.textContent = '¡Listo!'
  btn.classList.add('done')
  setTimeout(() => {
    btn.textContent = 'Agregar'
    btn.classList.remove('done')
  }, 1200)
  setTimeout(renderCart, reducedMotion() ? 0 : 700)
})

cartBtn.addEventListener('click', () => dialog.showModal())
$('[data-close]').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close()
})
$('[data-checkout]').addEventListener('click', () => {
  if (!cart.length) return toast('Primero agregá algún café.')
  cart = []
  renderCart()
  dialog.close()
  toast('¡Pedido recibido! Lo tostamos y te avisamos cuando sale. (Demo)')
})
$('[data-sub]').addEventListener('submit', (e) => {
  e.preventDefault()
  e.target.reset()
  toast('Listo, te escribimos para armar tu primer envío.')
})

renderCart()
