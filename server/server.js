require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// DB config — env vars first, XAMPP defaults as fallback
const db = mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'actas_db',
});

db.connect((err) => {
    if (err) {
        console.error('❌ Gagal sambung ke MySQL:', err.message);
        process.exit(1);
    }
    console.log('✅ Berjaya sambung ke MySQL (actas_db)!');
});

// API Endpoint 1: Log Masuk Dinamik (Pelajar, KP, dan Pegawai)
app.post('/api/login', (req, res) => {
    try {
        const { no_matrik, katalaluan } = req.body;

        if (!no_matrik || !katalaluan) {
            return res.status(400).json({ message: "ID Pengguna dan Kata Laluan diperlukan." });
        }

        // 1. Cuba cari dalam jadual pelajar terlebih dahulu
        const sqlPelajar = "SELECT * FROM pelajar WHERE no_matrik = ? AND katalaluan = ?";

        db.query(sqlPelajar, [no_matrik, katalaluan], (err, resultPelajar) => {
            if (err) {
                console.error('❌ Login query error (pelajar):', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data. Sila cuba lagi.' });
            }

            // Jika dijumpai dalam jadual pelajar
            if (resultPelajar.length > 0) {
                const user = {
                    no_matrik: resultPelajar[0].no_matrik,
                    nama: resultPelajar[0].nama,
                    program: resultPelajar[0].program,
                    role: 'pelajar'
                };
                return res.status(200).json({ message: "Log Masuk Berjaya sebagai Pelajar!", user });
            }

            // 2. Jika tidak jumpa dalam jadual pelajar, cari dalam jadual KAKITANGAN (UKMPer)
            const sqlKakitangan = "SELECT * FROM kakitangan WHERE id_ukmper = ? AND katalaluan = ?";

            db.query(sqlKakitangan, [no_matrik, katalaluan], (errKakitangan, resultKakitangan) => {
                if (errKakitangan) {
                    console.error('❌ Login query error (kakitangan):', errKakitangan.message);
                    return res.status(500).json({ error: 'Ralat pangkalan data. Sila cuba lagi.' });
                }

                // Jika dijumpai dalam jadual kakitangan
                if (resultKakitangan.length > 0) {
                    let penentuRole = 'pegawai';

                    if (resultKakitangan[0].peranan === 'Ketua Program') {
                        penentuRole = 'kp';
                    } else if (resultKakitangan[0].peranan === 'Pegawai FTSM') {
                        penentuRole = 'pegawai';
                    }

                    const user = {
                        no_matrik: resultKakitangan[0].id_ukmper,
                        nama: resultKakitangan[0].nama,
                        program: resultKakitangan[0].peranan,
                        role: penentuRole
                    };
                    return res.status(200).json({ message: `Log Masuk Berjaya sebagai ${resultKakitangan[0].peranan}!`, user });
                }

                // 3. Jika kedua-dua jadual langsung tak jumpa data
                return res.status(401).json({ message: "ID Pengguna atau Kata Laluan salah!" });
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/login:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka. Sila hubungi pentadbir.' });
    }
});

// API Endpoint 2: Capaian Data Akademik & Kiraan Automatik
app.get('/api/akademik/:no_matrik', (req, res) => {
    try {
        const noMatrik = req.params.no_matrik;

        const sql = `
            SELECT
                k.kod_kursus,
                k.nama_kursus,
                k.jam_kredit,
                k.kategori,
                kp.gred,
                kp.mata_nilaian,
                kp.semester_diambil
            FROM Keputusan kp
            JOIN Kursus k ON kp.kod_kursus = k.kod_kursus
            WHERE kp.no_matrik = ?
            ORDER BY kp.semester_diambil ASC
        `;

        db.query(sql, [noMatrik], (err, results) => {
            if (err) {
                console.error('❌ /api/akademik query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan data akademik.' });
            }

            let totalKredit = 0;
            let totalMataNilaian = 0;

            results.forEach(subjek => {
                totalKredit += subjek.jam_kredit;
                totalMataNilaian += (subjek.mata_nilaian * subjek.jam_kredit);
            });

            let pngk = totalKredit > 0 ? (totalMataNilaian / totalKredit).toFixed(2) : "0.00";

            res.status(200).json({
                status: "Berjaya",
                jumlah_kredit: totalKredit,
                pngk_semasa: pngk,
                senarai_keputusan: results
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/akademik:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// API Endpoint 3: Tambah Kursus & Keputusan Baharu secara Dinamik
app.post('/api/tambah-kursus', (req, res) => {
    try {
        const { no_matrik, kod_kursus, nama_kursus, jam_kredit, kategori, gred, mata_nilaian, semester_diambil } = req.body;

        if (!no_matrik || !kod_kursus || !gred) {
            return res.status(400).json({ error: 'Medan no_matrik, kod_kursus, dan gred diperlukan.' });
        }

        // Langkah A: Masukkan ke jadual Kursus (IGNORE jika kod_kursus dah wujud)
        const sqlKursus = "INSERT IGNORE INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori) VALUES (?, ?, ?, ?)";

        db.query(sqlKursus, [kod_kursus, nama_kursus, jam_kredit, kategori], (err) => {
            if (err) {
                console.error('❌ /api/tambah-kursus insert kursus error:', err.message);
                return res.status(500).json({ error: 'Ralat semasa menyimpan maklumat kursus.' });
            }

            // Langkah B: Masukkan gred ke jadual Keputusan
            const sqlKeputusan = "INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES (?, ?, ?, ?, ?)";

            db.query(sqlKeputusan, [no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil], (err2) => {
                if (err2) {
                    console.error('❌ /api/tambah-kursus insert keputusan error:', err2.message);
                    return res.status(500).json({ error: 'Ralat semasa menyimpan keputusan pelajar.' });
                }

                res.status(200).json({ message: "Data keputusan berjaya ditambah!" });
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/tambah-kursus:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// ===================================================================
// API KHAS KETUA PROGRAM (KP)
// ===================================================================

// API Endpoint 4: Tarik Semua Data Pelajar & Analitik Fakulti
app.get('/api/kp/analitik-pelajar', (req, res) => {
    try {
        const sql = `
            SELECT
                p.no_matrik, p.nama, p.program,
                k.jam_kredit, kp.mata_nilaian
            FROM pelajar p
            LEFT JOIN keputusan kp ON p.no_matrik = kp.no_matrik
            LEFT JOIN kursus k ON kp.kod_kursus = k.kod_kursus
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('❌ /api/kp/analitik-pelajar query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan analitik pelajar.' });
            }

            const pelajarMap = {};

            results.forEach(row => {
                if (!pelajarMap[row.no_matrik]) {
                    pelajarMap[row.no_matrik] = {
                        no_matrik: row.no_matrik,
                        nama: row.nama,
                        program: row.program,
                        totalMata: 0,
                        totalKredit: 0
                    };
                }

                if (row.jam_kredit && row.mata_nilaian) {
                    pelajarMap[row.no_matrik].totalMata += (parseFloat(row.mata_nilaian) * parseInt(row.jam_kredit));
                    pelajarMap[row.no_matrik].totalKredit += parseInt(row.jam_kredit);
                }
            });

            let totalCgpaSemua = 0;
            let pelajarCount = 0;
            const senaraiPelajar = [];

            Object.values(pelajarMap).forEach(p => {
                p.cgpa = p.totalKredit > 0 ? (p.totalMata / p.totalKredit).toFixed(2) : "0.00";
                senaraiPelajar.push(p);

                if (p.totalKredit > 0) {
                    totalCgpaSemua += parseFloat(p.cgpa);
                    pelajarCount++;
                }
            });

            const purataCgpaFakulti = pelajarCount > 0 ? (totalCgpaSemua / pelajarCount).toFixed(2) : "0.00";

            res.status(200).json({
                status: "Berjaya",
                jumlah_pelajar: Object.keys(pelajarMap).length,
                purata_cgpa_fakulti: purataCgpaFakulti,
                senarai_pelajar: senaraiPelajar
            });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/kp/analitik-pelajar:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// API Endpoint 5: Pantau Prestasi Mengikut Kursus (Untuk KP)
app.get('/api/kp/pantau-kursus', (req, res) => {
    try {
        const sql = `
            SELECT
                k.kod_kursus,
                k.nama_kursus,
                k.kategori,
                k.jam_kredit,
                COUNT(kp.no_matrik) AS jumlah_pelajar,
                AVG(kp.mata_nilaian) AS purata_mata
            FROM kursus k
            LEFT JOIN keputusan kp ON k.kod_kursus = kp.kod_kursus
            GROUP BY k.kod_kursus, k.nama_kursus, k.kategori, k.jam_kredit
            ORDER BY purata_mata DESC
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('❌ /api/kp/pantau-kursus query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa memantau kursus.' });
            }

            const cleanResults = results.map(kursus => ({
                ...kursus,
                purata_mata: kursus.purata_mata ? parseFloat(kursus.purata_mata).toFixed(2) : "0.00"
            }));

            res.status(200).json(cleanResults);
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/kp/pantau-kursus:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// API Endpoint 6: Analisis Taburan Gred Keseluruhan (Untuk KP)
app.get('/api/kp/taburan-gred', (req, res) => {
    try {
        const sql = `
            SELECT gred, COUNT(no_matrik) as jumlah
            FROM keputusan
            GROUP BY gred
            ORDER BY
                CASE gred
                    WHEN 'A'  THEN 1
                    WHEN 'A-' THEN 2
                    WHEN 'B+' THEN 3
                    WHEN 'B'  THEN 4
                    WHEN 'B-' THEN 5
                    WHEN 'C+' THEN 6
                    WHEN 'C'  THEN 7
                    WHEN 'D'  THEN 8
                    WHEN 'E'  THEN 9
                    ELSE 10
                END
        `;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('❌ /api/kp/taburan-gred query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan taburan gred.' });
            }
            res.status(200).json(results);
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/kp/taburan-gred:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// API Endpoint 7: Tarik Maklum Balas / Amaran Khusus untuk Pelajar Tertentu
app.get('/api/pelajar/maklum-balas/:no_matrik', (req, res) => {
    try {
        const noMatrik = req.params.no_matrik;
        const sql = "SELECT * FROM maklum_balas WHERE no_matrik = ? ORDER BY tarikh DESC";

        db.query(sql, [noMatrik], (err, results) => {
            if (err) {
                console.error('❌ /api/pelajar/maklum-balas query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan maklum balas.' });
            }
            res.status(200).json(results);
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/pelajar/maklum-balas:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// ===================================================================
// API PENILAIAN KURSUS (PELAJAR KEPADA KP)
// ===================================================================

// Auto-bina jadual penilaian_kursus
const sqlBinaPenilaian = `
    CREATE TABLE IF NOT EXISTS penilaian_kursus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_matrik VARCHAR(20),
        kod_kursus VARCHAR(20),
        rating INT,
        komen TEXT,
        tarikh TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`;
db.query(sqlBinaPenilaian, (err) => {
    if (err) console.error("Ralat bina jadual penilaian_kursus:", err.message);
});

// POST: Pelajar hantar penilaian kursus
app.post('/api/pelajar/penilaian', (req, res) => {
    try {
        const { no_matrik, kod_kursus, rating, komen } = req.body;

        if (!no_matrik || !kod_kursus || rating === undefined) {
            return res.status(400).json({ error: 'Medan no_matrik, kod_kursus, dan rating diperlukan.' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating mesti antara 1 hingga 5.' });
        }

        const sql = "INSERT INTO penilaian_kursus (no_matrik, kod_kursus, rating, komen) VALUES (?, ?, ?, ?)";

        db.query(sql, [no_matrik, kod_kursus, rating, komen], (err) => {
            if (err) {
                console.error('❌ /api/pelajar/penilaian query error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa menghantar penilaian.' });
            }
            res.status(200).json({ message: "Penilaian kursus berjaya dihantar!" });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/pelajar/penilaian:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// ===================================================================
// API MAKLUM BALAS / AMARAN AKADEMIK
// ===================================================================

// Auto-bina jadual jika belum wujud dalam MySQL
const sqlBinaJadual = `
    CREATE TABLE IF NOT EXISTS maklum_balas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_matrik VARCHAR(20),
        tarikh TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mesej TEXT,
        status VARCHAR(20) DEFAULT 'Belum Dibaca'
    )
`;
db.query(sqlBinaJadual, (err) => {
    if (err) console.error("Ralat bina jadual maklum_balas:", err.message);
});

// PATCH: Tandai semua maklum balas pelajar sebagai dibaca
app.patch('/api/pelajar/maklum-balas/baca/:no_matrik', (req, res) => {
    try {
        const noMatrik = req.params.no_matrik;
        const sql = "UPDATE maklum_balas SET status = 'Dibaca' WHERE no_matrik = ? AND status = 'Belum Dibaca'";
        db.query(sql, [noMatrik], (err) => {
            if (err) {
                console.error('❌ /api/pelajar/maklum-balas/baca error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data.' });
            }
            res.status(200).json({ message: 'Maklum balas ditandai sebagai dibaca.' });
        });
    } catch (e) {
        console.error('❌ Unexpected error in PATCH /maklum-balas/baca:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// POST: KP hantar maklum balas kepada pelajar
app.post('/api/kp/maklum-balas', (req, res) => {
    try {
        const { no_matrik, mesej } = req.body;

        if (!no_matrik || !mesej || mesej.trim() === '') {
            return res.status(400).json({ error: 'Medan no_matrik dan mesej diperlukan.' });
        }

        console.log("📥 Cuba hantar mesej ke matrik:", no_matrik);
        console.log("💬 Kandungan Mesej:", mesej);

        const sql = "INSERT INTO maklum_balas (no_matrik, mesej) VALUES (?, ?)";

        db.query(sql, [no_matrik, mesej.trim()], (err) => {
            if (err) {
                console.error("❌ RALAT SQL MAKLUM BALAS:", err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa menghantar maklum balas.' });
            }
            res.status(200).json({ message: "Maklum balas berjaya dihantar!" });
        });
    } catch (e) {
        console.error('❌ Unexpected error in /api/kp/maklum-balas:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// ===================================================================
// API KHAS PEGAWAI (CRUD DATA PELAJAR)
// ===================================================================

// READ: Tarik senarai semua pelajar
app.get('/api/pegawai/pelajar', (req, res) => {
    try {
        db.query("SELECT * FROM pelajar ORDER BY no_matrik ASC", (err, results) => {
            if (err) {
                console.error('❌ /api/pegawai/pelajar GET error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa mendapatkan senarai pelajar.' });
            }
            res.status(200).json(results);
        });
    } catch (e) {
        console.error('❌ Unexpected error in GET /api/pegawai/pelajar:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});

// CREATE: Tambah pelajar baharu
app.post('/api/pegawai/pelajar', (req, res) => {
    try {
        const { no_matrik, katalaluan, nama, program } = req.body;

        if (!no_matrik || !katalaluan || !nama || !program) {
            return res.status(400).json({ error: 'Semua medan (no_matrik, katalaluan, nama, program) diperlukan.' });
        }

        const sql = "INSERT INTO pelajar (no_matrik, katalaluan, nama, program) VALUES (?, ?, ?, ?)";
        db.query(sql, [no_matrik, katalaluan, nama, program], (err) => {
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

// UPDATE: Kemas kini profil pelajar
app.put('/api/pegawai/pelajar/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { nama, program, katalaluan } = req.body;

        if (!nama || !program) {
            return res.status(400).json({ error: 'Medan nama dan program diperlukan.' });
        }

        const sql = "UPDATE pelajar SET nama = ?, program = ?, katalaluan = ? WHERE no_matrik = ?";
        db.query(sql, [nama, program, katalaluan, id], (err, result) => {
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

// DELETE: Padam rekod pelajar
app.delete('/api/pegawai/pelajar/:id', (req, res) => {
    try {
        const id = req.params.id;
        const sql = "DELETE FROM pelajar WHERE no_matrik = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('❌ /api/pegawai/pelajar DELETE error:', err.message);
                return res.status(500).json({ error: 'Ralat pangkalan data semasa memadamkan rekod pelajar.' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: `Pelajar dengan No Matrik '${id}' tidak dijumpai.` });
            }
            res.status(200).json({ message: "Pelajar berjaya dipadam dari sistem!" });
        });
    } catch (e) {
        console.error('❌ Unexpected error in DELETE /api/pegawai/pelajar:', e.message);
        res.status(500).json({ error: 'Ralat tidak dijangka.' });
    }
});


// ===================================================================
// TETAPAN SEMULA KATA LALUAN
// ===================================================================

// Auto-bina jadual password_reset_tokens
db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        no_matrik VARCHAR(20) NOT NULL,
        token VARCHAR(100) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) console.error('Ralat bina jadual password_reset_tokens:', err.message);
});

// Tambah kolum email ke jadual pelajar dan kakitangan jika belum wujud
db.query(`ALTER TABLE pelajar ADD COLUMN IF NOT EXISTS email VARCHAR(100)`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
        console.error('Ralat tambah kolum email (pelajar):', err.message);
    }
});
db.query(`ALTER TABLE kakitangan ADD COLUMN IF NOT EXISTS email VARCHAR(100)`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
        console.error('Ralat tambah kolum email (kakitangan):', err.message);
    }
});
// Tambah kolum user_type ke jadual password_reset_tokens jika belum wujud
db.query(`ALTER TABLE password_reset_tokens ADD COLUMN IF NOT EXISTS user_type VARCHAR(20) DEFAULT 'pelajar'`, (err) => {
    if (err && !err.message.includes('Duplicate column')) {
        console.error('Ralat tambah kolum user_type:', err.message);
    }
});

const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// POST: Hantar e-mel reset kata laluan (pelajar & kakitangan)
app.post('/api/forgot-password', (req, res) => {
    try {
        const { email, no_matrik } = req.body;

        if (!email || !no_matrik) {
            return res.status(400).json({ success: false, message: 'E-mel dan No. Matrik diperlukan.' });
        }

        // Cari dalam pelajar dahulu, kemudian kakitangan
        db.query('SELECT * FROM pelajar WHERE no_matrik = ? AND email = ?', [no_matrik, email], (err, pelajarResults) => {
            if (err) {
                console.error('❌ /api/forgot-password pelajar query error:', err.message);
                return res.status(500).json({ success: false, message: 'Ralat pangkalan data.' });
            }

            const sendReset = (user, userType) => {
                const token = crypto.randomBytes(32).toString('hex');
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

                db.query('DELETE FROM password_reset_tokens WHERE no_matrik = ?', [no_matrik], (delErr) => {
                    if (delErr) console.error('Ralat padam token lama:', delErr.message);

                    db.query(
                        'INSERT INTO password_reset_tokens (no_matrik, token, expires_at, user_type) VALUES (?, ?, ?, ?)',
                        [no_matrik, token, expiresAt, userType],
                        (insertErr) => {
                            if (insertErr) {
                                console.error('❌ /api/forgot-password insert token error:', insertErr.message);
                                return res.status(500).json({ success: false, message: 'Ralat menyimpan token.' });
                            }

                            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

                            const mailOptions = {
                                from: `"ACTAS-FTSM" <${process.env.EMAIL_USER}>`,
                                to: email,
                                subject: 'ACTAS-FTSM - Tetapkan Semula Kata Laluan',
                                html: `
<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,48,130,0.10);">
        <!-- Header -->
        <tr>
          <td style="background:#003082;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">ACTAS-FTSM</p>
            <p style="margin:6px 0 0;font-size:12px;color:#a8c4ff;letter-spacing:2px;text-transform:uppercase;">Sistem Analisis Kredit Akademik</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;font-size:20px;color:#003082;font-weight:700;">Tetapan Semula Kata Laluan</h2>
            <p style="margin:0 0 12px;color:#374151;font-size:15px;">Salam, <strong>${pelajar.nama}</strong>,</p>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.7;">
              Kami menerima permintaan untuk menetapkan semula kata laluan akaun ACTAS-FTSM anda:
              <strong style="color:#003082;">${no_matrik}</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetUrl}"
                 style="display:inline-block;background:#003082;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;letter-spacing:0.5px;">
                Tetapkan Kata Laluan
              </a>
            </div>
            <p style="margin:24px 0 8px;color:#6b7280;font-size:13px;text-align:center;">
              Pautan ini akan tamat tempoh dalam <strong>1 jam</strong>.
            </p>
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              Jika anda tidak membuat permintaan ini, abaikan e-mel ini.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8faff;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              ACTAS-FTSM &nbsp;|&nbsp; Fakulti Teknologi dan Sains Maklumat, UKM
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
                            };

                            mailer.sendMail(mailOptions, (mailErr) => {
                                if (mailErr) {
                                    console.error('❌ Gagal hantar e-mel:', mailErr.message);
                                    return res.status(500).json({ success: false, message: 'Gagal menghantar e-mel. Sila cuba lagi.' });
                                }
                                res.status(200).json({ success: true, message: 'E-mel reset telah dihantar.' });
                            });
                        }
                    );
                });
            }
        );
    } catch (e) {
        console.error('❌ Unexpected error in /api/forgot-password:', e.message);
        res.status(500).json({ success: false, message: 'Ralat tidak dijangka.' });
    }
});

// POST: Tetapkan semula kata laluan dengan token
app.post('/api/reset-password', (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token dan kata laluan baharu diperlukan.' });
        }

        db.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
            [token],
            (err, results) => {
                if (err) {
                    console.error('❌ /api/reset-password query error:', err.message);
                    return res.status(500).json({ success: false, message: 'Ralat pangkalan data.' });
                }

                if (results.length === 0) {
                    return res.status(400).json({ success: false, message: 'Token tidak sah atau tamat tempoh.' });
                }

                const { no_matrik } = results[0];

                db.query(
                    'UPDATE pelajar SET katalaluan = ? WHERE no_matrik = ?',
                    [newPassword, no_matrik],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('❌ /api/reset-password update error:', updateErr.message);
                            return res.status(500).json({ success: false, message: 'Ralat mengemaskini kata laluan.' });
                        }

                        db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token], (delErr) => {
                            if (delErr) console.error('Ralat padam token:', delErr.message);
                        });

                        res.status(200).json({ success: true, message: 'Kata laluan berjaya ditetapkan semula.' });
                    }
                );
            }
        );
    } catch (e) {
        console.error('❌ Unexpected error in /api/reset-password:', e.message);
        res.status(500).json({ success: false, message: 'Ralat tidak dijangka.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend ACTAS berjalan di port ${PORT}`);
});