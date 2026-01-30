const nav = document.querySelector('.nav');
const bg = document.querySelector('.nav-bg');
const links = nav.querySelectorAll('a');
const home = document.getElementById('home');
const about = document.getElementById('about');
const work = document.getElementById('work');
const contact = document.getElementById('contact');
const header = document.querySelector('header');
let lastScrollY = window.scrollY;
const title = document.getElementById('title');
const body = document.body;
const toggle = document.getElementById('dark-mode');
const icon = document.querySelector('img');
const isDarkMode = () => body.classList.contains('dark-mode');

//initializes nav-bg
bg.style.width = `${links[0].getBoundingClientRect().width}px`;

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

  console.log(scrollIndex);

  bg.style.width = `${links[scrollIndex].getBoundingClientRect().width}px`;
  bg.style.transform = `translateX(${links[scrollIndex].getBoundingClientRect().left - nav.getBoundingClientRect().left}px)`;
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

  updateNavBg();
});

//controls nav-bg hover behavior
links.forEach((link) => {
  link.addEventListener('mouseenter', () => {
    const rect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    bg.style.width = `${rect.width}px`;
    bg.style.transform = `translateX(${rect.left - navRect.left}px)`;
  });

  link.addEventListener('mouseleave', () => {
    updateNavBg();
  });
});

//toggle dark mode and light mode
toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  if (isDarkMode()) {
    icon.src = './assets/light-mode.svg';
    icon.alt = 'light mode icon';
  } else {
    icon.src = './assets/dark-mode.svg';
    icon.alt = 'dark mode icon';
  }
});

//main title shadow effect
home.addEventListener('mousemove', (event) => {
  const rect = title.getBoundingClientRect();

  //calculates text center
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  //tighten or loosen cursor offset
  const offsetX = (centerX - event.pageX) / 10000;
  const offsetY = (centerY - event.pageY) / 10000;

  title.style.textShadow = `
      ${-offsetX.toFixed(3) * 0.5}em ${-offsetY.toFixed(3) * 0.5}em 0 white,
      ${offsetX.toFixed(4)}em ${offsetY.toFixed(4)}em 0 rgba(93,93,93, 0.5),
      ${offsetX.toFixed(4) * 2}em ${offsetY.toFixed(4) * 2}em 0 rgba(93,93,93, 0.4),
      ${offsetX.toFixed(4) * 3}em ${offsetY.toFixed(4) * 3}em 0 rgba(93,93,93, 0.3),
      ${offsetX.toFixed(4) * 4}em ${offsetY.toFixed(4) * 4}em 0 rgba(93,93,93, 0.2)
    `;
  if (isDarkMode()) {
    title.style.textShadow = `
    ${offsetX.toFixed(4) * 0.5}em ${offsetY.toFixed(4) * 0.5}em 0 #00c4c4,
    ${-offsetX.toFixed(4) * 0.5}em ${-offsetY.toFixed(4) * 0.5}em 0 #c40034
  `;
  }
});
