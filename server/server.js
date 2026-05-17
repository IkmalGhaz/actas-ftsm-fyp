const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sambungan ke Pangkalan Data (XAMPP MySQL)
const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root', // username default XAMPP
    password: '', // password default XAMPP (kosongkan)
    database: 'actas_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Berjaya sambung ke MySQL (actas_db)!');
});

// API Endpoint 1: Log Masuk Dinamik (Pelajar, KP, dan Pegawai)
app.post('/api/login', (req, res) => {
    const { no_matrik, katalaluan } = req.body;
    
    // 1. Cuba cari dalam jadual pelajar terlebih dahulu
    const sqlPelajar = "SELECT * FROM pelajar WHERE no_matrik = ? AND katalaluan = ?";
    
    db.query(sqlPelajar, [no_matrik, katalaluan], (err, resultPelajar) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Jika dijumpai dalam jadual pelajar
        if (resultPelajar.length > 0) {
            const user = {
                no_matrik: resultPelajar[0].no_matrik,
                nama: resultPelajar[0].nama,
                program: resultPelajar[0].program,
                role: 'pelajar' // Beritahu React ini adalah pelajar
            };
            return res.status(200).json({ message: "Log Masuk Berjaya sebagai Pelajar!", user });
        }
        
        // 2. Jika tidak jumpa dalam jadual pelajar, cari dalam jadual KAKITANGAN (UKMPer)
        const sqlKakitangan = "SELECT * FROM kakitangan WHERE id_ukmper = ? AND katalaluan = ?";
        
        db.query(sqlKakitangan, [no_matrik, katalaluan], (errKakitangan, resultKakitangan) => {
            if (errKakitangan) return res.status(500).json({ error: errKakitangan.message });
            
            // Jika dijumpai dalam jadual kakitangan
            if (resultKakitangan.length > 0) {
                // Tentukan peranan ('kp' atau 'pegawai') berdasarkan data lajur 'peranan'
                let penentuRole = 'pegawai'; // Default
                
                if (resultKakitangan[0].peranan === 'Ketua Program') {
                    penentuRole = 'kp';
                } else if (resultKakitangan[0].peranan === 'Pegawai FTSM') {
                    penentuRole = 'pegawai';
                }
                
                const user = {
                    no_matrik: resultKakitangan[0].id_ukmper, // Guna ID UKMPer
                    nama: resultKakitangan[0].nama,
                    program: resultKakitangan[0].peranan,
                    role: penentuRole // Beritahu React peranan spesifik kakitangan ini
                };
                return res.status(200).json({ message: `Log Masuk Berjaya sebagai ${resultKakitangan[0].peranan}!`, user });
            }
            
            // 3. Jika kedua-dua jadual langsung tak jumpa data
            return res.status(401).json({ message: "ID Pengguna atau Kata Laluan salah!" });
        });
    });
});

// API Endpoint 2: Capaian Data Akademik & Kiraan Automatik
app.get('/api/akademik/:no_matrik', (req, res) => {
    const noMatrik = req.params.no_matrik;

    // Guna SQL JOIN untuk gabung jadual Keputusan dan Kursus
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
        if (err) return res.status(500).json({ error: err.message });

        // Logik Pengiraan PNGK & Jumlah Kredit
        let totalKredit = 0;
        let totalMataNilaian = 0;

        results.forEach(subjek => {
            totalKredit += subjek.jam_kredit;
            totalMataNilaian += (subjek.mata_nilaian * subjek.jam_kredit);
        });

        // Elak ralat bahagi dengan sifar (jika pelajar tiada subjek lagi)
        let pngk = totalKredit > 0 ? (totalMataNilaian / totalKredit).toFixed(2) : "0.00";

        // Hantar balik data yang dah siap diproses ke React
        res.status(200).json({
            status: "Berjaya",
            jumlah_kredit: totalKredit,
            pngk_semasa: pngk,
            senarai_keputusan: results
        });
    });
});

// API Endpoint 3: Tambah Kursus & Keputusan Baharu secara Dinamik
app.post('/api/tambah-kursus', (req, res) => {
    const { no_matrik, kod_kursus, nama_kursus, jam_kredit, kategori, gred, mata_nilaian, semester_diambil } = req.body;

    // Langkah A: Masukkan ke jadual Kursus (IGNORE jika kod_kursus dah wujud dalam Master Data Universiti)
    const sqlKursus = "INSERT IGNORE INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori) VALUES (?, ?, ?, ?)";
    
    db.query(sqlKursus, [kod_kursus, nama_kursus, jam_kredit, kategori], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Langkah B: Masukkan gred ke jadual Keputusan (Ikat pelajar dengan kursus tersebut)
        const sqlKeputusan = "INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES (?, ?, ?, ?, ?)";
        
        db.query(sqlKeputusan, [no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil], (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            
            res.status(200).json({ message: "Data keputusan berjaya ditambah!" });
        });
    });
});

