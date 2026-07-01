# JWT Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure all ACTAS-FTSM backend endpoints with JWT-based authentication, replacing the current scheme where any caller (including Postman without login) can hit protected endpoints freely.

**Architecture:** `/api/login` signs a JWT on successful bcrypt auth; the token is stored in `localStorage` and attached to every axios request via a centralized `api.js` interceptor; Express middleware (`verifyToken` + `requireRole`) guards all protected endpoints; a 401 interceptor auto-logouts the frontend when a token expires.

**Tech Stack:** Node.js/Express backend, `jsonwebtoken` npm package, React 19 + Vite frontend, `axios` with interceptors.

## Global Constraints

- JWT library: `jsonwebtoken` (npm) — no `jose`, no `jwt-simple`
- Token expiry: exactly `'8h'` (string literal passed to `expiresIn`)
- JWT payload fields: `{ no_matrik, role, programs_handled }` (programs_handled is `[]` for pelajar, the array for kp/pegawai)
- JWT_SECRET env var name: exactly `JWT_SECRET`
- localStorage key for token: exactly `'token'`; user object key remains `'user'` (unchanged)
- Centralized axios instance export: default export from `server/client/src/api.js`
- Public endpoints (NO middleware): `/api/login`, `/api/forgot-password`, `/api/reset-password`
- No refresh token, no Redis, no token rotation — single access token only
- Do NOT remove any existing response fields from `/api/login` — only ADD the `token` field
- Ownership check: pelajar endpoints with `:no_matrik` URL param must verify `req.user.no_matrik === req.params.no_matrik`
- Working directory for server commands: `C:\xampp2\htdocs\actas-ftsm\actas-ftsm-fyp\server`

---

## File Map

**Create:**
- `server/middleware/auth.js` — `verifyToken`, `requireRole`, `verifyOwnership` Express middlewares
- `server/client/src/api.js` — centralized axios instance with auth interceptors

**Modify:**
- `server/package.json` — add `jsonwebtoken` dependency
- `server/.env` — add `JWT_SECRET` with generated value
- `server/.env.example` — add `JWT_SECRET=` placeholder (create file if missing)
- `server/server.js` — require jwt + middleware, update `/api/login`, apply middleware to 15 endpoints
- `server/client/src/login.jsx` — save `token` to localStorage after login
- `server/client/src/components/SidebarLayout.jsx` — remove `'token'` on logout
- `server/client/src/api.js` (created above, then imported by components)
- 14 components: `AnalisisGred`, `CartaPrestasi`, `dashboard`, `DashboardKP`, `JanaLaporan`, `MaklumBalasKP`, `PantauKursus`, `PelajarBerisiko`, `PenilaianSubjek`, `ResetPassword`, `SemakanKredit`, `Simulator`, `TambahKursus`, `UrusDataPelajar` — swap `import axios from 'axios'` → `import api from './api'`, replace `axios.` → `api.`, strip `http://localhost:5000` prefix from all URLs

---

## Task 1: Install jsonwebtoken + environment setup

**Files:**
- Modify: `server/package.json`
- Modify: `server/.env`
- Create: `server/.env.example`

**Interfaces:**
- Produces: `JWT_SECRET` env var available to `process.env.JWT_SECRET` in all subsequent tasks

- [ ] **Step 1: Install jsonwebtoken**

From `C:\xampp2\htdocs\actas-ftsm\actas-ftsm-fyp\server`:

```bash
npm install jsonwebtoken
```

Expected: package-lock.json updated, `"jsonwebtoken"` appears in `package.json` dependencies.

- [ ] **Step 2: Add JWT_SECRET to .env**

Read current `server/.env`. It contains:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=actas_db

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
```

Append this line to the bottom of `server/.env`:
```
JWT_SECRET=a294a47714ce67e78ba42c6316c0139d7bbaf25a124e444047c03f13f045d9abcf7c30a2ac39ff22794d2eb473a718b1fa3d9674a66a2d3aeb1d9691efa7ffed
```

(This value was pre-generated with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`. The user will replace it for production.)

- [ ] **Step 3: Create .env.example**

Create `server/.env.example` with placeholder values (this file is safe to commit, no real secrets):

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=actas_db

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:5173

JWT_SECRET=
```

- [ ] **Step 4: Verify server still starts**

```bash
node server.js
```

Expected output includes `✅ Berjaya sambung ke MySQL (actas_db)!` and no crash. Press Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "feat: install jsonwebtoken and add JWT_SECRET to env"
```

