import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, MessageSquare } from 'lucide-react';

const gradeColor = (gred) => {
    if (!gred || gred === 'L') return 'bg-gray-100 text-gray-600';
    if (gred.startsWith('A'))  return 'bg-emerald-100 text-emerald-700';
    if (gred.startsWith('B'))  return 'bg-blue-100 text-blue-700';
    if (gred.startsWith('C'))  return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
};

// Per-program graduation credit target (matches seed_buku_panduan.sql)
const TOTAL_KREDIT_BY_PROGRAM = {
    'Sains Komputer':                   122,
    'Teknologi Maklumat':               122,
    'Kejuruteraan Perisian Multimedia': 122,
    'Kejuruteraan Perisian Maklumat':   122,
};

function getStatusInfo(cgpa) {
    if (cgpa >= 3.67) return { label: 'Anugerah Dekan',   color: 'bg-emerald-100 text-emerald-700' };
    if (cgpa >= 3.00) return { label: 'Kepujian Tinggi',  color: 'bg-blue-100 text-blue-700' };
    if (cgpa >= 2.67) return { label: 'Kepujian',         color: 'bg-sky-100 text-sky-700' };
    if (cgpa >= 2.00) return { label: 'Lulus',            color: 'bg-yellow-100 text-yellow-700' };
    if (cgpa >  0)    return { label: 'Amaran Akademik',  color: 'bg-red-100 text-red-700' };
    return                    { label: '—',               color: 'bg-gray-100 text-gray-500' };
}

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [dataAkademik, setDataAkademik] = useState(null);
    const [notifikasi,   setNotifikasi]   = useState([]);
    const [loading,      setLoading]      = useState(true);

    const totalKreditSasaran = TOTAL_KREDIT_BY_PROGRAM[user?.program] ?? 122;

    // Build per-semester GPA chart data — exclude L-grade (null mata_nilaian) rows
    const chartData = useMemo(() => {
        const rows = dataAkademik?.senarai_keputusan ?? [];
        if (rows.length === 0) return [];

        const bysem = {};
        rows.forEach(({ semester_diambil: sem, mata_nilaian, jam_kredit }) => {
            if (mata_nilaian == null) return;          // skip L/null grades
            if (!bysem[sem]) bysem[sem] = { mata: 0, kredit: 0 };
            bysem[sem].mata   += parseFloat(mata_nilaian) * parseInt(jam_kredit);
            bysem[sem].kredit += parseInt(jam_kredit);
        });

        return Object.keys(bysem)
            .sort((a, b) => Number(a) - Number(b))
            .map(sem => ({
                name: `Sem ${sem}`,
                gpa:  bysem[sem].kredit > 0
                    ? parseFloat((bysem[sem].mata / bysem[sem].kredit).toFixed(2))
                    : 0
            }));
    }, [dataAkademik]);

    // Group results by semester for the table
    const bySemester = useMemo(() => {
        const rows = dataAkademik?.senarai_keputusan ?? [];
        const groups = {};
        rows.forEach(row => {
            const sem = row.semester_diambil;
            if (!groups[sem]) groups[sem] = [];
            groups[sem].push(row);
        });
        return Object.keys(groups)
            .sort((a, b) => Number(a) - Number(b))
            .map(sem => ({ semester: sem, kursus: groups[sem] }));
    }, [dataAkademik]);

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        const fetchAll = async () => {
            try {
                const [resAkademik, resNotif] = await Promise.all([
                    axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`),
                    axios.get(`http://localhost:5000/api/pelajar/maklum-balas/${user.no_matrik}`)
                ]);
                setDataAkademik(resAkademik.data);
                setNotifikasi(resNotif.data);
                // Auto-mark all unread notifications as read
                if (resNotif.data.some(n => n.status === 'Belum Dibaca')) {
                    axios.patch(`http://localhost:5000/api/pelajar/maklum-balas/baca/${user.no_matrik}`)
                        .catch(() => {});
                }
            } catch (err) {
                console.error('Gagal tarik data dashboard pelajar:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (!user) return null;

    const cgpa      = parseFloat(dataAkademik?.pngk_semasa ?? 0);
    const kredit    = parseInt(dataAkademik?.jumlah_kredit ?? 0);
    const kreditPct = Math.min(Math.round((kredit / totalKreditSasaran) * 100), 100);
    const status    = getStatusInfo(cgpa);

    // Y-axis domain: floor to nearest 0.5 below minimum GPA, cap at 4.0
    const gpaMin = chartData.length ? Math.min(...chartData.map(d => d.gpa)) : 0;
    const yMin   = Math.max(0, Math.floor(gpaMin * 2) / 2 - 0.5);

    // Credit ring constants
    const ringR          = 56;
    const ringCirc       = +(2 * Math.PI * ringR).toFixed(2);
    const ringOffset     = +(ringCirc * (1 - kredit / totalKreditSasaran)).toFixed(2);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <style>{`
                @keyframes dbRingDraw {
                    from { stroke-dashoffset: ${ringCirc}; }
                    to   { stroke-dashoffset: ${ringOffset}; }
                }
                .db-ring { animation: dbRingDraw 1.5s cubic-bezier(0.16,1,0.3,1) forwards; }
                @media (prefers-reduced-motion: reduce) {
                    .db-ring { animation: none; stroke-dashoffset: ${ringOffset}; }
                }
            `}</style>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
                </div>
            ) : (
                <>
                    {/* ── HERO BANNER ── */}
                    <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                        <div className="px-10 py-9 flex flex-col lg:flex-row items-center gap-8">

                            {/* Left — identity */}
                            <div className="flex-1 flex flex-col justify-center">
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    PORTAL AKADEMIK
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    {user.nama.split(' ')[0]}
                                </h1>
                                <p className="text-white/40 text-sm mt-0.5 font-medium">{user.nama}</p>
                                <p className="text-white/30 text-xs mt-3 font-medium">
                                    {user.program ?? 'FTSM UKM'}&ensp;·&ensp;
                                    <span className="font-mono">{user.no_matrik}</span>
                                </p>
                                <div className="mt-5">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            {/* Centre — CGPA */}
                            <div className="flex flex-col items-center text-center px-6">
                                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em' }}>
                                    PNGK KUMULATIF
                                </p>
                                <p className="text-white mt-1 leading-none"
                                    style={{ fontFamily: "'DM Serif Display', serif", fontSize: 76, fontWeight: 400 }}>
                                    {cgpa > 0 ? cgpa.toFixed(2) : '—'}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 6 }}>
                                    daripada 4.00
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            {/* Right — credit ring */}
                            <div className="flex flex-col items-center">
                                <svg viewBox="0 0 140 140" width="136" height="136"
                                    aria-label={`${kredit} daripada ${totalKreditSasaran} kredit selesai`}>
                                    <circle cx="70" cy="70" r={ringR} fill="none"
                                        stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                                    <circle cx="70" cy="70" r={ringR} fill="none"
                                        stroke="#C9A227" strokeWidth="8" strokeLinecap="round"
                                        strokeDasharray={ringCirc}
                                        strokeDashoffset={ringCirc}
                                        transform="rotate(-90 70 70)"
                                        className="db-ring" />
                                    <text x="70" y="66" textAnchor="middle" fill="white"
                                        fontSize="26" fontFamily="'DM Serif Display', serif" fontWeight="400">
                                        {kredit}
                                    </text>
                                    <text x="70" y="83" textAnchor="middle" fill="#C9A227"
                                        fontSize="9" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="2">
                                        KREDIT
                                    </text>
                                    <text x="70" y="98" textAnchor="middle" fill="rgba(255,255,255,0.28)"
                                        fontSize="8.5" fontFamily="Inter,sans-serif">
                                        / {totalKreditSasaran} SASARAN
                                    </text>
                                </svg>
                                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                                    {kreditPct}% selesai
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── CHART + NOTIFICATIONS ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* GPA chart — 3 cols */}
                        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
                                Trend GPA Mengikut Semester
                            </h3>
                            {chartData.length > 0 ? (
                                <div className="h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                domain={[yMin, 4.0]}
                                                ticks={[yMin, yMin + 0.5, yMin + 1.0, yMin + 1.5, 4.0].filter(v => v <= 4.0)} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(v) => [v.toFixed(2), 'GPA']}
                                            />
                                            <Line type="monotone" dataKey="gpa" stroke="#002060" strokeWidth={2.5}
                                                dot={{ fill: '#002060', r: 4, strokeWidth: 0 }}
                                                activeDot={{ r: 6, fill: '#002060', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                                    Tiada rekod keputusan lagi untuk dipaparkan.
                                </div>
                            )}
                        </div>

                        {/* Notifications — 2 cols */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Bell size={13} className="text-[#002060]" />
                                Maklum Balas KP
                            </h3>
                            {notifikasi.length > 0 ? (
                                <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                                    {notifikasi.map(item => {
                                        const unread = item.status === 'Belum Dibaca';
                                        return (
                                            <div key={item.id}
                                                className={`p-4 rounded-xl border ${unread ? 'bg-amber-50 border-amber-200/70' : 'bg-gray-50 border-gray-100'}`}>
                                                {unread && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full mb-2 inline-block">
                                                        Baru
                                                    </span>
                                                )}
                                                <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.mesej}</p>
                                                <p className={`text-xs font-bold mt-2 ${unread ? 'text-amber-600' : 'text-gray-400'}`}>
                                                    {new Date(item.tarikh).toLocaleDateString('ms-MY')}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-[220px] flex flex-col items-center justify-center text-center gap-3">
                                    <MessageSquare size={30} className="text-gray-200" />
                                    <p className="text-sm text-gray-400">Tiada maklum balas daripada Ketua Program.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RESULTS TABLE — semester grouped ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-5 flex justify-between items-center border-b border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Rekod Keputusan Akademik
                            </h3>
                            <button
                                onClick={() => navigate('/tambah-kursus')}
                                className="bg-[#002060] hover:bg-[#003082] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm active:scale-95"
                            >
                                + Daftar Kursus
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {bySemester.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-400 text-[11px] uppercase tracking-widest">
                                            <th className="px-6 py-3 font-semibold">Kod</th>
                                            <th className="px-4 py-3 font-semibold">Nama Kursus</th>
                                            <th className="px-4 py-3 font-semibold">Kategori</th>
                                            <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                            <th className="px-4 py-3 font-semibold text-center">Gred</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-gray-700">
                                        {bySemester.map(({ semester, kursus }) => (
                                            <>
                                                <tr key={`sem-${semester}`}>
                                                    <td colSpan="5" className="px-6 py-2 bg-[#002060]/[0.03] border-y border-gray-100">
                                                        <span className="text-[10px] font-bold text-[#002060]/50 uppercase tracking-widest">
                                                            Semester {semester}
                                                        </span>
                                                    </td>
                                                </tr>
                                                {kursus.map((s, i) => (
                                                    <tr key={`${semester}-${i}`}
                                                        className="hover:bg-gray-50/60 transition-colors border-b border-gray-50">
                                                        <td className="px-6 py-3.5 font-bold text-[#002060] font-mono text-xs">{s.kod_kursus}</td>
                                                        <td className="px-4 py-3.5 font-medium max-w-[240px] truncate">{s.nama_kursus}</td>
                                                        <td className="px-4 py-3.5">
                                                            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md font-medium">
                                                                {s.kategori}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-gray-500">{s.jam_kredit}</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`px-2.5 py-1 rounded-md font-extrabold text-xs inline-block min-w-[36px] text-center ${gradeColor(s.gred)}`}>
                                                                {s.gred}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="px-8 py-14 text-center text-gray-400 text-sm">
                                    Tiada rekod keputusan ditemui. Klik "+ Daftar Kursus" untuk menambah.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
