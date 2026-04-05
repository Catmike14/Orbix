const express      = require('express');
const session      = require('express-session');
const bcrypt       = require('bcryptjs');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'orbix-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Try again in 15 minutes.',
});

function requireAuth(req, res, next) {
  if (req.session && req.session.auth) return next();
  res.redirect('/login');
}

app.get('/login', (req, res) => {
  if (req.session && req.session.auth) return res.redirect('/');
  res.send(loginHTML());
});

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const adminUser  = process.env.ADMIN_USERNAME || 'admin';
  const adminHash  = process.env.ADMIN_PASSWORD_HASH || '';  // bcrypt hash (more secure)
  const adminPlain = process.env.ADMIN_PASSWORD || '';       // plain text (simpler setup)

  const userMatch = username === adminUser;
  let passMatch = false;

  if (adminHash) {
    // bcrypt hash — most secure
    passMatch = await bcrypt.compare(password, adminHash);
  } else if (adminPlain) {
    // plain text password from env var — simple, works fine on Render
    passMatch = password === adminPlain;
  }

  if (!userMatch || !passMatch) {
    return res.send(loginHTML('Invalid username or password.'));
  }

  req.session.regenerate(err => {
    if (err) return res.send(loginHTML('Session error. Try again.'));
    req.session.auth = true;
    res.redirect('/');
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.use(requireAuth, express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`ORBIX running on port ${PORT}`));

function loginHTML(error) {
  const err = error ? `<div class="error">${error}</div>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ORBIX — Login</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#04060d;background-image:radial-gradient(ellipse 80% 50% at 20% 0%,rgba(0,229,160,.05) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 100%,rgba(77,159,255,.05) 0%,transparent 60%);min-height:100vh;display:flex;align-items:center;justify-content:center;color:#eef2ff}
  .card{width:100%;max-width:360px;background:#080e1a;border:1px solid rgba(99,132,199,.2);border-radius:16px;padding:36px 32px;box-shadow:0 24px 80px rgba(0,0,0,.7);margin:20px}
  .logo{display:flex;align-items:center;gap:10px;margin-bottom:28px;justify-content:center}
  .logo-text{font-size:22px;font-weight:700;letter-spacing:3px;color:#00e5a0}
  .logo-sub{font-size:11px;color:#3d5070;text-align:center;margin-top:4px;letter-spacing:1px}
  label{display:block;font-size:11px;color:#8899bb;margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase}
  input{width:100%;background:#0d1525;border:1px solid rgba(99,132,199,.2);border-radius:8px;padding:10px 14px;color:#eef2ff;font-size:14px;outline:none;transition:border-color 140ms;margin-bottom:16px}
  input:focus{border-color:rgba(0,229,160,.5)}
  button{width:100%;background:#00e5a0;color:#04060d;border:none;border-radius:8px;padding:11px;font-size:14px;font-weight:700;letter-spacing:.5px;cursor:pointer;margin-top:4px;transition:opacity 140ms}
  button:hover{opacity:.88}
  .error{background:rgba(255,77,106,.1);border:1px solid rgba(255,77,106,.3);border-radius:8px;padding:10px 14px;font-size:12px;color:#ff4d6a;margin-bottom:18px;text-align:center}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="8" fill="#04060d"/><ellipse cx="16" cy="16" rx="12" ry="4.2" fill="none" stroke="#00e5a0" stroke-width="1.3" stroke-opacity=".7" transform="rotate(-30 16 16)"/><ellipse cx="16" cy="16" rx="7.5" ry="2.8" fill="none" stroke="#4d9fff" stroke-width="1" stroke-opacity=".5" transform="rotate(20 16 16)"/><circle cx="16" cy="16" r="4.5" fill="#071e12" stroke="#00e5a0" stroke-width="1.4"/><polyline points="11,16.5 13,13.5 14.5,17 16,13 17.5,16 19,14 21,16.5" fill="none" stroke="#00e5a0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div>
      <div class="logo-text">ORBIX</div>
      <div class="logo-sub">SEE EVERY MOVE</div>
    </div>
  </div>
  ${err}
  <form method="POST" action="/login">
    <label>Username</label>
    <input type="text" name="username" autocomplete="username" autofocus required>
    <label>Password</label>
    <input type="password" name="password" autocomplete="current-password" required>
    <button type="submit">Sign In</button>
  </form>
</div>
</body>
</html>`;
}