> Note: Do NOT `git add .env` — it is gitignored (contains real secrets).

---

## Task 2: Auth middleware + JWT signing in /api/login

**Files:**
- Create: `server/middleware/auth.js`
- Modify: `server/server.js` (lines 1–8 for require, lines ~52–58 and ~79–87 for /api/login)

**Interfaces:**
- Consumes: `process.env.JWT_SECRET` from Task 1
- Produces:
  - `verifyToken(req, res, next)` — Express middleware, attaches verified payload to `req.user`
  - `requireRole(...roles)` — factory returning Express middleware, checks `req.user.role`
  - `verifyOwnership(req, res, next)` — Express middleware, checks `req.user.no_matrik === req.params.no_matrik`
  - `/api/login` response now includes `token` field alongside existing `user` and `message` fields

- [ ] **Step 1: Create server/middleware/auth.js**

Create the file `server/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token tidak ditemui. Sila log masuk.' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Token tidak sah atau telah tamat. Sila log masuk semula.' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Akses ditolak: anda tidak mempunyai kebenaran untuk endpoint ini.' });
    }
    next();
};

const verifyOwnership = (req, res, next) => {
    const id = req.params.no_matrik;
    if (id && req.user.no_matrik !== id) {
        return res.status(403).json({ message: 'Akses ditolak: anda hanya boleh mengakses data anda sendiri.' });
    }
    next();
};

module.exports = { verifyToken, requireRole, verifyOwnership };
```

- [ ] **Step 2: Add requires at the top of server.js**

Read `server/server.js`. The current top section (lines 1–8) looks like:

```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
```

Add two new lines after the bcrypt require:

```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, requireRole, verifyOwnership } = require('./middleware/auth');
```

- [ ] **Step 3: Update /api/login to sign and return JWT — pelajar branch**

In `/api/login`, find the pelajar success block. Current code (around line 52–58):

```javascript
                const user = {
                    no_matrik: resultPelajar[0].no_matrik,
                    nama:      resultPelajar[0].nama,
                    program:   resultPelajar[0].program,
                    role:      'pelajar'
                };
                return res.status(200).json({ message: "Log Masuk Berjaya sebagai Pelajar!", user });
```

Replace with:

```javascript
                const user = {
                    no_matrik: resultPelajar[0].no_matrik,
                    nama:      resultPelajar[0].nama,
                    program:   resultPelajar[0].program,
                    role:      'pelajar'
                };
                const token = jwt.sign(
                    { no_matrik: user.no_matrik, role: user.role, programs_handled: [] },
                    process.env.JWT_SECRET,
                    { expiresIn: '8h' }
                );
                return res.status(200).json({ message: "Log Masuk Berjaya sebagai Pelajar!", user, token });
```

- [ ] **Step 4: Update /api/login to sign and return JWT — kakitangan branch**

Find the kakitangan success block. Current code (around line 79–86):

```javascript
                    const user = {
                        no_matrik:        resultKaki[0].id_ukmper,
                        nama:             resultKaki[0].nama,
                        program:          resultKaki[0].judul_jawatan || resultKaki[0].peranan,
                        role:             penentuRole,
                        programs_handled: programsHandled,
                    };
                    return res.status(200).json({ message: `Log Masuk Berjaya sebagai ${resultKaki[0].peranan}!`, user });
```

Replace with:

```javascript
                    const user = {
                        no_matrik:        resultKaki[0].id_ukmper,
                        nama:             resultKaki[0].nama,
                        program:          resultKaki[0].judul_jawatan || resultKaki[0].peranan,
                        role:             penentuRole,
                        programs_handled: programsHandled,
                    };
                    const token = jwt.sign(
                        { no_matrik: user.no_matrik, role: user.role, programs_handled: user.programs_handled },
                        process.env.JWT_SECRET,
                        { expiresIn: '8h' }
                    );
                    return res.status(200).json({ message: `Log Masuk Berjaya sebagai ${resultKaki[0].peranan}!`, user, token });
```

- [ ] **Step 5: Verify server starts and /api/login returns token**

Start server:
```bash
node server.js
```

In a separate terminal, test login (use an existing pelajar ID from DB — e.g., A21ST001 or whichever exists, with their plain-text password before bcrypt... no, all passwords are already hashed. Use a known demo account):

