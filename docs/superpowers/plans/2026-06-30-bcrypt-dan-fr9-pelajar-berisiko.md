# Bcrypt Password Hashing & FR9 Pelajar Berisiko — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure all passwords with bcrypt hashing and implement FR9 (automatic at-risk student detection) with a KP-facing page.

**Architecture:** Two independent subsystems — (A) replace plain-text password storage/comparison with bcrypt throughout server.js plus a one-shot migration script, and (B) add a new API endpoint + React page for at-risk student detection (CGPA < 2.00 OR credit-hours behind schedule).

**Tech Stack:** Node.js/Express + mysql2 callbacks, bcrypt (new dependency), React 19 + Tailwind + Lucide icons, axios.

## Global Constraints

- Column `katalaluan` in `pelajar` is `VARCHAR(100)`. bcrypt hashes are 60 chars — fits within limit, no ALTER needed.
- Column `katalaluan` in `kakitangan` is `VARCHAR(100)`. Same — fits.
- All SQL uses mysql2 **callback** style (not promise-based), except the migration script which uses `mysql2/promise`.
- Frontend base URL is `http://localhost:5000`. Do not change it.
- All Bahasa Melayu error messages and labels must be preserved as-is.
- No test framework is installed. Manual verification via server logs + browser is the test cycle.
- Demo passwords: pelajar=`pelajar123`, KP/kakitangan=`kp123`, pegawai=`pegawai123` (all currently plain-text in DB).
- "Kredit Tertinggal" threshold: `kredit_terkumpul < semester_max * 14` (14 credits/semester expected pace, below the nominal ~15.25/sem).
- Do **not** log or return any password or hash value in API responses or `console.log`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `server/package.json` | Modify | Add bcrypt dependency |
| `server/scripts/hashExistingPasswords.js` | **Create** | One-time migration: hash all plain-text passwords in DB |
| `server/server.js` | Modify | (a) Add `require('bcrypt')`, (b) fix `/api/login`, (c) hash in POST/PUT pegawai/pelajar, (d) hash in `/api/reset-password`, (e) new `/api/kp/pelajar-berisiko` endpoint |
| `server/client/src/PelajarBerisiko.jsx` | **Create** | New KP page — full table of at-risk students with risk badges |
| `server/client/src/App.jsx` | Modify | Add route `/kp/pelajar-berisiko` → `<PelajarBerisiko />` |
| `server/client/src/components/SidebarLayout.jsx` | Modify | Add "Pelajar Berisiko" nav item in `kpNavItems` |
| `server/client/src/DashboardKP.jsx` | Modify | Add risk summary alert card + second API call to `/api/kp/pelajar-berisiko` |

---

## Task 1: Install bcrypt and Create Migration Script

**Files:**
- Modify: `server/package.json`
- Create: `server/scripts/hashExistingPasswords.js`

**Interfaces:**
- Produces: `bcrypt` available to `require('bcrypt')` in server.js. Migration script runnable with `node server/scripts/hashExistingPasswords.js` from the `server/` directory.

- [ ] **Step 1: Install bcrypt**

```bash
cd server && npm install bcrypt
```

Expected: `package.json` gains `"bcrypt": "^5.x.x"` under `dependencies`. No errors.

- [ ] **Step 2: Verify installation**

```bash
node -e "const b = require('bcrypt'); console.log('bcrypt OK, version:', b.getRounds ? 'loaded' : 'loaded');"
```

Expected: prints `bcrypt OK, version: loaded` (no module-not-found error).

- [ ] **Step 3: Create scripts directory and migration file**

Create `server/scripts/hashExistingPasswords.js` with the following content:

