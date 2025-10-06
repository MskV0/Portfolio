Interactive Portfolio (HTML/CSS/JS)

A fast, modern developer portfolio with smooth scrolling, section reveals, theme toggle, and projects rendered from JSON.

Quick start

1. Open `index.html` in a browser. For local JSON fetch, serve files:
   - VS Code Live Server, or
   - Python: `python -m http.server 5173` then visit `http://localhost:5173`

Customize

- Replace "Your Name" in `index.html` header and hero.
- Update skills in the `#skillsList` or render dynamically later.
- Edit `data/projects.json` with your real projects: `title`, `description`, `tech`, `image`, `demo`, `repo`.
- Swap colors in `styles.css` via CSS variables. Light/dark theme persists via `localStorage`.

Features

- Sticky, responsive navbar with mobile drawer
- Smooth scroll and section reveal using IntersectionObserver
- JSON-driven project cards
- Accessible form validation (front-end only)
- Theme toggle with persistence

Next steps

- Add animations (optional: GSAP)
- Add route-style hash highlighting for active section
- Hook contact form to a service (Formspree/Netlify) or simple backend


