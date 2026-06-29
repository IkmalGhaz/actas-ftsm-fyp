import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function CartaPrestasi() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [dataAkademik, setDataAkademik] = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`)
            .then(res => setDataAkademik(res.data))
            .catch(() => setError('Gagal memuat data carta prestasi. Sila cuba semula.'))
            .finally(() => setLoading(false));
    }, []);

    const { chartData, bestSem, totalKredit } = useMemo(() => {
        const rows = dataAkademik?.senarai_keputusan ?? [];
        const bysem = {};

        rows.forEach(({ semester_diambil: sem, mata_nilaian, jam_kredit }) => {
            if (mata_nilaian == null) return;
            if (!bysem[sem]) bysem[sem] = { mata: 0, kredit: 0 };
            bysem[sem].mata   += parseFloat(mata_nilaian) * parseInt(jam_kredit);
            bysem[sem].kredit += parseInt(jam_kredit);
        });

        let cumMata = 0, cumKredit = 0;
        let best = { sem: '—', png: 0 };

        const data = Object.keys(bysem)
            .sort((a, b) => Number(a) - Number(b))
            .map(sem => {
                const png = bysem[sem].kredit > 0
                    ? parseFloat((bysem[sem].mata / bysem[sem].kredit).toFixed(2))
                    : 0;
                cumMata   += bysem[sem].mata;
                cumKredit += bysem[sem].kredit;
                const pngk = cumKredit > 0
                    ? parseFloat((cumMata / cumKredit).toFixed(2))
                    : 0;
                if (png > best.png) best = { sem: `Semester ${sem}`, png };
                return { name: `Sem ${sem}`, png, pngk, kredit: bysem[sem].kredit };
            });

        return { chartData: data, bestSem: best, totalKredit: cumKredit };
    }, [dataAkademik]);

    if (!user) return null;

    const cgpa = parseFloat(dataAkademik?.pngk_semasa ?? 0);

    // Trend: last semester PNG vs previous
    const trendDelta = chartData.length >= 2
        ? parseFloat((chartData[chartData.length - 1].png - chartData[chartData.length - 2].png).toFixed(2))
        : null;

    // Dynamic Y-axis — zoom into relevant range
    const allPng = chartData.flatMap(d => [d.png, d.pngk]).filter(v => v > 0);
    const yMin   = allPng.length ? Math.max(0, Math.floor(Math.min(...allPng) * 2) / 2 - 0.5) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                    <BarChart3 className="text-[#002060]" size={26} />
                    Carta Prestasi Akademik
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                    Analisis PNG per semester berbanding PNGK kumulatif.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
                </div>
            ) : error ? (
                <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {error}
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <BarChart3 size={40} className="text-gray-200" />
                    <p className="text-gray-400 text-sm text-center">
                        Tiada rekod keputusan lagi.<br />
                        Daftar kursus untuk melihat carta prestasi anda.
                    </p>
                    <button
                        onClick={() => navigate('/tambah-kursus')}
                        className="px-5 py-2.5 bg-[#002060] text-white text-sm font-bold rounded-xl hover:bg-[#003082] transition-colors"
                    >
                        + Daftar Kursus
                    </button>
                </div>
            ) : (
                <>
                    {/* ── HERO BANNER ── */}
                    <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                        <div className="px-10 py-8 flex flex-col md:flex-row items-start md:items-center gap-8">

                            {/* Left — PNGK + trend badge */}
                            <div className="flex-1">
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    PNGK TERKINI
                                </p>
                                <p className="text-white font-black tracking-tight mt-1"
                                    style={{ fontFamily: "'DM Serif Display', serif", fontSize: 72, lineHeight: 1 }}>
                                    {cgpa > 0 ? cgpa.toFixed(2) : '—'}
                                </p>
                                {trendDelta !== null && (
                                    <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                                        trendDelta > 0 ? 'bg-emerald-500/20 text-emerald-300' :
                                        trendDelta < 0 ? 'bg-red-500/20 text-red-300' :
                                                         'bg-white/10 text-white/40'
                                    }`}>
                                        {trendDelta > 0 ? <TrendingUp size={13} /> :
                                         trendDelta < 0 ? <TrendingDown size={13} /> :
                                                          <Minus size={13} />}
                                        {trendDelta > 0 ? `+${trendDelta}` : `${trendDelta}`} berbanding semester lepas
                                    </span>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="hidden md:block self-stretch w-px bg-white/10" />

                            {/* Right — stat boxes */}
                            <div className="flex flex-wrap gap-3">
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        PRESTASI TERBAIK
                                    </p>
                                    <p className="text-white text-2xl font-black mt-1">
                                        {bestSem.png > 0 ? bestSem.png.toFixed(2) : '—'}
                                    </p>
                                    <p className="text-white/30 text-[10px] mt-0.5">{bestSem.sem}</p>
                                </div>
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        KREDIT TERKUMPUL
                                    </p>
                                    <p className="text-white text-2xl font-black mt-1">{totalKredit}</p>
                                    <p className="text-white/30 text-[10px] mt-0.5">jam kredit</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── CHART ── */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        {/* Custom legend */}
                        <div className="flex items-center justify-between mb-7">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                PNG vs PNGK Mengikut Semester
                            </h3>
                            <div className="flex items-center gap-5 text-xs font-medium text-gray-400">
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block w-5 h-[2.5px] rounded bg-[#002060]" />
                                    PNG
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block w-5 h-[2.5px] rounded bg-[#C9A227]" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#C9A227 0,#C9A227 6px,transparent 6px,transparent 10px)' }} />
                                    PNGK
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block w-4 h-px bg-emerald-400" />
                                    Dekan 3.67
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="inline-block w-4 h-px bg-blue-300" />
                                    Kepujian 3.00
                                </span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} dy={10} />
                                    <YAxis domain={[yMin, 4.0]} axisLine={false} tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(v, name) => [v.toFixed(2), name]}
                                    />
                                    <ReferenceLine y={3.67} stroke="#34d399" strokeDasharray="5 3" strokeWidth={1.5}
                                        label={{ value: 'Dekan 3.67', position: 'insideTopRight', fill: '#34d399', fontSize: 10, fontWeight: 600 }} />
                                    <ReferenceLine y={3.00} stroke="#93c5fd" strokeDasharray="5 3" strokeWidth={1.5}
                                        label={{ value: 'Kepujian 3.00', position: 'insideTopRight', fill: '#93c5fd', fontSize: 10, fontWeight: 600 }} />
                                    <Line type="monotone" dataKey="png" name="PNG (Semester)"
                                        stroke="#002060" strokeWidth={2.5}
                                        dot={{ fill: '#002060', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#002060', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                    <Line type="monotone" dataKey="pngk" name="PNGK (Kumulatif)"
                                        stroke="#C9A227" strokeWidth={2.5} strokeDasharray="6 4"
                                        dot={{ fill: '#C9A227', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#C9A227', stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── SEMESTER TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-5 border-b border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Ringkasan Mengikut Semester
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-3 font-semibold">Semester</th>
                                        <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                        <th className="px-4 py-3 font-semibold text-center">PNG</th>
                                        <th className="px-4 py-3 font-semibold text-center">Trend</th>
                                        <th className="px-4 py-3 font-semibold text-center">PNGK Kumulatif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                    {chartData.map((row, i) => {
                                        const prev  = i > 0 ? chartData[i - 1].png : null;
                                        const delta = prev !== null
                                            ? parseFloat((row.png - prev).toFixed(2))
                                            : null;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-6 py-3.5 font-bold text-gray-800">{row.name}</td>
                                                <td className="px-4 py-3.5 text-center text-gray-500">{row.kredit} </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`font-extrabold px-2.5 py-1 rounded-md text-xs ${
                                                        row.png >= 3.67 ? 'bg-emerald-100 text-emerald-700' :
                                                        row.png >= 3.00 ? 'bg-blue-100 text-blue-700' :
                                                        row.png >= 2.00 ? 'bg-yellow-100 text-yellow-700' :
                                                                          'bg-red-100 text-red-700'
                                                    }`}>
                                                        {row.png.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {delta !== null ? (
                                                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                                            delta > 0 ? 'text-emerald-600' :
                                                            delta < 0 ? 'text-red-500' : 'text-gray-400'
                                                        }`}>
                                                            {delta > 0 ? <TrendingUp size={12} /> :
                                                             delta < 0 ? <TrendingDown size={12} /> :
                                                                         <Minus size={12} />}
                                                            {delta > 0 ? `+${delta}` : `${delta}`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3.5 text-center font-bold text-gray-600">
                                                    {row.pngk.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