```javascript
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

function isAlreadyHashed(value) {
    return typeof value === 'string' && (value.startsWith('$2b$') || value.startsWith('$2a$'));
}

async function main() {
    const db = await mysql.createConnection({
        host:     process.env.DB_HOST     || '127.0.0.1',
        port:     parseInt(process.env.DB_PORT) || 3306,
        user:     process.env.DB_USER     || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME     || 'actas_db',
    });

    console.log('✅ Berjaya sambung ke DB. Mulakan migrasi hash kata laluan...\n');

    const [pelajarRows] = await db.query('SELECT no_matrik, katalaluan FROM pelajar');
    let pelajarUpdated = 0;
    for (const row of pelajarRows) {
        if (!row.katalaluan || isAlreadyHashed(row.katalaluan)) continue;
        const hashed = await bcrypt.hash(row.katalaluan, SALT_ROUNDS);
        await db.query('UPDATE pelajar SET katalaluan = ? WHERE no_matrik = ?', [hashed, row.no_matrik]);
        pelajarUpdated++;
    }
    console.log(`Pelajar dikemaskini: ${pelajarUpdated} / ${pelajarRows.length}`);

    const [kakiRows] = await db.query('SELECT id_ukmper, katalaluan FROM kakitangan');
    let kakiUpdated = 0;
    for (const row of kakiRows) {
        if (!row.katalaluan || isAlreadyHashed(row.katalaluan)) continue;
        const hashed = await bcrypt.hash(row.katalaluan, SALT_ROUNDS);
        await db.query('UPDATE kakitangan SET katalaluan = ? WHERE id_ukmper = ?', [hashed, row.id_ukmper]);
        kakiUpdated++;
    }
    console.log(`Kakitangan dikemaskini: ${kakiUpdated} / ${kakiRows.length}`);

    await db.end();
    console.log('\n✅ Migrasi selesai. Semua kata laluan telah dihash dengan bcrypt.');
}

main().catch(err => {
    console.error('\n❌ Ralat migrasi:', err.message);
    process.exit(1);
});
```

- [ ] **Step 4: Run the migration script**

```bash
node server/scripts/hashExistingPasswords.js
```

Expected output (with a populated DB):
```
✅ Berjaya sambung ke DB. Mulakan migrasi hash kata laluan...

Pelajar dikemaskini: N / N
Kakitangan dikemaskini: M / M

✅ Migrasi selesai. Semua kata laluan telah dihash dengan bcrypt.
```

If `N` and `M` are both 0, the table is empty or passwords were already hashed — check by running: `SELECT no_matrik, LEFT(katalaluan, 4) FROM pelajar LIMIT 3;` in MySQL. You should see `$2b$`.

- [ ] **Step 5: Commit**

```bash
git add server/package.json server/package-lock.json server/scripts/hashExistingPasswords.js
git commit -m "feat: install bcrypt and add one-time password migration script"
```

---

## Task 2: Secure /api/login with bcrypt.compare

**Files:**
- Modify: `server/server.js` (lines 1–101, the login endpoint and requires block)

**Interfaces:**
- Consumes: `bcrypt` from Task 1 (`npm install bcrypt` must be complete)
- Produces: `POST /api/login` that fetches user by ID only, then compares via `bcrypt.compare()`

**Why this order matters:** Run migration (Task 1) *before* restarting the server with this change. If you restart the server with bcrypt.compare but haven't migrated yet, logins will fail because plain-text hashes don't match bcrypt format.

- [ ] **Step 1: Add bcrypt require at the top of server.js**

In `server/server.js`, find the existing requires block (lines 1–6):

```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
```

Change to:

```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
```

- [ ] **Step 2: Replace the /api/login endpoint**

Find and replace the entire `app.post('/api/login', ...)` block (lines 30–101 in current server.js) with:

