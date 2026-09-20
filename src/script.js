import { animate, stagger, splitText, onScroll } from 'animejs';
import { initScrollReveal } from './reveal.js';
import { initCustomCursor } from './cursor.js';
import Masonry from 'masonry-layout';

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
  icon.src = '/assets/icons/light-mode.svg';
  icon.alt = 'Light mode icon';
}

toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode() ? 'dark' : 'light');

  if (isDarkMode()) {
    icon.src = '/assets/icons/light-mode.svg';
    icon.alt = 'Light mode icon';
  } else {
    icon.src = '/assets/icons/dark-mode.svg';
    icon.alt = 'Dark mode icon';
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
  //shared by the mousemove handler and the dark-mode toggle: pulled out so
  //toggling the theme can recompute the shadow immediately using the last
  //known pointer position, instead of leaving the previous theme's colors
  //on screen until the pointer happens to move again
  let lastPageX = window.innerWidth / 2;
  let lastPageY = window.innerHeight / 2;

  const updateTitleShadow = () => {
    title.forEach((el) => {
      const rect = el.getBoundingClientRect();

      //calculates text center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      //tighten or loosen cursor offset
      const offsetX = (centerX - lastPageX) / 43000;
      const offsetY = (centerY - lastPageY) / 100000;

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
  };

  home.addEventListener('mousemove', (event) => {
    lastPageX = event.pageX;
    lastPageY = event.pageY;
    updateTitleShadow();
  });

  toggle.addEventListener('click', updateTitleShadow);
}

// email link
const user = 'amyruth.rubio';
const domain = 'gmail.com';
const email = user + '@' + domain;

const link = document.getElementById('email-link');
link.href = 'mailto:' + email;

const grid = document.querySelector('.grid');
const masonry = new Masonry(grid, {
  itemSelector: '.grid-item',
  columnWidth: '.grid-sizer',
  percentPosition: true,
});

// ── About title idle "disperse" hint ────────────────────────────
// before the user has ever clicked the About title, its letters
// periodically drift apart (to a per-letter offset) and settle back, as a
// hint that the title is interactive. Hovering while dispersed closes it
// early; clicking the title stops the idle cycle for good (see the "stop"
// call from initAboutHobbiesToggle's toggle() below).
const DISPERSE_TRANSFORMS = [
  { y: 0.01, rot: -2 },
  { y: -0.1, rot: -1 },
  { y: 0.05, rot: 2 },
  { y: -0.05, rot: -2 },
  { y: 0.1, rot: 2 },
  { y: -0.1, rot: 1 },
  { y: 0.05, rot: -1 },
];

// how far apart adjacent letters end up, in em — unlike y/rotation (hand-
// picked per letter above for character), x is derived from each letter's
// position so the horizontal gaps stay even regardless of word length
const DISPERSE_SPACING_EM = 0.2;

function wrapTitleChars(el, text) {
  el.textContent = '';
  const chars = text.split('');
  chars.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'disperse-char';
    const t = DISPERSE_TRANSFORMS[i % DISPERSE_TRANSFORMS.length];
    const dx = i * DISPERSE_SPACING_EM;
    span.style.setProperty('--dx', `${dx}em`);
    span.style.setProperty('--dy', `${t.y}em`);
    span.style.setProperty('--drot', `${t.rot}deg`);
    span.textContent = char;
    el.appendChild(span);
  });
}

// the hobbies grid isn't meant to be reachable on mobile (see
// initAboutHobbiesToggle below) — matches the site's own tablet breakpoint
// (`@media (min-width: 768px)` in style.css)
const IS_MOBILE_VIEWPORT = window.matchMedia('(max-width: 767px)').matches;

