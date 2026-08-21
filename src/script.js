import { animate, stagger, splitText, onScroll } from 'animejs';
import { initScrollReveal } from './reveal.js';
import { initCustomCursor } from './cursor.js';

initScrollReveal();
initCustomCursor();

const nav = document.querySelector('.nav');
const bg = document.querySelector('.nav-bg');
const links = nav.querySelectorAll('a');
const home = document.getElementById('home');
const about = document.getElementById('about');
const work = document.getElementById('work');
const contact = document.getElementById('contact');
const header = document.querySelector('header');
const title = document.querySelectorAll('.title');
const heroEl = document.getElementById('hero');
const taglineGroup = document.getElementById('tagline-group');
const body = document.body;
const toggle = document.getElementById('dark-mode');
const icon = document.querySelector('img');
const isDarkMode = () => body.classList.contains('dark-mode');
let lastScrollY = window.scrollY;
let isNavHovered = false;

//initializes nav-bg
bg.style.width = `${links[0].offsetWidth}px`;

// controls nav-bg position as user scrolls through content
const updateNavBg = () => {
  let currentScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
  const sections = [home, about, work, contact];

  let scrollIndex = sections.findIndex(
    (section, i) =>
      currentScrollPosition >= section.offsetTop - 100 &&
      (!sections[i + 1] || currentScrollPosition < sections[i + 1].offsetTop - 100),
  );

  if (scrollIndex === -1) scrollIndex = 0;

  bg.style.width = `${links[scrollIndex].offsetWidth}px`;
  bg.style.transform = `translateX(${links[scrollIndex].offsetLeft}px)`;
};

window.addEventListener('scroll', () => {
  // hides header on scroll
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    header.classList.add('is-hidden');
  } else {
    header.classList.remove('is-hidden');
  }

  lastScrollY = currentScrollY;

  if (isNavHovered) return;

  updateNavBg();
});

//controls nav-bg hover behavior
links.forEach((link) => {
  link.addEventListener('mouseenter', () => {
    isNavHovered = true;
    bg.style.width = `${link.offsetWidth}px`;
    bg.style.transform = `translateX(${link.offsetLeft}px)`;
  });

  link.addEventListener('mouseleave', () => {
    isNavHovered = false;
    updateNavBg();
  });
});

//toggle dark mode and light mode
// the inline anti-flash script in index.html may have already added
// dark-mode before this module loaded (system preference or a saved
// choice) — sync the icon to whatever theme actually ended up applied
if (isDarkMode()) {
  icon.src = '/assets/light-mode.svg';
  icon.alt = 'light mode icon';
}

toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode() ? 'dark' : 'light');

  if (isDarkMode()) {
    icon.src = '/assets/light-mode.svg';
    icon.alt = 'light mode icon';
  } else {
    icon.src = '/assets/dark-mode.svg';
    icon.alt = 'dark mode icon';
  }
});

// hero intro: letters cascade in on load (plays once, at the start only)
// splitText recursively processes a container's descendants, so splitting
// #hero directly covers the h4/h1/h3 inside it in one call
const heroChars = splitText(heroEl, { chars: { wrap: false } }).chars;

heroChars.forEach((char) => {
  char.style.opacity = '0';
  char.style.transform = 'translateY(20px)';
});

heroEl.style.opacity = 1;

animate(heroChars, {
  translateY: [20, 0],
  opacity: [0, 1],
  duration: 600,
  ease: 'outExpo',
  delay: stagger(20),
});

// tagline: reveal one line at a time, letter by letter within each line,
// scrubbed directly to scroll position — scrolling down plays it forward,
// scrolling up rewinds it. Masking at the line level (one clip box per
// whole phrase, not per word/letter) avoids clipping the slanted, connecting
// strokes of adjacent characters — Shrikhand's letterforms lean into each
// other enough that even a word-level mask cut into them at the edges.
//
// splitText's own `lines` option always defers the actual split to
// doc.fonts.ready.then(...) internally, even if fonts are already loaded
// (its readiness flag starts false unconditionally) — reading .chars right
// after calling it grabs the pre-split (empty) array, one microtask too
// early, silently orphaning the whole animation. So the line-level mask is
// built by hand here instead: split for chars only (fully synchronous,
// same as the hero/signoff), then wrap everything but the accessibility
// clone in one clip span ourselves.
const LINE_STAGGER = 750;
const CHAR_STAGGER = 55;

const taglineCharDelays = new Map();
const taglineChars = [];

document.querySelectorAll('#tagline-group > p.tagline').forEach((line, lineIndex) => {
  const chars = splitText(line, { chars: { wrap: false } }).chars;

  const lineMask = document.createElement('span');
  lineMask.style.overflow = 'clip';
  lineMask.style.display = 'block';
  while (line.childNodes.length > 1) {
    lineMask.appendChild(line.childNodes[1]);
  }
  line.appendChild(lineMask);

  chars.forEach((char, charIndex) => {
    taglineCharDelays.set(char, lineIndex * LINE_STAGGER + charIndex * CHAR_STAGGER);
    taglineChars.push(char);
  });
});

taglineGroup.style.opacity = 1;

