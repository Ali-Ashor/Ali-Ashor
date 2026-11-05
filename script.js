// Typing roles
const roles = ['Backend Developer', 'Frontend Developer', 'Full Stack Learner', 'WordPress Designer', 'Graphic Designer', 'SEO Specialist'];
const typed = document.getElementById('typed');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let r = 0, c = 0, del = false;
function tick() {
  const word = roles[r];
  typed.textContent = word.slice(0, c);
  if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
  if (del && c === 0) { del = false; r = (r + 1) % roles.length; }
  c += del ? -1 : 1;
  setTimeout(tick, del ? 40 : 80);
}
if (reduce) typed.textContent = roles[0]; else tick();

// Skills
['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MySQL', 'SQLite', 'Python', 'C++', 'Git', 'GitHub', 'VS Code', 'WordPress']
  .forEach(s => { const li = document.createElement('li'); li.textContent = s; document.getElementById('skill-list').appendChild(li); });

// Mobile menu
const btn = document.querySelector('.menu-btn'), nav = document.getElementById('links');
btn.addEventListener('click', () => btn.setAttribute('aria-expanded', nav.classList.toggle('open')));
nav.addEventListener('click', e => { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });

// Projects from the Node.js API
function el(tag, text, cls) { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
fetch('/api/projects').then(res => res.json()).then(list => {
  document.getElementById('api-out').textContent = JSON.stringify(list.slice(0, 2), null, 2) + '\n// ...' + (list.length - 2) + ' more';
  const box = document.getElementById('project-list');
  box.textContent = '';
  list.forEach(p => {
    const card = el('article', '', 'project');
    const info = el('div');
    info.append(el('h3', p.title), el('p', p.description));
    const ul = el('ul'); p.features.forEach(f => ul.appendChild(el('li', f)));
    const tags = el('div', '', 'tags'); p.stack.forEach(t => tags.appendChild(el('span', t)));
    info.append(ul, tags);
    const links = el('div', '', 'links');
    const code = el('a', 'View code', 'btn'); code.href = p.repo; code.target = '_blank'; code.rel = 'noopener';
    links.appendChild(code);
    if (p.demo) { const d = el('a', 'Live demo', 'btn primary'); d.href = p.demo; d.target = '_blank'; d.rel = 'noopener'; links.appendChild(d); }
    card.append(info, links);
    box.appendChild(card);
  });
}).catch(() => {
  document.getElementById('project-list').textContent = 'Could not load projects. Start the server with npm start.';
  document.getElementById('api-out').textContent = 'Server not reachable.';
});

// Contact form
const form = document.getElementById('contact-form'), status = document.getElementById('form-status');
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.checkValidity()) { status.className = 'err'; status.textContent = 'Check the fields: name, a valid email, and a message of at least 10 characters.'; return; }
  status.className = ''; status.textContent = 'Sending...';
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    status.className = 'ok'; status.textContent = 'Message sent. I will reply by email.'; form.reset();
  } catch (err) { status.className = 'err'; status.textContent = err.message; }
});
