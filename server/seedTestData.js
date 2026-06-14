const mysql = require('mysql2/promise');

const db = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'actas_db'
};

const GRADE_POINTS = {
    'A': 4.00, 'A-': 3.67,
    'B+': 3.33, 'B': 3.00, 'B-': 2.67,
    'C+': 2.33, 'C': 2.00,
    'D': 1.00, 'E': 0.00
};

// Build a grade sequence that yields an exact target CGPA over given courses.
// Uses a simple fill strategy: assign a base grade to all courses, then
// adjust the first course up/down one notch until the CGPA lands on target.
function gradeSequenceForCgpa(targetCgpa, courses) {
    const grades = Object.keys(GRADE_POINTS);
    const points = Object.values(GRADE_POINTS);
    const totalCredits = courses.reduce((s, c) => s + c.jam_kredit, 0);

    // Find which grade point value produces closest average
    let bestGrade = 'B';
    let bestDiff = Infinity;
    for (const [g, p] of Object.entries(GRADE_POINTS)) {
        const cgpa = (p * totalCredits) / totalCredits;
        if (Math.abs(cgpa - targetCgpa) < bestDiff) {
            bestDiff = Math.abs(cgpa - targetCgpa);
            bestGrade = g;
        }
    }

    // Distribute: fill everything with bestGrade, then fine-tune first course
    return courses.map((c, i) => {
        if (i === 0) {
            // pick the grade whose point value when mixed with others hits the target
            const otherCredits = courses.slice(1).reduce((s, x) => s + x.jam_kredit, 0);
            const otherMata = otherCredits * GRADE_POINTS[bestGrade];
            const neededMata = targetCgpa * totalCredits - otherMata;
            const neededPoint = neededMata / c.jam_kredit;
            // clamp to nearest available grade point
            let closest = bestGrade;
            let closestDiff = Infinity;
            for (const [g, p] of Object.entries(GRADE_POINTS)) {
                if (Math.abs(p - neededPoint) < closestDiff) {
                    closestDiff = Math.abs(p - neededPoint);
                    closest = g;
                }
            }
            return closest;
        }
        return bestGrade;
    });
}

// Master course catalogue — realistic FTSM courses
const COURSES = [
    { kod_kursus: 'TSEK1013', nama_kursus: 'Pengaturcaraan I', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK1023', nama_kursus: 'Pengaturcaraan II', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK2013', nama_kursus: 'Struktur Data & Algoritma', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK2023', nama_kursus: 'Pangkalan Data', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK2033', nama_kursus: 'Kejuruteraan Perisian', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK3013', nama_kursus: 'Rangkaian Komputer', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK3023', nama_kursus: 'Sistem Pengendalian', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK3033', nama_kursus: 'Kecerdasan Buatan', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK4014', nama_kursus: 'Projek Tahun Akhir I', jam_kredit: 4, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK4024', nama_kursus: 'Projek Tahun Akhir II', jam_kredit: 4, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK2043', nama_kursus: 'Pengaturcaraan Web', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK3043', nama_kursus: 'Keselamatan Sistem', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK3053', nama_kursus: 'Pembangunan Aplikasi Mudah Alih', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TSEK4033', nama_kursus: 'Pengkomputeran Awan', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TMAL1013', nama_kursus: 'Matematik Diskret', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'TMAL2013', nama_kursus: 'Statistik & Kebarangkalian', jam_kredit: 3, kategori: 'Wajib Fakulti' },
    { kod_kursus: 'UNEM1013', nama_kursus: 'Bahasa Melayu Akademik', jam_kredit: 3, kategori: 'Wajib Universiti' },
    { kod_kursus: 'UNEM2013', nama_kursus: 'Bahasa Inggeris untuk Sains & Teknologi', jam_kredit: 3, kategori: 'Wajib Universiti' },
    { kod_kursus: 'UNEM3013', nama_kursus: 'Kokurikulum I', jam_kredit: 2, kategori: 'Wajib Universiti' },
    { kod_kursus: 'UNEM3023', nama_kursus: 'Kokurikulum II', jam_kredit: 2, kategori: 'Wajib Universiti' },
    { kod_kursus: 'UHLB3012', nama_kursus: 'Hubungan Etnik', jam_kredit: 2, kategori: 'Wajib Universiti' },
    { kod_kursus: 'UTAM1012', nama_kursus: 'Tamadun Islam & Asia', jam_kredit: 2, kategori: 'Wajib Universiti' },
    { kod_kursus: 'CITRA101', nama_kursus: 'Kreativiti & Inovasi', jam_kredit: 3, kategori: 'Kursus Citra' },
    { kod_kursus: 'CITRA102', nama_kursus: 'Kepimpinan & Keusahawanan', jam_kredit: 3, kategori: 'Kursus Citra' },
    { kod_kursus: 'CITRA103', nama_kursus: 'Etika & Peradaban', jam_kredit: 3, kategori: 'Kursus Citra' },
    { kod_kursus: 'ELEK1013', nama_kursus: 'Pemikiran Kritis & Penyelesaian Masalah', jam_kredit: 3, kategori: 'Elektif' },
    { kod_kursus: 'ELEK1023', nama_kursus: 'Komunikasi Profesional', jam_kredit: 3, kategori: 'Elektif' },
];

