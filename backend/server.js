require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const bcrypt    = require('bcrypt');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;
const SALT = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// ── Rate limiters ─────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 50,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  statusCode: 429,
});
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 50,
  message: { message: 'Too many accounts created. Please try again later.' },
  statusCode: 429,
});

// ── Helpers ───────────────────────────────────────────────────
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

// ── User store ────────────────────────────────────────────────
let users      = {};   // keyed by username.toLowerCase()
let emailIndex = {};   // email.toLowerCase() → username key
let nextId     = 2;
let dummyHash;

async function init() {
  const hash = await bcrypt.hash('admin', SALT);
  users['admin'] = { id: 1, username: 'admin', email: 'admin@example.com', passwordHash: hash };
  emailIndex['admin@example.com'] = 'admin';
  dummyHash = await bcrypt.hash('__dummy__', SALT);
  console.log('User store ready.');
}

// ── POST /signup ──────────────────────────────────────────────
app.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Required check
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Username, email and password are required.' });

    // Type check
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'Invalid input.' });

    const trimmedUsername = username.trim();
    const trimmedEmail    = email.trim();

    // Username: allow letters, numbers, spaces, underscores, hyphens
    if (trimmedUsername.length < 2 || trimmedUsername.length > 100)
      return res.status(400).json({ message: 'Username must be 2–100 characters.' });

    // Email validation
    if (!isValidEmail(trimmedEmail))
      return res.status(400).json({ message: 'Please enter a valid email address.' });

    // Password length
    if (password.length < 4 || password.length > 200)
      return res.status(400).json({ message: 'Password must be at least 4 characters.' });

    const userKey  = trimmedUsername.toLowerCase();
    const emailKey = trimmedEmail.toLowerCase();

    if (users[userKey])
      return res.status(409).json({ message: 'Username already taken. Please choose another.' });

    if (emailIndex[emailKey])
      return res.status(409).json({ message: 'Email already registered. Please sign in.' });

    const passwordHash = await bcrypt.hash(password, SALT);
    const newUser = { id: nextId++, username: trimmedUsername, email: trimmedEmail, passwordHash };
    users[userKey]       = newUser;
    emailIndex[emailKey] = userKey;

    console.log(`Registered: ${trimmedUsername} <${trimmedEmail}>`);

    return res.status(201).json({
      message : 'Account created successfully.',
      user    : { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── POST /login ───────────────────────────────────────────────
app.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password)
      return res.status(400).json({ message: 'Username/email and password are required.' });

    if (typeof identifier !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'Invalid input.' });

    const trimmedId = identifier.trim();

    // Resolve identifier → user (email or username)
    let user;
    if (isValidEmail(trimmedId)) {
      const key = emailIndex[trimmedId.toLowerCase()];
      user = key ? users[key] : null;
    } else {
      user = users[trimmedId.toLowerCase()] || null;
    }

    // Always bcrypt to prevent timing attacks
    const hash  = user ? user.passwordHash : dummyHash;
    const match = await bcrypt.compare(password, hash);

    if (!user || !match)
      return res.status(401).json({ message: 'Invalid username/email or password.' });

    return res.status(200).json({
      message : 'Login successful',
      user    : { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

// ── Start ─────────────────────────────────────────────────────
init().then(() =>
  app.listen(PORT, () => console.log(`Server → http://localhost:${PORT}`))
);