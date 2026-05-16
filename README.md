<div align="center">

# 🎓 ACTAS-FTSM
**Academic Credit Tracking & Analytics System**

*Membentuk masa depan analitik akademik yang lebih bijak, pantas, dan efisien untuk mahasiswa FTSM, UKM.*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

</div>

---

## ✨ Ciri-Ciri Utama (Features)

Sistem ini direka khusus dengan memfokuskan **Pengalaman Pengguna (UX)** yang optimum dan **Prestasi Masa Nyata**.

- 🔐 **Akses Dwi-Peranan (Role-Based)** <br> Log masuk berasingan untuk *Pelajar* dan *Ketua Program* dengan tahap kebenaran (authorization) yang berbeza.
- 📊 **Papan Pemuka Interaktif (Dashboard)** <br> Visualisasi data akademik berimpak tinggi seperti *PNGK Semasa* dan *Jumlah Kredit Terkumpul* secara terus.
- 🔮 **Simulator PNGK ("Killer Feature")** <br> Modul algoritma ramalan yang membolehkan pelajar mensimulasikan gred sasaran untuk meramal pencapaian masa depan tanpa mengubah data sebenar pangkalan data.
- 📈 **Analitik Berpusat KP** <br> Paparan menyeluruh untuk Ketua Program memantau taburan gred, jejak pencapaian, dan mengenal pasti subjek kritikal.

<br>

## 🚀 Mula Menggunakan (Quick Start)

Ikuti langkah mudah ini untuk menjalankan projek ini di persekitaran tempatan (localhost) anda.

### 1. Klon & Susun Pangkalan Data
Pastikan **XAMPP (Apache & MySQL)** sedang berjalan. Bina pangkalan data `actas_db` dan laksanakan kod SQL ini di dalam phpMyAdmin anda:

```sql
CREATE DATABASE IF NOT EXISTS actas_db;
USE actas_db;

CREATE TABLE pelajar (no_matrik VARCHAR(10) PRIMARY KEY, kata_laluan VARCHAR(255), nama VARCHAR(100), program VARCHAR(100));
CREATE TABLE pegawai (id_pegawai VARCHAR(20) PRIMARY KEY, nama VARCHAR(100), katalaluan VARCHAR(255), peranan VARCHAR(50) DEFAULT 'Ketua Program');
CREATE TABLE kursus (kod_kursus VARCHAR(10) PRIMARY KEY, nama_kursus VARCHAR(100), jam_kredit INT, kategori VARCHAR(50));
CREATE TABLE keputusan (id INT AUTO_INCREMENT PRIMARY KEY, no_matrik VARCHAR(10), kod_kursus VARCHAR(10), gred VARCHAR(5), mata_nilaian DECIMAL(3,2), semester_diambil INT, FOREIGN KEY (no_matrik) REFERENCES pelajar(no_matrik), FOREIGN KEY (kod_kursus) REFERENCES kursus(kod_kursus));
```

### 2. Jalankan Pelayan (Backend)
Buka terminal dan mulakan enjin *Node.js*:
```bash
cd server
npx nodemon server.js
```

### 3. Jalankan Muka Depan (Frontend)
Buka terminal baharu dan mulakan kompilasi *Vite/React*:
```bash
cd server/client
npm run dev
```

<br>

## 🔐 Akses Pengujian (Demo Accounts)

Untuk tujuan pengujian sistem, sila gunakan maklumat daftar masuk olok-olok (mock) berikut:

| Peranan | Username (ID) | Kata Laluan | Keterangan |
| :--- | :--- | :--- | :--- |
| **Pelajar** | `A202965` | `123` | Akses penuh papan pemuka rekod akademik pelajar. |
| **Ketua Program** | `KP001` | *(Rujuk DB)* | Akses modul tadbir urus dan laporan pensyarah. |

---

<div align="center">
  <p>Dibangunkan dengan 💻 dan ☕ oleh <b>Mohamad Ikmal Bin Mohd Ghazali</b></p>
  <p><i>Kejuruteraan Perisian, FTSM (UKM)</i></p>
</div>