function initAboutTitleDisperse() {
  const about = document.getElementById('about');
  const title = document.getElementById('about-toggle-title');
  if (!about || !title) return { stop() {} };

  // no interactivity to hint at on mobile — leave the plain heading alone
  if (IS_MOBILE_VIEWPORT) return { stop() {} };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { stop() {} };
  }

  const INTERVAL_MS = 3000;
  const DISPERSED_MS = 5000;
  let idleEnabled = true;
  let timeoutId = null;

  wrapTitleChars(title, title.textContent.trim());

  function scheduleCycle() {
    if (!idleEnabled) return;
    timeoutId = setTimeout(() => {
      if (!idleEnabled) return;
      title.classList.add('is-dispersed');
      timeoutId = setTimeout(() => {
        if (!idleEnabled) return;
        title.classList.remove('is-dispersed');
        scheduleCycle();
      }, DISPERSED_MS);
    }, INTERVAL_MS);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        scheduleCycle();
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.3 },
  );
  observer.observe(about);

  title.addEventListener('mouseenter', () => {
    if (title.classList.contains('is-dispersed')) {
      title.classList.remove('is-dispersed');
    }
  });

  return {
    stop() {
      idleEnabled = false;
      clearTimeout(timeoutId);
      title.classList.remove('is-dispersed');
    },
  };
}

const titleDisperse = initAboutTitleDisperse();

// ── About / Hobbies toggle ─────────────────────────────────────
// clicking the "About" title swaps the about-text/tech-stack panel for the
// hobbies grid in the same spot. display can't be transitioned, so the
// swap happens at the invisible midpoint of a fade-out/fade-in.
function initAboutHobbiesToggle() {
  const about = document.getElementById('about');
  const title = document.getElementById('about-toggle-title');
  if (!about || !title) return;

  // the hobbies grid (photo/video/etc. cells) isn't meant to be reachable
  // on mobile — leave the title as a plain, non-interactive heading there
  // instead of wiring up a toggle that can never be reached any other way
  if (IS_MOBILE_VIEWPORT) {
    title.removeAttribute('role');
    title.removeAttribute('tabindex');
    title.removeAttribute('aria-pressed');
    return;
  }

  const FADE_MS = 350;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isHobbiesView = false;
  let isAnimating = false;

  function toggle() {
    if (isAnimating) return;
    isAnimating = true;
    titleDisperse.stop();
    about.classList.add('is-fading');

    setTimeout(() => {
      isHobbiesView = !isHobbiesView;
      title.textContent = isHobbiesView ? 'Hobbies' : 'About';
      title.setAttribute('aria-pressed', String(isHobbiesView));
      about.classList.toggle('is-hobbies-view', isHobbiesView);
      if (isHobbiesView) {
        // the hobbies grid was hidden (display: none) the first time
        // Masonry measured it, so its layout needs recomputing now that it
        // has a real width to lay items out against
        masonry.layout();
        // autoplay videos parsed while their ancestor was display:none
        // don't reliably start on their own once revealed — nudge them
        document
          .querySelectorAll('#hidden-about-me video[autoplay]')
          .forEach((video) => video.play().catch(() => {}));
        // fresh reveal each time Hobbies view is opened
        document
          .querySelectorAll('#hobbies-grid .cell-overlay')
          .forEach((overlay) => overlay.classList.remove('is-revealed'));
        // the reel's title-overflow check may have run while #video-cell
        // was still hidden — now that it's visible, remeasure
        showReelPlayer.remeasureTitle();
      } else {
        // no need to keep decoding/playing video that isn't visible
        document.querySelectorAll('#hidden-about-me video').forEach((video) => video.pause());
      }

      // the panel swap changes #about's height, which can leave the section
      // scrolled too high or too low to comfortably see — re-center it on
      // whichever content just came in
      about.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });

      requestAnimationFrame(() => {
        about.classList.remove('is-fading');
        isAnimating = false;
      });
    }, FADE_MS);
  }

  title.addEventListener('click', toggle);
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
}

initAboutHobbiesToggle();

// ── Hobbies-grid cell overlays ───────────────────────────────────
// each hobbies-grid cell starts covered by a labeled overlay; clicking (or
// pressing Enter/Space on) it slides the overlay away in its own direction
// to reveal the cell's content. Reset each time Hobbies view opens (see
// initAboutHobbiesToggle).
function initCellOverlays() {
  document.querySelectorAll('#hobbies-grid .cell-overlay').forEach((overlay) => {
    const isReelCell = overlay.closest('.grid-item').id === 'video-cell';
    const reveal = () => {
      overlay.classList.add('is-revealed');
      if (isReelCell) showReelPlayer.playFirstTrack();
    };
    overlay.addEventListener('click', reveal);
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        reveal();
      }
    });
  });
}

