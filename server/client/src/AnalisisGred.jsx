import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen } from 'lucide-react';

const GRADE_GROUPS = [
    { label: 'Cemerlang', desc: 'A, A-',     grades: ['A', 'A-'],       barBg: 'bg-emerald-500', countBg: 'bg-emerald-100', countText: 'text-emerald-700', fill: '#10b981' },
    { label: 'Kepujian',  desc: 'B+, B, B-', grades: ['B+', 'B', 'B-'], barBg: 'bg-blue-500',    countBg: 'bg-blue-100',    countText: 'text-blue-700',    fill: '#3b82f6' },
    { label: 'Lulus',     desc: 'C+, C',     grades: ['C+', 'C'],       barBg: 'bg-amber-400',   countBg: 'bg-amber-100',   countText: 'text-amber-700',   fill: '#f59e0b' },
    { label: 'Kritikal',  desc: 'D, E',      grades: ['D', 'E'],        barBg: 'bg-red-500',     countBg: 'bg-red-100',     countText: 'text-red-700',     fill: '#ef4444' },
];

function getBarFill(gred) {
    if (!gred) return '#6b7280';
    if (gred.startsWith('A')) return '#10b981';
    if (gred.startsWith('B')) return '#3b82f6';
    if (gred.startsWith('C')) return '#f59e0b';
    return '#ef4444';
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-gray-800">{label}</p>
            <p className="text-gray-500 mt-0.5">{payload[0].value} <span className="font-medium">pelajar</span></p>
        </div>
    );
};

function AnalisisGred() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [dataGred, setDataGred] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/taburan-gred', {
            params: { programs: JSON.stringify(user.programs_handled ?? []) }
        })
            .then(res => {
                setDataGred(res.data.map(item => ({
                    name:     `Gred ${(item.gred ?? '?').trim().toUpperCase()}`,
                    jumlah:   parseInt(item.jumlah) || 0,
                    gredAsal: (item.gred ?? '').trim().toUpperCase(),
                })));
            })
            .catch(() => setError('Gagal memuat data analisis gred. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const totalKeputusan = dataGred.reduce((s, d) => s + d.jumlah, 0);

    const gradeGroups = useMemo(() => GRADE_GROUPS.map(g => {
        const count = dataGred
            .filter(d => g.grades.includes(d.gredAsal))
            .reduce((s, d) => s + d.jumlah, 0);
        const pct = totalKeputusan > 0 ? Math.round((count / totalKeputusan) * 100) : 0;
        return { ...g, count, pct };
    }), [dataGred, totalKeputusan]);

    const passCount = gradeGroups.filter(g => g.label !== 'Kritikal').reduce((s, g) => s + g.count, 0);
    const passRate  = totalKeputusan > 0 ? Math.round((passCount / totalKeputusan) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
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
                            <div>
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    ANALISIS TABURAN GRED — KETUA PROGRAM
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    Taburan Gred Keseluruhan Pelajar Fakulti
                                </h1>
                                <p className="text-white/30 text-sm mt-1 font-medium">
                                    Gambaran keseluruhan pencapaian gred bagi semua kursus berdaftar.
                                </p>
                            </div>

                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="text-center">
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                        JUMLAH REKOD
                                    </p>
                                    <p className="text-white font-black tracking-tight mt-1"
                                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 64, lineHeight: 1 }}>
                                        {totalKeputusan}
                                    </p>
                                    <p className="text-white/25 text-xs mt-1 font-medium">pendaftaran kursus</p>
                                </div>
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <p style={{ color: '#6ee7b7', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        KADAR LULUS
                                    </p>
                                    <p className="text-white text-3xl font-black mt-1">{passRate}%</p>
                                    <p style={{ color: 'rgba(110,231,183,0.5)', fontSize: 10, marginTop: 2 }}>
                                        {passCount} pelajar
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── MAIN CONTENT ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Bar chart — 2 cols */}
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                                Kekerapan Mengikut Gred
                            </h3>

                            {dataGred.length > 0 ? (
                                <div className="flex-1" style={{ minHeight: 280 }}>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={dataGred} margin={{ top: 10, right: 16, left: -24, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false} tickLine={false}
                                                tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                axisLine={false} tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 11 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                                            <Bar dataKey="jumlah" radius={[5, 5, 0, 0]} maxBarSize={52}>
                                                {dataGred.map((entry, i) => (
                                                    <Cell key={i} fill={getBarFill(entry.gredAsal)} fillOpacity={0.9} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                    Tiada data keputusan direkodkan lagi.
                                </div>
                            )}

                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 pt-6 border-t border-gray-50">
                                {GRADE_GROUPS.map((g, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-sm ${g.barBg}`} />
                                        <span className="text-xs font-medium text-gray-500">
                                            {g.label}
                                            <span className="text-gray-300 ml-1">({g.desc})</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar — 1 col */}
                        <div className="flex flex-col gap-5">

                            {/* Grade group breakdown */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-5">
                                    Ringkasan Kumpulan
                                </h3>

                                {/* Mini stacked bar */}
                                {totalKeputusan > 0 && (
                                    <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-5">
                                        {gradeGroups.map((g, i) =>
                                            g.pct > 0 && (
                                                <div key={i} className={g.barBg}
                                                    style={{ width: `${g.pct}%` }}
                                                    title={`${g.label}: ${g.count} (${g.pct}%)`}
                                                />
                                            )
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {gradeGroups.map((g, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0 ${g.barBg}`} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-700">{g.label}</p>
                                                    <p className="text-[10px] text-gray-400">{g.desc}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${g.countBg} ${g.countText}`}>
                                                    {g.count}
                                                </span>
                                                <span className="text-xs text-gray-300 w-8 text-right">
                                                    {g.pct}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalKeputusan > 0 && (
                                    <div className="mt-5 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-xs text-gray-400 font-medium">Jumlah rekod</span>
                                        <span className="text-xs font-bold text-gray-700">{totalKeputusan}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    Tindakan Susulan
                                </p>
                                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                    Kenal pasti kursus yang menyumbang gred kritikal dan pantau trend prestasi pelajar secara terperinci.
                                </p>
                                <button
                                    onClick={() => navigate('/kp/pantau-kursus')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                                    style={{ background: '#002060' }}
                                >
                                    <BookOpen size={14} />
                                    Lihat Pemantauan Kursus
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AnalisisGred;
