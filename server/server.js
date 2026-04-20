const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Sambungan ke Pangkalan Data (XAMPP MySQL)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // username default XAMPP
    password: '', // password default XAMPP (kosongkan)
    database: 'actas_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Berjaya sambung ke MySQL (actas_db)!');
});

// API Endpoint 1: Log Masuk
app.post('/api/login', (req, res) => {
    const { no_matrik, katalaluan } = req.body;
    
    // Cari pelajar dalam database
    const sql = "SELECT * FROM Pelajar WHERE no_matrik = ? AND katalaluan = ?";
    
    db.query(sql, [no_matrik, katalaluan], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Jika data wujud
        if (result.length > 0) {
            res.status(200).json({ message: "Log Masuk Berjaya!", user: result[0] });
        } else {
            res.status(401).json({ message: "ID Pelajar atau Kata Laluan salah!" });
        }
    });
});

// Hidupkan server pada Port 5000
app.listen(5000, () => {
    console.log('🚀 Server Backend ACTAS berjalan di port 5000');
});