import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, MessageSquare, Search, ArrowUpDown, Download } from 'lucide-react';

function getThresholds() {
    try {
        const raw = localStorage.getItem('actas_config');
        if (raw) {
            const cfg = JSON.parse(raw);
            return {
                cgpaDekan:  parseFloat(cfg.cgpaDekan)  || 3.67,
                cgpaAmaran: parseFloat(cfg.cgpaAmaran) || 2.00,
            };
        }
    } catch {}
    return { cgpaDekan: 3.67, cgpaAmaran: 2.00 };
}

function cgpaBadge(cgpa, dekan = 3.67, amaran = 2.00) {
    const v = parseFloat(cgpa);
    if (v >= dekan)  return 'bg-emerald-100 text-emerald-700';
    if (v >= 3.00)   return 'bg-blue-100 text-blue-700';
    if (v >= amaran) return 'bg-yellow-100 text-yellow-700';
    if (v > 0)       return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-500';
}

function DashboardKP() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const { cgpaDekan, cgpaAmaran } = getThresholds();

    const [kpData, setKpData]     = useState({ jumlah_pelajar: 0, purata_cgpa_fakulti: '0.00', senarai_pelajar: [] });
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');
    const [sortDir, setSortDir]   = useState('desc');
    const [csvError, setCsvError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/analitik-pelajar')
            .then(res => setKpData(res.data))
            .catch(() => setError('Gagal memuat data analitik. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const pelajarList = kpData.senarai_pelajar;
    const total       = pelajarList.length;
    const avgCgpa     = parseFloat(kpData.purata_cgpa_fakulti) || 0;
    const dekanCount  = pelajarList.filter(p => parseFloat(p.cgpa) >= cgpaDekan).length;
    const amaranCount = pelajarList.filter(p => parseFloat(p.cgpa) < cgpaAmaran && parseFloat(p.cgpa) > 0).length;

    const distribution = useMemo(() => {
        const tiers = [
            { label: 'Anugerah Dekan',  min: cgpaDekan,  max: Infinity,   bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' },
            { label: 'Kepujian Tinggi', min: 3.00,        max: cgpaDekan,  bg: 'bg-blue-500',    text: 'text-blue-700',   light: 'bg-blue-50'    },
            { label: 'Kepujian',        min: 2.67,        max: 3.00,       bg: 'bg-sky-400',     text: 'text-sky-700',    light: 'bg-sky-50'     },
            { label: 'Lulus',           min: cgpaAmaran,  max: 2.67,       bg: 'bg-amber-400',   text: 'text-amber-700',  light: 'bg-amber-50'   },
            { label: 'Amaran Akademik', min: 0,           max: cgpaAmaran, bg: 'bg-red-500',     text: 'text-red-700',    light: 'bg-red-50'     },
        ];
        return tiers.map(t => {
            const count = pelajarList.filter(p => {
                const v = parseFloat(p.cgpa);
                return v >= t.min && v < t.max;
            }).length;
            return { ...t, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
        });
    }, [pelajarList, total, cgpaDekan, cgpaAmaran]);

    const filteredPelajar = useMemo(() => {
        let list = [...pelajarList];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.nama.toLowerCase().includes(q) ||
                p.no_matrik.toLowerCase().includes(q) ||
                (p.program ?? '').toLowerCase().includes(q)
            );
        }
        list.sort((a, b) => {
            const diff = parseFloat(a.cgpa) - parseFloat(b.cgpa);
            return sortDir === 'desc' ? -diff : diff;
        });
        return list;
    }, [pelajarList, search, sortDir]);

    const muatTurunCSV = () => {
        if (!pelajarList.length) { setCsvError('Tiada data pelajar untuk dimuat turun.'); return; }
        setCsvError('');
        const headers = ['No Matrik', 'Nama Pelajar', 'Program', 'Kredit Terkumpul', 'PNGK'];
        const rows    = pelajarList.map(p => [
            p.no_matrik,
            `"${p.nama.toUpperCase()}"`,
            `"${p.program}"`,
            p.totalKredit,
            p.cgpa,
        ]);
        const csv  = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.href     = encodeURI(csv);
        link.download = 'Laporan_Keseluruhan_Pelajar_FTSM.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

                            {/* Left — identity */}
                            <div>
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    PAPAN PEMUKA KETUA PROGRAM
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    Selamat datang, {user.nama.split(' ')[0]}
                                </h1>
                                <p className="text-white/30 text-sm mt-1 font-medium">
                                    {user.program ?? 'FTSM UKM'}&ensp;·&ensp;Analitik Keseluruhan Pelajar
                                </p>
                            </div>

                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            {/* Right — key metrics */}
                            <div className="flex flex-wrap items-center gap-5">
                                {/* Big PNGK */}
                                <div className="text-center">
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                        PURATA PNGK FAKULTI
                                    </p>
                                    <p className="text-white font-black tracking-tight mt-1"
                                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 68, lineHeight: 1 }}>
                                        {avgCgpa.toFixed(2)}
                                    </p>
                                </div>

                                {/* Stat chips */}
                                <div className="flex flex-col gap-2">
                                    <div className="px-5 py-2.5 rounded-2xl text-center"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{ color: '#C9A227', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                            JUMLAH PELAJAR
                                        </p>
                                        <p className="text-white text-2xl font-black mt-0.5">{total}</p>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-2xl text-center"
                                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <p style={{ color: '#6ee7b7', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                            ANUGERAH DEKAN
                                        </p>
                                        <p className="text-white text-2xl font-black mt-0.5">{dekanCount}</p>
                                    </div>
                                    <div className="px-5 py-2.5 rounded-2xl text-center"
                                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <p style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                            PERLU PERHATIAN
                                        </p>
                                        <p className="text-white text-2xl font-black mt-0.5">{amaranCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── PNGK DISTRIBUTION ── */}
                    {total > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">
                                Taburan Prestasi Pelajar
                            </h3>
                            {/* Stacked bar */}
                            <div className="flex h-3 rounded-full overflow-hidden gap-px">
                                {distribution.map((tier, i) =>
                                    tier.pct > 0 && (
                                        <div key={i} className={`${tier.bg} transition-all`}
                                            style={{ width: `${tier.pct}%` }}
                                            title={`${tier.label}: ${tier.count} pelajar (${tier.pct}%)`}
                                        />
                                    )
                                )}
                            </div>
                            {/* Legend */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2.5 mt-5">
                                {distribution.map((tier, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 ${tier.bg}`} />
                                        <span className="text-xs text-gray-500 font-medium">
                                            {tier.label}
                                        </span>
                                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${tier.light} ${tier.text}`}>
                                            {tier.count}
                                        </span>
                                        <span className="text-xs text-gray-300">({tier.pct}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── STUDENT TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Table toolbar */}
                        <div className="px-7 py-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Senarai Prestasi Pelajar
                                </h3>
                                {search.trim() && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {filteredPelajar.length} daripada {total} pelajar
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Search */}
                                <div className="relative">
                                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama, matrik, program..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg w-52 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#002060]/20 focus:border-[#002060] transition-all"
                                    />
                                </div>
                                {/* Sort toggle */}
                                <button
                                    onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <ArrowUpDown size={12} />
                                    PNGK {sortDir === 'desc' ? '↓' : '↑'}
                                </button>
                                {/* CSV download */}
                                <button
                                    onClick={muatTurunCSV}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white rounded-lg transition-opacity hover:opacity-90"
                                    style={{ background: '#002060' }}
                                >
                                    <Download size={13} />
                                    Muat Turun CSV
                                </button>
                            </div>
                        </div>

                        {csvError && (
                            <div className="px-7 py-2.5 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">
                                {csvError}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-3 font-semibold">No. Matrik</th>
                                        <th className="px-4 py-3 font-semibold">Nama Pelajar</th>
                                        <th className="px-4 py-3 font-semibold">Program</th>
                                        <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                        <th className="px-4 py-3 font-semibold text-center">PNGK</th>
                                        <th className="px-4 py-3 font-semibold text-center">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                    {filteredPelajar.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-[#002060] text-xs">
                                                {p.no_matrik}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium max-w-[200px] truncate">
                                                {p.nama}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                                                    {p.program ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-gray-500">
                                                {p.totalKredit} 
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`px-2.5 py-1 rounded-md font-extrabold text-xs inline-block min-w-[46px] text-center ${cgpaBadge(p.cgpa, cgpaDekan, cgpaAmaran)}`}>
                                                    {p.cgpa}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    onClick={() => navigate('/kp/maklum-balas')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors"
                                                    style={{ color: '#002060', borderColor: 'rgba(0,32,96,0.2)' }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = '#002060'; e.currentTarget.style.color = 'white'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#002060'; }}
                                                >
                                                    <MessageSquare size={11} />
                                                    Maklum Balas
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredPelajar.length === 0 && (
                                        <tr>
                                            <td colSpan="6">
                                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                    <Users size={36} className="text-gray-200" />
                                                    <p className="text-gray-400 text-sm font-medium text-center">
                                                        {search.trim()
                                                            ? `Tiada pelajar sepadan dengan "${search}".`
                                                            : 'Tiada rekod pelajar dijumpai dalam pangkalan data.'}
                                                    </p>
                                                    {search.trim() && (
                                                        <button
                                                            onClick={() => setSearch('')}
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

export default DashboardKP;