```javascript
app.post('/api/login', (req, res) => {
    try {
        const { no_matrik, katalaluan } = req.body;

        if (!no_matrik || !katalaluan) {
            return res.status(400).json({ message: "ID Pengguna dan Kata Laluan diperlukan." });
        }

        db.query("SELECT * FROM pelajar WHERE no_matrik = ?", [no_matrik], async (err, resultPelajar) => {
            if (err) {
                console.error('❌ Login query error (pelajar):', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data. Sila cuba lagi.' });
            }

            if (resultPelajar.length > 0) {
                try {
                    const match = await bcrypt.compare(katalaluan, resultPelajar[0].katalaluan);
                    if (!match) return res.status(401).json({ message: "ID Pengguna atau Kata Laluan salah!" });
                } catch {
                    return res.status(500).json({ error: 'Ralat semasa pengesahan kata laluan.' });
                }
                const user = {
                    no_matrik: resultPelajar[0].no_matrik,
                    nama:      resultPelajar[0].nama,
                    program:   resultPelajar[0].program,
                    role:      'pelajar'
                };
                return res.status(200).json({ message: "Log Masuk Berjaya sebagai Pelajar!", user });
            }

            db.query("SELECT * FROM kakitangan WHERE id_ukmper = ?", [no_matrik], async (errKaki, resultKaki) => {
                if (errKaki) {
                    console.error('❌ Login query error (kakitangan):', errKaki.message);
                    return res.status(500).json({ error: 'Ralat pangkalan data. Sila cuba lagi.' });
                }

                if (resultKaki.length > 0) {
                    try {
                        const match = await bcrypt.compare(katalaluan, resultKaki[0].katalaluan);
                        if (!match) return res.status(401).json({ message: "ID Pengguna atau Kata Laluan salah!" });
                    } catch {
                        return res.status(500).json({ error: 'Ralat semasa pengesahan kata laluan.' });
                    }

                    const penentuRole = resultKaki[0].peranan === 'Ketua Program' ? 'kp' : 'pegawai';
                    let programsHandled = [];
                    try { programsHandled = JSON.parse(resultKaki[0].programs_handled || '[]'); } catch {}

                    const user = {
                        no_matrik:        resultKaki[0].id_ukmper,
                        nama:             resultKaki[0].nama,
                        program:          resultKaki[0].judul_jawatan || resultKaki[0].peranan,
                        role:             penentuRole,
                        programs_handled: programsHandled,
                    };
                    return res.status(200).json({ message: `Log Masuk Berjaya sebagai ${resultKaki[0].peranan}!`, user });
                }

                return res.status(401).json({ message: "ID Pengguna atau Kata Laluan salah!" });
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/login:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka. Sila hubungi pentadbir.' });
    }
});
```

- [ ] **Step 3: Restart server and verify login works**

```bash
# Stop the server (Ctrl+C if running), then:
node server/server.js
# OR if using nodemon:
# nodemon is likely already running — it auto-restarts on file save
```

Open browser → go to `http://localhost:3000` (or wherever frontend runs) → log in with:
- `A21CS001` / `pelajar123` → should succeed, role = `pelajar`
- `KP001` / `kp123` → should succeed, role = `kp`
- `KP001` / `wrongpassword` → should get "ID Pengguna atau Kata Laluan salah!"

- [ ] **Step 4: Commit**

```bash
git add server/server.js
git commit -m "feat: secure /api/login with bcrypt.compare — no password in SQL query"
```

---

## Task 3: Hash Passwords in CRUD and Reset Endpoints

**Files:**
- Modify: `server/server.js` — three endpoints: POST pegawai/pelajar, PUT pegawai/pelajar/:id, POST reset-password

**Interfaces:**
- Consumes: `bcrypt` (already required from Task 2)
- Produces: All three endpoints hash passwords before DB write; PUT conditionally skips katalaluan update when not supplied

- [ ] **Step 1: Hash in POST /api/pegawai/pelajar (create student)**

Find the `app.post('/api/pegawai/pelajar', ...)` handler. The inner callback currently does:

```javascript
const sql = "INSERT INTO pelajar (no_matrik, katalaluan, nama, program) VALUES (?, ?, ?, ?)";
db.query(sql, [no_matrik, katalaluan, nama, program], (err) => {
```

Replace the callback to add hashing. Change the entire handler to:

