const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES = path.join(DATA_DIR, 'messages.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

// Edit this list: replace each repo link with your real project repository.
const projects = [
  { id: 1, title: 'Mini SaaS Dashboard', stack: ['Node.js', 'Express', 'SQLite'],
    description: 'SaaS-style dashboard with login, sessions, and add/delete project management.',
    features: ['User authentication', 'Session management', 'Dynamic dashboard', 'Responsive UI'],
    repo: 'https://github.com/Ali-Ashor', demo: '' },
  { id: 2, title: 'SmartCafe System', stack: ['Node.js', 'MySQL'],
    description: 'Cafe ordering and management system for menu items and customer orders.',
    features: ['Menu management', 'Order handling'], repo: 'https://github.com/Ali-Ashor', demo: '' },
  { id: 3, title: 'Student Management System', stack: ['JavaScript', 'SQL'],
    description: 'Manage student records and academic operations in one place.',
    features: ['Student records', 'Academic data'], repo: 'https://github.com/Ali-Ashor', demo: '' },
  { id: 4, title: 'Car Price Prediction', stack: ['Python', 'Machine Learning'],
    description: 'Machine learning project that predicts vehicle prices from car features.',
    features: ['Data preprocessing', 'Price prediction'], repo: 'https://github.com/Ali-Ashor', demo: '' },
  { id: 5, title: 'Portfolio Website', stack: ['HTML', 'CSS', 'JavaScript'],
    description: 'Responsive personal portfolio with a Node.js backend and contact form.',
    features: ['Responsive layout', 'Contact API'], repo: 'https://github.com/Ali-Ashor', demo: '' }
];

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/projects', (req, res) => res.json(projects));

// Simple rate limit: 5 messages per hour per IP
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 3600000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

app.post('/api/contact', (req, res) => {
  if (limited(req.ip)) return res.status(429).json({ error: 'Too many messages. Try again in an hour.' });
  const { name, email, message } = req.body || {};
  if ([name, email, message].some(v => typeof v !== 'string')) {
    return res.status(400).json({ error: 'Fill in name, email and message.' });
  }
  const entry = { name: name.trim(), email: email.trim(), message: message.trim(), date: new Date().toISOString() };
  if (entry.name.length < 2 || entry.name.length > 80) return res.status(400).json({ error: 'Name must be 2 to 80 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email) || entry.email.length > 120) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (entry.message.length < 10 || entry.message.length > 2000) return res.status(400).json({ error: 'Message must be 10 to 2000 characters.' });
  try {
    const all = fs.existsSync(MESSAGES) ? JSON.parse(fs.readFileSync(MESSAGES, 'utf8')) : [];
    all.push(entry);
    fs.writeFileSync(MESSAGES, JSON.stringify(all, null, 2));
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not save your message. Try again.' });
  }
});

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
