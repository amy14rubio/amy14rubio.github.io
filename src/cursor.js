// custom cursor: a small glowing "light source" that follows the mouse with
// a bit of organic lag, and morphs into a contextual CTA pill when hovering
// a genuinely interactive element (links/buttons only — never decorative or
// static content). While hovering one of those elements, the cursor is also
// magnetically drawn toward its center — the element itself never moves,
// only the cursor's own tracked position bends toward it.
// Disabled entirely on touch devices and for users who've asked the OS for
// reduced motion.
export function initCustomCursor() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (prefersReducedMotion || !hasFinePointer) return;

  const cursor = document.createElement('div');
  cursor.id = 'cursor-light';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML =
    '<span class="cursor-dot"></span><span class="cursor-core"><span class="cursor-label"></span></span>';
  document.body.appendChild(cursor);

  const dot = cursor.querySelector('.cursor-dot');
  const label = cursor.querySelector('.cursor-label');

  document.documentElement.classList.add('custom-cursor-active');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX;
  let y = mouseY;
  let prevX = x;
  let prevY = y;
  let hasMoved = false;

  // squash-and-stretch feel: velocity is derived from the *lerped* position
  // (not the raw mouse delta), so it's naturally smoothed the same way the
  // position itself is — fast, direct swipes stretch the dot along the
  // direction of travel; it relaxes back to a circle as it settles.
  const STRETCH_MAX_X = 0.5;
  const SQUASH_MAX_Y = 0.35;
  const SPEED_MULTIPLIER = 0.08;
  // how much of the remaining distance to the real pointer position the dot
  // closes each frame — higher is snappier/less lag, 1 means no lag at all
  const LERP_FACTOR = 0.2;
  // how strongly the cursor bends toward a hovered element's center instead
  // of the raw pointer position — 0 disables the pull, 1 snaps dead-center
  const MAGNETIC_FACTOR = 0.6;
  // magnetism only ever targets small, button-sized elements (below) —
  // pulling toward a large element's center (e.g. a whole nav link's hit
  // area or the tall tech-category panels) can drag the dot far from
  // wherever you're actually pointing inside it, which reads as the cursor
  // "overshooting" rather than feeling controlled

  let magneticTargetEl = null;

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!hasMoved) {
      hasMoved = true;
      x = mouseX;
      y = mouseY;
      cursor.style.opacity = 1;
    }
  });

  // mouseout with no relatedTarget means the pointer left the window entirely
  document.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) {
      cursor.style.opacity = 0;
      hasMoved = false;
    }
  });

  window.addEventListener('mousedown', () => cursor.classList.add('is-pressed'));
  window.addEventListener('mouseup', () => cursor.classList.remove('is-pressed'));

  const render = () => {
    let targetX = mouseX;
    let targetY = mouseY;

    if (magneticTargetEl) {
      const rect = magneticTargetEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = mouseX + (centerX - mouseX) * MAGNETIC_FACTOR;
      targetY = mouseY + (centerY - mouseY) * MAGNETIC_FACTOR;
    }

    x += (targetX - x) * LERP_FACTOR;
    y += (targetY - y) * LERP_FACTOR;

    const dx = x - prevX;
    const dy = y - prevY;
    prevX = x;
    prevY = y;

    const speed = Math.sqrt(dx * dx + dy * dy) * SPEED_MULTIPLIER;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const scaleX = 1 + Math.min(speed, STRETCH_MAX_X);
    const scaleY = 1 - Math.min(speed, SQUASH_MAX_Y);

    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    dot.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);

  const resolveLabel = (el) => {
    if (el.id === 'email-link') return 'Say hello!';
    if (el.id === 'dark-mode') {
      return document.body.classList.contains('dark-mode')
        ? 'Joining the light side?'
        : 'Joining the dark side?';
    }

    if (el.closest('.card-links')) {
      const alt = el.querySelector('img')?.alt || '';
      if (/github/i.test(alt)) return 'See my code!';
      if (/demo user/i.test(alt)) return 'Try the user demo!';
      if (/demo organization/i.test(alt)) return 'Try the organization demo!';
      if (/demo/i.test(alt)) return 'Watch the demo!';
      return 'See it live!';
    }

    if (el.closest('#find-me-info')) {
      return /github\.com/.test(el.href) ? "See what I'm building!" : "Let's Connect!";
    }

    if (el.tagName === 'BUTTON' && el.type === 'submit') return "Let's go!";

    if (el.id === 'about-toggle-title') {
      return el.getAttribute('aria-pressed') === 'true' ? 'Back to About!' : 'See my hobbies!';
    }

    if (el.target === '_blank') return 'Check it out!';

    return 'Click me!';
  };

  // shared by both the link/button CTA pill and the hobbies-cell captions
  // below — `autoHideMs`, if given, hides the pill after that long even if
  // still hovering (a timed caption rather than a persistent CTA)
  function attachCtaHover(el, getLabel, { autoHideMs, magnetic = true } = {}) {
    let autoHideTimeoutId = null;

    el.addEventListener('mouseenter', (event) => {
      label.textContent = getLabel(el);
      cursor.classList.add('is-cta');
      if (magnetic) magneticTargetEl = el;
      // pill's max-width is 200px — flip it to grow leftward instead of
      // clipping off-screen when the cursor is close to the right edge
      const nearRightEdge = window.innerWidth - event.clientX < 200;
      cursor.classList.toggle('is-cta-flip', nearRightEdge);

      if (autoHideMs) {
        clearTimeout(autoHideTimeoutId);
        autoHideTimeoutId = setTimeout(() => {
          cursor.classList.remove('is-cta');
          if (magneticTargetEl === el) magneticTargetEl = null;
        }, autoHideMs);
      }
    });

    el.addEventListener('mouseleave', () => {
      clearTimeout(autoHideTimeoutId);
      cursor.classList.remove('is-cta');
      if (magneticTargetEl === el) magneticTargetEl = null;
    });
  }

  document.querySelectorAll('a, button, #about-toggle-title').forEach((el) => {
    // nav links and the header logo already communicate interactivity on
    // their own (sliding pill, italic script) — skip the CTA morph there
    if (el.closest('nav') || el.closest('header h1')) return;

    // script.js strips role/tabindex from the About title when the
    // toggle's disabled (mobile viewport) — don't show a CTA pill for a
    // click that no longer does anything
    if (el.id === 'about-toggle-title' && !el.hasAttribute('role')) return;

    // common playback icons (play/pause, prev, next) — the user already
    // knows these are clickable, so skip the CTA morph entirely
    if (el.classList.contains('cursor-skip')) return;

    attachCtaHover(el, resolveLabel);
  });

  // hobbies-grid cells: a descriptive caption (not an action prompt) that
  // shows for a fixed 3s on hover, then disappears even if still hovering
  // — covers the cell whether its reveal overlay is still showing or the
  // content underneath has already been revealed
  const HOBBIES_CAPTIONS = {
    photography: 'Edited in Lightroom!',
    'graphic-designs-cell': "A few designs I've made",
    'video-editing-cell': 'Lost in edit',
    'anime-picks': 'Highly recommend!',
    'music-player': '•*¨*•.¸¸♬︎',
  };

  Object.keys(HOBBIES_CAPTIONS).forEach((cellId) => {
    const cell = document.getElementById(cellId);
    if (!cell) return;
    attachCtaHover(cell, () => HOBBIES_CAPTIONS[cellId], {
      autoHideMs: 3000,
      // the magnetic pull toward this cell's center fights with actually
      // landing clicks on the small play/pause/prev/next buttons inside it
      magnetic: cellId !== 'music-player',
    });
  });
}