// ===================================================================
// API KHAS KETUA PROGRAM (KP)
// ===================================================================

// API Endpoint 4: Tarik Semua Data Pelajar & Analitik Fakulti
app.get('/api/kp/analitik-pelajar', (req, res) => {
    // Tarik semua pelajar berserta gred mereka
    const sql = `
        SELECT 
            p.no_matrik, p.nama, p.program,
            k.jam_kredit, kp.mata_nilaian
        FROM pelajar p
        LEFT JOIN keputusan kp ON p.no_matrik = kp.no_matrik
        LEFT JOIN kursus k ON kp.kod_kursus = k.kod_kursus
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Kumpulan data mengikut pelajar (No Matrik)
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

        // Kira CGPA untuk setiap pelajar dan kumpulkan statistik
        let totalCgpaSemua = 0;
        let pelajarCount = 0;
        let senaraiPelajar = [];

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
});

// API Endpoint 5: Pantau Prestasi Mengikut Kursus (Untuk KP)
app.get('/api/kp/pantau-kursus', (req, res) => {
    // Gabungkan jadual kursus dan keputusan, kemudian kira statistik
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
        if (err) return res.status(500).json({ error: err.message });

        // Bersihkan data (jika purata_mata null sebab tiada pelajar ambil)
        const cleanResults = results.map(kursus => ({
            ...kursus,
            purata_mata: kursus.purata_mata ? parseFloat(kursus.purata_mata).toFixed(2) : "0.00"
        }));

        res.status(200).json(cleanResults);
    });
});

// API Endpoint 6: Analisis Taburan Gred Keseluruhan (Untuk KP)
app.get('/api/kp/taburan-gred', (req, res) => {
    // Kita kira jumlah setiap gred dan susun ikut hierarki A hingga E
    const sql = `
        SELECT gred, COUNT(no_matrik) as jumlah
        FROM keputusan
        GROUP BY gred
        ORDER BY
            CASE gred
                WHEN 'A' THEN 1
                WHEN 'A-' THEN 2
                WHEN 'B+' THEN 3
                WHEN 'B' THEN 4
                WHEN 'B-' THEN 5
                WHEN 'C+' THEN 6
                WHEN 'C' THEN 7
                WHEN 'D' THEN 8
                WHEN 'E' THEN 9
                ELSE 10
            END
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// API Endpoint 7: Tarik Maklum Balas / Amaran Khusus untuk Pelajar Tertentu
app.get('/api/pelajar/maklum-balas/:no_matrik', (req, res) => {
    const noMatrik = req.params.no_matrik;
    const sql = "SELECT * FROM maklum_balas WHERE no_matrik = ? ORDER BY tarikh DESC";
    
    db.query(sql, [noMatrik], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
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

// POST: KP hantar maklum balas kepada pelajar
app.post('/api/kp/maklum-balas', (req, res) => {
    const { no_matrik, mesej } = req.body;
    const sql = "INSERT INTO maklum_balas (no_matrik, mesej) VALUES (?, ?)";
    db.query(sql, [no_matrik, mesej], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Maklum balas berjaya dihantar!" });
    });
});

// ===================================================================
// API KHAS PEGAWAI (CRUD DATA PELAJAR)
// ===================================================================

// READ: Tarik senarai semua pelajar
app.get('/api/pegawai/pelajar', (req, res) => {
    db.query("SELECT * FROM pelajar ORDER BY no_matrik ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// CREATE: Tambah pelajar baharu
app.post('/api/pegawai/pelajar', (req, res) => {
    const { no_matrik, katalaluan, nama, program } = req.body;
    const sql = "INSERT INTO pelajar (no_matrik, katalaluan, nama, program) VALUES (?, ?, ?, ?)";
    db.query(sql, [no_matrik, katalaluan, nama, program], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Berjaya daftar pelajar baharu!" });
    });
});

// UPDATE: Kemas kini profil pelajar
app.put('/api/pegawai/pelajar/:id', (req, res) => {
    const id = req.params.id; // No Matrik asal
    const { nama, program, katalaluan } = req.body;
    const sql = "UPDATE pelajar SET nama = ?, program = ?, katalaluan = ? WHERE no_matrik = ?";
    db.query(sql, [nama, program, katalaluan, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Rekod pelajar berjaya dikemas kini!" });
    });
});

// DELETE: Padam rekod pelajar
app.delete('/api/pegawai/pelajar/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM pelajar WHERE no_matrik = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Pelajar berjaya dipadam dari sistem!" });
    });
});

// Hidupkan server pada Port 5000
app.listen(5000, () => {
    console.log('🚀 Server Backend ACTAS berjalan di port 5000');
});