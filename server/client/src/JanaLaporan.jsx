import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Printer, Download, Filter, ChevronDown, FileText } from 'lucide-react';

const KATEGORI_PILLS = ['Semua', 'Anugerah Dekan', 'Amaran Akademik'];

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

function getKategori(cgpa, dekan = 3.67, amaran = 2.00) {
    const v = parseFloat(cgpa);
    if (v >= dekan)  return { label: 'Anugerah Dekan',  bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (v >= 3.00)   return { label: 'Kepujian',         bg: 'bg-blue-100',    text: 'text-blue-700'    };
    if (v >= amaran) return { label: 'Lulus',            bg: 'bg-amber-100',   text: 'text-amber-700'   };
    return             { label: 'Amaran Akademik', bg: 'bg-red-100',     text: 'text-red-700'     };
}

function JanaLaporan() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const { cgpaDekan, cgpaAmaran } = getThresholds();
    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [fetchError, setFetchError] = useState('');

    const [programFilter, setProgramFilter] = useState('Semua');
    const [kategoriFilter, setKategoriFilter] = useState('Semua');
    const [csvError, setCsvError]   = useState('');

    useEffect(() => {
        if (!user || user.role !== 'pegawai') { navigate('/'); return; }
        api.get('/api/kp/analitik-pelajar')
            .then(res => setSenaraiPelajar(res.data.senarai_pelajar || []))
            .catch(() => setFetchError('Gagal memuat data pelajar. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const uniquePrograms = useMemo(() =>
        ['Semua', ...Array.from(new Set(senaraiPelajar.map(p => p.program).filter(Boolean))).sort()]
    , [senaraiPelajar]);

    const pelajarDitapis = useMemo(() =>
        senaraiPelajar.filter(p => {
            const v = parseFloat(p.cgpa);
            if (programFilter !== 'Semua' && p.program !== programFilter) return false;
            if (kategoriFilter === 'Anugerah Dekan')  return v >= cgpaDekan;
            if (kategoriFilter === 'Amaran Akademik') return v < cgpaAmaran;
            return true;
        })
    , [senaraiPelajar, programFilter, kategoriFilter, cgpaDekan, cgpaAmaran]);

    const stats = useMemo(() => ({
        total:  pelajarDitapis.length,
        dekan:  pelajarDitapis.filter(p => parseFloat(p.cgpa) >= cgpaDekan).length,
        amaran: pelajarDitapis.filter(p => parseFloat(p.cgpa) < cgpaAmaran).length,
    }), [pelajarDitapis, cgpaDekan, cgpaAmaran]);

    const printLabel = [
        kategoriFilter !== 'Semua' ? kategoriFilter : 'Semua Pelajar',
        programFilter !== 'Semua' ? `— ${programFilter}` : '',
    ].filter(Boolean).join(' ');

    const muatTurunCSV = () => {
        if (pelajarDitapis.length === 0) {
            setCsvError('Tiada data untuk dieksport berdasarkan tapisan semasa.');
            setTimeout(() => setCsvError(''), 3500);
            return;
        }
        const headers = ['Bil.', 'No. Matrik', 'Nama Pelajar', 'Program', 'Kredit Terkumpul', 'PNGK', 'Kategori'];
        const rows = pelajarDitapis.map((p, i) => [
            i + 1,
            p.no_matrik,
            `"${p.nama.toUpperCase()}"`,
            `"${p.program}"`,
            p.totalKredit,
            p.cgpa,
            `"${getKategori(p.cgpa, cgpaDekan, cgpaAmaran).label}"`,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,﻿'
            + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `Laporan_${kategoriFilter.replace(/ /g,'_')}_${programFilter.replace(/ /g,'_')}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">

            {/* Print page settings */}
            <style>{`@media print { @page { margin: 20mm 15mm; } }`}</style>

            {/* ── HERO BANNER ── */}
            <div className="print:hidden rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            PENJANAAN LAPORAN RASMI — PEGAWAI FTSM
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                            Rekod Akademik Pelajar
                        </h1>
                        <p className="text-white/30 text-sm mt-1 font-medium">
                            Saring, pratonton dan jana laporan dalam format PDF atau CSV.
                        </p>
                    </div>

                    <div className="hidden lg:block self-stretch w-px bg-white/10" />

                    <div className="flex flex-wrap items-center gap-5">
                        <div className="text-center">
                            <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                REKOD DITAPIS
                            </p>
                            <p className="text-white font-black tracking-tight mt-1"
                                style={{ fontFamily: "'DM Serif Display', serif", fontSize: 64, lineHeight: 1 }}>
                                {loading ? '—' : stats.total}
                            </p>
                            <p className="text-white/25 text-xs mt-1 font-medium">pelajar</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => window.print()}
                                disabled={loading || stats.total === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                            >
                                <Printer size={15} />
                                Cetak PDF
                            </button>
                            <button
                                onClick={muatTurunCSV}
                                disabled={loading || stats.total === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: '#C9A227', color: '#002060' }}
                            >
                                <Download size={15} />
                                Eksport CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inline errors */}
            {csvError && (
                <div className="print:hidden px-5 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
                    {csvError}
                </div>
            )}
            {fetchError && (
                <div className="print:hidden px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {fetchError}
                </div>
            )}

            {!fetchError && (
                <>
                    {/* ── FILTER CONTROLS ── */}
                    <div className="print:hidden bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
                        <div className="flex flex-wrap items-end gap-6">

                            <div className="flex items-center gap-2 self-center mb-0.5">
                                <Filter size={13} className="text-gray-400" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tapisan</span>
                            </div>

                            {/* Program dropdown */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Program Pengajian
                                </label>
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-4 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:border-[#002060] cursor-pointer"
                                        value={programFilter}
                                        onChange={(e) => setProgramFilter(e.target.value)}
                                    >
                                        {uniquePrograms.map(p => (
                                            <option key={p} value={p}>
                                                {p === 'Semua' ? 'Semua Program' : p}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="self-stretch w-px bg-gray-100 hidden sm:block" />

                            {/* Category pills */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Kategori Pelajar
                                </label>
                                <div className="flex gap-1.5">
                                    {KATEGORI_PILLS.map(k => (
                                        <button
                                            key={k}
                                            onClick={() => setKategoriFilter(k)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                kategoriFilter === k
                                                    ? 'text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                            style={kategoriFilter === k ? { background: '#002060' } : {}}
                                        >
                                            {k === 'Semua' ? 'Semua Pelajar' : k}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary chips */}
                            {!loading && (
                                <div className="ml-auto flex items-center gap-2 self-center">
                                    <span className="text-xs text-gray-400 font-medium">{stats.total} rekod</span>
                                    {stats.dekan > 0 && (
                                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                            {stats.dekan} Dekan
                                        </span>
                                    )}
                                    {stats.amaran > 0 && (
                                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded bg-red-100 text-red-700">
                                            {stats.amaran} Amaran
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── REPORT TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none overflow-hidden">

                        {/* Official letterhead — print only */}
                        <div className="hidden print:block px-0 pt-0 pb-6">
                            <div className="text-center border-b-2 border-gray-800 pb-5 mb-0">
                                <h1 className="text-xl font-black uppercase tracking-widest text-gray-900" style={{ fontFamily: 'serif' }}>
                                    Fakulti Teknologi &amp; Sains Maklumat
                                </h1>
                                <h2 className="text-sm font-bold text-gray-600 mt-1 uppercase tracking-wide">
                                    Universiti Kebangsaan Malaysia
                                </h2>
                                <div className="my-4 border-t border-gray-300" />
                                <p className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                                    Laporan Rasmi: {printLabel}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Tarikh Jana:&nbsp;
                                    {new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    &ensp;·&ensp; Dijana oleh: {user.nama}
                                </p>
                            </div>
                        </div>

                        {/* Screen-only table header */}
                        <div className="print:hidden flex items-center justify-between px-8 pt-6 pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-gray-400" />
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                    Pratonton Laporan
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                                {loading ? 'Memuatkan...' : `${stats.total} rekod ditemui`}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64 print:hidden">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2"
                                    style={{ borderColor: '#002060' }} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] font-bold uppercase tracking-widest
                                            bg-gray-50 text-gray-400
                                            print:bg-transparent print:text-gray-600 print:border-b print:border-gray-400">
                                            <th className="pl-8 pr-3 py-4 print:pl-0 print:py-2">Bil.</th>
                                            <th className="px-4 py-4 print:px-2 print:py-2">No. Matrik</th>
                                            <th className="px-4 py-4 print:px-2 print:py-2">Nama Pelajar</th>
                                            <th className="px-4 py-4 print:px-2 print:py-2">Program</th>
                                            <th className="px-4 py-4 text-center print:px-2 print:py-2">Kredit</th>
                                            <th className="px-4 py-4 text-center print:px-2 print:py-2">PNGK</th>
                                            <th className="px-4 py-4 print:px-2 print:py-2">Kategori</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-50 print:divide-gray-200">
                                        {pelajarDitapis.length === 0 ? (
                                            <tr>
                                                <td colSpan={7}
                                                    className="px-8 py-16 text-center text-gray-400 font-medium print:hidden">
                                                    Tiada rekod pelajar untuk tapisan ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            pelajarDitapis.map((p, i) => {
                                                const kat = getKategori(p.cgpa, cgpaDekan, cgpaAmaran);
                                                return (
                                                    <tr key={p.no_matrik}
                                                        className="hover:bg-gray-50/60 transition-colors print:hover:bg-transparent">
                                                        <td className="pl-8 pr-3 py-3.5 font-mono text-xs text-gray-400 print:pl-0 print:text-gray-600">
                                                            {String(i + 1).padStart(2, '0')}
                                                        </td>
                                                        <td className="px-4 py-3.5 font-mono font-bold text-xs print:px-2"
                                                            style={{ color: '#002060' }}>
                                                            {p.no_matrik}
                                                        </td>
                                                        <td className="px-4 py-3.5 font-bold text-gray-800 text-xs uppercase print:px-2">
                                                            {p.nama}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-gray-500 text-xs print:px-2">
                                                            {p.program}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center text-gray-600 font-medium print:px-2">
                                                            {p.totalKredit}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center print:px-2">
                                                            <span className="font-black text-gray-800">{p.cgpa}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 print:px-2">
                                                            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded
                                                                print:bg-transparent print:text-gray-700 print:border print:border-gray-400
                                                                ${kat.bg} ${kat.text}`}>
                                                                {kat.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Official print footer */}
                        {!loading && pelajarDitapis.length > 0 && (
                            <div className="hidden print:block px-0 mt-8 pt-6 border-t-2 border-gray-400">
                                <div className="flex justify-between items-start text-xs text-gray-600">
                                    <div>
                                        <p className="font-bold text-gray-800">Ringkasan Laporan</p>
                                        <p className="mt-1">Jumlah Rekod: {stats.total}</p>
                                        <p>Anugerah Dekan: {stats.dekan} pelajar</p>
                                        <p>Amaran Akademik: {stats.amaran} pelajar</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 mb-8">Tandatangan &amp; Cop Rasmi</p>
                                        <div className="border-b border-gray-700 w-52 mb-1" />
                                        <p className="font-bold text-gray-800">{user.nama}</p>
                                        <p className="text-gray-500">Pegawai FTSM, UKM</p>
                                    </div>
                                </div>
                                <p className="mt-6 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400 uppercase tracking-widest">
                                    Dokumen Sulit — Dijana oleh Sistem ACTAS-FTSM — Hanya Untuk Kegunaan Dalaman
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default JanaLaporan;
