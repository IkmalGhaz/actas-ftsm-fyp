import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from './api';
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const INPUT = 'w-full px-4 pr-11 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002060]/20 focus:border-[#002060] transition-all text-sm bg-gray-50';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate       = useNavigate();
    const token          = searchParams.get('token');

    const [newPassword,     setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew,         setShowNew]         = useState(false);
    const [showConfirm,     setShowConfirm]     = useState(false);
    const [loading,         setLoading]         = useState(false);
    const [error,           setError]           = useState('');
    const [success,         setSuccess]         = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Kata laluan tidak sepadan. Sila semak semula.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Kata laluan mesti sekurang-kurangnya 6 aksara.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/reset-password', { token, newPassword });
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/?reset=success'), 2500);
            } else {
                setError(response.data.message || 'Ralat tidak diketahui.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghubungi pelayan. Sila cuba lagi.');
        } finally {
            setLoading(false);
        }
    };

    /* ── Invalid / missing token ── */
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6" style={{ background: '#002060' }}>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            PORTAL ACTAS — FTSM UKM
                        </p>
                        <h2 className="text-base font-extrabold text-white mt-2">Pautan Tidak Sah</h2>
                    </div>
                    <div className="px-8 py-8 flex flex-col items-center text-center gap-4">
                        <XCircle size={40} className="text-red-400" />
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Pautan tetapan semula kata laluan ini tidak sah atau telah tamat tempoh.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
                            style={{ background: '#002060' }}
                        >
                            Kembali Log Masuk
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Main form ── */
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Navy header */}
                <div className="px-8 py-6" style={{ background: '#002060' }}>
                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                        PORTAL ACTAS — FTSM UKM
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <KeyRound size={17} className="text-white/50 flex-shrink-0" />
                        <h2 className="text-base font-extrabold text-white">Tetapan Semula Kata Laluan</h2>
                    </div>
                    <p className="text-white/30 text-xs mt-1">Masukkan kata laluan baharu untuk akaun anda</p>
                </div>

                <div className="px-8 py-7">
                    {success ? (
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                            <div>
                                <p className="font-bold text-gray-900">Kata Laluan Berjaya Ditetapkan!</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Anda akan dihalakan ke halaman log masuk sebentar lagi...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Kata Laluan Baru
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Sekurang-kurangnya 6 aksara"
                                        className={INPUT}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Sahkan Kata Laluan
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Ulang kata laluan baharu"
                                        className={INPUT}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{ background: '#002060' }}
                            >
                                {loading ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Tetapkan Kata Laluan'
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                <button
                                    type="button"
                                    onClick={() => navigate('/')}
                                    className="font-semibold hover:opacity-70 transition-opacity"
                                    style={{ color: '#002060' }}
                                >
                                    Kembali log masuk
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
