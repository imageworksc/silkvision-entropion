/* ==========================================================================
   Page behaviour
   Loaded with `defer`, so the document is parsed by the time this runs.

   Everything here is an enhancement. If the file fails to load the page is
   still complete and readable: nothing is hidden by CSS until this script
   says it is safe to hide it.
   ========================================================================== */

'use strict';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;

/* --------------------------------------------------------------------------
   1 · Menu
   A button with aria-expanded rather than a <details>: above 992px the panel
   has to be a plain row, and forcing a closed <details> open in CSS means
   fighting the browser's own hiding of its contents.
   -------------------------------------------------------------------------- */
const setupMenu = () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  /* Escape closes it and returns focus to the control that opened it,
     otherwise focus is stranded in a panel that is no longer on screen.

     Bound to the document, not to nav. The toggle is nav's sibling, so right
     after you open the menu — when focus is still sitting on the button —
     a keydown on nav never fires and Escape did nothing at the one moment
     you are most likely to press it. */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    toggle.focus();
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
};

/* --------------------------------------------------------------------------
   2 · Scroll state — the reading progress bar, the sticky header's shadow,
   and the flag that retires the scroll cue once it has done its job.
   -------------------------------------------------------------------------- */
const setupScroll = () => {
  const bar = document.getElementById('progress');
  const header = document.getElementById('siteHeader');
  let ticking = false;

  const read = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
    if (header) header.dataset.stuck = String(y > 8);
    root.dataset.scrolled = String(y > 40);
    ticking = false;
  };

  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(read);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);

  read();
};

/* --------------------------------------------------------------------------
   3 · Scroll reveals
   The flag goes on <html> from here, so a target is only ever hidden while
   the page is in a position to bring it back.
   -------------------------------------------------------------------------- */
const setupReveals = () => {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  if (!targets.length) return;

  root.dataset.anim = 'on';

  if (reduced.matches || !('IntersectionObserver' in window)) {
    for (const el of targets) el.classList.add('is-in');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });

  for (const el of targets) io.observe(el);

  // The negative rootMargin means anything in the last slice of a
  // fully-scrolled page would never trigger. Once the visitor reaches the
  // bottom, reveal whatever is still waiting.
  const flush = () => {
    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
    for (const el of targets) {
      el.classList.add('is-in');
      io.unobserve(el);
    }
    window.removeEventListener('scroll', flush);
  };
  window.addEventListener('scroll', flush, { passive: true });
  window.addEventListener('load', flush);
};

/* --------------------------------------------------------------------------
   4 · The sticky call bar
   On a phone, once the hero and its two buttons have scrolled away. Hidden
   again at the closing band, which carries the same two actions full size.
   -------------------------------------------------------------------------- */
const setupStickyCta = () => {
  const bar = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const closing = document.getElementById('contact');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  let pastHero = false;
  let atClosing = false;
  const paint = () => { bar.dataset.shown = String(pastHero && !atClosing); };

  new IntersectionObserver(([e]) => {
    pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    paint();
  }).observe(hero);

  if (closing) {
    new IntersectionObserver(([e]) => {
      atClosing = e.isIntersecting;
      paint();
    }).observe(closing);
  }
};

/* --------------------------------------------------------------------------
   5 · Accordions — the FAQ opens softly
   <details> opens in one frame: the answer appears and everything under it
   jumps. Here the row's height eases between closed and open, the answer
   fades in a beat behind it, and the chevron turns as the move starts, not
   when it ends. The script keeps the one-open-at-a-time rule that `name`
   gave, because the browser's own version would shut the other row in one
   frame and cut its animation short. Without the script, or under reduced
   motion, the native toggle is left alone.
   -------------------------------------------------------------------------- */
const setupAccordions = () => {
  const EASE = 'cubic-bezier(.4, 0, .2, 1)';   // eases in and out: no snap at the start
  const OPEN_MS = 560;
  const CLOSE_MS = 440;

  const move = (d, open) => {
    const summary = d.querySelector('summary');
    // Measure before cancelling, so a click mid-move reverses from where
    // the row is rather than from where it was headed.
    const from = d.getBoundingClientRect().height;
    if (d._anim) d._anim.cancel();
    d.classList.toggle('is-closing', !open);
    if (open) d.open = true;
    const to = open
      ? d.getBoundingClientRect().height
      : summary.getBoundingClientRect().height + (d.offsetHeight - d.clientHeight);
    d.style.overflow = 'hidden';
    const anim = d.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: open ? OPEN_MS : CLOSE_MS, easing: EASE }
    );
    d._anim = anim;
    if (open) {
      [...d.children].filter((el) => el !== summary).forEach((el) => el.animate(
        [{ opacity: 0, transform: 'translateY(-.5rem)' }, { opacity: 1, transform: 'none' }],
        { duration: OPEN_MS - 80, delay: 80, easing: EASE, fill: 'backwards' }
      ));
    }
    const done = () => {
      if (!open) d.open = false;
      d.classList.remove('is-closing');
      d.style.overflow = '';
      d._anim = null;
    };
    anim.onfinish = done;
    anim.oncancel = () => { d.style.overflow = ''; };
  };

  document.querySelectorAll('.faq').forEach((group) => {
    const items = [...group.querySelectorAll(':scope > details')];
    items.forEach((d) => {
      const exclusive = d.hasAttribute('name');
      d.removeAttribute('name');
      d.querySelector('summary').addEventListener('click', (e) => {
        if (reduced.matches) {
          if (exclusive && !d.open) items.forEach((o) => { if (o !== d) o.open = false; });
          return;
        }
        e.preventDefault();
        const opening = !d.open || d.classList.contains('is-closing');
        move(d, opening);
        if (opening && exclusive) {
          items.forEach((o) => { if (o !== d && o.open && !o.classList.contains('is-closing')) move(o, false); });
        }
      });
    });
  });
};

setupMenu();
setupScroll();
setupReveals();
setupStickyCta();
setupAccordions();