const PROGRAMS = ['Kejuruteraan Perisian', 'Sains Komputer', 'Teknologi Maklumat', 'Sistem Komputer'];

const MALAY_NAMES = [
    'Ahmad Faris', 'Nur Aisyah', 'Muhammad Haziq', 'Siti Nurhaliza', 'Amirul Hakim',
    'Farah Nadia', 'Khairul Azwan', 'Nurul Ain', 'Zulfikri', 'Izzatul Husna',
    'Hafizuddin', 'Wan Nurfarahain', 'Azri Syafiq', 'Nur Syahirah', 'Danial Iman',
    'Fatin Nasuha', 'Ridhwan Azhar', 'Liyana Sofea', 'Afiq Zafran', 'Nurshafiqah',
    'Izzul Haqeem', 'Siti Hajar', 'Shafiq Anwar', 'Aliya Husna', 'Ikhwan Hakimi',
    'Nazirah Nasir', 'Syafiq Zikri', 'Hana Syahira', 'Ameer Fareez', 'Putri Yasmin',
    'Asyraf Wajdi', 'Nabilah Izzati', 'Haris Iskandar', 'Safiya Maisarah', 'Zarif Harraz',
    'Aina Mardhiah', 'Faiz Zulkifli', 'Nurin Irdina', 'Haziq Aiman', 'Siti Zulaikha',
    'Uzair Hafiy', 'Nur Amirah', 'Shahril Nizam', 'Irdina Balqis', 'Suffian Azri',
    'Nabilah Husna', 'Luqman Nul Hakim', 'Farhana Jasmin', 'Aqil Haiqal', 'Raihana Afiqah'
];

// ──────────────────────────────────────────────────────────────
// Student profiles (50 records)
// Format: { suffix, name, program, profile }
// profile values:
//   'normal'   – typical student, random mix of grades
//   'zero'     – no courses at all (edge: 0 credits)
//   'overflow' – enrolled beyond the 120-credit cap
//   'cgpa_200' – CGPA exactly 2.00
//   'cgpa_367' – CGPA exactly 3.67 (Dean's List threshold)
//   'cgpa_400' – CGPA perfect 4.00
// ──────────────────────────────────────────────────────────────
function buildStudents() {
    const students = [];
    let id = 1;

    // 5 edge-case: zero credits
    for (let i = 0; i < 5; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'zero' });
        id++;
    }

    // 5 edge-case: overflow (>120 credits)
    for (let i = 0; i < 5; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'overflow' });
        id++;
    }

    // 5 edge-case: CGPA exactly 2.00
    for (let i = 0; i < 5; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'cgpa_200' });
        id++;
    }

    // 5 edge-case: CGPA exactly 3.67
    for (let i = 0; i < 5; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'cgpa_367' });
        id++;
    }

    // 5 edge-case: CGPA exactly 4.00
    for (let i = 0; i < 5; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'cgpa_400' });
        id++;
    }

    // 25 normal students
    for (let i = 0; i < 25; i++) {
        students.push({ suffix: String(200000 + id).padStart(6, '0'), name: MALAY_NAMES[id - 1], program: PROGRAMS[i % 4], profile: 'normal' });
        id++;
    }

    return students;
}