```javascript
app.post('/api/pegawai/pelajar', async (req, res) => {
    try {
        const { no_matrik, katalaluan, nama, program } = req.body;

        if (!no_matrik || !katalaluan || !nama || !program) {
            return res.status(400).json({ error: 'Semua medan (no_matrik, katalaluan, nama, program) diperlukan.' });
        }

        const hashedPassword = await bcrypt.hash(katalaluan, 10);
        const sql = "INSERT INTO pelajar (no_matrik, katalaluan, nama, program) VALUES (?, ?, ?, ?)";
        db.query(sql, [no_matrik, hashedPassword, nama, program], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: `No Matrik '${no_matrik}' sudah wujud dalam sistem.` });
                }
                console.error('❌ /api/pegawai/pelajar POST error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendaftar pelajar.' });
            }
            res.status(201).json({ message: "Berjaya daftar pelajar baharu!" });
        });
    } catch (e) {
        console.error('❌ Unexpected error in POST /api/pegawai/pelajar:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});
```

- [ ] **Step 2: Hash conditionally in PUT /api/pegawai/pelajar/:id (update student)**

The current handler always updates `katalaluan` even when it's undefined. Replace the entire `app.put('/api/pegawai/pelajar/:id', ...)` handler with:

```javascript
app.put('/api/pegawai/pelajar/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { nama, program, katalaluan } = req.body;

        if (!nama || !program) {
            return res.status(400).json({ error: 'Medan nama dan program diperlukan.' });
        }

        let sql, params;
        if (katalaluan && katalaluan.trim()) {
            const hashedPassword = await bcrypt.hash(katalaluan.trim(), 10);
            sql    = "UPDATE pelajar SET nama = ?, program = ?, katalaluan = ? WHERE no_matrik = ?";
            params = [nama, program, hashedPassword, id];
        } else {
            sql    = "UPDATE pelajar SET nama = ?, program = ? WHERE no_matrik = ?";
            params = [nama, program, id];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                console.error('❌ /api/pegawai/pelajar PUT error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mengemas kini rekod pelajar.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Pelajar dengan No Matrik '${id}' tidak dijumpai.` });
            }
            res.status(200).json({ message: "Rekod pelajar berjaya dikemas kini!" });
        });
    } catch (e) {
        console.error('❌ Unexpected error in PUT /api/pegawai/pelajar:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});
```

- [ ] **Step 3: Hash in POST /api/reset-password**

Find the `app.post('/api/reset-password', ...)` handler. Inside it, find:

```javascript
const { no_matrik, user_type } = results[0];
const updateSql = user_type === 'kakitangan'
    ? 'UPDATE kakitangan SET katalaluan = ? WHERE id_ukmper = ?'
    : 'UPDATE pelajar SET katalaluan = ? WHERE no_matrik = ?';

db.query(updateSql, [newPassword, no_matrik], (updateErr) => {
```

Replace with (the outer callback must become `async`):

```javascript
db.query(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
    [token],
    async (err, results) => {
        if (err) {
            console.error('❌ /api/reset-password query error:', err.message);
            return res.status(500).json({ success: false, message: 'Ralat pangkalan data.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ success: false, message: 'Token tidak sah atau tamat tempoh.' });
        }

        const { no_matrik, user_type } = results[0];
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(newPassword, 10);
        } catch {
            return res.status(500).json({ success: false, message: 'Ralat semasa memproses kata laluan.' });
        }

        const updateSql = user_type === 'kakitangan'
            ? 'UPDATE kakitangan SET katalaluan = ? WHERE id_ukmper = ?'
            : 'UPDATE pelajar SET katalaluan = ? WHERE no_matrik = ?';

        db.query(updateSql, [hashedPassword, no_matrik], (updateErr) => {
            if (updateErr) {
                console.error('❌ /api/reset-password update error:', updateErr.message);
                return res.status(500).json({ success: false, message: 'Ralat mengemaskini kata laluan.' });
            }

            db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (delErr) => {
                if (delErr) console.error('Ralat padam token:', delErr.message);
            });

            res.status(200).json({ success: true, message: 'Kata laluan berjaya ditetapkan semula.' });
        });
    }
);
```

- [ ] **Step 4: Manual smoke test**

With server running:
1. **Create student (Pegawai UI):** Log in as `PEGAWAI001/pegawai123` → Urus Data Pelajar → tambah pelajar baharu (e.g., `A99TEST / test123`). Then check DB: `SELECT LEFT(katalaluan, 4) FROM pelajar WHERE no_matrik='A99TEST';` — should return `$2b$`.
2. **Update student:** Edit that student, change password to `test456`. Check DB: the hash changes.
3. **Login with new student:** Log in as `A99TEST / test123` (original) — should fail (401). Log in as `A99TEST / test456` — should succeed.
4. **Delete test student** via UI to clean up.

- [ ] **Step 5: Commit**

```bash
git add server/server.js
git commit -m "feat: hash passwords with bcrypt in create, update, and reset endpoints"
```

---

## Task 4: Add GET /api/kp/pelajar-berisiko Endpoint

**Files:**
- Modify: `server/server.js` — add new endpoint after the `/api/kp/taburan-gred` block (around line 354)

**Interfaces:**
- Consumes: `programs` query param (JSON array, same pattern as `/api/kp/analitik-pelajar`)
- Produces:
  ```json
  {
    "status": "Berjaya",
    "jumlah_berisiko": 3,
    "senarai": [
      {
        "no_matrik": "A21CS001",
        "nama": "Ahmad Farhan",
        "program": "Sains Komputer",
        "cgpa": "1.85",
        "kredit_terkumpul": 27,
        "semester_max": 3,
        "sebab_risiko": "CGPA Kritikal"
      }
    ]
  }
  ```

**Risk criteria:**
- `cgpa > 0 AND cgpa < 2.00` → label "CGPA Kritikal"
- `semester_max > 0 AND kredit_terkumpul < semester_max * 14` → label "Kredit Tertinggal"
- A student can have both labels (separated by `, `)
- `cgpa = 0` (no keputusan yet) is excluded — cannot assess risk without data

- [ ] **Step 1: Add the endpoint in server.js**

After the closing brace of `app.get('/api/kp/taburan-gred', ...)`, add:

```javascript
// API Endpoint: Kesan Pelajar Berisiko (FR9)
app.get('/api/kp/pelajar-berisiko', (req, res) => {
    try {
        let programList = [];
        try { programList = JSON.parse(req.query.programs || '[]'); } catch {}

        const hasFilter = programList.length > 0;
        const placeholders = programList.map(() => '?').join(', ');

        const sql = `
            SELECT
                p.no_matrik,
                p.nama,
                p.program,
                COALESCE(
                    SUM(CASE WHEN kp.mata_nilaian IS NOT NULL THEN k.jam_kredit * kp.mata_nilaian ELSE 0 END)
                    / NULLIF(SUM(CASE WHEN kp.mata_nilaian IS NOT NULL THEN k.jam_kredit ELSE 0 END), 0),
                    0
                ) AS cgpa,
                COALESCE(SUM(k.jam_kredit), 0) AS kredit_terkumpul,
                COALESCE(MAX(kp.semester_diambil), 0) AS semester_max
            FROM pelajar p
            LEFT JOIN keputusan kp ON p.no_matrik = kp.no_matrik
            LEFT JOIN kursus k ON kp.kod_kursus = k.kod_kursus
            ${hasFilter ? `WHERE p.program IN (${placeholders})` : ''}
            GROUP BY p.no_matrik, p.nama, p.program
            HAVING
                (cgpa > 0 AND cgpa < 2.00)
                OR (semester_max > 0 AND kredit_terkumpul < semester_max * 14)
            ORDER BY cgpa ASC
        `;

        db.query(sql, programList, (err, results) => {
            if (err) {
                console.error('❌ /api/kp/pelajar-berisiko query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan data pelajar berisiko.' });
            }

            const senarai = results.map(row => {
                const cgpa = parseFloat(row.cgpa).toFixed(2);
                const sebabRisiko = [];
                if (parseFloat(cgpa) > 0 && parseFloat(cgpa) < 2.00) sebabRisiko.push('CGPA Kritikal');
                if (row.semester_max > 0 && parseInt(row.kredit_terkumpul) < row.semester_max * 14) sebabRisiko.push('Kredit Tertinggal');
                return {
                    no_matrik:        row.no_matrik,
                    nama:             row.nama,
                    program:          row.program,
                    cgpa,
                    kredit_terkumpul: parseInt(row.kredit_terkumpul),
                    semester_max:     row.semester_max,
                    sebab_risiko:     sebabRisiko.join(', '),
                };
            });

            res.status(200).json({
                status: 'Berjaya',
                jumlah_berisiko: senarai.length,
                senarai,
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/kp/pelajar-berisiko:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});
```

- [ ] **Step 2: Test the endpoint manually**

With server running, open a browser or use curl:

```
http://localhost:5000/api/kp/pelajar-berisiko
```

Expected: JSON with `status: "Berjaya"` and a `senarai` array. If the seed data has students with low scores, you'll see results. If empty, that's valid (no at-risk students in seed data).

To test filter: `http://localhost:5000/api/kp/pelajar-berisiko?programs=["Sains Komputer"]`

- [ ] **Step 3: Commit**

```bash
git add server/server.js
git commit -m "feat: add GET /api/kp/pelajar-berisiko endpoint for FR9 at-risk student detection"
```

---

## Task 5: Create PelajarBerisiko.jsx Frontend Page

**Files:**
- Create: `server/client/src/PelajarBerisiko.jsx`

**Interfaces:**
- Consumes: `GET /api/kp/pelajar-berisiko?programs=<JSON>` (from Task 4)
- Produces: React component exported as default, importable in App.jsx as `import PelajarBerisiko from './PelajarBerisiko'`

- [ ] **Step 1: Create PelajarBerisiko.jsx**

Create `server/client/src/PelajarBerisiko.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Users } from 'lucide-react';

function riskBadge(sebab) {
    if (!sebab) return null;
    return sebab.split(', ').map((label, i) => {
        const isCgpa   = label === 'CGPA Kritikal';
        const isKredit = label === 'Kredit Tertinggal';
        const cls = isCgpa
            ? 'bg-red-100 text-red-700'
            : isKredit
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600';
        return (
            <span key={i} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mr-1 ${cls}`}>
                {label}
            </span>
        );
    });
}

function PelajarBerisiko() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [data, setData]       = useState({ jumlah_berisiko: 0, senarai: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/pelajar-berisiko', {
            params: { programs: JSON.stringify(user.programs_handled ?? []) }
        })
            .then(res => setData(res.data))
            .catch(() => setError('Gagal memuat data pelajar berisiko. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const { jumlah_berisiko, senarai } = data;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
                </div>
            ) : error ? (
                <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {error}
                </div>
            ) : (
                <>
                    {/* ── HERO BANNER ── */}
                    <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                        <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                            <div>
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    PENGESANAN RISIKO AKADEMIK — FR9
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    Senarai Pelajar Berisiko
                                </h1>
                                <p className="text-white/30 text-sm mt-1 font-medium">
                                    Pelajar dengan CGPA &lt; 2.00 atau kredit tertinggal berbanding semester semasa.
                                </p>
                            </div>

                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <p style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        PELAJAR BERISIKO
                                    </p>
                                    <p className="text-white font-black tracking-tight mt-1"
                                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 56, lineHeight: 1 }}>
                                        {jumlah_berisiko}
                                    </p>
                                    <p style={{ color: 'rgba(252,165,165,0.6)', fontSize: 10, marginTop: 2 }}>
                                        pelajar memerlukan perhatian
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RISK LEGEND ── */}
                    <div className="flex flex-wrap items-center gap-4 px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kategori Risiko:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            CGPA Kritikal — CGPA &lt; 2.00
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Kredit Tertinggal — kredit &lt; semester × 14
                        </span>
                    </div>

                    {/* ── TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-7 py-5 border-b border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Senarai Pelajar Berisiko
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {jumlah_berisiko} pelajar memerlukan tindakan susulan
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-3 font-semibold">No. Matrik</th>
                                        <th className="px-4 py-3 font-semibold">Nama Pelajar</th>
                                        <th className="px-4 py-3 font-semibold">Program</th>
                                        <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                        <th className="px-4 py-3 font-semibold text-center">Semester</th>
                                        <th className="px-4 py-3 font-semibold text-center">CGPA</th>
                                        <th className="px-4 py-3 font-semibold">Kategori Risiko</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                    {senarai.map((p, i) => (
                                        <tr key={i} className="hover:bg-red-50/30 transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-[#002060] text-xs">
                                                {p.no_matrik}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium max-w-[180px] truncate">
                                                {p.nama}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                                                    {p.program ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-gray-500 text-xs">
                                                {p.kredit_terkumpul}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-gray-500 text-xs">
                                                {p.semester_max}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="px-2.5 py-1 rounded-md font-extrabold text-xs inline-block min-w-[46px] text-center bg-red-100 text-red-700">
                                                    {p.cgpa}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {riskBadge(p.sebab_risiko)}
                                            </td>
                                        </tr>
                                    ))}

                                    {senarai.length === 0 && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                    <Users size={36} className="text-gray-200" />
                                                    <p className="text-gray-400 text-sm font-medium text-center">
                                                        Tiada pelajar berisiko dikesan buat masa ini.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default PelajarBerisiko;
```

- [ ] **Step 2: Commit**

```bash
git add server/client/src/PelajarBerisiko.jsx
git commit -m "feat: add PelajarBerisiko.jsx — KP page for FR9 at-risk student table"
```

---

## Task 6: Wire Up Route, Sidebar Nav, and DashboardKP Summary Card

**Files:**
- Modify: `server/client/src/App.jsx`
- Modify: `server/client/src/components/SidebarLayout.jsx`
- Modify: `server/client/src/DashboardKP.jsx`

**Interfaces:**
- Consumes: `PelajarBerisiko` component (Task 5), `GET /api/kp/pelajar-berisiko` (Task 4)
- Produces: Route `/kp/pelajar-berisiko` accessible, KP sidebar shows "Pelajar Berisiko" link, DashboardKP shows risk alert card

- [ ] **Step 1: Add route in App.jsx**

In `server/client/src/App.jsx`, add the import at the top with other KP imports:

```javascript
import PelajarBerisiko from './PelajarBerisiko';
```

Then, inside the `<Routes>` block, after the existing KP route for `/kp/maklum-balas`:

```jsx
<Route path="/kp/pelajar-berisiko" element={<ProtectedRoute roles={['kp']}><PelajarBerisiko /></ProtectedRoute>} />
```

- [ ] **Step 2: Add nav item in SidebarLayout.jsx**

In `server/client/src/components/SidebarLayout.jsx`, find the existing import for Lucide icons at line 2–14. Add `AlertTriangle` to the import:

```javascript
import {
    LayoutDashboard,
    CheckSquare,
    BarChart3,
    BrainCircuit,
    Star,
    LogOut,
    MonitorPlay,
    MessageSquare,
    FileText,
    Users,
    Settings,
    AlertTriangle
} from 'lucide-react';
```

Then find `const kpNavItems = [...]` and add the new entry after the `Maklum Balas` item:

```javascript
const kpNavItems = [
    { name: 'Papan Pemuka',      path: '/kp/dashboard',         icon: LayoutDashboard },
    { name: 'Pantau Kursus',     path: '/kp/pantau-kursus',     icon: MonitorPlay },
    { name: 'Analisis Gred',     path: '/kp/analisis-gred',     icon: BarChart3 },
    { name: 'Maklum Balas',      path: '/kp/maklum-balas',      icon: MessageSquare },
    { name: 'Pelajar Berisiko',  path: '/kp/pelajar-berisiko',  icon: AlertTriangle },
];
```

- [ ] **Step 3: Add risk summary alert card in DashboardKP.jsx**

In `server/client/src/DashboardKP.jsx`, update the imports to add `AlertTriangle` and `ChevronRight`:

```javascript
import { Users, MessageSquare, Search, ArrowUpDown, Download, AlertTriangle, ChevronRight } from 'lucide-react';
```

Add a new state variable at the top of the `DashboardKP` function (after the existing state declarations):

```javascript
const [risikoCount, setRisikoCount] = useState(0);
```

In the `useEffect`, add a second axios call after the existing one (both can run in parallel since they're independent):

```javascript
useEffect(() => {
    if (!user || user.role !== 'kp') { navigate('/'); return; }

    const programsParam = JSON.stringify(user.programs_handled ?? []);

    axios.get('http://localhost:5000/api/kp/analitik-pelajar', {
        params: { programs: programsParam }
    })
        .then(res => setKpData(res.data))
        .catch(() => setError('Gagal memuat data analitik. Sila muat semula halaman.'))
        .finally(() => setLoading(false));

    axios.get('http://localhost:5000/api/kp/pelajar-berisiko', {
        params: { programs: programsParam }
    })
        .then(res => setRisikoCount(res.data.jumlah_berisiko ?? 0))
        .catch(() => {});
}, []);
```

Then, in the JSX, add the risk alert card between the distribution bar and the student table. Find the comment `{/* ── STUDENT TABLE ── */}` and insert the card just above it:

```jsx
{/* ── RISK ALERT CARD ── */}
{risikoCount > 0 && (
    <div className="flex items-center justify-between gap-4 px-6 py-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-red-800">
                    {risikoCount} pelajar berisiko dikesan
                </p>
                <p className="text-xs text-red-500 mt-0.5">
                    CGPA Kritikal (&lt;2.00) atau kredit tertinggal berbanding semester semasa
                </p>
            </div>
        </div>
        <button
            onClick={() => navigate('/kp/pelajar-berisiko')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex-shrink-0"
        >
            Lihat Senarai
            <ChevronRight size={12} />
        </button>
    </div>
)}

{/* ── STUDENT TABLE ── */}
```

- [ ] **Step 4: End-to-end browser test**

1. Start both backend (`node server/server.js`) and frontend (`npm run dev` inside `server/client/`).
2. Log in as `KP001 / kp123`.
3. Verify sidebar shows "Pelajar Berisiko" link with the triangle icon.
4. Navigate to `/kp/pelajar-berisiko` — should render the page with hero banner.
5. If any at-risk students exist in the seed data, they appear in the table with red/amber badges.
6. Go back to `/kp/dashboard` — if at-risk count > 0, the red alert card appears above the student table with a working "Lihat Senarai" button.
7. Verify that navigating directly to `/kp/pelajar-berisiko` while NOT logged in redirects to `/`.

- [ ] **Step 5: Commit**

```bash
git add server/client/src/App.jsx server/client/src/components/SidebarLayout.jsx server/client/src/DashboardKP.jsx
git commit -m "feat: wire FR9 Pelajar Berisiko into KP routing, sidebar, and dashboard alert card"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] ISU 1.1: bcrypt installed — Task 1
- [x] ISU 1.2: Hash in create (POST pegawai/pelajar), update (PUT pegawai/pelajar/:id), reset (POST reset-password) — Task 3
- [x] ISU 1.3: Login uses bcrypt.compare, no password in SQL — Task 2
- [x] ISU 1.4: Migration script for existing accounts — Task 1, Step 3-4
- [x] ISU 1.5: No password/hash in console.log or API responses — verified throughout (server logs only log IDs/errors, never katalaluan values)
- [x] ISU 2.1: GET /api/kp/pelajar-berisiko with CGPA + credit criteria + programs_handled filter — Task 4
- [x] ISU 2.2: Frontend page with risk badge table — Task 5
- [x] ISU 2.3: programs_handled filter honoured — implemented in SQL WHERE clause same as analitik-pelajar

**Notes for documentation update (D5/D6):**
- `katalaluan` field in `pelajar` and `kakitangan`: stored as bcrypt hash (60-char string, format `$2b$10$...`), fits VARCHAR(100)
- Login flow: two-step — (1) SELECT by ID, (2) bcrypt.compare in application layer
- New endpoint: `GET /api/kp/pelajar-berisiko` — risk criteria: CGPA < 2.00 OR kredit_terkumpul < semester_max × 14
- New route: `/kp/pelajar-berisiko`, KP role only
- No changes to DB schema required (VARCHAR(100) accommodates bcrypt hash)
