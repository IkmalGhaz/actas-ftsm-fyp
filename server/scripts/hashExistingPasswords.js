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
