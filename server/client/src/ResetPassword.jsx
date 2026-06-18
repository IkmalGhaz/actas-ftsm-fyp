import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew]             = useState(false);
    const [showConfirm, setShowConfirm]     = useState(false);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState('');
    const [success, setSuccess]             = useState(false);

    const handleSubmit = async (e) => {
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
            const response = await axios.post('http://localhost:5000/api/reset-password', {
                token,
                newPassword,
            });
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

    if (!token) {
        return (
            <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-red-50 rounded-full">
                            <XCircle size={40} className="text-red-500" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Pautan Tidak Sah</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Pautan tetapan semula kata laluan ini tidak sah atau telah tamat tempoh.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 text-sm font-bold text-white bg-[#003082] rounded-xl hover:bg-blue-800 transition-colors"
                    >
                        Kembali Log Masuk
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <KeyRound size={20} className="text-[#003082]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Tetapan Semula Kata Laluan</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Masukkan kata laluan baharu anda</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {success ? (
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <div className="p-4 bg-emerald-50 rounded-full">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-base">Kata Laluan Berjaya Ditetapkan!</p>
                                <p className="text-sm text-gray-500 mt-2">
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
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Kata Laluan Baru
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Sekurang-kurangnya 6 aksara"
                                        className="w-full px-4 pr-11 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Sahkan Kata Laluan
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Ulang kata laluan baharu"
                                        className="w-full px-4 pr-11 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
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
                                className="w-full py-3.5 text-sm font-bold text-white bg-[#003082] rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                                    className="font-semibold text-blue-500 hover:text-blue-600 transition-colors"
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

export default ResetPassword;
