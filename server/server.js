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

// Hidupkan server pada Port 5000
app.listen(5000, () => {
    console.log('🚀 Server Backend ACTAS berjalan di port 5000');
});