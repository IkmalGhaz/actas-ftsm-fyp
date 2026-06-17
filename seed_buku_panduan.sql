-- =================================================================
-- seed_buku_panduan.sql
-- ACTAS-FTSM — Data Buku Panduan Prasiswazah FTSM UKM 2023/2024
-- Jalankan pada schema: actas_db
-- =================================================================

USE actas_db;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------
-- DROP & RECREATE TABLES
-- -----------------------------------------------------------------

DROP TABLE IF EXISTS penilaian_kursus;
DROP TABLE IF EXISTS maklum_balas;
DROP TABLE IF EXISTS keputusan;
DROP TABLE IF EXISTS kursus;
DROP TABLE IF EXISTS pelajar;
DROP TABLE IF EXISTS kakitangan;

-- Kursus (semakan semula mengikut Buku Panduan)
CREATE TABLE kursus (
    kod_kursus      VARCHAR(20)  NOT NULL PRIMARY KEY,
    nama_kursus     VARCHAR(200) NOT NULL,
    jam_kredit      INT          NOT NULL,
    kategori        ENUM('Wajib Fakulti','Citra Wajib','Citra Universiti',
                         'Wajib Program','Lengkap Program') NOT NULL,
    program         VARCHAR(100) NOT NULL DEFAULT 'Semua',
    semester_cadang INT,
    taraf           VARCHAR(10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pelajar (
    no_matrik   VARCHAR(20)  NOT NULL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    program     VARCHAR(100) NOT NULL,
    katalaluan  VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kakitangan (
    id_ukmper   VARCHAR(20)  NOT NULL PRIMARY KEY,
    nama        VARCHAR(100) NOT NULL,
    peranan     VARCHAR(50)  NOT NULL,
    katalaluan  VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE keputusan (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    no_matrik        VARCHAR(20)   NOT NULL,
    kod_kursus       VARCHAR(20)   NOT NULL,
    gred             VARCHAR(5)    NOT NULL,
    mata_nilaian     DECIMAL(4,2),
    semester_diambil INT           NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE maklum_balas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    no_matrik   VARCHAR(20) NOT NULL,
    tarikh      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    mesej       TEXT        NOT NULL,
    status      VARCHAR(20) DEFAULT 'Belum Dibaca'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE penilaian_kursus (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    no_matrik   VARCHAR(20) NOT NULL,
    kod_kursus  VARCHAR(20) NOT NULL,
    rating      INT         NOT NULL,
    komen       TEXT,
    tarikh      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;


-- =================================================================
-- KURSUS — BERSAMA SEMUA PROGRAM
-- =================================================================

-- Semester 1 (semua program)
INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
('TTTT1013', 'Konsep dan Pemikiran Sistem',                  3, 'Citra Universiti', 'Semua', 1, 'C2'),
('TTTT1713', 'Statistik dan Kebarangkalian',                 3, 'Citra Universiti', 'Semua', 1, 'C2'),
('TTTK1114', 'Pengaturcaraan Komputer',                      4, 'Wajib Program',    'Semua', 1, 'WP'),
('TTTR1333', 'Matematik Diskret',                            3, 'Wajib Program',    'Semua', 1, 'WP'),
('TTTM2033', 'Teknologi Platform',                           3, 'Wajib Program',    'Semua', 1, 'WP');

-- Kokurikulum Wajib Fakulti — 3 fasa: 2+2+1 = 5 kredit WF
INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
('LMCE1012', 'Kokurikulum I',   2, 'Wajib Fakulti', 'Semua', 2, 'WF'),
('LMCE3012', 'Kokurikulum II',  2, 'Wajib Fakulti', 'Semua', 4, 'WF'),
('LMCE5011', 'Kokurikulum III', 1, 'Wajib Fakulti', 'Semua', 6, 'WF');

-- Citra Wajib (LMCW) — 2+2+3+3 = 10 kredit CW
INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
('LMCW1022', 'Asas Keusahawanan dan Inovasi',   2, 'Citra Wajib', 'Semua', 2, 'CW'),
('TTTT1022', 'Analisis Data',                    2, 'Citra Wajib', 'Semua', 2, 'CW'),
('LMCW2153', 'Penghayatan Etika dan Peradaban',  3, 'Citra Wajib', 'Semua', 3, 'CW'),
('LMCW2143', 'Falsafah dan Isu Semasa',          3, 'Citra Wajib', 'Semua', 4, 'CW');

-- Citra Universiti (C1-C6)
INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
('LMCK2922', 'Kemahiran Insaniah',         2, 'Citra Universiti', 'Semua', 3, 'C6'),
('TTTT3013', 'Komputer Etika dan Sosial',  3, 'Citra Universiti', 'Semua', 6, 'C4');

-- Wajib Program — bersama semua (Sem 2, 3, 5, 7, 8)
INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
('TTTT1964', 'Pangkalan Data',                                 4, 'Wajib Program', 'Semua', 2, 'WP'),
('TTTK1143', 'Rekabentuk Aturcara dan Penyelesaian Masalah',   3, 'Wajib Program', 'Semua', 2, 'WP'),
('TTTU2983', 'Pangkalan Data Lanjutan',                        3, 'Wajib Program', 'Semua', 3, 'WP'),
('TTTP2543', 'Pengaturcaraan Web',                             3, 'Wajib Program', 'Semua', 5, 'WP'),
('TTTT4056', 'Latihan Industri',                               6, 'Wajib Program', 'Semua', 7, 'WP'),
('TTTT4076', 'Projek Industri',                                6, 'Wajib Program', 'Semua', 8, 'WP');


-- =================================================================
-- PROGRAM 1 — SARJANA MUDA SAINS KOMPUTER
-- =================================================================

INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
-- Semester 2
('TTTK2103', 'Teknologi Rangkaian Komputer',              3, 'Wajib Program',   'Sains Komputer', 2, 'WP'),
-- Semester 3
('TTTK2023', 'Kejuruteraan Perisian Berorientasi Objek',  3, 'Wajib Program',   'Sains Komputer', 3, 'WP'),
('TTTC2013', 'Pengenalan Kecerdasan Buatan',              3, 'Wajib Program',   'Sains Komputer', 3, 'WP'),
('TTTK2093', 'Interaksi Manusia Komputer',                3, 'Wajib Program',   'Sains Komputer', 3, 'WP'),
-- Semester 4
('TTTK2053', 'Paradigma Pengaturcaraan',                  3, 'Wajib Program',   'Sains Komputer', 4, 'WP'),
('TTTK3163', 'Pembinaan Pengkompil',                      3, 'Wajib Program',   'Sains Komputer', 4, 'WP'),
-- Semester 4 — Trek Lengkap Program
('TTTC2453', 'Pembelajaran Mesin',                                    3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTK2223', 'Teori Sains Komputer',                                  3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTK2133', 'Komunikasi Data dan Telekomunikasi',                    3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTN2423', 'Keperluan Pensuisan, Penghalaan dan Tanpa Wayar',       3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTP2043', 'Fundamental Pemprosesan dan Analitik Teks',             3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTC2343', 'Sistem Robot Cerdas',                                   3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
('TTTK3033', 'Sistem Pengoperasian',                                  3, 'Lengkap Program', 'Sains Komputer', 4, 'LP'),
-- Semester 5
('TTTK4172', 'Usulan Projek',                             2, 'Wajib Program',   'Sains Komputer', 5, 'WP'),
-- Semester 6
('TTTK3043', 'Rekabentuk dan Analisis Alkhwarizmi',       3, 'Wajib Program',   'Sains Komputer', 6, 'WP'),
('TTTK4086', 'Projek',                                    6, 'Wajib Program',   'Sains Komputer', 6, 'WP');


-- =================================================================
-- PROGRAM 2 — SARJANA MUDA TEKNOLOGI MAKLUMAT
-- =================================================================

INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
-- Semester 2
('TTTR1223', 'Teknik Bermatematik untuk Teknologi Maklumat',  3, 'Wajib Program',   'Teknologi Maklumat', 2, 'WP'),
('TTTR1123', 'Pengurusan Operasi Industri',                   3, 'Lengkap Program', 'Teknologi Maklumat', 2, 'LP'),
-- Semester 3
('TTTR2043', 'Perancangan Sumber Enterpris ERP',              3, 'Lengkap Program', 'Teknologi Maklumat', 3, 'LP'),
-- Semester 4
('TTTK2323', 'Pengaturcaraan Mudah Alih',                     3, 'Wajib Program',   'Teknologi Maklumat', 4, 'WP'),
('TTTK2153', 'Perkongsian Maklumat',                          3, 'Wajib Program',   'Teknologi Maklumat', 4, 'WP'),
('TTTR2033', 'Pengurusan Kualiti',                            3, 'Lengkap Program', 'Teknologi Maklumat', 4, 'LP'),
('TTTR2143', 'Reka Bentuk dan Pembangunan Produk',            3, 'Lengkap Program', 'Teknologi Maklumat', 4, 'LP'),
('TTTR3423', 'Pengaturcaraan dan Simulasi Robot',             3, 'Lengkap Program', 'Teknologi Maklumat', 4, 'LP'),
-- Semester 5
('TTTN3513', 'Keselamatan Komputer dan Rangkaian',            3, 'Wajib Program',   'Teknologi Maklumat', 5, 'WP'),
('TTTM4172', 'Usulan Projek',                                 2, 'Wajib Program',   'Teknologi Maklumat', 5, 'WP'),
('TTTR3153', 'Pemodelan dan Simulasi Sistem',                 3, 'Lengkap Program', 'Teknologi Maklumat', 5, 'LP'),
('TTTU3833', 'Teknologi E-Bisnes',                            3, 'Lengkap Program', 'Teknologi Maklumat', 5, 'LP'),
-- Semester 6
('TTTM4086', 'Projek',                                        6, 'Wajib Program',   'Teknologi Maklumat', 6, 'WP'),
('TTTK4013', 'Pentadbiran Sistem',                            3, 'Wajib Program',   'Teknologi Maklumat', 6, 'WP'),
('TTTR3063', 'Reka Bentuk dan Inovasi Sistem Khidmat',        3, 'Lengkap Program', 'Teknologi Maklumat', 6, 'LP'),
('TTTR3163', 'Internet Pelbagai Benda',                       3, 'Lengkap Program', 'Teknologi Maklumat', 6, 'LP'),
('TTTH3813', 'Realiti Maya',                                  3, 'Lengkap Program', 'Teknologi Maklumat', 6, 'LP');


-- =================================================================
-- PROGRAM 3 — KEJURUTERAAN PERISIAN (MULTIMEDIA)
-- =================================================================

INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
-- Semester 2
('TTTH2843', 'Pengaturcaraan Multimedia',                          3, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 2, 'WP'),
-- Semester 3
('TTTE2104', 'Kejuruteraan Keperluan Perisian',                    4, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 3, 'WP'),
('TTTH2823', 'Animasi',                                            3, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 3, 'WP'),
-- Semester 4
('TTTH2304', 'Reka Bentuk Perisian untuk Sistem Multimedia',       4, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 4, 'WP'),
('TTTH2623', 'Teknologi Audio dan Video Digital',                  3, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 4, 'WP'),
-- Semester 5
('TTTH3404', 'Pembangunan Perisian untuk Sistem Multimedia',       4, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 5, 'WP'),
('TTTE3503', 'Pengujian Perisian',                                 3, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 5, 'WP'),
('TTTH4172', 'Usulan Projek',                                      2, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 5, 'WP'),
('TTTH3623', 'Pemodelan 3D',                                       3, 'Lengkap Program', 'Kejuruteraan Perisian Multimedia', 5, 'LP'),
('TTTH3723', 'Seni Reka Bentuk Grafik',                            3, 'Lengkap Program', 'Kejuruteraan Perisian Multimedia', 5, 'LP'),
-- Semester 6
('TTTH4086', 'Projek',                                             6, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 6, 'WP'),
('TTTE4333', 'Pengurusan dan Penyenggaraan Perisian',              3, 'Wajib Program',   'Kejuruteraan Perisian Multimedia', 6, 'WP'),
('TTTH3863', 'Permainan Multimedia',                               3, 'Lengkap Program', 'Kejuruteraan Perisian Multimedia', 6, 'LP');


-- =================================================================
-- PROGRAM 4 — KEJURUTERAAN PERISIAN (MAKLUMAT)
-- =================================================================

INSERT INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori, program, semester_cadang, taraf) VALUES
-- Semester 2
('TTTU2323', 'Prinsip Sistem Maklumat',                                  3, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 2, 'WP'),
-- Semester 3
('TTTU2023', 'Pengurusan Proses Bisnes',                                 3, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 3, 'WP'),
-- Semester 4
('TTTU2304', 'Rekabentuk Perisian untuk Sistem Maklumat',                4, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 4, 'WP'),
('TTTU2163', 'Analitik Data dan Sistem Sokongan Keputusan',              3, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 4, 'WP'),
-- Semester 5
('TTTU3404', 'Pembangunan Perisian untuk Sistem Maklumat',               4, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 5, 'WP'),
('TTTU4172', 'Usulan Projek',                                            2, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 5, 'WP'),
('TTTC3213', 'Kejuruteraan Data',                                        3, 'Lengkap Program', 'Kejuruteraan Perisian Maklumat', 5, 'LP'),
-- Semester 6
('TTTU4086', 'Projek',                                                   6, 'Wajib Program',   'Kejuruteraan Perisian Maklumat', 6, 'WP'),
('TTTU4363', 'Audit dan Keselamatan Sistem Maklumat',                    3, 'Lengkap Program', 'Kejuruteraan Perisian Maklumat', 6, 'LP'),
('TTTU4333', 'Pengurusan Sistem Maklumat',                               3, 'Lengkap Program', 'Kejuruteraan Perisian Maklumat', 6, 'LP');


-- =================================================================
-- KAKITANGAN (STAFF)
-- =================================================================
-- Kata laluan: kp123 (Ketua Program), pegawai123 (Pegawai FTSM)

INSERT INTO kakitangan (id_ukmper, nama, peranan, katalaluan) VALUES
('KP001',      'Dr. Rodziah Latih',          'Ketua Program', 'kp123'),
('KP002',      'Dr. Saadiah Yahya',          'Ketua Program', 'kp123'),
('KP003',      'Dr. Norshita Mat Nayan',     'Ketua Program', 'kp123'),
('KP004',      'Dr. Azrul Hazri Jantan',     'Ketua Program', 'kp123'),
('PEGAWAI001', 'En. Ahmad Zainuddin Omar',   'Pegawai FTSM',  'pegawai123');


-- =================================================================
-- PELAJAR (STUDENTS)
-- =================================================================
-- Kata laluan semua pelajar: pelajar123

INSERT INTO pelajar (no_matrik, nama, program, katalaluan) VALUES
-- Sains Komputer
('A21CS001', 'Ahmad Farhan bin Abdullah',      'Sains Komputer',                   'pelajar123'),
('A21CS002', 'Siti Aishah binti Razak',        'Sains Komputer',                   'pelajar123'),
-- Teknologi Maklumat
('A21TM001', 'Muhammad Hafiz bin Ismail',      'Teknologi Maklumat',               'pelajar123'),
('A21TM002', 'Nur Farhana binti Kamaruddin',   'Teknologi Maklumat',               'pelajar123'),
-- Kejuruteraan Perisian (Multimedia)
('A21MM001', 'Azri Hakimi bin Kamarudin',      'Kejuruteraan Perisian Multimedia', 'pelajar123'),
-- Kejuruteraan Perisian (Maklumat)
('A21MI001', 'Irdina Sofea binti Mohd Razif',  'Kejuruteraan Perisian Maklumat',   'pelajar123');


-- =================================================================
-- KEPUTUSAN (GRADES)
-- =================================================================
-- Peta gred → mata nilaian:
-- A=4.00, A-=3.67, B+=3.33, B=3.00, B-=2.67, C+=2.33, C=2.00, D=1.00, E=0.00
-- L (Lulus/Gagal) — mata_nilaian = NULL, tidak dikira CGPA

-- ── A21CS001 — Ahmad Farhan (Sains Komputer, 3 Semester) ──────────
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21CS001', 'TTTT1013', 'B+', 3.33, 1),
('A21CS001', 'TTTT1713', 'A-', 3.67, 1),
('A21CS001', 'TTTK1114', 'B',  3.00, 1),
('A21CS001', 'TTTR1333', 'B+', 3.33, 1),
('A21CS001', 'TTTM2033', 'A',  4.00, 1),
-- Sem 2
('A21CS001', 'LMCE1012', 'L',  NULL, 2),
('A21CS001', 'LMCW1022', 'A',  4.00, 2),
('A21CS001', 'TTTT1022', 'B+', 3.33, 2),
('A21CS001', 'TTTT1964', 'B',  3.00, 2),
('A21CS001', 'TTTK1143', 'A-', 3.67, 2),
('A21CS001', 'TTTK2103', 'B+', 3.33, 2),
-- Sem 3
('A21CS001', 'LMCW2153', 'B+', 3.33, 3),
('A21CS001', 'LMCK2922', 'L',  NULL, 3),
('A21CS001', 'TTTU2983', 'B',  3.00, 3),
('A21CS001', 'TTTK2023', 'A-', 3.67, 3),
('A21CS001', 'TTTC2013', 'B+', 3.33, 3),
('A21CS001', 'TTTK2093', 'B',  3.00, 3);

-- ── A21CS002 — Siti Aishah (Sains Komputer, 4 Semester) ───────────
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21CS002', 'TTTT1013', 'A',  4.00, 1),
('A21CS002', 'TTTT1713', 'A-', 3.67, 1),
('A21CS002', 'TTTK1114', 'A',  4.00, 1),
('A21CS002', 'TTTR1333', 'A',  4.00, 1),
('A21CS002', 'TTTM2033', 'A-', 3.67, 1),
-- Sem 2
('A21CS002', 'LMCE1012', 'L',  NULL, 2),
('A21CS002', 'LMCW1022', 'A',  4.00, 2),
('A21CS002', 'TTTT1022', 'A',  4.00, 2),
('A21CS002', 'TTTT1964', 'A-', 3.67, 2),
('A21CS002', 'TTTK1143', 'A',  4.00, 2),
('A21CS002', 'TTTK2103', 'A-', 3.67, 2),
-- Sem 3
('A21CS002', 'LMCW2153', 'A',  4.00, 3),
('A21CS002', 'LMCK2922', 'L',  NULL, 3),
('A21CS002', 'TTTU2983', 'A-', 3.67, 3),
('A21CS002', 'TTTK2023', 'A',  4.00, 3),
('A21CS002', 'TTTC2013', 'A',  4.00, 3),
('A21CS002', 'TTTK2093', 'A-', 3.67, 3),
-- Sem 4
('A21CS002', 'LMCE3012', 'L',  NULL, 4),
('A21CS002', 'LMCW2143', 'A',  4.00, 4),
('A21CS002', 'TTTK2053', 'A-', 3.67, 4),
('A21CS002', 'TTTK3163', 'B+', 3.33, 4),
('A21CS002', 'TTTC2453', 'A',  4.00, 4);

-- ── A21TM001 — Muhammad Hafiz (Teknologi Maklumat, 2 Semester) ────
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21TM001', 'TTTT1013', 'B+', 3.33, 1),
('A21TM001', 'TTTT1713', 'B',  3.00, 1),
('A21TM001', 'TTTK1114', 'B+', 3.33, 1),
('A21TM001', 'TTTR1333', 'A-', 3.67, 1),
('A21TM001', 'TTTM2033', 'B+', 3.33, 1),
-- Sem 2
('A21TM001', 'LMCE1012', 'L',  NULL, 2),
('A21TM001', 'LMCW1022', 'B+', 3.33, 2),
('A21TM001', 'TTTT1022', 'B+', 3.33, 2),
('A21TM001', 'TTTT1964', 'B',  3.00, 2),
('A21TM001', 'TTTK1143', 'B+', 3.33, 2),
('A21TM001', 'TTTR1223', 'B',  3.00, 2),
('A21TM001', 'TTTR1123', 'A-', 3.67, 2);

-- ── A21TM002 — Nur Farhana (Teknologi Maklumat, 3 Semester) ───────
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21TM002', 'TTTT1013', 'A-', 3.67, 1),
('A21TM002', 'TTTT1713', 'A',  4.00, 1),
('A21TM002', 'TTTK1114', 'B+', 3.33, 1),
('A21TM002', 'TTTR1333', 'A-', 3.67, 1),
('A21TM002', 'TTTM2033', 'A',  4.00, 1),
-- Sem 2
('A21TM002', 'LMCE1012', 'L',  NULL, 2),
('A21TM002', 'LMCW1022', 'A-', 3.67, 2),
('A21TM002', 'TTTT1022', 'A',  4.00, 2),
('A21TM002', 'TTTT1964', 'A-', 3.67, 2),
('A21TM002', 'TTTK1143', 'A',  4.00, 2),
('A21TM002', 'TTTR1223', 'A-', 3.67, 2),
('A21TM002', 'TTTR1123', 'B+', 3.33, 2),
-- Sem 3
('A21TM002', 'LMCW2153', 'A',  4.00, 3),
('A21TM002', 'LMCK2922', 'L',  NULL, 3),
('A21TM002', 'TTTU2983', 'A-', 3.67, 3),
('A21TM002', 'TTTK2023', 'A',  4.00, 3),
('A21TM002', 'TTTK2093', 'A-', 3.67, 3),
('A21TM002', 'TTTR2043', 'B+', 3.33, 3);

-- ── A21MM001 — Azri Hakimi (Kejuruteraan Perisian Multimedia, 2 Semester) ──
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21MM001', 'TTTT1013', 'A',  4.00, 1),
('A21MM001', 'TTTT1713', 'B+', 3.33, 1),
('A21MM001', 'TTTK1114', 'A-', 3.67, 1),
('A21MM001', 'TTTR1333', 'A',  4.00, 1),
('A21MM001', 'TTTM2033', 'A',  4.00, 1),
-- Sem 2
('A21MM001', 'LMCE1012', 'L',  NULL, 2),
('A21MM001', 'LMCW1022', 'A',  4.00, 2),
('A21MM001', 'TTTT1022', 'A',  4.00, 2),
('A21MM001', 'TTTT1964', 'A',  4.00, 2),
('A21MM001', 'TTTK1143', 'A',  4.00, 2),
('A21MM001', 'TTTH2843', 'A-', 3.67, 2);

-- ── A21MI001 — Irdina Sofea (Kejuruteraan Perisian Maklumat, 2 Semester) ──
INSERT INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES
-- Sem 1
('A21MI001', 'TTTT1013', 'B+', 3.33, 1),
('A21MI001', 'TTTT1713', 'A',  4.00, 1),
('A21MI001', 'TTTK1114', 'B+', 3.33, 1),
('A21MI001', 'TTTR1333', 'B+', 3.33, 1),
('A21MI001', 'TTTM2033', 'A-', 3.67, 1),
-- Sem 2
('A21MI001', 'LMCE1012', 'L',  NULL, 2),
('A21MI001', 'LMCW1022', 'A-', 3.67, 2),
('A21MI001', 'TTTT1022', 'B+', 3.33, 2),
('A21MI001', 'TTTT1964', 'B+', 3.33, 2),
('A21MI001', 'TTTK1143', 'A-', 3.67, 2),
('A21MI001', 'TTTU2323', 'B+', 3.33, 2);


-- =================================================================
-- MAKLUM BALAS CONTOH
-- =================================================================

INSERT INTO maklum_balas (no_matrik, mesej, status) VALUES
('A21CS001', 'Prestasi akademik anda pada Semester 3 menunjukkan peningkatan yang baik. Sila pilih trek Lengkap Program (IM/DS/ST/NT) sebelum pendaftaran Semester 4.', 'Belum Dibaca'),
('A21TM002', 'Tahniah — CGPA anda melebihi 3.5. Anda layak memohon Biasiswa Cemerlang FTSM untuk sesi akan datang. Sila hubungi pejabat untuk maklumat lanjut.', 'Belum Dibaca');


-- =================================================================
-- RINGKASAN AKAUN DEMO
-- =================================================================
-- Pelajar   : no_matrik (A21CS001 – A21MI001)  kata laluan: pelajar123
-- Ketua Program : KP001 – KP004               kata laluan: kp123
-- Pegawai   : PEGAWAI001                       kata laluan: pegawai123
-- =================================================================