animate(taglineChars, {
  translateY: ['160%', '0%'],
  opacity: [0, 1],
  duration: 1100,
  ease: 'outExpo',
  delay: (el) => taglineCharDelays.get(el),
  autoplay: onScroll({
    target: taglineGroup,
    enter: 'center -15%',
    leave: 'center 50%',
    sync: true,
  }),
});

// footer signoff: characters are always visible (no fade/mask), they just glide
// horizontally into their resting position as you scroll — alternating per line,
// odd lines slide in from the left, even lines from the right
const SIGNOFF_LINE_STAGGER = 700;
const SIGNOFF_CHAR_STAGGER = 40;
const SIGNOFF_OFFSET = 60;

const signoffLines = document.getElementById('signoff-lines');
const footerSignoff = document.getElementById('footer-signoff');
const signoffCharDelays = new Map();
const signoffCharOffsets = new Map();
const signoffChars = [];

document.querySelectorAll('#signoff-lines > p.signoff-line').forEach((line, lineIndex) => {
  const chars = splitText(line, { chars: { wrap: false } }).chars;
  const fromLeft = lineIndex % 2 === 0;

  chars.forEach((char, charIndex) => {
    signoffCharDelays.set(
      char,
      lineIndex * SIGNOFF_LINE_STAGGER + charIndex * SIGNOFF_CHAR_STAGGER,
    );
    signoffCharOffsets.set(char, fromLeft ? -SIGNOFF_OFFSET : SIGNOFF_OFFSET);
    signoffChars.push(char);
  });
});

// "enter"/"leave" mark a point on the FOOTER (the number) aligning with the
// viewport's center — e.g. "center 50%" = the footer's own vertical center
// reaching the middle of the screen. On mobile the footer takes up a much
// bigger share of the (shorter) viewport, so the page often runs out of
// scroll room before that point is reachable at all — freezing the scrub
// partway, with some characters never reaching their resting position.
// tablet/desktop keep the exact original markers; mobile targets points
// much closer to the footer's own top edge instead, which are guaranteed to
// scroll into alignment well before the page ends, while keeping the same
// scrub distance (208px) so it still feels like a real scrub, not a snap
const isMobile = !window.matchMedia('(min-width: 768px)').matches;

animate(signoffChars, {
  translateX: (el) => [signoffCharOffsets.get(el), 0],
  duration: 1500,
  ease: 'outExpo',
  delay: (el) => signoffCharDelays.get(el),
  autoplay: onScroll({
    target: footerSignoff,
    enter: isMobile ? 'center -40%' : 'center -15%',
    leave: isMobile ? 'center 10%' : 'center 50%',
    sync: true,
  }),
});

// work card image carousels: crossfade through every image in a card,
// however many there are (a pure-CSS animation can only alternate 2 cleanly)
document.querySelectorAll('.card-carousel').forEach((carousel) => {
  const imgs = carousel.querySelectorAll('img');
  if (imgs.length < 2) return;

  let current = 0;
  let intervalId = null;

  const advance = () => {
    const next = (current + 1) % imgs.length;
    imgs[current].style.opacity = 0;
    imgs[next].style.opacity = 1;
    current = next;
  };

  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(advance, 4000);
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = null;
  };

  start();

  const media = carousel.closest('.card-media');
  media.addEventListener('mouseenter', stop);
  media.addEventListener('mouseleave', start);
});

//main title shadow effect — skipped on touch/mobile, which get a static
//text-shadow from CSS instead (see .title in style.css)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  home.addEventListener('mousemove', (event) => {
    title.forEach((el) => {
      const rect = el.getBoundingClientRect();

      //calculates text center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      //tighten or loosen cursor offset
      const offsetX = (centerX - event.pageX) / 43000;
      const offsetY = (centerY - event.pageY) / 100000;

      el.style.textShadow = `
        ${-offsetX.toFixed(3) * 0.5}em ${-offsetY.toFixed(3) * 0.5}em 0 white,
        ${offsetX.toFixed(4)}em ${offsetY.toFixed(4)}em 0 rgba(93,93,93, 0.5),
        ${offsetX.toFixed(4) * 2}em ${offsetY.toFixed(4) * 2}em 0 rgba(93,93,93, 0.4),
        ${offsetX.toFixed(4) * 3}em ${offsetY.toFixed(4) * 3}em 0 rgba(93,93,93, 0.3),
        ${offsetX.toFixed(4) * 4}em ${offsetY.toFixed(4) * 4}em 0 rgba(93,93,93, 0.2)
      `;
      el.style.webkitTextStroke = `
          0.1px var(--accent-color)
        `;

      if (isDarkMode()) {
        el.style.textShadow = `
        ${offsetX.toFixed(4) * 0.8}em ${-offsetY.toFixed(4) * 0.8}em 0 rgba(255, 247, 8, 1),
          ${offsetX.toFixed(4) * 3}em ${offsetY.toFixed(4) * 3}em 0 rgba(255, 25, 60, 0.9),
          ${-offsetX.toFixed(4) * 3}em ${-offsetY.toFixed(4) * 3}em 0 rgba(30, 225, 255, 0.9)
        `;
        el.style.webkitTextStroke = `
          5px  var(--bg-white-color)
        `;
      }
    });
  });
}

// email link
const user = 'amyruth.rubio';
const domain = 'gmail.com';
const email = user + '@' + domain;

const link = document.getElementById('email-link');
link.href = 'mailto:' + email;