```bash
curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"no_matrik\":\"A21ST001\",\"katalaluan\":\"password123\"}" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); console.log('token present:', !!j.token); console.log('user present:', !!j.user);"
```

Expected: `token present: true` and `user present: true`.

> Note: Replace `A21ST001` and `password123` with a real demo account from the seed data. If unsure, check the DB: `SELECT no_matrik FROM pelajar LIMIT 1;` and use the original plain-text password (check `server/scripts/hashExistingPasswords.js` comments or DB docs for demo passwords).

Stop server (Ctrl+C).

- [ ] **Step 6: Commit**

```bash
git add middleware/auth.js server.js
git commit -m "feat: create JWT auth middleware and sign token in /api/login"
```

---

## Task 3: Apply middleware to all 15 protected endpoints

**Files:**
- Modify: `server/server.js`

**Interfaces:**
- Consumes: `verifyToken`, `requireRole`, `verifyOwnership` from Task 2
- Produces: All 15 protected endpoints reject unauthenticated or wrongly-roled requests

The pattern for adding middleware is: insert middleware arguments between the path string and the final handler function.

**Before:**
```javascript
app.get('/api/some-endpoint', (req, res) => {
```
**After (KP example):**
```javascript
app.get('/api/some-endpoint', verifyToken, requireRole('kp'), (req, res) => {
```

- [ ] **Step 1: Apply middleware to all 15 endpoints**

Read `server/server.js`. Make the following changes — one per endpoint. Each change is ONLY the function signature line (do not touch the handler body):

**Pelajar endpoints (3 with ownership check, 2 without):**

```javascript
// Line ~99 — GET /api/akademik/:no_matrik
// BEFORE:
app.get('/api/akademik/:no_matrik', (req, res) => {
// AFTER:
app.get('/api/akademik/:no_matrik', verifyToken, requireRole('pelajar'), verifyOwnership, (req, res) => {
```

```javascript
// Line ~148 — POST /api/tambah-kursus
// BEFORE:
app.post('/api/tambah-kursus', (req, res) => {
// AFTER:
app.post('/api/tambah-kursus', verifyToken, requireRole('pelajar'), (req, res) => {
```

```javascript
// Line ~418 — GET /api/pelajar/maklum-balas/:no_matrik
// BEFORE:
app.get('/api/pelajar/maklum-balas/:no_matrik', (req, res) => {
// AFTER:
app.get('/api/pelajar/maklum-balas/:no_matrik', verifyToken, requireRole('pelajar'), verifyOwnership, (req, res) => {
```

```javascript
// Line ~456 — POST /api/pelajar/penilaian
// BEFORE:
app.post('/api/pelajar/penilaian', (req, res) => {
// AFTER:
app.post('/api/pelajar/penilaian', verifyToken, requireRole('pelajar'), (req, res) => {
```

```javascript
// Line ~502 — PATCH /api/pelajar/maklum-balas/baca/:no_matrik
// BEFORE:
app.patch('/api/pelajar/maklum-balas/baca/:no_matrik', (req, res) => {
// AFTER:
app.patch('/api/pelajar/maklum-balas/baca/:no_matrik', verifyToken, requireRole('pelajar'), verifyOwnership, (req, res) => {
```

**KP endpoints (5 total):**

```javascript
// Line ~188 — GET /api/kp/analitik-pelajar
// BEFORE:
app.get('/api/kp/analitik-pelajar', (req, res) => {
// AFTER:
app.get('/api/kp/analitik-pelajar', verifyToken, requireRole('kp'), (req, res) => {
```

```javascript
// Line ~261 — GET /api/kp/pantau-kursus
// BEFORE:
app.get('/api/kp/pantau-kursus', (req, res) => {
// AFTER:
app.get('/api/kp/pantau-kursus', verifyToken, requireRole('kp'), (req, res) => {
```

```javascript
// Line ~309 — GET /api/kp/taburan-gred
// BEFORE:
app.get('/api/kp/taburan-gred', (req, res) => {
// AFTER:
app.get('/api/kp/taburan-gred', verifyToken, requireRole('kp'), (req, res) => {
```

```javascript
// Line ~352 — GET /api/kp/pelajar-berisiko
// BEFORE:
app.get('/api/kp/pelajar-berisiko', (req, res) => {
// AFTER:
app.get('/api/kp/pelajar-berisiko', verifyToken, requireRole('kp'), (req, res) => {
```