initCellOverlays();

// ── Image Carousels (graphic designs, photo gallery) ─────────
// same behavior for both: crossfade through every slide, one at a time,
// pausing while the cell is pressed/touched. Slides are queried from
// *within* cellId specifically (not document-wide) so each cell keeps its
// own independent current-slide/pause state, even though both use this
// same function.
function initImageCarousel(cellId, slideClass) {
  const cell = document.getElementById(cellId);
  const slides = cell ? cell.querySelectorAll(`.${slideClass}`) : [];
  if (!cell || !slides.length) return;

  let current = 0;
  let paused = false;

  function advance() {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }

  setInterval(() => {
    if (!paused) advance();
  }, 5000);

  cell.addEventListener('mousedown', () => {
    paused = true;
  });
  cell.addEventListener(
    'touchstart',
    () => {
      paused = true;
    },
    { passive: true },
  );
  document.addEventListener('mouseup', () => {
    paused = false;
  });
  document.addEventListener('touchend', () => {
    paused = false;
  });
}

initImageCarousel('graphic-designs-cell', 'designs-slide');
initImageCarousel('cell-items', 'pictures-slide');

// ── Marquee press-to-pause (video editing, favorite shows) ───────
// these two marquees pause on press-and-hold instead of hover, matching
// the photo/graphic-design carousels above — mousedown/touchstart to
// pause, mouseup/touchend anywhere on the page to resume (so releasing
// still works even if the pointer drags off the cell first)
function initMarqueePressPause(cellId) {
  const container = document.querySelector(`#${cellId} .marquee-container`);
  if (!container) return;

  const setPressed = (pressed) => container.classList.toggle('is-pressed', pressed);

  container.addEventListener('mousedown', () => setPressed(true));
  container.addEventListener('touchstart', () => setPressed(true), { passive: true });
  document.addEventListener('mouseup', () => setPressed(false));
  document.addEventListener('touchend', () => setPressed(false));
}

initMarqueePressPause('video-editing-cell');
initMarqueePressPause('fav-shows-cell');

