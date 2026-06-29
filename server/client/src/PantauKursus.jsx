import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Search, AlertTriangle, CheckCircle, ArrowUpDown } from 'lucide-react';

const STATUS_TIERS = [
    { label: 'Sangat Baik', minGpa: 3.00, maxGpa: Infinity, bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    { label: 'Baik',        minGpa: 2.67, maxGpa: 3.00,    bg: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700'    },
    { label: 'Sederhana',   minGpa: 2.00, maxGpa: 2.67,    bg: 'bg-amber-400',   light: 'bg-amber-50',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700'  },
    { label: 'Kritikal',    minGpa: 0,    maxGpa: 2.00,    bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-700',     badge: 'bg-red-100 text-red-700'      },
];

function getStatusTier(gpa, jumlahPelajar) {
    if (!jumlahPelajar) return { label: 'Tiada Rekod', badge: 'bg-gray-100 text-gray-500', Icon: CheckCircle };
    const tier = STATUS_TIERS.find(t => gpa >= t.minGpa && gpa < t.maxGpa) ?? STATUS_TIERS[3];
    return { ...tier, Icon: gpa >= 2.67 ? CheckCircle : AlertTriangle };
}

function PantauKursus() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [senaraiKursus, setSenaraiKursus] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState('');
    const [carian, setCarian]               = useState('');
    const [sortField, setSortField]         = useState('gpa');
    const [sortDir, setSortDir]             = useState('asc');

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/pantau-kursus', {
            params: { programs: JSON.stringify(user.programs_handled ?? []) }
        })
            .then(res => setSenaraiKursus(res.data))
            .catch(() => setError('Gagal memuat data pemantauan kursus. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const totalKursus   = senaraiKursus.length;
    const kritikalCount = senaraiKursus.filter(k => k.jumlah_pelajar > 0 && parseFloat(k.purata_mata) < 2.00).length;
    const avgGpa = (() => {
        const ws = senaraiKursus.filter(k => k.jumlah_pelajar > 0);
        return ws.length
            ? (ws.reduce((s, k) => s + parseFloat(k.purata_mata), 0) / ws.length).toFixed(2)
            : '—';
    })();

    const distribution = useMemo(() => {
        const ws = senaraiKursus.filter(k => k.jumlah_pelajar > 0);
        return STATUS_TIERS.map(t => {
            const count = ws.filter(k => {
                const g = parseFloat(k.purata_mata);
                return g >= t.minGpa && g < t.maxGpa;
            }).length;
            return { ...t, count, pct: ws.length > 0 ? Math.round((count / ws.length) * 100) : 0 };
        });
    }, [senaraiKursus]);

    const kursusDitapis = useMemo(() => {
        let list = [...senaraiKursus];
        if (carian.trim()) {
            const q = carian.toLowerCase();
            list = list.filter(k =>
                k.kod_kursus.toLowerCase().includes(q) ||
                k.nama_kursus.toLowerCase().includes(q) ||
                (k.kategori ?? '').toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            const diff = sortField === 'gpa'
                ? parseFloat(a.purata_mata) - parseFloat(b.purata_mata)
                : (a.jumlah_pelajar ?? 0) - (b.jumlah_pelajar ?? 0);
            return sortDir === 'asc' ? diff : -diff;
        });
        return list;
    }, [senaraiKursus, carian, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const sortIndicator = (field) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
                </div>
            ) : error ? (
                <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {error}
                </div>
            ) : (
                <>
                    {/* ── HERO BANNER ── */}
                    <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                        <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

                            {/* Left */}
                            <div>
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    PEMANTAUAN KURSUS — KETUA PROGRAM
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    Pemantauan Kursus
                                </h1>
                                <p className="text-white/30 text-sm mt-1 font-medium">
                                    Prestasi dan status kesukaran bagi setiap subjek berdaftar.
                                </p>
                            </div>

                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            {/* Right — key metrics */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        JUMLAH KURSUS
                                    </p>
                                    <p className="text-white text-2xl font-black mt-1">{totalKursus}</p>
                                </div>

                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        PURATA GPA
                                    </p>
                                    <p className="text-white font-black tracking-tight mt-1"
                                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, lineHeight: 1 }}>
                                        {avgGpa}
                                    </p>
                                </div>

                                {kritikalCount > 0 && (
                                    <div className="px-6 py-4 rounded-2xl text-center"
                                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <p style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                            KURSUS KRITIKAL
                                        </p>
                                        <p className="text-white text-2xl font-black mt-1">{kritikalCount}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── DISTRIBUTION BAR ── */}
                    {senaraiKursus.filter(k => k.jumlah_pelajar > 0).length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">
                                Taburan Status Kursus
                            </h3>
                            <div className="flex h-3 rounded-full overflow-hidden gap-px">
                                {distribution.map((tier, i) =>
                                    tier.pct > 0 && (
                                        <div key={i} className={`${tier.bg} transition-all`}
                                            style={{ width: `${tier.pct}%` }}
                                            title={`${tier.label}: ${tier.count} kursus (${tier.pct}%)`}
                                        />
                                    )
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2.5 mt-5">
                                {distribution.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 ${tier.bg}`} />
                                        <span className="text-xs text-gray-500 font-medium">{tier.label}</span>
                                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${tier.light} ${tier.text}`}>
                                            {tier.count}
                                        </span>
                                        <span className="text-xs text-gray-300">({tier.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── COURSE TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Toolbar */}
                        <div className="px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Senarai Kursus
                                </h3>
                                {carian.trim() && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {kursusDitapis.length} daripada {totalKursus} kursus
                                    </p>
                                )}
                            </div>
                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari kod, nama, atau kategori..."
                                    value={carian}
                                    onChange={e => setCarian(e.target.value)}
                                    className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg w-64 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#002060]/20 focus:border-[#002060] transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-3 font-semibold">Kod Kursus</th>
                                        <th className="px-4 py-3 font-semibold">Maklumat Subjek</th>
                                        <th className="px-4 py-3 font-semibold text-center">
                                            <button
                                                onClick={() => toggleSort('pelajar')}
                                                className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
                                            >
                                                Pelajar <ArrowUpDown size={11} />
                                                {sortIndicator('pelajar')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-center">
                                            <button
                                                onClick={() => toggleSort('gpa')}
                                                className="inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
                                            >
                                                Purata GPA <ArrowUpDown size={11} />
                                                {sortIndicator('gpa')}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 font-semibold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                    {kursusDitapis.map((kursus, i) => {
                                        const gpa    = parseFloat(kursus.purata_mata);
                                        const tier   = getStatusTier(gpa, kursus.jumlah_pelajar);
                                        const barPct = kursus.jumlah_pelajar > 0 ? Math.min((gpa / 4) * 100, 100) : 0;
                                        const barColor =
                                            gpa >= 3.00 ? '#10b981' :
                                            gpa >= 2.67 ? '#3b82f6' :
                                            gpa >= 2.00 ? '#f59e0b' : '#ef4444';

                                        return (
                                            <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-[#002060] text-xs tracking-wide">
                                                    {kursus.kod_kursus}
                                                </td>
                                                <td className="px-4 py-4 max-w-[260px]">
                                                    <p className="font-semibold text-gray-800 truncate">{kursus.nama_kursus}</p>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            {kursus.kategori}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                                            {kursus.jam_kredit} Kredit
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center font-bold text-gray-700">
                                                    {kursus.jumlah_pelajar}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {kursus.jumlah_pelajar > 0 ? (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="text-base font-black text-gray-800 tabular-nums">
                                                                {kursus.purata_mata}
                                                            </span>
                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full rounded-full transition-all"
                                                                    style={{ width: `${barPct}%`, backgroundColor: barColor }} />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${tier.badge}`}>
                                                        <tier.Icon size={12} />
                                                        {tier.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {kursusDitapis.length === 0 && (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                    <BookOpen size={36} className="text-gray-200" />
                                                    <p className="text-gray-400 text-sm font-medium text-center">
                                                        {carian.trim()
                                                            ? `Tiada kursus sepadan dengan "${carian}".`
                                                            : 'Tiada rekod kursus dijumpai dalam pangkalan data.'}
                                                    </p>
                                                    {carian.trim() && (
                                                        <button
                                                            onClick={() => setCarian('')}
                                                            className="text-xs font-bold text-[#002060] hover:underline"
                                                        >
                                                            Padam carian
                                                        </button>
                                                    )}
                                                </div>
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

export default PantauKursus;
