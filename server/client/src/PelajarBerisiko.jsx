import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, Users } from 'lucide-react';

function riskBadge(sebab) {
    if (!sebab) return null;
    return sebab.split(', ').map((label, i) => {
        const isCgpa   = label === 'CGPA Kritikal';
        const isKredit = label === 'Kredit Tertinggal';
        const cls = isCgpa
            ? 'bg-red-100 text-red-700'
            : isKredit
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600';
        return (
            <span key={i} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide mr-1 ${cls}`}>
                {label}
            </span>
        );
    });
}

function PelajarBerisiko() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [data, setData]       = useState({ jumlah_berisiko: 0, senarai: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/pelajar-berisiko', {
            params: { programs: JSON.stringify(user.programs_handled ?? []) }
        })
            .then(res => setData(res.data))
            .catch(() => setError('Gagal memuat data pelajar berisiko. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const { jumlah_berisiko, senarai } = data;

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
                                    PENGESANAN RISIKO AKADEMIK — FR9
                                </p>
                                <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                                    Senarai Pelajar Berisiko
                                </h1>
                                <p className="text-white/30 text-sm mt-1 font-medium">
                                    Pelajar dengan CGPA &lt; 2.00 atau kredit tertinggal berbanding semester semasa.
                                </p>
                            </div>

                            <div className="hidden lg:block self-stretch w-px bg-white/10" />

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="px-6 py-4 rounded-2xl text-center"
                                    style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                    <p style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                        PELAJAR BERISIKO
                                    </p>
                                    <p className="text-white font-black tracking-tight mt-1"
                                        style={{ fontFamily: "'DM Serif Display', serif", fontSize: 56, lineHeight: 1 }}>
                                        {jumlah_berisiko}
                                    </p>
                                    <p style={{ color: 'rgba(252,165,165,0.6)', fontSize: 10, marginTop: 2 }}>
                                        pelajar memerlukan perhatian
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RISK LEGEND ── */}
                    <div className="flex flex-wrap items-center gap-4 px-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kategori Risiko:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            CGPA Kritikal — CGPA &lt; 2.00
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Kredit Tertinggal — kredit &lt; semester × 14
                        </span>
                    </div>

                    {/* ── TABLE ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-7 py-5 border-b border-gray-100">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                Senarai Pelajar Berisiko
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {jumlah_berisiko} pelajar memerlukan tindakan susulan
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest">
                                        <th className="px-6 py-3 font-semibold">No. Matrik</th>
                                        <th className="px-4 py-3 font-semibold">Nama Pelajar</th>
                                        <th className="px-4 py-3 font-semibold">Program</th>
                                        <th className="px-4 py-3 font-semibold text-center">Kredit</th>
                                        <th className="px-4 py-3 font-semibold text-center">Semester</th>
                                        <th className="px-4 py-3 font-semibold text-center">CGPA</th>
                                        <th className="px-4 py-3 font-semibold">Kategori Risiko</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                    {senarai.map((p, i) => (
                                        <tr key={i} className="hover:bg-red-50/30 transition-colors">
                                            <td className="px-6 py-3.5 font-mono font-bold text-[#002060] text-xs">
                                                {p.no_matrik}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium max-w-[180px] truncate">
                                                {p.nama}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-medium whitespace-nowrap">
                                                    {p.program ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-gray-500 text-xs">
                                                {p.kredit_terkumpul}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-gray-500 text-xs">
                                                {p.semester_max}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="px-2.5 py-1 rounded-md font-extrabold text-xs inline-block min-w-[46px] text-center bg-red-100 text-red-700">
                                                    {p.cgpa}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {riskBadge(p.sebab_risiko)}
                                            </td>
                                        </tr>
                                    ))}

                                    {senarai.length === 0 && (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                                    <Users size={36} className="text-gray-200" />
                                                    <p className="text-gray-400 text-sm font-medium text-center">
                                                        Tiada pelajar berisiko dikesan buat masa ini.
                                                    </p>
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

export default PelajarBerisiko;
