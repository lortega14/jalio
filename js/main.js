/* =========================================================
   JALIO · Interacciones de la landing
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURA AQUÍ TUS DATOS DE CONTACTO (solo datos confirmados)
   whatsapp: número con lada de país, sin espacios ni "+".
             Ejemplo para México: '5214441234567'
   correo:   ejemplo 'hola@jalio.mx'
   Deja vacío ('') el canal que no uses.
--------------------------------------------------------- */
const CONTACTO = {
  whatsapp: '',
  correo: ''
};

(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Arranque: un único momento de entrada ---------- */
  const ready = () => root.classList.add('is-ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 600))]).then(ready);
  } else {
    ready();
  }

  /* ---------- Tema claro / oscuro ---------- */
  const themeBtn = $('#theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const sysLight = window.matchMedia('(prefers-color-scheme: light)');
  const saved = () => { try { return localStorage.getItem('jalio-tema'); } catch (e) { return null; } };
  const applyTheme = t => {
    root.setAttribute('data-theme', t);
    if (metaTheme) metaTheme.setAttribute('content', t === 'light' ? '#ffffff' : '#111111');
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
  };
  applyTheme(root.getAttribute('data-theme') || 'dark');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('jalio-tema', next); } catch (e) {}
      // Barrido diagonal si el navegador soporta View Transitions
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => applyTheme(next));
      else applyTheme(next);
    });
  }
  // Si no hay elección guardada, seguir los cambios del sistema
  const onSys = e => { if (!saved()) applyTheme(e.matches ? 'light' : 'dark'); };
  if (sysLight.addEventListener) sysLight.addEventListener('change', onSys);

  /* ---------- Navegación ---------- */
  const nav = $('#nav');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  // Menú móvil
  const toggle = $('.nav__toggle');
  const menu = $('#menu-movil');
  const openMenu = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';
    const first = $('a', menu);
    if (first) first.focus({ preventScroll: true });
  };
  const closeMenu = (returnFocus = true) => {
    menu.classList.remove('is-open');
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    if (returnFocus) toggle.focus({ preventScroll: true });
  };
  toggle.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  $$('a', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); });
  window.matchMedia('(min-width: 881px)').addEventListener('change', e => { if (e.matches && !menu.hidden) closeMenu(false); });

  // Enlace activo según la sección visible
  const navLinks = $$('.nav__links a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Elementos que se activan al entrar en pantalla ---------- */
  const inview = $$('[data-inview]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    inview.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    inview.forEach(el => io.observe(el));
  }

  /* =========================================================
     CONSOLA I/O · entrada → código → salida
     ========================================================= */
  const EJEMPLOS = [
    {
      url: 'barberiacentro.mx',
      entrada: 'Quiero que mis clientes vean mis servicios y me escriban para apartar su cita.',
      codigo: [
        ['<header>'],
        ['  <a class="logo">Barbería Centro</a>', 1],
        ['</header>'],
        ['<main>'],
        ['  <h1>Tu corte, a tu hora.</h1>', 2],
        ['  <p>Aparta tu lugar en un mensaje.</p>', 3],
        ['  <ul class="servicios">'],
        ['    <li>Corte clásico</li>', 4],
        ['    <li>Arreglo de barba</li>', 5],
        ['    <li>Corte + barba</li>', 6],
        ['  </ul>'],
        ['  <a href="https://wa.me/…">Agendar por WhatsApp</a>', 7],
        ['</main>']
      ],
      salida: `
        <div class="pv pv-nav" data-s="1">Barbería Centro<i></i><i></i><i></i></div>
        <p class="pv pv-h" data-s="2">Tu corte, a tu hora.</p>
        <p class="pv pv-p" data-s="3">Aparta tu lugar en un mensaje.</p>
        <ul class="pv-list">
          <li class="pv" data-s="4">Corte clásico<span>30 min</span></li>
          <li class="pv" data-s="5">Arreglo de barba<span>20 min</span></li>
          <li class="pv" data-s="6">Corte + barba<span>45 min</span></li>
        </ul>
        <span class="pv pv-btn" data-s="7">Agendar por WhatsApp</span>`
    },
    {
      url: 'casaroble.mx',
      entrada: 'Necesito mostrar mis muebles en línea. La venta la cierro en la tienda.',
      codigo: [
        ['<header>'],
        ['  <a class="logo">Casa Roble</a>', 1],
        ['</header>'],
        ['<main>'],
        ['  <h1>Muebles para cada espacio.</h1>', 2],
        ['  <p>Visítanos o pregunta por mensaje.</p>', 3],
        ['  <section class="catalogo">'],
        ['    <article>Sala</article>', 4],
        ['    <article>Comedor</article>', 5],
        ['    <article>Recámara</article>', 6],
        ['  </section>'],
        ['  <a href="https://wa.me/…">Preguntar por WhatsApp</a>', 7],
        ['</main>']
      ],
      salida: `
        <div class="pv pv-nav" data-s="1">Casa Roble<i></i><i></i><i></i></div>
        <p class="pv pv-h" data-s="2">Muebles para cada espacio.</p>
        <p class="pv pv-p" data-s="3">Visítanos o pregunta por mensaje.</p>
        <ul class="pv-grid">
          <li class="pv" data-s="4">Sala</li>
          <li class="pv" data-s="5">Comedor</li>
          <li class="pv" data-s="6">Recámara</li>
        </ul>
        <span class="pv pv-btn" data-s="7">Preguntar por WhatsApp</span>`
    },
    {
      url: 'clubnorte.mx',
      entrada: 'Quiero que vean nuestras disciplinas, los horarios y cómo inscribirse.',
      codigo: [
        ['<header>'],
        ['  <a class="logo">Club Norte</a>', 1],
        ['</header>'],
        ['<main>'],
        ['  <h1>Entrena cerca de casa.</h1>', 2],
        ['  <p>Clases para todas las edades.</p>', 3],
        ['  <table class="horarios">'],
        ['    <tr><td>Natación</td><td>L–V</td><td>7:00</td></tr>', 4],
        ['    <tr><td>Fútbol</td><td>Sáb</td><td>9:00</td></tr>', 5],
        ['    <tr><td>Box</td><td>L–J</td><td>19:00</td></tr>', 6],
        ['  </table>'],
        ['  <a href="#inscripcion">Inscríbete</a>', 7],
        ['</main>']
      ],
      salida: `
        <div class="pv pv-nav" data-s="1">Club Norte<i></i><i></i><i></i></div>
        <p class="pv pv-h" data-s="2">Entrena cerca de casa.</p>
        <p class="pv pv-p" data-s="3">Clases para todas las edades.</p>
        <ul class="pv-table">
          <li class="pv" data-s="4"><span>Natación</span><span>L–V</span><span>7:00</span></li>
          <li class="pv" data-s="5"><span>Fútbol</span><span>Sáb</span><span>9:00</span></li>
          <li class="pv" data-s="6"><span>Box</span><span>L–J</span><span>19:00</span></li>
        </ul>
        <span class="pv pv-btn" data-s="7">Inscríbete</span>`
    }
  ];

  const ioEl = $('#io');
  if (ioEl) {
    const tabs = $$('.io__tab', ioEl);
    const inputText = $('.io__input-text', ioEl);
    const codeEl = $('.io__code code', ioEl);
    const codeWrap = $('.io__code', ioEl);
    const page = $('.browser__page', ioEl);
    const url = $('.io__pane--out .browser__url', ioEl);
    const flows = $$('.io__flow', ioEl);
    const statusText = $('.io__status-text', ioEl);
    const pauseBtn = $('.io__pause', ioEl);

    let current = 0;
    let runId = 0;
    let userPaused = false;
    let autoPaused = false;
    const isPaused = () => userPaused || autoPaused;

    class Cancel extends Error {}
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    async function wait(ms, id) {
      await sleep(ms);
      while (isPaused() && id === runId) await sleep(120);
      if (id !== runId) throw new Cancel();
    }

    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Resaltado mínimo de HTML en escala de grises
    function highlight(src) {
      let out = '', i = 0, inTag = false;
      const span = (cls, txt) => txt ? `<span class="${cls}">${esc(txt)}</span>` : '';
      while (i < src.length) {
        const ch = src[i];
        if (!inTag) {
          if (ch === '<') {
            let j = i + 1;
            while (j < src.length && !/[\s>]/.test(src[j])) j++;
            out += span('tok-tag', src.slice(i, j));
            i = j; inTag = true;
          } else {
            let j = i;
            while (j < src.length && src[j] !== '<') j++;
            const txt = src.slice(i, j);
            out += /^\s+$/.test(txt) ? esc(txt) : span('tok-txt', txt);
            i = j;
          }
        } else {
          if (ch === '>') { out += span('tok-tag', '>'); i++; inTag = false; }
          else if (ch === '"') {
            let j = src.indexOf('"', i + 1);
            j = j === -1 ? src.length : j + 1;
            out += span('tok-str', src.slice(i, j)); i = j;
          } else if (/\s/.test(ch)) { out += ch; i++; }
          else {
            let j = i;
            while (j < src.length && !/[\s=>"]/.test(src[j])) j++;
            if (src[j] === '=') j++;
            out += span('tok-attr', src.slice(i, j)); i = j;
          }
        }
      }
      return out;
    }

    function setState(state, text) {
      ioEl.dataset.state = state;
      statusText.textContent = text;
    }
    function pulse(flow) {
      if (!flow) return;
      flow.classList.remove('is-on');
      void flow.offsetWidth; // reinicia la animación
      flow.classList.add('is-on');
    }
    function selectTab(i) {
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', String(k === i));
        t.tabIndex = k === i ? 0 : -1;
      });
    }
    function reset(ex) {
      inputText.textContent = '';
      codeEl.innerHTML = '';
      codeWrap.scrollTop = 0;
      page.innerHTML = ex.salida;
      url.textContent = ex.url;
      flows.forEach(f => f.classList.remove('is-on'));
    }
    function reveal(step) {
      if (!step) return;
      $$(`[data-s="${step}"]`, page).forEach(el => el.classList.add('on'));
    }
    function renderFinal(i) {
      const ex = EJEMPLOS[i];
      selectTab(i);
      reset(ex);
      inputText.textContent = ex.entrada;
      codeEl.innerHTML = ex.codigo.map(([l]) => `<span class="ln">${highlight(l)}</span>`).join('');
      $$('.pv', page).forEach(el => el.classList.add('on'));
      flows.forEach(f => f.classList.add('is-on'));
      ioEl.dataset.phase = 'done';
      setState('done', 'build ok');
    }

    async function play(i, id) {
      const ex = EJEMPLOS[i];
      selectTab(i);
      reset(ex);
      setState('typing', 'escribiendo');

      // 01 · Entrada
      ioEl.dataset.phase = 'input';
      await wait(350, id);
      for (const ch of ex.entrada) {
        inputText.textContent += ch;
        await wait(ch === ' ' ? 18 : 24 + Math.random() * 30, id);
      }
      await wait(380, id);
      pulse(flows[0]);

      // 02 · Código (cada línea construye una parte de la salida)
      ioEl.dataset.phase = 'code';
      await wait(420, id);
      for (const [line, step] of ex.codigo) {
        const ln = document.createElement('span');
        ln.className = 'ln is-current';
        codeEl.appendChild(ln);
        const indent = line.match(/^\s*/)[0];
        let typed = indent;
        ln.innerHTML = highlight(typed);
        for (const ch of line.slice(indent.length)) {
          typed += ch;
          ln.innerHTML = highlight(typed);
          codeWrap.scrollTop = codeWrap.scrollHeight;
          await wait(12 + Math.random() * 16, id);
        }
        ln.classList.remove('is-current');
        if (step) { pulse(flows[1]); reveal(step); }
        await wait(step ? 160 : 70, id);
      }

      // 03 · Salida
      ioEl.dataset.phase = 'done';
      setState('done', 'build ok');
      await wait(4200, id);
    }

    async function loop(start) {
      const id = ++runId;
      let i = start;
      try {
        while (true) {
          current = i;
          await play(i, id);
          i = (i + 1) % EJEMPLOS.length;
        }
      } catch (e) {
        if (!(e instanceof Cancel)) throw e;
      }
    }

    // Pestañas (con navegación por teclado)
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        if (reduceMotion) { renderFinal(i); return; }
        loop(i);
      });
      tab.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus();
        tabs[n].click();
      });
    });

    // Pausa manual
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Reanudar animación' : 'Pausar animación');
      if (userPaused) setState('paused', 'en pausa');
      else setState(ioEl.dataset.phase === 'done' ? 'done' : 'typing', ioEl.dataset.phase === 'done' ? 'build ok' : 'escribiendo');
    });

    if (reduceMotion) {
      pauseBtn.hidden = true;
      renderFinal(0);
    } else {
      // Pausa automática fuera de pantalla o con la pestaña oculta
      let visible = true;
      const sync = () => { autoPaused = !visible || document.hidden; };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 }).observe(ioEl);
      }
      document.addEventListener('visibilitychange', sync);
      reset(EJEMPLOS[0]);
      selectTab(0);
      setTimeout(() => loop(0), 1300);
    }
  }

  /* =========================================================
     PROCESO · barra de avance ligada al scroll
     ========================================================= */
  const stepsEl = $('#steps');
  if (stepsEl) {
    const steps = $$('.step', stepsEl);
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const rect = stepsEl.getBoundingClientRect();
      const anchor = vh * 0.6;
      const p = Math.min(1, Math.max(0, (anchor - rect.top) / rect.height));
      stepsEl.style.setProperty('--progress', p.toFixed(4));
      steps.forEach(s => {
        const r = s.getBoundingClientRect();
        s.classList.toggle('is-active', r.top + 24 < anchor);
      });
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    if (reduceMotion) {
      stepsEl.style.setProperty('--progress', '1');
      steps.forEach(s => s.classList.add('is-active'));
    } else {
      update();
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
    }
  }

  /* =========================================================
     PREGUNTAS · acordeón con altura animada
     ========================================================= */
  $$('.faq__item').forEach(item => {
    const summary = $('summary', item);
    const body = $('.faq__body', item);
    let anim = null;
    summary.addEventListener('click', e => {
      if (reduceMotion || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      if (item.open) {
        anim = body.animate({ height: [body.offsetHeight + 'px', '0px'], opacity: [1, 0] }, { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
        anim.onfinish = () => { item.open = false; anim = null; };
      } else {
        item.open = true;
        const h = body.scrollHeight;
        anim = body.animate({ height: ['0px', h + 'px'], opacity: [0, 1] }, { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* =========================================================
     CONTACTO · formulario hacia WhatsApp o correo
     ========================================================= */
  const form = $('#form-contacto');
  if (form) {
    const status = $('#form-status');
    const canalField = $('#canal-field');
    const submit = $('#f-enviar');
    const direct = $('#contacto-directo');
    const wa = (CONTACTO.whatsapp || '').replace(/\D/g, '');
    const mail = (CONTACTO.correo || '').trim();

    // Enlaces directos (solo si están configurados)
    const items = [];
    if (wa) items.push(`<li><a href="https://wa.me/${wa}" target="_blank" rel="noopener"><span>WhatsApp</span><b>Escríbenos</b></a></li>`);
    if (mail) items.push(`<li><a href="mailto:${mail}"><span>Correo</span><b>${esc2(mail)}</b></a></li>`);
    direct.innerHTML = items.join('');

    function esc2(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

    if (wa && mail) canalField.hidden = false;

    const canal = () => {
      if (wa && mail) return form.canal.value;
      return wa ? 'whatsapp' : mail ? 'correo' : null;
    };
    const labelBtn = () => {
      const c = canal();
      submit.textContent = c === 'whatsapp' ? 'Continuar en WhatsApp' : c === 'correo' ? 'Continuar en tu correo' : 'Enviar mensaje';
    };
    labelBtn();
    $$('input[name="canal"]', form).forEach(r => r.addEventListener('change', labelBtn));

    if (!wa && !mail) {
      status.textContent = 'Este formulario aún no tiene un canal de contacto. Configúralo en js/main.js (CONTACTO).';
      status.classList.add('is-warning');
    }

    const fields = {
      nombre: { el: $('#f-nombre'), msg: 'Escribe tu nombre para saber cómo dirigirnos a ti.' },
      mensaje: { el: $('#f-mensaje'), msg: 'Cuéntanos en una o dos líneas qué necesitas.' }
    };
    const setError = (key, show) => {
      const { el, msg } = fields[key];
      const field = el.closest('.field');
      const err = $('#e-' + key);
      field.classList.toggle('has-error', show);
      el.setAttribute('aria-invalid', String(show));
      err.textContent = show ? msg : '';
    };
    Object.keys(fields).forEach(k => {
      fields[k].el.addEventListener('input', () => { if (fields[k].el.value.trim()) setError(k, false); });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(fields).forEach(k => {
        const bad = !fields[k].el.value.trim();
        setError(k, bad);
        if (bad && !firstInvalid) firstInvalid = fields[k].el;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      const c = canal();
      if (!c) {
        status.textContent = 'No se pudo enviar: falta configurar WhatsApp o correo en js/main.js.';
        status.classList.add('is-warning');
        return;
      }

      const nombre = fields.nombre.el.value.trim();
      const negocio = $('#f-negocio').value.trim();
      const tipo = form.tipo.value;
      const mensaje = fields.mensaje.el.value.trim();
      const texto =
        `Hola, Jalio. Soy ${nombre}${negocio ? ` de ${negocio}` : ''}.\n` +
        `Me interesa: ${tipo}.\n\n${mensaje}`;

      if (c === 'whatsapp') {
        window.open(`https://wa.me/${wa}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
        status.textContent = 'Abrimos WhatsApp con tu mensaje listo. Solo presiona enviar.';
      } else {
        const asunto = `Proyecto web${negocio ? ` · ${negocio}` : ''}`;
        window.location.href = `mailto:${mail}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`;
        status.textContent = 'Abrimos tu correo con el mensaje listo. Solo presiona enviar.';
      }
      status.classList.remove('is-warning');
    });
  }

  /* ---------- Año del pie ---------- */
  const anio = $('#anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
