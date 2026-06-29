import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

const RATING_LABEL = ['', 'Sangat Mengecewakan', 'Kurang Memuaskan', 'Sederhana Baik', 'Sangat Baik', 'Cemerlang!'];

function PenilaianSubjek() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [senaraiSubjek, setSenaraiSubjek] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [fetchError, setFetchError]       = useState('');

    const [subjekDipilih, setSubjekDipilih] = useState('');
    const [rating, setRating]               = useState(0);
    const [hoverRating, setHoverRating]     = useState(0);
    const [komen, setKomen]                 = useState('');
    const [submitting, setSubmitting]       = useState(false);
    const [formError, setFormError]         = useState('');
    const [berjaya, setBerjaya]             = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'pelajar') { navigate('/'); return; }

        axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`)
            .then(res => setSenaraiSubjek(res.data.senarai_keputusan || []))
            .catch(() => setFetchError('Gagal memuat senarai kursus. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const selectedCourse = senaraiSubjek.find(s => s.kod_kursus === subjekDipilih) ?? null;

    const handleHantar = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!subjekDipilih)          { setFormError('Sila pilih kursus yang ingin dinilai.');           return; }
        if (rating === 0)            { setFormError('Sila berikan rating bintang terlebih dahulu.');     return; }
        if (komen.trim().length < 20){ setFormError('Komen anda perlu sekurang-kurangnya 20 aksara.');  return; }

        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/pelajar/penilaian', {
                no_matrik: user.no_matrik,
                kod_kursus: subjekDipilih,
                rating,
                komen,
            });
            setBerjaya(true);
            setTimeout(() => {
                setBerjaya(false);
                setSubjekDipilih('');
                setRating(0);
                setKomen('');
            }, 3000);
        } catch {
            setFormError('Gagal menghantar penilaian. Sila cuba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const activeRating = hoverRating || rating;

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10">

            {/* ── HERO BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex items-center justify-between gap-6">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            PORTAL PENILAIAN KURSUS
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 26 }}>
                            Nilai Pengalaman Pembelajaran Anda
                        </h1>
                        <p className="text-white/35 text-sm mt-2 leading-relaxed max-w-md">
                            Maklum balas anda membantu pihak pengurusan meningkatkan kualiti akademik fakulti.
                        </p>
                    </div>
                    <Star size={64} className="flex-shrink-0 hidden sm:block"
                        style={{ color: '#C9A227', opacity: 0.25 }} fill="currentColor" />
                </div>
            </div>

            {/* ── CONTENT ── */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002060]" />
                </div>
            ) : fetchError ? (
                <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {fetchError}
                </div>
            ) : senaraiSubjek.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <BookOpen size={40} className="text-gray-200" />
                    <p className="text-gray-400 text-sm text-center">
                        Anda belum mendaftar apa-apa kursus.<br />
                        Daftar kursus terlebih dahulu untuk membuat penilaian.
                    </p>
                    <button
                        onClick={() => navigate('/tambah-kursus')}
                        className="px-5 py-2.5 bg-[#002060] text-white text-sm font-bold rounded-xl hover:bg-[#003082] transition-colors"
                    >
                        + Daftar Kursus
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">

                    {/* Success overlay */}
                    {berjaya && (
                        <div className="absolute inset-0 bg-white/96 z-10 flex flex-col items-center justify-center gap-4">
                            <CheckCircle size={72} className="text-emerald-500" />
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-gray-800">Terima Kasih!</h2>
                                <p className="text-gray-500 text-sm mt-1.5 max-w-xs mx-auto">
                                    Maklum balas anda telah dihantar kepada Ketua Program FTSM.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleHantar} className="p-8 space-y-8">

                        {/* Step 1 — Course select */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <BookOpen size={14} className="text-[#002060]" />
                                Langkah 1 — Pilih Kursus
                            </label>
                            <select
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002060]/20 focus:border-[#002060] transition-all text-sm text-gray-700 font-medium cursor-pointer"
                                value={subjekDipilih}
                                onChange={(e) => { setSubjekDipilih(e.target.value); setFormError(''); }}
                            >
                                <option value="" disabled>-- Sila pilih kursus yang ingin dinilai --</option>
                                {senaraiSubjek.map((s, i) => (
                                    <option key={i} value={s.kod_kursus}>
                                        {s.kod_kursus} — {s.nama_kursus} (Sem {s.semester_diambil})
                                    </option>
                                ))}
                            </select>

                            {/* Selected course info card */}
                            {selectedCourse && (
                                <div className="mt-2 p-4 rounded-xl flex items-start gap-3"
                                    style={{ background: 'rgba(0,32,96,0.04)', border: '1px solid rgba(0,32,96,0.1)' }}>
                                    <div className="p-2 rounded-lg flex-shrink-0"
                                        style={{ background: 'rgba(0,32,96,0.08)' }}>
                                        <BookOpen size={14} className="text-[#002060]" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono font-bold text-[#002060]">{selectedCourse.kod_kursus}</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedCourse.nama_kursus}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Semester {selectedCourse.semester_diambil}
                                            &ensp;·&ensp; {selectedCourse.jam_kredit} kredit
                                            &ensp;·&ensp; Gred:&nbsp;
                                            <span className="font-bold text-gray-600">{selectedCourse.gred ?? '—'}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 2 — Star rating */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <Star size={14} className="text-[#002060]" />
                                Langkah 2 — Berikan Rating
                            </label>
                            <div className="flex gap-2 justify-center py-7 bg-gray-50 rounded-2xl border border-gray-100">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none active:scale-95"
                                        onClick={() => { setRating(star); setFormError(''); }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        aria-label={`${star} bintang`}
                                    >
                                        <Star
                                            size={46}
                                            className={`transition-colors duration-150 ${
                                                star <= activeRating ? 'text-[#C9A227]' : 'text-gray-200'
                                            }`}
                                            fill={star <= activeRating ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 h-4">
                                {activeRating > 0 ? RATING_LABEL[activeRating] : 'Sila pilih rating anda'}
                            </p>
                        </div>

                        {/* Step 3 — Comment */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                <MessageSquare size={14} className="text-[#002060]" />
                                Langkah 3 — Ulasan / Komen
                            </label>
                            <textarea
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002060]/20 focus:border-[#002060] transition-all resize-none min-h-[140px] text-sm text-gray-700"
                                placeholder="Apakah pendapat anda tentang silibus kursus ini? Adakah ia sukar difahami atau sangat membantu?"
                                value={komen}
                                maxLength={500}
                                onChange={(e) => { setKomen(e.target.value); setFormError(''); }}
                            />
                            <div className="flex justify-between items-center">
                                {komen.length > 0 && komen.length < 20 ? (
                                    <p className="text-xs text-red-400 font-medium">Minimum 20 aksara diperlukan</p>
                                ) : (
                                    <span />
                                )}
                                <p className={`text-xs font-medium ml-auto ${komen.length >= 480 ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {komen.length} / 500
                                </p>
                            </div>
                        </div>

                        {/* Inline form error */}
                        {formError && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                                {formError}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !subjekDipilih || rating === 0}
                            className="w-full flex items-center justify-center gap-2.5 text-white py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: '#002060' }}
                        >
                            <Send size={16} />
                            {submitting ? 'Menghantar...' : 'Hantar Penilaian Kursus'}
                        </button>

                    </form>
                </div>
            )}
        </div>
    );
}

export default PenilaianSubjek;
