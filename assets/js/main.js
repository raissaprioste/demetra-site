/* =========================================================
   DEMETRA — interações e animações
   Depende de: gsap, ScrollTrigger, Lenis
   ========================================================= */

/* ▸ CONFIGURAÇÃO: número do WhatsApp com DDI + DDD, só dígitos */
const WHATSAPP = '55XXXXXXXXXXX';

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => window.matchMedia('(min-width: 901px)').matches;

  /* ---------- WhatsApp em todos os botões ---------- */
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(el.dataset.wa)}`;
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* ---------- Quarta parede: relógio e título da aba ---------- */
  const clock = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  if (clock) { tick(); setInterval(tick, 20000); }

  const tituloOriginal = document.title;
  document.addEventListener('visibilitychange', () => {
    document.title = document.hidden ? 'volta: a ideia ainda não terminou.' : tituloOriginal;
  });

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Rolagem suave ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) { e.preventDefault(); lenis.scrollTo(alvo, { offset: 0 }); }
    }));
  }

  /* ---------- Nav: fundo ao rolar e esconde ao descer ---------- */
  const nav = document.querySelector('.nav');
  let ultimoY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > ultimoY && y > 400);
      ultimoY = y;
    }
  });

  /* ---------- Utilitário: quebrar em palavras ---------- */
  function splitWords(el, cls = 'w', inner = 'wi') {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = cls;
            if (inner) { const i = document.createElement('span'); i.className = inner; i.textContent = part; w.appendChild(i); }
            else w.textContent = part;
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return el.querySelectorAll(inner ? '.' + inner : '.' + cls);
  }

  /* ---------- Cursor ---------- */
  if (fine && !reduce) {
    const cur = document.querySelector('.cursor');
    const dot = cur.querySelector('.cursor-dot');
    const ring = cur.querySelector('.cursor-ring');
    const label = cur.querySelector('.cursor-label');
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('mousemove', e => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    /* sobre fundos tangerina o cursor troca para abeto, senão some */
    const TANGERINA = '.painel-1, .s-final, .btn-t, .wa-float, .hl';
    document.addEventListener('mouseover', e => {
      const t = e.target;
      cur.classList.toggle('is-dark', !!t.closest(TANGERINA) && !t.closest('.btn-a'));
    });
    document.querySelectorAll('[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => { label.textContent = el.dataset.cursor; cur.classList.add('is-active'); });
      el.addEventListener('mouseleave', () => cur.classList.remove('is-active'));
    });

    /* botões magnéticos */
    document.querySelectorAll('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.3);
      });
      el.addEventListener('mouseleave', () => { mx(0); my(0); });
    });
  }

  if (reduce) return;

  /* =========================================================
     01 · PRIMEIRA DOBRA — o título genérico é riscado e reescrito
     ========================================================= */
  /* ---------- Intro: "demetra." em tela cheia, depois a logo voa para a nav ---------- */
  const introEl = document.querySelector('.intro');
  const hero = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

  let introAcabou = false;
  const fimIntro = () => {
    if (introAcabou) return;
    introAcabou = true;
    document.documentElement.classList.remove('intro-on');
    if (lenis) lenis.start();
    hero.play();
  };

  if (introEl && getComputedStyle(introEl).display !== 'none') {
    if (lenis) lenis.stop();
    const logoIntro = introEl.querySelector('.intro-logo');
    const logoNav = document.querySelector('.nav .logo');
    const palavra = introEl.querySelector('.intro-word');
    gsap.set('.intro-dot', { autoAlpha: 0, scale: 0.55 });

    /* onda: faixas concêntricas de tangerina sobem de baixo e pintam o nome, que assenta em creme */
    const CORES = ['#F08A3E', '#B85A1C', '#F08A3E', '#FDEFE4'];
    const onda = { p: 0 };
    const pintar = () => {
      const W = palavra.offsetWidth, H = palavra.offsetHeight;
      const fs = parseFloat(getComputedStyle(palavra).fontSize);
      const b = fs * 0.35, faixa = CORES.length * b;
      const cy = H * 1.8;
      const rMin = cy - H, rMax = Math.hypot(W / 2, cy) + faixa + b;
      const R = rMin + onda.p * (rMax - rMin);
      const st = ['#FDEFE4 0px', `#FDEFE4 ${Math.max(0, R - faixa)}px`];
      CORES.forEach((c, k) => st.push(`${c} ${R - faixa + (k + 0.5) * b}px`));
      st.push(`rgba(253,239,228,0) ${R + b * 0.6}px`);
      palavra.style.backgroundImage = `radial-gradient(circle at 50% ${cy}px, ${st.join(',')})`;
    };

    const intro = gsap.timeline({ delay: 0.1, onComplete: fimIntro });
    intro
      .to(onda, { p: 1, duration: 2.8, ease: 'sine.inOut', onUpdate: pintar,
        onComplete: () => { palavra.style.backgroundImage = 'linear-gradient(#FDEFE4,#FDEFE4)'; } })
      .to('.intro-dot', { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power4.out' }, 1.4)
      .add(() => {
        /* calcula o voo até a logo da nav (FLIP) */
        const a = logoIntro.getBoundingClientRect();
        const b = logoNav.getBoundingClientRect();
        const escala = b.width / a.width;
        intro.to(logoIntro, {
          x: (b.left + b.width / 2) - (a.left + a.width / 2),
          y: (b.top + b.height / 2) - (a.top + a.height / 2),
          scale: escala, duration: 1, ease: 'expo.inOut'
        }, 2.7)
        .to(introEl, { backgroundColor: 'rgba(15,42,40,0)', duration: 0.6, ease: 'power2.out' }, '-=0.35')
        .set('.nav', { autoAlpha: 1 })
        .set('.nav-links, .nav .btn', { autoAlpha: 0 }, '<');
      }, 0);

    /* clique ou tecla pula a intro */
    const pular = () => { if (introAcabou) return; intro.kill(); fimIntro(); };
    introEl.addEventListener('click', pular);
    window.addEventListener('keydown', pular, { once: true });
    /* segurança: nunca prende a página */
    setTimeout(() => { if (document.documentElement.classList.contains('intro-on')) fimIntro(); }, 6000);
  } else {
    hero.delay(0.3).play();
  }

  gsap.set('.hero-title .li', { yPercent: 110 });
  gsap.set('.hl', { '--hl': 0 });
  gsap.set(['.hero-lead', '.hero-actions', '.nav'], { autoAlpha: 0 });
  gsap.set('.draft-text', { autoAlpha: 0, y: 16 });
  gsap.set(['.hero-lead', '.hero-actions'], { y: 18 });
  /* nota de margem: datilografada letra por letra */
  const notaEl = document.querySelector('.draft-note');
  const notaTexto = notaEl.textContent;
  notaEl.textContent = '';
  const notaLetras = [...notaTexto].map(c => {
    const s = document.createElement('span');
    s.textContent = c;
    s.style.visibility = 'hidden';
    notaEl.appendChild(s);
    return s;
  });
  notaEl.setAttribute('aria-label', notaTexto);
  gsap.set(notaEl, { autoAlpha: 1 });
  gsap.set('.strike', { scaleX: 0, rotation: -1.2, transformOrigin: 'left center' });

  hero
    .to('.draft-text', { autoAlpha: 0.9, y: 0, duration: 0.7 })
    .to('.strike', { scaleX: 1, duration: 0.8, ease: 'power1.inOut' }, '+=0.15')
    .to('.draft-text', { autoAlpha: 0.38, duration: 0.8 }, '-=0.3')
    .to(notaLetras, { visibility: 'visible', duration: 0.01, stagger: { each: 0.03, ease: 'none' } }, '+=0.15')
    .to('.hero-title .li', { yPercent: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, '+=0.45')
    .to('.hl', { '--hl': 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.55')
    .to(['.hero-lead', '.hero-actions'], { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, '+=0.15')
    .to(['.nav', '.nav-links', '.nav .btn'], { autoAlpha: 1, duration: 0.6 }, '<');


  /* o título se afasta ao rolar */
  gsap.to('.s-hero .wrap', {
    yPercent: -12, opacity: 0.2, ease: 'none',
    scrollTrigger: { trigger: '.s-hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ---------- Títulos com entrada palavra-por-palavra ---------- */
  document.querySelectorAll('.split').forEach(el => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, duration: 0.9, stagger: 0.05, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 82%' }
    });
  });

  /* =========================================================
     02 · CONFLITO — o que é "de fora" é riscado e cai
     ========================================================= */
  const fora = gsap.utils.toArray('.fora li');
  const dentro = gsap.utils.toArray('.dentro li');
  const mmConflito = gsap.matchMedia();
  mmConflito.add('(min-width: 901px)', () => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.s-conflito', start: 'top top', end: '+=160%', scrub: 0.6, pin: true }
    });
    fora.forEach((li, i) => {
      const span = li.querySelector('span');
      tl.to(span, { '--s': 1, duration: 0.4 }, i * 0.5)
        .to(li, { y: () => window.innerHeight * 0.7, rotate: gsap.utils.random(-28, 28), autoAlpha: 0, duration: 1, ease: 'power2.in' }, i * 0.5 + 0.35);
      if (dentro[i]) tl.to(dentro[i], { opacity: 1, duration: 0.5 }, i * 0.5 + 0.2);
    });
  });
  mmConflito.add('(max-width: 900px)', () => {
    fora.forEach(li => gsap.to(li.querySelector('span'), { '--s': 1, scrollTrigger: { trigger: li, start: 'top 75%', end: 'top 55%', scrub: true } }));
    dentro.forEach(li => gsap.to(li, { opacity: 1, scrollTrigger: { trigger: li, start: 'top 80%', end: 'top 60%', scrub: true } }));
  });

  /* =========================================================
     TRANSIÇÃO · a frase acende enquanto rola
     ========================================================= */
  document.querySelectorAll('.scrub-words').forEach(el => {
    const words = splitWords(el, 'sw', null);
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: true }
    });
  });

  /* =========================================================
     03 · FRENTES — rolagem horizontal fixa (desktop)
     ========================================================= */
  const mmFrentes = gsap.matchMedia();
  mmFrentes.add('(min-width: 901px)', () => {
    const track = document.querySelector('.frentes-track');
    const dist = () => track.scrollWidth - window.innerWidth;
    const scrollTween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.s-frentes', start: 'top top', end: () => '+=' + dist(), scrub: 1, pin: true, invalidateOnRefresh: true }
    });
    document.querySelectorAll('.painel:not(.painel-intro)').forEach(p => {
      gsap.from(p.querySelectorAll('.h2, .lead, .tags, .btn'), {
        y: 60, autoAlpha: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: p, containerAnimation: scrollTween, start: 'left 70%' }
      });
      gsap.from(p.querySelector('.nota'), {
        x: 40, autoAlpha: 0, duration: 0.8,
        scrollTrigger: { trigger: p, containerAnimation: scrollTween, start: 'left 55%' }
      });
    });
  });
  mmFrentes.add('(max-width: 900px)', () => {
    document.querySelectorAll('.painel').forEach(p => gsap.from(p.children, {
      y: 40, autoAlpha: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 80%' }
    }));
  });

  /* =========================================================
     04 · PROVA — papéis espalhados que se arrumam na mesa
     ========================================================= */
  const papeis = gsap.utils.toArray('.papel');
  const espalha = desktop() ? 1 : 0.25;
  papeis.forEach(p => {
    gsap.fromTo(p,
      { xPercent: +p.dataset.x * espalha, yPercent: +p.dataset.y * espalha, rotate: +p.dataset.r * (desktop() ? 1.6 : 0.6) },
      { xPercent: 0, yPercent: 0, rotate: +p.dataset.r * 0.15, ease: 'none',
        scrollTrigger: { trigger: '.mesa-papeis', start: 'top 95%', end: 'center 55%', scrub: 1 } });
  });
  if (fine) {
    const area = document.querySelector('.s-prova');
    const movers = papeis.map((p, i) => {
      const depth = (i % 3 + 1) * 6;
      return { x: gsap.quickTo(p, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(p, 'y', { duration: 0.8, ease: 'power3' }), depth };
    });
    area.addEventListener('mousemove', e => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach(m => { m.x(nx * m.depth * 2); m.y(ny * m.depth * 2); });
    });
  }

  /* =========================================================
     05 · À FRENTE DA DEMETRA — retratos se revelam
     ========================================================= */
  gsap.utils.toArray('.retrato').forEach((r, i) => {
    gsap.fromTo(r, { clipPath: 'inset(100% 0 0 0)' }, {
      clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'expo.out', delay: i * 0.12,
      scrollTrigger: { trigger: r, start: 'top 80%' }
    });
  });
  const citacao = document.querySelector('.citacao');
  if (citacao) {
    const w = splitWords(citacao);
    gsap.from(w, { yPercent: 110, stagger: 0.04, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: citacao, start: 'top 85%' } });
  }

  /* =========================================================
     06 · FINAL
     ========================================================= */
  gsap.from(['.final-lead', '.final-actions'], {
    y: 30, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '.s-final', start: 'top 60%' }
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