```javascript
// Line ~520 — POST /api/kp/maklum-balas
// BEFORE:
app.post('/api/kp/maklum-balas', (req, res) => {
// AFTER:
app.post('/api/kp/maklum-balas', verifyToken, requireRole('kp'), (req, res) => {
```

**Pegawai endpoints (4 total):**

```javascript
// Line ~551 — GET /api/pegawai/pelajar
// BEFORE:
app.get('/api/pegawai/pelajar', (req, res) => {
// AFTER:
app.get('/api/pegawai/pelajar', verifyToken, requireRole('pegawai'), (req, res) => {
```

```javascript
// Line ~567 — POST /api/pegawai/pelajar
// BEFORE:
app.post('/api/pegawai/pelajar', async (req, res) => {
// AFTER:
app.post('/api/pegawai/pelajar', verifyToken, requireRole('pegawai'), async (req, res) => {
```

```javascript
// Line ~594 — PUT /api/pegawai/pelajar/:id
// BEFORE:
app.put('/api/pegawai/pelajar/:id', async (req, res) => {
// AFTER:
app.put('/api/pegawai/pelajar/:id', verifyToken, requireRole('pegawai'), async (req, res) => {
```

```javascript
// Line ~630 — DELETE /api/pegawai/pelajar/:id
// BEFORE:
app.delete('/api/pegawai/pelajar/:id', (req, res) => {
// AFTER:
app.delete('/api/pegawai/pelajar/:id', verifyToken, requireRole('pegawai'), (req, res) => {
```

> Endpoints NOT touched (public — no middleware): `POST /api/login` (line ~31), `POST /api/forgot-password` (line ~705), `POST /api/reset-password` (line ~827).

- [ ] **Step 2: Verify — unauthenticated request returns 401**

Start server:
```bash
node server.js
```

Test a protected endpoint without token:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/kp/analitik-pelajar
```
Expected: `401`

Test a protected endpoint with a pelajar token trying to access KP route:
```bash
# First get a pelajar token
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"no_matrik\":\"A21ST001\",\"katalaluan\":\"password123\"}" | node -e "process.stdin.resume(); let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>console.log(JSON.parse(d).token));")

# Try KP endpoint with pelajar token — should get 403
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/kp/analitik-pelajar
```
Expected: `403`

Test a public endpoint still works:
```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"no_matrik\":\"BADID\",\"katalaluan\":\"BADPASS\"}"
```
Expected: `401` (from bcrypt compare, not from verifyToken — login endpoint is public)

Stop server (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add server.js
git commit -m "feat: apply JWT verifyToken + requireRole middleware to all 15 protected endpoints"
```

---

## Task 4: Frontend — centralized axios instance + token save + component migration

**Files:**
- Create: `server/client/src/api.js`
- Modify: `server/client/src/login.jsx` (save token + use api)
- Modify: `server/client/src/components/SidebarLayout.jsx` (clear token on logout)
- Modify (import swap + URL prefix strip): `AnalisisGred.jsx`, `CartaPrestasi.jsx`, `dashboard.jsx`, `DashboardKP.jsx`, `JanaLaporan.jsx`, `MaklumBalasKP.jsx`, `PantauKursus.jsx`, `PelajarBerisiko.jsx`, `PenilaianSubjek.jsx`, `ResetPassword.jsx`, `SemakanKredit.jsx`, `Simulator.jsx`, `TambahKursus.jsx`, `UrusDataPelajar.jsx`

**Interfaces:**
- Consumes: `token` in `localStorage` (key `'token'`), `JWT_SECRET` on backend
- Produces: All API calls include `Authorization: Bearer <token>` header; 401 response auto-logouts user

