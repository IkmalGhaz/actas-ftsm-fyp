import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Calculator, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const GRED_MATA = {
    'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00,
    'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'D': 1.00, 'E': 0.00,
};

function gradeColor(grade) {
    if (!grade) return 'text-gray-400';
    if (grade === 'A' || grade === 'A-') return 'text-emerald-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-amber-600';
    return 'text-red-600';
}

function getStatus(cgpa) {
    const v = parseFloat(cgpa);
    if (isNaN(v) || v === 0) return null;
    if (v >= 3.67) return { label: 'Anugerah Dekan',  bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (v >= 3.00) return { label: 'Kepujian',         bg: 'bg-blue-100',    text: 'text-blue-700'    };
    if (v >= 2.00) return { label: 'Lulus',            bg: 'bg-amber-100',   text: 'text-amber-700'   };
    return               { label: 'Amaran Akademik', bg: 'bg-red-100',     text: 'text-red-700'     };
}

const LABEL = 'text-[11px] font-bold text-gray-400 uppercase tracking-widest';
const INPUT = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all';

export default function Simulator() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [currentCgpa,   setCurrentCgpa]   = useState(0);
    const [currentKredit, setCurrentKredit] = useState(0);
    const [loading,       setLoading]       = useState(true);
    const [fetchError,    setFetchError]    = useState('');

    const [simulatedCourses, setSimulatedCourses] = useState([]);
    const [newCourse,  setNewCourse]  = useState({ name: '', credits: 3, grade: 'A' });
    const [inputError, setInputError] = useState('');

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        api.get(`/api/akademik/${user.no_matrik}`)
            .then(res => {
                setCurrentCgpa(parseFloat(res.data.pngk_semasa) || 0);
                setCurrentKredit(parseInt(res.data.jumlah_kredit) || 0);
            })
            .catch(() => setFetchError('Gagal memuat data akademik. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    const { simulatedCgpa, simulatedCreditsTotal } = useMemo(() => {
        let simPts = 0, simKredit = 0;
        simulatedCourses.forEach(c => {
            simPts    += GRED_MATA[c.grade] * c.credits;
            simKredit += c.credits;
        });
        const total = currentKredit + simKredit;
        const cgpa  = total > 0
            ? (currentCgpa * currentKredit + simPts) / total
            : 0;
        return { simulatedCgpa: cgpa, simulatedCreditsTotal: simKredit };
    }, [simulatedCourses, currentCgpa, currentKredit]);

    const delta = simulatedCourses.length > 0 ? simulatedCgpa - currentCgpa : null;

    const addCourse = () => {
        if (!newCourse.name.trim()) { setInputError('Sila masukkan nama subjek.'); return; }
        setInputError('');
        setSimulatedCourses(prev => [...prev, { ...newCourse, id: Date.now() }]);
        setNewCourse({ name: '', credits: 3, grade: 'A' });
    };

    const removeCourse = id => setSimulatedCourses(prev => prev.filter(c => c.id !== id));
    const clearAll     = ()  => setSimulatedCourses([]);

    const currentStatus   = getStatus(currentCgpa);
    const projectedStatus = simulatedCourses.length > 0 ? getStatus(simulatedCgpa) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#002060' }} />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="max-w-lg mx-auto mt-10 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
                {fetchError}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9">
                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                        PERANCANGAN PINTAR : SIMULATOR PNGK
                    </p>

                    {/* CGPA comparison row */}
                    <div className="mt-6 flex items-end gap-8 flex-wrap">

                        {/* Current */}
                        <div>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1">PNGK Semasa</p>
                            <p className="text-white font-black leading-none"
                               style={{ fontFamily: 'DM Serif Display, serif', fontSize: 64 }}>
                                {currentCgpa.toFixed(2)}
                            </p>
                            {currentStatus ? (
                                <span className={`mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded ${currentStatus.bg} ${currentStatus.text}`}>
                                    {currentStatus.label}
                                </span>
                            ) : (
                                <span className="mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded bg-white/10 text-white/40">
                                    Tiada rekod
                                </span>
                            )}
                        </div>

                        {/* Delta arrow */}
                        <div className="flex flex-col items-center gap-1.5 pb-1">
                            {delta !== null ? (
                                <div className="flex items-center gap-1.5">
                                    {delta > 0
                                        ? <TrendingUp size={16} className="text-emerald-400" />
                                        : delta < 0
                                            ? <TrendingDown size={16} className="text-red-400" />
                                            : <Minus size={16} className="text-white/30" />
                                    }
                                    <span className={`text-sm font-bold ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-white/30'}`}>
                                        {delta >= 0 ? '+' : ''}{delta.toFixed(2)}
                                    </span>1
                                </div>
                            ) : null}
                            <span className="text-white/20 text-xl leading-none"></span>
                        </div>

                        {/* Projected */}
                        <div>
                            <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mb-1">PNGK Simulasi</p>
                            <p className="font-black leading-none"
                               style={{
                                   fontFamily: 'DM Serif Display, serif',
                                   fontSize: 64,
                                   color: simulatedCourses.length > 0 ? '#C9A227' : 'rgba(255,255,255,0.15)',
                               }}>
                                {simulatedCourses.length > 0 ? simulatedCgpa.toFixed(2) : '—'}
                            </p>
                            {projectedStatus ? (
                                <span className={`mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded ${projectedStatus.bg} ${projectedStatus.text}`}>
                                    {projectedStatus.label}
                                </span>
                            ) : (
                                <span className="mt-2 inline-block text-[11px] font-bold px-2.5 py-1 rounded bg-white/5 text-white/20">
                                    Tambah kursus untuk melihat
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Stat strip */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex gap-6 flex-wrap">
                        <div>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Kredit Terkumpul</p>
                            <p className="text-white font-bold text-sm mt-0.5">{currentKredit} kredit</p>
                        </div>
                        {simulatedCourses.length > 0 && (
                            <>
                                <div className="w-px bg-white/10 self-stretch" />
                                <div>
                                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Kursus Simulasi</p>
                                    <p className="text-white font-bold text-sm mt-0.5">{simulatedCourses.length} kursus</p>
                                </div>
                                <div className="w-px bg-white/10 self-stretch" />
                                <div>
                                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Kredit Simulasi</p>
                                    <p className="text-white font-bold text-sm mt-0.5">{simulatedCreditsTotal} kredit</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BODY GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* LEFT: Add form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-7 py-5 border-b border-gray-50">
                            <p className={LABEL}>Tambah Subjek Simulasi</p>
                        </div>
                        <div className="px-7 py-6 space-y-5">

                            <div className="space-y-1.5">
                                <label className={LABEL}>Nama Subjek</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Kejuruteraan Perisian"
                                    className={`${INPUT}${inputError ? ' border-red-300' : ''}`}
                                    value={newCourse.name}
                                    onChange={e => { setNewCourse(p => ({ ...p, name: e.target.value })); setInputError(''); }}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCourse(); } }}
                                />
                                {inputError && (
                                    <p className="text-xs text-red-600 font-medium">{inputError}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className={LABEL}>Jam Kredit</label>
                                <select
                                    className={INPUT}
                                    value={newCourse.credits}
                                    onChange={e => setNewCourse(p => ({ ...p, credits: Number(e.target.value) }))}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} Kredit</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className={LABEL}>Gred Sasaran</label>
                                <select
                                    className={`${INPUT} font-bold`}
                                    value={newCourse.grade}
                                    onChange={e => setNewCourse(p => ({ ...p, grade: e.target.value }))}
                                >
                                    {Object.entries(GRED_MATA).map(([g, pts]) => (
                                        <option key={g} value={g}>Gred {g} — {pts.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={addCourse}
                                className="w-full py-3 text-white font-bold rounded-xl text-sm transition-all active:scale-[0.98] hover:brightness-110"
                                style={{ background: '#002060' }}
                            >
                                Tambah ke Senarai
                            </button>

                            {simulatedCourses.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="w-full py-2.5 text-red-500 font-bold rounded-xl text-sm border border-red-200 hover:bg-red-50 transition-colors"
                                >
                                    Kosongkan Semua
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Course list */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-7 py-5 border-b border-gray-50 flex justify-between items-center">
                            <p className={LABEL}>Senarai Subjek Simulasi</p>
                            {simulatedCourses.length > 0 && (
                                <span className="text-[11px] font-bold text-gray-400">
                                    {simulatedCourses.length} kursus · {simulatedCreditsTotal} kredit baharu
                                </span>
                            )}
                        </div>

                        {simulatedCourses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <Calculator size={38} strokeWidth={1.5} className="text-gray-200" />
                                <p className="text-sm font-medium text-gray-400">Tiada subjek ditambah lagi.</p>
                                <p className="text-xs text-gray-300">Tambah subjek di sebelah kiri untuk mula meramal PNGK.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-7 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</th>
                                        <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subjek</th>
                                        <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kredit</th>
                                        <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gred</th>
                                        <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mata</th>
                                        <th className="px-7 py-3.5" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {simulatedCourses.map((c, i) => (
                                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-7 py-4 text-[11px] font-bold text-gray-300">{i + 1}</td>
                                            <td className="px-4 py-4 font-semibold text-gray-800 text-sm max-w-[200px] truncate">{c.name}</td>
                                            <td className="px-4 py-4 text-center text-sm text-gray-500 font-medium">{c.credits}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`text-sm font-black ${gradeColor(c.grade)}`}>{c.grade}</span>
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-bold text-gray-600 font-mono">
                                                {GRED_MATA[c.grade].toFixed(2)}
                                            </td>
                                            <td className="px-7 py-4 text-right">
                                                <button
                                                    onClick={() => removeCourse(c.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                    aria-label="Padam"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