// ── Video Show Reel Player (YouTube IFrame API) ──────────────
const showReelPlayer = (function initShowReelPlayer() {
  const PLAYLIST_ID = 'PLkIkhBY7AJp9S-9rwPhwH27q_anVDpcrt';

  const reelBg = document.getElementById('reel-bg');
  const reelThumb = document.getElementById('reel-thumb');
  const reelTitle = document.getElementById('reel-title');
  const reelTitleText = document.getElementById('reel-title-text');
  const reelTitleTextDup = document.getElementById('reel-title-text-dup');
  const reelSubtitle = document.getElementById('reel-subtitle');
  const reelPlayBtn = document.getElementById('reel-play');
  const reelPrevBtn = document.getElementById('reel-prev');
  const reelNextBtn = document.getElementById('reel-next');
  const reelProgressTrack = document.getElementById('reel-progress-track');
  const reelProgressFill = document.getElementById('reel-progress-fill');
  const reelProgressHandle = document.getElementById('reel-progress-handle');
  const reelTime = document.getElementById('reel-time');

  let player = null;
  let isPlaying = false;
  let isSeeking = false;
  // the player loads asynchronously (YouTube iframe API script fetch +
  // init) — clicking the reel's cell overlay before that's ready just
  // queues the play instead of silently doing nothing
  let playRequested = false;
  // YouTube re-fires a PLAYING state change after a seek even though it's
  // the same video (it briefly buffers, then resumes) — tracking the last
  // title lets updateTrackTitle tell "still the same track" apart from
  // "actually changed tracks", so seeking doesn't restart the marquee
  let lastMarqueeTitle = null;

  function cleanTitle(raw) {
    return raw
      .replace(/\s*[\(\[](official |lyric )?(audio|video|lyric video|mv)[\)\]]/gi, '')
      .trim();
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // slow, constant reading pace regardless of title length — a fixed
  // duration would make long titles race by and short ones crawl
  const MARQUEE_SPEED_PX_PER_SEC = 22;
  // how long it holds still once fully scrolled, before looping again
  const MARQUEE_PAUSE_SECONDS = 1.5;

  // the pause above is a fixed number of seconds, but the scroll portion's
  // duration depends on the title's width — so the pause's *share* of the
  // total loop differs per title, which means the keyframe percentage
  // marking "done scrolling, start of the pause" differs per title too.
  // Keyframe percentages can't reference a custom property, so this
  // generates a fresh @keyframes rule for each title instead of relying on
  // one static rule in style.css.
  let marqueeStyleEl = null;

  // only marquee-scrolls titles that actually don't fit — measuring
  // requires a layout pass, so this drops the marquee first (in case a
  // previous, longer title left it running) and re-measures on the next
  // frame
  function applyTitleMarquee() {
    reelTitle.classList.remove('is-marquee');
    reelTitle.style.removeProperty('--marquee-duration');
    if (marqueeStyleEl) {
      marqueeStyleEl.remove();
      marqueeStyleEl = null;
    }

    requestAnimationFrame(() => {
      const overflow = reelTitleText.scrollWidth - reelTitle.clientWidth;
      if (overflow > 2) {
        // the loop distance is one full copy's width *plus* the gap before
        // its duplicate — that's what makes the duplicate land exactly
        // where the original started, for a seamless repeat
        const gap = parseFloat(getComputedStyle(reelTitleTextDup).paddingLeft) || 0;
        const singleWidth = reelTitleText.getBoundingClientRect().width + gap;
        const scrollSeconds = singleWidth / MARQUEE_SPEED_PX_PER_SEC;
        const totalSeconds = scrollSeconds + MARQUEE_PAUSE_SECONDS;
        const scrollEndPercent = (scrollSeconds / totalSeconds) * 100;

        marqueeStyleEl = document.createElement('style');
        marqueeStyleEl.textContent = `
          @keyframes reel-title-loop-dynamic {
            /* a timing-function set on a keyframe governs the segment
               FROM that keyframe to the next one — ease-in-out here
               means the scroll eases out of the pause as it starts and
               eases into the next pause as it finishes. The hold segment
               after it (scrollEndPercent -> 100%) doesn't move, so its
               own timing-function has nothing to visibly affect. */
            0% { transform: translateX(0); animation-timing-function: ease-in-out; }
            ${scrollEndPercent}% { transform: translateX(-${singleWidth}px); }
            100% { transform: translateX(-${singleWidth}px); }
          }
        `;
        document.head.appendChild(marqueeStyleEl);

        reelTitle.style.setProperty('--marquee-duration', `${totalSeconds}s`);
        reelTitle.classList.add('is-marquee');
      }
    });
  }

  // decides whether or not song is playing
  // save to localStorage??
  function setPlayingState(playing) {
    isPlaying = playing;
    // reel-play has no inner icon — its play/pause shape is a CSS mask cut
    // out of the button itself (see .reel-btn--play in style.css)
    reelPlayBtn.classList.toggle('is-playing', playing);
    reelPlayBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  // controls displayed title
  function updateTrackTitle() {
    if (!player) return;
    const data = player.getVideoData();
    if (data && data.title) {
      const clean = cleanTitle(data.title);
      // seeking re-fires this for the *same* video, and re-running the
      // marquee setup below would restart it from the beginning — only do
      // that when the track has actually changed
      if (clean !== lastMarqueeTitle) {
        lastMarqueeTitle = clean;
        reelTitleText.textContent = clean;
        reelTitleTextDup.textContent = clean;
        applyTitleMarquee();
      }
    }
    // auto-generated "topic" channels (YouTube's own catalog uploads, not
    // an actual uploader) tack on a "- Topic" suffix that's just noise here
    if (data && data.author) {
      reelSubtitle.textContent = data.author.replace(/\s*-\s*Topic$/i, '');
    }
  }

  // gets yt thumbnail
  function updateAlbumArt() {
    if (!player) return;
    const data = player.getVideoData();
    if (data && data.video_id) {
      const reelArt = `url('https://i.ytimg.com/vi/${data.video_id}/hqdefault.jpg')`;
      reelBg.style.backgroundImage = reelArt;
      reelThumb.style.backgroundImage = reelArt;
    }
  }

  function setProgressUI(ratio) {
    const pct = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
    reelProgressFill.style.width = pct;
    reelProgressHandle.style.left = pct;
  }

  // scrubs the reel's progress bar to wherever the pointer is along the
  // track, in real time, without fighting the rAF loop below
  function seekRatioFromEvent(event) {
    const rect = reelProgressTrack.getBoundingClientRect();
    return (event.clientX - rect.left) / rect.width;
  }

  reelProgressTrack.addEventListener('pointerdown', (event) => {
    if (!player) return;
    isSeeking = true;
    reelProgressTrack.setPointerCapture(event.pointerId);
    setProgressUI(seekRatioFromEvent(event));
  });

  reelProgressTrack.addEventListener('pointermove', (event) => {
    if (!isSeeking) return;
    setProgressUI(seekRatioFromEvent(event));
  });

  reelProgressTrack.addEventListener('pointerup', (event) => {
    if (!isSeeking || !player) return;
    isSeeking = false;
    const ratio = Math.min(1, Math.max(0, seekRatioFromEvent(event)));
    const duration = player.getDuration();
    if (duration) player.seekTo(duration * ratio, true);
  });

  // keeps the reel's progress bar/time advancing while playing, but never
  // fights the user's own drag in progress
  function tickProgress() {
    if (player && !isSeeking && typeof player.getCurrentTime === 'function') {
      const duration = player.getDuration();
      const current = player.getCurrentTime();
      if (duration) {
        setProgressUI(current / duration);
        reelTime.textContent = formatTime(current);
      }
    }
    requestAnimationFrame(tickProgress);
  }
  requestAnimationFrame(tickProgress);

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('yt-hidden-player', {
      width: '1',
      height: '1',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        autoplay: 0,
        controls: 0,
        playsinline: 1,
        enablejsapi: 1,
        // wraps the playlist around instead of stopping after the last
        // track — covers both "plays through to the end" and "user clicks
        // next on the last track"
        loop: 1,
        origin: window.location.origin,
      },
      events: {
        onReady(e) {
          e.target.setVolume(70);
          if (playRequested) {
            playRequested = false;
            e.target.playVideo();
          }
          // a playlist player doesn't reliably fire a CUED state change
          // before playback starts, so the first track's title/artwork
          // would otherwise stay blank until the user clicks play — poll
          // briefly until the cued track's data actually shows up
          const pollForCuedTrack = setInterval(() => {
            const data = e.target.getVideoData();
            if (data && data.video_id) {
              clearInterval(pollForCuedTrack);
              updateTrackTitle();
              updateAlbumArt();
            }
          }, 150);
        },
        onStateChange(e) {
          if (e.data === YT.PlayerState.PLAYING) {
            setPlayingState(true);
            updateTrackTitle();
            updateAlbumArt();
          } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
            setPlayingState(false);
          } else if (e.data === YT.PlayerState.CUED) {
            // covers the (rarer) case where the browser does fire this
            updateTrackTitle();
            updateAlbumArt();
          }
        },
      },
    });
  };

  // Dynamically load the YouTube IFrame API
  const ytScript = document.createElement('script');
  ytScript.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(ytScript);

  reelPlayBtn.addEventListener('click', () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  });

  reelPrevBtn.addEventListener('click', () => player && player.previousVideo());
  reelNextBtn.addEventListener('click', () => player && player.nextVideo());

  // #video-cell's width is percentage-based, so how much (if any) the
  // title overflows can change on resize
  window.addEventListener('resize', applyTitleMarquee);

  return {
    // plays the first (already-cued) playlist track — used to auto-start
    // the reel when its cell overlay is revealed. Queues the request if
    // the player hasn't finished loading yet.
    playFirstTrack() {
      if (player) {
        player.playVideo();
      } else {
        playRequested = true;
      }
    },
    // the first track's title gets measured for overflow as soon as it's
    // cued (see the onReady poll below), but #video-cell is still
    // display:none behind the About view at that point, so the measured
    // width is 0 and the marquee never gets added — remeasure now that
    // the cell is actually visible
    remeasureTitle() {
      applyTitleMarquee();
    },
  };
})();
