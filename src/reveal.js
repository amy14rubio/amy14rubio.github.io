// generic entrance-reveal system for elements marked [data-reveal]. The CSS
// side defines the opacity/transform states; this just decides *when* to
// flip the .is-revealed class — immediately for data-reveal="load" (always
// above the fold, e.g. the header), or once each element scrolls into view.
export function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const reveal = (el) => {
    el.classList.add('is-revealed');

    const clearDelay = () => {
      el.style.transitionDelay = '';
      el.removeEventListener('transitionend', clearDelay);
    };
    el.addEventListener('transitionend', clearDelay);
  };

  const loadTargets = [];
  const scrollTargets = [];

  targets.forEach((el) => {
    if (el.dataset.reveal === 'load') loadTargets.push(el);
    else scrollTargets.push(el);
  });

  // double rAF: ensures the initial (opacity:0) state has actually painted
  // before flipping the class, so the browser doesn't coalesce both states
  // into a single frame and skip the transition entirely
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loadTargets.forEach(reveal);
    });
  });

  if (scrollTargets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 },
  );

  scrollTargets.forEach((el) => observer.observe(el));
}
