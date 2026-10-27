/* =========================================================
   JALIO · Campo de partículas del hero
   Cápsulas en reposo sobre una retícula; al acercar el cursor
   se ordenan en un anillo que lo sigue y regresan a su lugar
   al alejarlo. Clic o toque sostenido: carga y dispersión.
   Sin librerías: Canvas 2D, se pausa fuera de pantalla.
   ========================================================= */
(() => {
  'use strict';

  const canvas = document.getElementById('particulas');
  if (!canvas || !canvas.getContext) return;
  const hero = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => t * t * (3 - 2 * t);

  // Generador pseudoaleatorio estable (el campo se ve igual en cada carga)
  let seed = 20261023;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- Estado ---------- */
  let W = 0, H = 0, dpr = 1, N = 0;
  let homeX, homeY, x, y, vx, vy, phase, band, agility, delay, size, orbit;
  let rgb = '255, 255, 255';
  let ambient = 0.16;
  let time = 0, intro = 0, charge = 0, last = 0, raf = 0;
  let focus = 0;      // 0 = sin interacción, 1 = el usuario mueve el cursor sobre el hero
  let influence = 0;  // fuerza con que el anillo atrae a las partículas
  // Con mouse: en reposo cuando no está encima. En pantallas táctiles: recorrido lento y tenue.
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let visible = true;
  let ringR = 120, magnet = 170, spread = 30, waveAmp = 14;

  const cursor = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  const pointer = { x: 0, y: 0, inside: false, moved: -1e9, down: false };

  function readTheme() {
    const v = getComputedStyle(root).getPropertyValue('--particle').trim();
    rgb = v || '255, 255, 255';
    ambient = root.getAttribute('data-theme') === 'light' ? 0.13 : 0.17;
  }

  function build() {
    const rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width));
    H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Densidad según pantalla, con tope para mantener 60 fps
    let gap = W < 700 ? 24 : 30;
    while ((W / gap) * (H / gap) > 1800) gap += 2;
    const cols = Math.ceil(W / gap) + 1;
    const rows = Math.ceil(H / gap) + 1;
    N = cols * rows;

    homeX = new Float32Array(N); homeY = new Float32Array(N);
    x = new Float32Array(N); y = new Float32Array(N);
    vx = new Float32Array(N); vy = new Float32Array(N);
    phase = new Float32Array(N); band = new Float32Array(N);
    agility = new Float32Array(N); delay = new Float32Array(N); size = new Float32Array(N); orbit = new Float32Array(N);

    seed = 20261023;
    for (let i = 0; i < N; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      homeX[i] = (c + 0.5 + (rand() - 0.5) * 0.8) * gap - gap / 2;
      homeY[i] = (r + 0.5 + (rand() - 0.5) * 0.8) * gap - gap / 2;
      phase[i] = rand() * Math.PI * 2;
      band[i] = rand() * 2 - 1;
      agility[i] = 0.7 + rand() * 0.6;
      delay[i] = rand();
      size[i] = 0.75 + rand() * 0.5;
      x[i] = homeX[i];
      // Entrada "antigravedad": las partículas suben a su lugar
      y[i] = reduce ? homeY[i] : homeY[i] + H * (0.25 + delay[i] * 0.35);
      vx[i] = 0; vy[i] = 0;
    }

    ringR = clamp(Math.min(W, H) * 0.17, 80, 170);
    magnet = ringR * 1.5;
    spread = ringR * 0.26;
    waveAmp = ringR * 0.1;

    cursor.x = cursor.tx = W * 0.68;
    cursor.y = cursor.ty = H * 0.3;
  }

  /* ---------- Simulación (resortes amortiguados) ---------- */
  function simulate(dt) {
    const cx = cursor.x, cy = cursor.y;
    const ring = ringR * (1 - 0.35 * charge);
    const edge = magnet * 0.2;
    // Giro acumulado por partícula, con tope: solo gira mientras está en el anillo
    // y se "desenrolla" al salir, así nunca da vueltas de más.
    const spinRate = 0.18 * focus + charge * 2.2;

    for (let i = 0; i < N; i++) {
      const hx = homeX[i];
      const hy = homeY[i] + Math.sin(time * 0.7 + phase[i]) * 2.5;
      const dx = hx - cx, dy = hy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const cap = smooth(1 - clamp((dist - (magnet - edge)) / (edge * 2), 0, 1)) * influence;
      let turn = orbit[i] + spinRate * cap * dt;
      turn -= Math.atan2(Math.sin(turn), Math.cos(turn)) * (1 - cap) * Math.min(1, dt * 2.5);
      orbit[i] = turn;

      let tx = hx, ty = hy;
      if (cap > 0.001) {
        const a = Math.atan2(dy, dx) + turn;
        const wave = waveAmp * (0.6 * Math.sin(a * 3 - time * 0.6) + 0.4 * Math.sin(phase[i] + time * 0.5));
        const rad = dist + (ring + wave + band[i] * spread - dist) * cap;
        tx = cx + Math.cos(a) * rad;
        ty = cy + Math.sin(a) * rad;
      }

      if (intro < delay[i] * 0.9) continue;
      const w = 7.5 * agility[i];
      const k = w * w, c = 1.6 * w;
      const h = dt / 2;
      for (let s = 0; s < 2; s++) {
        vx[i] += ((tx - x[i]) * k - vx[i] * c) * h;
        vy[i] += ((ty - y[i]) * k - vy[i] * c) * h;
        x[i] += vx[i] * h;
        y[i] += vy[i] * h;
      }
    }
  }

  function burst(strength) {
    const reach = ringR * 1.9;
    for (let i = 0; i < N; i++) {
      const dx = x[i] - cursor.x, dy = y[i] - cursor.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
      const kick = 900 * strength * Math.exp(-(d / reach) * (d / reach)) * agility[i];
      vx[i] += (dx / d) * kick;
      vy[i] += (dy / d) * kick;
    }
  }

  /* ---------- Dibujo: cápsulas agrupadas por intensidad ---------- */
  const LEVELS = 6;
  const paths = Array.from({ length: LEVELS }, () => []);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let l = 0; l < LEVELS; l++) paths[l].length = 0;

    const cx = cursor.x, cy = cursor.y;
    const ring = ringR * (1 - 0.35 * charge);
    const bw = ringR * 0.5;
    const reveal = reduce ? 1 : clamp(intro / 0.8, 0, 1);

    for (let i = 0; i < N; i++) {
      const dx = x[i] - cx, dy = y[i] - cy;
      const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
      const q = (d - ring) / bw;
      const glow = Math.exp(-q * q) * influence;
      let ux = dx / d, uy = dy / d;

      // Si va rápido, se estira en la dirección del movimiento
      const sp = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]);
      const streak = clamp(sp / 260, 0, 2);
      if (sp > 1) {
        const m = smooth(clamp(streak, 0, 1));
        ux = ux * (1 - m) + (vx[i] / sp) * m;
        uy = uy * (1 - m) + (vy[i] / sp) * m;
        const n = Math.sqrt(ux * ux + uy * uy) || 1;
        ux /= n; uy /= n;
      }

      const len = (1.2 + glow * 7 + streak * 5) * size[i];
      const lvl = Math.min(LEVELS - 1, Math.floor((glow * 0.85 + clamp(streak, 0, 1) * 0.3) * LEVELS));
      paths[lvl].push(x[i] - ux * len * 0.5, y[i] - uy * len * 0.5, x[i] + ux * len * 0.5, y[i] + uy * len * 0.5);
    }

    ctx.lineCap = 'round';
    for (let l = 0; l < LEVELS; l++) {
      const p = paths[l];
      if (!p.length) continue;
      const t = l / (LEVELS - 1);
      ctx.strokeStyle = `rgba(${rgb}, ${((ambient + (0.9 - ambient) * t) * reveal).toFixed(3)})`;
      ctx.lineWidth = 1.4 + t * 1.4;
      ctx.beginPath();
      for (let j = 0; j < p.length; j += 4) { ctx.moveTo(p[j], p[j + 1]); ctx.lineTo(p[j + 2], p[j + 3]); }
      ctx.stroke();
    }
  }

  /* ---------- Bucle ---------- */
  function frame(now) {
    raf = 0;
    const dt = clamp((now - last) / 1000 || 0, 0, 1 / 30);
    last = now;
    time += dt;
    if (intro < 3) intro += dt;
    charge = pointer.down ? Math.min(1, charge + dt / 0.9) : Math.max(0, charge - dt * 4);

    // Cursor real; sin interacción, el anillo se disuelve (con mouse)
    // o recorre el hero despacio y tenue (pantallas táctiles)
    const idle = !pointer.inside || performance.now() - pointer.moved > 2500;
    focus += ((idle ? 0 : 1) - focus) * Math.min(1, dt * 3);
    const target = idle ? (canHover ? 0 : 0.4) : 1;
    influence += (target - influence) * Math.min(1, dt * (idle ? 1.2 : 4));
    if (idle) {
      if (!canHover) {
        cursor.tx = W * 0.5 + Math.sin(time * 0.16) * W * 0.3;
        cursor.ty = H * 0.38 + Math.cos(time * 0.23) * H * 0.18;
      }
    } else {
      cursor.tx = pointer.x;
      cursor.ty = pointer.y;
    }
    const ks = idle ? 3 : 49, cs = idle ? 3.5 : 14;
    cursor.vx += ((cursor.tx - cursor.x) * ks - cursor.vx * cs) * dt;
    cursor.vy += ((cursor.ty - cursor.y) * ks - cursor.vy * cs) * dt;
    cursor.x += cursor.vx * dt;
    cursor.y += cursor.vy * dt;

    simulate(dt);
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (reduce || raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // Movimiento reducido: un solo cuadro estático, ya acomodado
  function renderStatic() {
    intro = 3; influence = 0.6; focus = 0;
    cursor.x = W * 0.7; cursor.y = H * 0.3;
    for (let s = 0; s < 240; s++) simulate(1 / 60);
    draw();
  }

  /* ---------- Entrada del usuario ---------- */
  function locate(e) {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  if (!reduce) {
    window.addEventListener('pointermove', e => { locate(e); if (pointer.inside) pointer.moved = performance.now(); }, { passive: true });
    window.addEventListener('pointerdown', e => {
      locate(e);
      if (!pointer.inside) return;
      pointer.moved = performance.now();
      // No cargar al tocar botones, enlaces o la consola
      if (e.target.closest('a, button, input, textarea, .io')) return;
      pointer.down = true;
    }, { passive: true });
    const release = e => {
      if (pointer.down) burst(0.45 + charge);
      pointer.down = false;
      if (e.pointerType !== 'mouse') pointer.moved = performance.now() - 1500;
    };
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer.inside = false; pointer.down = false; });
  }

  /* ---------- Ciclo de vida ---------- */
  readTheme();
  build();
  if (reduce) renderStatic(); else wake();

  let lastW = W, lastH = H;
  new ResizeObserver(() => {
    const r = hero.getBoundingClientRect();
    // Ignora cambios pequeños de alto (barra del navegador en móvil)
    if (Math.round(r.width) === lastW && Math.abs(Math.round(r.height) - lastH) < 120) return;
    lastW = Math.round(r.width); lastH = Math.round(r.height);
    const keepIntro = intro;
    build();
    intro = Math.max(keepIntro, 3);
    for (let i = 0; i < N; i++) y[i] = homeY[i];
    if (reduce) renderStatic(); else wake();
  }).observe(hero);

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; wake(); }).observe(hero);
  document.addEventListener('visibilitychange', wake);

  // Cambio de tema: actualizar color
  new MutationObserver(() => { readTheme(); if (reduce) draw(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();