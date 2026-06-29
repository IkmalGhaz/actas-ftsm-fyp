import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, MessageSquare, TrendingUp, BookOpen, Award } from 'lucide-react';

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

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">

            {/* Page header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Selamat datang, {user.nama.split(' ')[0]}!
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                    {user.program ?? 'FTSM UKM'} &ensp;·&ensp; {user.no_matrik}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003082]" />
                </div>
            ) : (
                <>
                    {/* KP notifications */}
                    {notifikasi.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Bell size={13} className="text-[#003082]" /> Maklum Balas Ketua Program
                            </p>
                            {notifikasi.map(item => {
                                const unread = item.status === 'Belum Dibaca';
                                return (
                                    <div key={item.id} className={`p-5 rounded-2xl flex items-start gap-4 border ${unread ? 'bg-amber-50 border-amber-200/70' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className={`p-2.5 rounded-xl mt-0.5 flex-shrink-0 ${unread ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                            <MessageSquare size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {unread && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full">Baru</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.mesej}</p>
                                            <p className={`text-xs font-bold mt-2 ${unread ? 'text-amber-600' : 'text-gray-400'}`}>
                                                {new Date(item.tarikh).toLocaleDateString('ms-MY')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Stat cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* CGPA */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">PNGK Terkini</p>
                                    <p className="text-4xl font-extrabold text-emerald-500 mt-1">
                                        {cgpa > 0 ? cgpa.toFixed(2) : '—'}
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <TrendingUp size={20} className="text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 font-medium">Purata Nilai Gred Kumulatif</p>
                        </div>

                        {/* Status */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Akademik</p>
                                    <div className="mt-3">
                                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold inline-block ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Award size={20} className="text-[#003082]" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 font-medium">
                                {cgpa >= 3.67 ? 'CGPA ≥ 3.67 — layak Anugerah Dekan' : 'Berdasarkan CGPA semasa'}
                            </p>
                        </div>

                        {/* Credit progress */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kredit Graduasi</p>
                                    <div className="flex items-end gap-1 mt-1">
                                        <span className="text-3xl font-extrabold text-gray-900">{kredit}</span>
                                        <span className="text-lg font-bold text-gray-400 pb-0.5">/ {totalKreditSasaran}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <BookOpen size={20} className="text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${kreditPct}%`, backgroundColor: kreditPct === 100 ? '#10b981' : '#003082' }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 font-medium text-right mt-1">{kreditPct}% selesai</p>
                        </div>
                    </div>

                    {/* GPA trend chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold text-gray-900 mb-8">Trend GPA Mengikut Semester</h3>
                        {chartData.length > 0 ? (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={12} />
                                        <YAxis axisLine={false} tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                                            domain={[yMin, 4.0]}
                                            ticks={[yMin, yMin + 0.5, yMin + 1.0, yMin + 1.5, 4.0].filter(v => v <= 4.0)} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(v) => [v.toFixed(2), 'GPA']}
                                        />
                                        <Line
                                            type="monotone" dataKey="gpa" stroke="#003082" strokeWidth={2.5}
                                            dot={{ fill: '#003082', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#003082', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
                                Tiada rekod keputusan lagi untuk dipaparkan.
                            </div>
                        )}
                    </div>

                    {/* Results table */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-bold text-gray-900">Rekod Keputusan Akademik</h3>
                            <button
                                onClick={() => navigate('/tambah-kursus')}
                                className="bg-[#003082] hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
                            >
                                + Daftar Kursus
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Kod</th>
                                        <th className="px-4 py-3 font-semibold">Nama Kursus</th>
                                        <th className="px-4 py-3 font-semibold">Kategori</th>
                                        <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                        <th className="px-4 py-3 font-semibold text-center">Sem</th>
                                        <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">Gred</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                    {(dataAkademik?.senarai_keputusan ?? []).map((s, i) => {
                                        const gBg =
                                            s.gred === 'L' ? 'bg-gray-100 text-gray-600' :
                                            s.gred.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                                            s.gred.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                            s.gred.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700';
                                        return (
                                            <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-4 py-3.5 font-bold text-[#003082] font-mono text-xs">{s.kod_kursus}</td>
                                                <td className="px-4 py-3.5 font-medium max-w-[240px] truncate">{s.nama_kursus}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                                                        {s.kategori}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center text-gray-500">{s.jam_kredit}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-500">{s.semester_diambil}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`px-2.5 py-1 rounded-md font-extrabold text-xs inline-block min-w-[36px] text-center ${gBg}`}>
                                                        {s.gred}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {!dataAkademik?.senarai_keputusan?.length && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                                                Tiada rekod keputusan ditemui. Klik "Daftar Kursus" untuk menambah.
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

export default Dashboard;