- [ ] **Step 1: Create server/client/src/api.js**

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
```

- [ ] **Step 2: Update login.jsx — save token + use api instance**

Read `server/client/src/login.jsx`.

**Change 1:** Replace the axios import:
```javascript
// BEFORE:
import axios from 'axios';
// AFTER:
import api from './api';
```

**Change 2:** In `handleLogin`, after `if (response.status === 200)`, add token save before the navigate call:
```javascript
// BEFORE:
            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'kp') {
// AFTER:
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'kp') {
```

**Change 3:** Replace the axios.post call for login:
```javascript
// BEFORE:
            const response = await axios.post('http://localhost:5000/api/login', {
// AFTER:
            const response = await api.post('/api/login', {
```

**Change 4:** In `ForgotPasswordModal`, replace the axios.post call:
```javascript
// BEFORE:
            const response = await axios.post('http://localhost:5000/api/forgot-password', {
// AFTER:
            const response = await api.post('/api/forgot-password', {
```

- [ ] **Step 3: Update SidebarLayout.jsx — clear token on logout**

Read `server/client/src/components/SidebarLayout.jsx`.

Find the logout handler (around line 25). Current code:
```javascript
        localStorage.removeItem('user');
        navigate('/');
```

Replace with:
```javascript
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
```

- [ ] **Step 4: Migrate all remaining 14 components**

For each of these files, make two types of changes:
1. **Import swap:** `import axios from 'axios';` → `import api from './api';`
2. **Call swap:** Every `axios.get(`, `axios.post(`, `axios.put(`, `axios.patch(`, `axios.delete(` → same with `api.` prefix, AND strip `http://localhost:5000` from the URL string (keep the `/api/...` part).

Files to update (all in `server/client/src/`):

**AnalisisGred.jsx** — swap import + replace all axios calls (calls `/api/kp/taburan-gred`)

**CartaPrestasi.jsx** — swap import + replace all axios calls (calls `/api/akademik/:no_matrik`)

**dashboard.jsx** — swap import + replace all axios calls (calls `/api/akademik/:no_matrik` and `/api/pelajar/maklum-balas/:no_matrik` and `/api/pelajar/maklum-balas/baca/:no_matrik`)

**DashboardKP.jsx** — swap import + replace all axios calls (calls `/api/kp/analitik-pelajar`, `/api/kp/pelajar-berisiko`)

**JanaLaporan.jsx** — swap import + replace all axios calls

**MaklumBalasKP.jsx** — swap import + replace all axios calls (calls `/api/kp/maklum-balas`)

**PantauKursus.jsx** — swap import + replace all axios calls (calls `/api/kp/pantau-kursus`)

**PelajarBerisiko.jsx** — swap import + replace all axios calls (calls `/api/kp/pelajar-berisiko`)

**PenilaianSubjek.jsx** — swap import + replace all axios calls (calls `/api/pelajar/penilaian`)

**ResetPassword.jsx** — swap import + replace all axios calls (calls `/api/reset-password`)

**SemakanKredit.jsx** — swap import + replace all axios calls (calls `/api/akademik/:no_matrik`)

**Simulator.jsx** — swap import + replace all axios calls (calls `/api/akademik/:no_matrik`)

**TambahKursus.jsx** — swap import + replace all axios calls (calls `/api/tambah-kursus`)

**UrusDataPelajar.jsx** — swap import + replace all axios calls (calls `/api/pegawai/pelajar`)

> If any file does not actually contain `import axios from 'axios'` when you read it, skip it — the grep scan may have had a stale match.

- [ ] **Step 5: Verify frontend works end-to-end**

Start backend:
```bash
# In server/
node server.js
```

Start frontend:
```bash
# In server/client/
npm run dev
```

Open browser to `http://localhost:5173`. Then:
1. Log in with a known pelajar account
2. Open DevTools → Application → Local Storage → verify `token` key exists (starts with `eyJ`)
3. Open DevTools → Network tab → click any page (e.g., Dashboard)
4. Inspect the API request → Headers → verify `Authorization: Bearer eyJ...` header is present
5. Log out → verify `token` is removed from localStorage
6. Log in as KP account → navigate to Pelajar Berisiko page → verify data loads
7. Log in as pelajar → manually visit `http://localhost:5173/kp/dashboard` → should redirect to `/` (ProtectedRoute guard in App.jsx)

Stop both servers.

- [ ] **Step 6: Commit**

```bash
git add client/src/api.js client/src/login.jsx client/src/components/SidebarLayout.jsx \
  client/src/AnalisisGred.jsx client/src/CartaPrestasi.jsx client/src/dashboard.jsx \
  client/src/DashboardKP.jsx client/src/JanaLaporan.jsx client/src/MaklumBalasKP.jsx \
  client/src/PantauKursus.jsx client/src/PelajarBerisiko.jsx client/src/PenilaianSubjek.jsx \
  client/src/ResetPassword.jsx client/src/SemakanKredit.jsx client/src/Simulator.jsx \
  client/src/TambahKursus.jsx client/src/UrusDataPelajar.jsx
git commit -m "feat: add centralized axios instance with JWT auth, save token on login, clear on logout"
```