// Pick N courses from catalogue without repetition
function pickCourses(n) {
    const shuffled = [...COURSES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}

// Random grade weighted toward middle (B/B+/C+)
function randomGrade() {
    const pool = ['A', 'A', 'A-', 'A-', 'B+', 'B+', 'B+', 'B', 'B', 'B', 'B-', 'B-', 'C+', 'C+', 'C', 'D', 'E'];
    return pool[Math.floor(Math.random() * pool.length)];
}

async function seed() {
    const conn = await mysql.createConnection(db);
    console.log('Connected to actas_db.');

    // ── Seed courses catalogue ──────────────────────────────────
    console.log('\n[1/3] Seeding course catalogue...');
    for (const c of COURSES) {
        await conn.execute(
            'INSERT IGNORE INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori) VALUES (?, ?, ?, ?)',
            [c.kod_kursus, c.nama_kursus, c.jam_kredit, c.kategori]
        );
    }
    console.log(`  ${COURSES.length} courses upserted.`);

    // ── Seed students ───────────────────────────────────────────
    const students = buildStudents();
    console.log('\n[2/3] Seeding students...');

    let inserted = 0;
    let skipped = 0;
    for (const s of students) {
        const noMatrik = `A${s.suffix}`;
        const [existing] = await conn.execute('SELECT no_matrik FROM pelajar WHERE no_matrik = ?', [noMatrik]);
        if (existing.length > 0) { skipped++; continue; }

        await conn.execute(
            'INSERT INTO pelajar (no_matrik, katalaluan, nama, program) VALUES (?, ?, ?, ?)',
            [noMatrik, '123', s.name, s.program]
        );
        inserted++;
    }
    console.log(`  ${inserted} students inserted, ${skipped} already existed (skipped).`);

    // ── Seed keputusan (results) ────────────────────────────────
    console.log('\n[3/3] Seeding academic results...');

    const gradeNotes = {};
    let resultRows = 0;

    for (const s of students) {
        const noMatrik = `A${s.suffix}`;

        if (s.profile === 'zero') {
            // No courses — tests the 0-credit edge case
            gradeNotes[noMatrik] = 'EDGE: 0 credits';
            continue;
        }

        let courses;
        let grades;

        if (s.profile === 'overflow') {
            // Take all 27 courses (~75 credits) — exceeds graduation target of 120
            // To push well past 120, repeat some courses under different semesters
            courses = [...COURSES, ...COURSES.slice(0, 10)];
            grades = courses.map(() => randomGrade());
            gradeNotes[noMatrik] = 'EDGE: overflow credits';

        } else if (s.profile === 'cgpa_200') {
            courses = pickCourses(10);
            grades = gradeSequenceForCgpa(2.00, courses);
            gradeNotes[noMatrik] = 'EDGE: CGPA exactly 2.00';

        } else if (s.profile === 'cgpa_367') {
            courses = pickCourses(10);
            grades = gradeSequenceForCgpa(3.67, courses);
            gradeNotes[noMatrik] = 'EDGE: CGPA exactly 3.67 (Dean\'s List boundary)';

        } else if (s.profile === 'cgpa_400') {
            courses = pickCourses(10);
            grades = courses.map(() => 'A');
            gradeNotes[noMatrik] = 'EDGE: CGPA perfect 4.00';

        } else {
            // Normal: take 8–18 courses, random grades across 4 semesters
            const count = 8 + Math.floor(Math.random() * 11);
            courses = pickCourses(count);
            grades = courses.map(() => randomGrade());
            gradeNotes[noMatrik] = 'Normal student';
        }

        // Distribute across semesters (max 8 courses per semester)
        for (let i = 0; i < courses.length; i++) {
            const c = courses[i];
            const sem = Math.floor(i / 8) + 1;
            const gred = grades[i];
            const mata = GRADE_POINTS[gred];

            // For overflow students, vary course codes slightly to avoid PK collisions
            let kodKursus = c.kod_kursus;
            if (s.profile === 'overflow' && i >= COURSES.length) {
                kodKursus = c.kod_kursus + 'X';
                // Ensure course exists
                await conn.execute(
                    'INSERT IGNORE INTO kursus (kod_kursus, nama_kursus, jam_kredit, kategori) VALUES (?, ?, ?, ?)',
                    [kodKursus, c.nama_kursus + ' (Lanjutan)', c.jam_kredit, c.kategori]
                );
            }

            try {
                await conn.execute(
                    'INSERT IGNORE INTO keputusan (no_matrik, kod_kursus, gred, mata_nilaian, semester_diambil) VALUES (?, ?, ?, ?, ?)',
                    [noMatrik, kodKursus, gred, mata, sem]
                );
                resultRows++;
            } catch (e) {
                // Skip duplicate keputusan rows silently
            }
        }
    }

    console.log(`  ${resultRows} result rows inserted.`);

    // ── Summary report ──────────────────────────────────────────
    console.log('\n── Seed Summary ──────────────────────────────────────────');
    console.log('No Matrik      | Profile');
    console.log('───────────────|──────────────────────────────────────────');
    for (const [mat, note] of Object.entries(gradeNotes)) {
        console.log(`${mat.padEnd(15)}| ${note}`);
    }
    console.log('\nDone. Run the app and log in as any A2xxxxx account (password: 123).');

    await conn.end();
}

seed().catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
