// Theme toggle with localStorage persistence
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  if (savedTheme === 'light') root.setAttribute('data-theme', 'light');
}
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? '' : 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });
}

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navList?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// IntersectionObserver reveal on scroll
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Render projects dynamically from JSON
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  try {
    const res = await fetch('data/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects');
    const projects = await res.json();
    grid.innerHTML = projects.map((p, i) => projectCardHTML(p, i)).join('');
    // Observe newly added cards for reveal animations
    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } catch (err) {
    grid.innerHTML = '<p>Unable to load projects right now.</p>';
    console.error(err);
  }
}

function projectCardHTML(p, index) {
  const tech = (p.tech || []).map(t => `<span>${t}</span>`).join('');
  const links = [
    p.demo && `<a class="btn btn-outline" href="${p.demo}" target="_blank" rel="noreferrer">Live</a>`,
    p.repo && `<a class="btn" href="${p.repo}" target="_blank" rel="noreferrer">Code</a>`
  ].filter(Boolean).join('');
  const href = p.demo || p.repo || '#';
  return `
    <article class="card reveal" data-anim="fade-up" style="--anim-delay:${index * 80}ms" data-href="${href}" role="link" tabindex="0">
      <div class="thumb" style="background:url('${p.image || ''}') center/cover no-repeat"></div>
      <div class="content">
        <h3>${p.title}</h3>
        <p class="meta">${p.description || ''}</p>
        <div class="badges" data-repo="${p.repo || ''}">
          <span class="badge" data-stars>★ --</span>
          <span class="badge" data-forks>⑂ --</span>
        </div>
        <div class="tags">${tech}</div>
        <div class="cta">${links}</div>
      </div>
    </article>`;
}

// Contact form validation (front-end only)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const status = document.getElementById('formStatus');

    const errors = {};
    if (!name.value.trim()) errors.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) errors.email = 'Enter a valid email';
    if (!message.value.trim()) errors.message = 'Please write a message';

    for (const key of ['name','email','message']) {
      const el = document.querySelector(`.error[data-for="${key}"]`);
      if (el) el.textContent = errors[key] || '';
    }

    if (Object.keys(errors).length === 0) {
      status.textContent = 'Thanks! Your message has been validated locally.';
      contactForm.reset();
      setTimeout(()=> status.textContent = '', 2500);
    }
  });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Load data
loadProjects();

// Populate hero skills and add click effect
const heroSkills = ['Cybersecurity','Web App Security','JavaScript','UI Engineering','Performance'];
const heroSkillsEl = document.getElementById('heroSkills');
if (heroSkillsEl) {
  heroSkillsEl.innerHTML = heroSkills.map(s => `<li class="skill-chip" tabindex="0">${s}</li>`).join('');
  heroSkillsEl.addEventListener('click', e => {
    const li = e.target.closest('.skill-chip');
    if (!li) return;
    li.classList.remove('ping');
    void li.offsetWidth; // restart animation
    li.classList.add('ping');
  });
}

// Enhance Skills section chips (hover + click effects)
const skillsListEl = document.getElementById('skillsList');
if (skillsListEl) {
  const items = Array.from(skillsListEl.querySelectorAll('li'));
  for (const li of items) {
    li.classList.add('skill-chip');
    li.setAttribute('tabindex', '0');
    li.addEventListener('click', () => {
      li.classList.remove('ping');
      void li.offsetWidth;
      li.classList.add('ping');
    });
    li.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        li.click();
      }
    });
  }
}

// Home button reload
// If a home button exists, enable soft-refresh behavior
document.getElementById('homeBtn')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.querySelectorAll('.reveal.visible').forEach(el => el.classList.remove('visible'));
  setTimeout(()=>{ document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); }, 150);
});

// Enhance cards with GitHub stars/forks when available
async function enhanceWithGitHubStats() {
  const badgeRows = Array.from(document.querySelectorAll('.badges[data-repo]'));
  const tasks = badgeRows.map(async row => {
    const url = row.getAttribute('data-repo');
    if (!url) return;
    try {
      const match = url.match(/github\.com\/(.+?)\/(.+?)(?:$|#|\?|\/)/i);
      if (!match) return;
      const owner = match[1];
      const repo = match[2];
      const api = `https://api.github.com/repos/${owner}/${repo}`;
      const res = await fetch(api, { headers: { 'Accept': 'application/vnd.github+json' } });
      if (!res.ok) return;
      const data = await res.json();
      const starsEl = row.querySelector('[data-stars]');
      const forksEl = row.querySelector('[data-forks]');
      if (starsEl) starsEl.textContent = `★ ${Intl.NumberFormat().format(data.stargazers_count || 0)}`;
      if (forksEl) forksEl.textContent = `⑂ ${Intl.NumberFormat().format(data.forks_count || 0)}`;
    } catch (e) {
      // silent fail; leave placeholders
    }
  });
  await Promise.allSettled(tasks);
}

// Trigger GitHub stats after initial render
window.addEventListener('load', () => setTimeout(enhanceWithGitHubStats, 300));

// Card click navigation and keyboard activation
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card[data-href]');
  if (!card) return;
  const url = card.getAttribute('data-href');
  if (!url || url === '#') return;
  card.classList.remove('tap');
  void card.offsetWidth;
  card.classList.add('tap');
  window.open(url, '_blank', 'noopener');
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = document.activeElement;
  if (!el || !el.classList?.contains('card')) return;
  const url = el.getAttribute('data-href');
  if (!url || url === '#') return;
  e.preventDefault();
  el.classList.remove('tap');
  void el.offsetWidth;
  el.classList.add('tap');
  window.open(url, '_blank', 'noopener');
});

// Mobile navbar hide/show on scroll
let lastScrollPosition = 0;
const header = document.querySelector('.site-header');
const mobileBreakpoint = 760; // Matches your CSS breakpoint

function handleNavbarOnScroll() {
  // Only apply on mobile
  if (window.innerWidth > mobileBreakpoint) {
    header.style.transform = 'translateY(0)';
    return;
  }

  const currentScroll = window.pageYOffset;
  
  // Always show navbar at top of page
  if (currentScroll <= 80) {
    header.style.transform = 'translateY(0)';
    lastScrollPosition = currentScroll;
    return;
  }
  
  // Scrolling down - hide navbar
  if (currentScroll > lastScrollPosition && currentScroll > 100) {
    header.style.transform = 'translateY(-100%)';
    // Close mobile menu if open
    navList?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  } 
  // Scrolling up - show navbar
  else if (currentScroll < lastScrollPosition) {
    header.style.transform = 'translateY(0)';
  }
  
  lastScrollPosition = currentScroll;
}

// Listen to scroll with passive flag for better mobile performance
window.addEventListener('scroll', handleNavbarOnScroll, { passive: true });

// Reset navbar position on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > mobileBreakpoint) {
    header.style.transform = 'translateY(0)';
  }
}, { passive: true });
