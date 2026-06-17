import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, Medal, TrendingUp, BookOpen } from 'lucide-react';

export default function CartaPrestasi() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [dataAkademik, setDataAkademik] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`)
            .then(res => setDataAkademik(res.data))
            .catch(err => console.error('Gagal tarik data carta prestasi:', err))
            .finally(() => setLoading(false));
    }, []);

    // Build per-semester PNG and rolling PNGK
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
                return { name: `Sem ${sem}`, png, pngk };
            });

        return { chartData: data, bestSem: best, totalKredit: cumKredit };
    }, [dataAkademik]);

    if (!user) return null;

    const cgpa = parseFloat(dataAkademik?.pngk_semasa ?? 0);

    const StatCard = ({ icon: Icon, label, value, subtext, iconBg, iconColor }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
                    {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-xl ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <BarChart3 className="text-[#003082]" size={28} />
                    Carta Prestasi Akademik
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Analisis PNG per semester berbanding PNGK kumulatif.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003082]" />
                </div>
            ) : (
                <>
                    {/* Stat strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <StatCard
                            icon={TrendingUp}  label="PNGK Terkini"
                            value={cgpa > 0 ? cgpa.toFixed(2) : '—'}
                            subtext="Purata Nilai Gred Kumulatif"
                            iconBg="bg-emerald-50" iconColor="text-emerald-600"
                        />
                        <StatCard
                            icon={Medal}  label="Prestasi Terbaik"
                            value={bestSem.png > 0 ? bestSem.png.toFixed(2) : '—'}
                            subtext={bestSem.sem}
                            iconBg="bg-amber-50" iconColor="text-amber-500"
                        />
                        <StatCard
                            icon={BookOpen}  label="Kredit Terkumpul"
                            value={totalKredit}
                            subtext="jam kredit lulus setakat ini"
                            iconBg="bg-purple-50" iconColor="text-purple-600"
                        />
                    </div>

                    {/* Chart */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-base font-bold text-gray-900 mb-8">PNG vs PNGK Mengikut Semester</h3>
                        {chartData.length > 0 ? (
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }} dy={10} />
                                        <YAxis domain={[0, 4.0]} ticks={[0, 1, 2, 3, 4]}
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(v) => [v.toFixed(2)]}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '24px' }} iconType="circle" />
                                        <Line
                                            type="monotone" dataKey="png" name="PNG (Semester)"
                                            stroke="#003082" strokeWidth={2.5}
                                            dot={{ fill: '#003082', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#003082', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                        <Line
                                            type="monotone" dataKey="pngk" name="PNGK (Kumulatif)"
                                            stroke="#F5A623" strokeWidth={2.5} strokeDasharray="6 4"
                                            dot={{ fill: '#F5A623', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#F5A623', stroke: '#fff', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[320px] flex items-center justify-center text-gray-400 text-sm">
                                Tiada rekod keputusan lagi untuk dipaparkan.
                            </div>
                        )}
                    </div>

                    {/* Per-semester table */}
                    {chartData.length > 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-900 mb-5">Ringkasan Mengikut Semester</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                                            <th className="px-4 py-3 font-semibold rounded-tl-lg">Semester</th>
                                            <th className="px-4 py-3 font-semibold text-center">PNG</th>
                                            <th className="px-4 py-3 font-semibold text-center rounded-tr-lg">PNGK Kumulatif</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                        {chartData.map((row, i) => (
                                            <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-4 py-3.5 font-bold text-gray-800">{row.name}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`font-extrabold px-2.5 py-1 rounded-md text-xs ${
                                                        row.png >= 3.67 ? 'bg-emerald-100 text-emerald-700' :
                                                        row.png >= 3.00 ? 'bg-blue-100 text-blue-700' :
                                                        row.png >= 2.00 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>{row.png.toFixed(2)}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-center font-bold text-gray-600">
                                                    {row.pngk.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
