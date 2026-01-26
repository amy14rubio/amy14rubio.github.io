document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const bg = document.querySelector('.nav-bg');
  const links = nav.querySelectorAll('a');
  const home = document.getElementById('home');
  const about = document.getElementById('about');
  const work = document.getElementById('work');
  const contact = document.getElementById('contact');
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;

  //initializes nav-bg
  bg.style.width = `${links[0].getBoundingClientRect().width}px`;

  // controls nav-bg position as user scrolls through content
  const updateNavBg = () => {
    let currentScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    const sections = [home, about, work, contact];

    let scrollIndex = sections.findIndex(
      (section, i) =>
        currentScrollPosition >= section.offsetTop &&
        (!sections[i + 1] || currentScrollPosition < sections[i + 1].offsetTop),
    );

    if (scrollIndex === -1) scrollIndex = 0;

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
      scrollIndex = sections.length - 1;
    }

    bg.style.width = `${links[scrollIndex].getBoundingClientRect().width}px`;
    bg.style.transform = `translateX(${links[scrollIndex].getBoundingClientRect().left - nav.getBoundingClientRect().left}px)`;
  };

  window.addEventListener('scroll', () => {
    // hides header on scroll
    const currentScrollY = window.scrollY;

    console.log(currentScrollY);
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastScrollY = currentScrollY;

    updateNavBg();
  });

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
});
