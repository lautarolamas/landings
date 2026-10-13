# Landings

Cinco landings de rubros distintos bajo un mismo dominio. Cada una vive en su propia ruta y tiene una animación firma propia.

| Ruta | Rubro | Firma |
| --- | --- | --- |
| `/` | Índice | Paneles que se expanden con un adelanto de cada landing |
| `/cafe` | Café de especialidad (Grano Lento) | La pantalla se llena de café con una ola que reacciona a la velocidad del scroll. Tienda con carrito persistente. |
| `/arquitectura` | Estudio de arquitectura (Taller Ochenta) | Cursor de mira tipo CAD con coordenadas, plantas que se dibujan al pasar el mouse y fichas de obra que se expanden con View Transitions. |
| `/odontologia` | Clínica odontológica (Alba) | El borde del hero es una sonrisa que se curva con el cursor y el scroll. Antes/después arrastrable y turnero online con archivo .ics. |
| `/pilates` | Estudio de pilates (Pulso) | Tipografía elástica: cada letra es un resorte que se estira cerca del cursor y rebota con el scroll. Horarios con reserva y planes mensual/anual. |
| `/cirilo` | Panadería y cafetería real (Cirilo, Los Polvorines) | El pan se hace con el scroll: se amasa, se corta, fermenta y crece, y se dora en el horno con las greñas abriéndose. En el hero, el cursor espolvorea harina. Fotos reales en `cirilo/fotos/` (ver su `LEEME.md`). |

## Stack

- [Vite](https://vite.dev) en modo multi-página, HTML + CSS + JavaScript sin frameworks.
- Sin imágenes en las landings de ejemplo: las ilustraciones son SVG generado o CSS, así cada página pesa menos de 10 KB de JS y CSS comprimidos. `/cirilo` es la excepción: sus fotos reales se cargan solas desde `cirilo/fotos/`, en diferido y con caché larga.
- Tipografías variables autoalojadas con `@fontsource` (solo se descarga el subconjunto latino).
- Respeta `prefers-reduced-motion`.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/cafe/
npm run build    # genera dist/
npm run preview
```

## Agregar una landing nueva

1. Crear una carpeta `nombre/` con `index.html`, `style.css` y `main.js`.
2. Sumar `'nombre'` a la lista `pages` en `vite.config.js`.
3. Agregar la tarjeta en `index.html` de la raíz.

## Deploy en Vercel

Importar el repositorio en Vercel. `vercel.json` ya define el framework (Vite), el comando de build y la carpeta `dist`. Cada carpeta queda servida en su ruta (`/cafe`, `/arquitectura`, …).
