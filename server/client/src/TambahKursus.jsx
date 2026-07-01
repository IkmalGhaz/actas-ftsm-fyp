import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const GRED_MATA = {
    'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00,
    'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'D': 1.00, 'E': 0.00,
};

const LABEL = 'text-[11px] font-bold text-gray-400 uppercase tracking-widest';
const INPUT = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:border-[#002060] transition-all';

export default function TambahKursus() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [formData, setFormData] = useState({
        kod_kursus:       '',
        nama_kursus:      '',
        jam_kredit:       3,
        kategori:         'Wajib Fakulti',
        gred:             'A',
        semester_diambil: 1,
    });

    const [submitting,   setSubmitting]   = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [formError,    setFormError]    = useState('');

    useEffect(() => {
        if (!user) navigate('/');
    }, []);

    if (!user) return null;

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formError) setFormError('');
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!formData.kod_kursus.trim())  { setFormError('Kod kursus tidak boleh kosong.'); return; }
        if (!formData.nama_kursus.trim()) { setFormError('Nama kursus tidak boleh kosong.'); return; }

        setFormError('');
        setSubmitting(true);
        setSubmitStatus(null);

        try {
            await api.post('/api/tambah-kursus', {
                no_matrik:    user.no_matrik,
                mata_nilaian: GRED_MATA[formData.gred] ?? 0,
                ...formData,
                kod_kursus: formData.kod_kursus.trim().toUpperCase(),
            });
            setSubmitStatus('success');
            setTimeout(() => navigate('/dashboard'), 1800);
        } catch {
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">

            {/* ── BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex items-center justify-between gap-6">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            REKOD KURSUS BAHARU
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 26 }}>
                            Daftar Keputusan Kursus
                        </h1>
                        <p className="text-white/30 text-sm mt-1 font-medium">
                            {user.nama} · {user.program ?? 'FTSM UKM'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="flex-shrink-0 text-white/40 hover:text-white/80 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                        ← Kembali
                    </button>
                </div>
            </div>

            {/* ── FORM CARD ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="px-8 py-7 space-y-6">

                        {/* Inline alerts */}
                        {submitStatus === 'success' && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                                <CheckCircle2 size={16} className="flex-shrink-0" />
                                Keputusan berjaya direkodkan! Mengalih ke papan pemuka...
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                                <XCircle size={16} className="flex-shrink-0" />
                                Ralat pelayan semasa menyimpan. Sila cuba lagi.
                            </div>
                        )}
                        {formError && (
                            <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
                                <AlertCircle size={13} className="flex-shrink-0" />
                                {formError}
                            </div>
                        )}

                        {/* Kod & Nama */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className={LABEL}>Kod Kursus</label>
                                <input
                                    type="text"
                                    name="kod_kursus"
                                    placeholder="Cth: TTTK2033"
                                    className={`${INPUT} uppercase`}
                                    value={formData.kod_kursus}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className={LABEL}>Nama Kursus</label>
                                <input
                                    type="text"
                                    name="nama_kursus"
                                    placeholder="Cth: Rangkaian Komputer"
                                    className={INPUT}
                                    value={formData.nama_kursus}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Kategori */}
                        <div className="space-y-1.5">
                            <label className={LABEL}>Kategori Kursus</label>
                            <select
                                name="kategori"
                                className={INPUT}
                                value={formData.kategori}
                                onChange={handleChange}
                            >
                                <option value="Wajib Fakulti">Wajib Fakulti</option>
                                <option value="Citra Wajib">Citra Wajib</option>
                                <option value="Citra Universiti">Citra Universiti</option>
                                <option value="Wajib Program">Wajib Program</option>
                                <option value="Lengkap Program">Lengkap Program</option>
                            </select>
                        </div>

                        {/* Kredit, Semester, Gred — 3 col */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                                <label className={LABEL}>Jam Kredit</label>
                                <select
                                    name="jam_kredit"
                                    className={INPUT}
                                    value={formData.jam_kredit}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <option key={n} value={n}>{n} Kredit</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={LABEL}>Semester Diambil</label>
                                <select
                                    name="semester_diambil"
                                    className={INPUT}
                                    value={formData.semester_diambil}
                                    onChange={handleChange}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                        <option key={n} value={n}>Semester {n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className={LABEL}>Gred Diperoleh</label>
                                <select
                                    name="gred"
                                    className={`${INPUT} font-bold`}
                                    value={formData.gred}
                                    onChange={handleChange}
                                >
                                    {Object.entries(GRED_MATA).map(([g, pts]) => (
                                        <option key={g} value={g}>Gred {g} — {pts.toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Form footer */}
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={submitting || submitStatus === 'success'}
                            className="w-full py-3.5 font-bold text-sm rounded-xl text-white transition-all active:scale-[0.98] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: '#002060' }}
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                    Menyimpan...
                                </>
                            ) : submitStatus === 'success' ? (
                                <>
                                    <CheckCircle2 size={16} />
                                    Berjaya Disimpan
                                </>
                            ) : (
                                'Simpan Keputusan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
