// custom cursor: a small glowing "light source" that follows the mouse with
// a bit of organic lag, and morphs into a contextual CTA pill when hovering
// a genuinely interactive element (links/buttons only — never decorative or
// static content). Disabled entirely on touch devices and for users who've
// asked the OS for reduced motion.
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
  const SPEED_MULTIPLIER = 0.04;

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
    x += (mouseX - x) * 0.18;
    y += (mouseY - y) * 0.18;

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
    if (el.id === 'dark-mode') return 'Toggle theme';

    if (el.closest('.card-links')) {
      const alt = el.querySelector('img')?.alt || '';
      if (/github/i.test(alt)) return 'Code';
      if (/demo user/i.test(alt)) return 'Demo user';
      if (/demo organization/i.test(alt)) return 'Demo organization';
      if (/demo/i.test(alt)) return 'Demo';
      return 'Live';
    }

    if (el.closest('#find-me-info')) {
      return /github\.com/.test(el.href) ? 'Github' : 'Connect!';
    }

    if (el.tagName === 'BUTTON' && el.type === 'submit') return "Let's go!";

    if (el.target === '_blank') return 'Visit';

    return 'Click me!';
  };

  document.querySelectorAll('a, button').forEach((el) => {
    // nav links and the header logo already communicate interactivity on
    // their own (sliding pill, italic script) — skip the CTA morph there
    if (el.closest('nav') || el.closest('header h1')) return;

    el.addEventListener('mouseenter', (event) => {
      label.textContent = resolveLabel(el);
      cursor.classList.add('is-cta');
      // pill's max-width is 200px — flip it to grow leftward instead of
      // clipping off-screen when the cursor is close to the right edge
      const nearRightEdge = window.innerWidth - event.clientX < 200;
      cursor.classList.toggle('is-cta-flip', nearRightEdge);
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-cta');
    });
  });
}
