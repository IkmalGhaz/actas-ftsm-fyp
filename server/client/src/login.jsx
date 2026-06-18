import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Mail, KeyRound, CheckCircle2 } from 'lucide-react';

function ForgotPasswordModal({ onClose }) {
    const [id, setId]         = useState('');
    const [email, setEmail]   = useState('');
    const [sent, setSent]     = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/forgot-password', {
                no_matrik: id,
                email,
            });
            if (response.data.success) {
                setSent(true);
            } else {
                setError(response.data.message || 'Ralat tidak diketahui.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghubungi pelayan. Sila cuba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <KeyRound size={20} className="text-[#003082]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Tetapkan Semula Kata Laluan</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Masukkan maklumat akaun anda</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Tutup"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-8 py-6">
                    {sent ? (
                        // Success state
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <div className="p-4 bg-emerald-50 rounded-full">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-base">E-mel Dihantar!</p>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                    E-mel tetapan semula kata laluan telah dihantar ke{' '}
                                    <span className="font-semibold text-gray-800">{email}</span>.
                                    Sila semak inbox anda.
                                </p>
                                <p className="text-xs text-gray-400 mt-3">
                                    Tidak terima e-mel? Semak folder spam atau hubungi pentadbir sistem.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-2 w-full py-3 text-sm font-bold text-white bg-[#003082] rounded-xl hover:bg-blue-800 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    ) : (
                        // Form
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    No. Matrik
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="Cth: A21CS001"
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    E-mel Berdaftar
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Cth: ahmad@siswa.ukm.edu.my"
                                        className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                    />
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
                                        Menghantar...
                                    </>
                                ) : (
                                    'Hantar Pautan Reset'
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Ingat kata laluan?{' '}
                                <button
                                    type="button"
                                    onClick={onClose}
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

function Login() {
    const [noMatrik, setNoMatrik]     = useState('');
    const [katalaluan, setKatalaluan] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                no_matrik: noMatrik,
                katalaluan: katalaluan
            });

            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.user.role === 'kp') {
                    navigate('/kp/dashboard');
                } else if (response.data.user.role === 'pegawai') {
                    navigate('/pegawai/jana-laporan');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
                if (noMatrik.toUpperCase().startsWith('KP')) {
                    localStorage.setItem('user', JSON.stringify({ nama: 'Dr. Rodziah', no_matrik: noMatrik, role: 'kp' }));
                    navigate('/kp/dashboard');
                } else if (noMatrik.toUpperCase().startsWith('P')) {
                    localStorage.setItem('user', JSON.stringify({ nama: 'En. Afiq', no_matrik: noMatrik, role: 'pegawai' }));
                    navigate('/pegawai/jana-laporan');
                } else {
                    localStorage.setItem('user', JSON.stringify({ nama: 'Ahmad Aliff', no_matrik: noMatrik || 'A123456', role: 'pelajar' }));
                    navigate('/dashboard');
                }
            } else {
                alert(error.response?.data?.message || 'Pelayan bermasalah');
            }
        }
    };

    return (
        <>
            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

            <div className="flex min-h-screen bg-[#F0F7FF]">
                {/* Left side — campus photos */}
                <div className="hidden lg:flex lg:w-1/2 bg-gray-100 overflow-hidden relative border-r border-gray-200">
                    <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-1 p-2 bg-gray-200">
                        <img className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Campus 1" />
                        <img className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Campus 2" />
                        <img className="object-cover w-full h-full col-span-2 row-span-2 hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Campus 3" />
                    </div>
                </div>

                {/* Right side — login form */}
                <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                    <div className="w-full max-w-[480px] p-10 space-y-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                        {/* Branding */}
                        <div className="text-center flex flex-col items-center">
                            <div className="flex space-x-6 mb-6 items-center justify-center">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/UKM_logo.svg/1200px-UKM_logo.svg.png"
                                    alt="UKM Logo"
                                    className="h-16 object-contain"
                                />
                                <div className="h-16 w-px bg-gray-200" />
                                <div className="text-left">
                                    <p className="font-extrabold text-gray-800 text-xs tracking-wider uppercase leading-tight">
                                        Fakulti<br />Teknologi Dan<br />Sains Maklumat
                                    </p>
                                </div>
                            </div>
                            <img src="/logo.svg" alt="ACTAS-FTSM" className="h-12 mt-2" />
                            <p className="mt-3 text-xl font-bold text-gray-700">Sistem Analisis Kredit Akademik</p>
                        </div>

                        {/* Form */}
                        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Nombor Matrik / UKMPer / Pengenalan
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                    placeholder="Cth: K012345 (KP/Pegawai) atau A012345 (Pelajar)"
                                    value={noMatrik}
                                    onChange={(e) => setNoMatrik(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    Kata Laluan
                                </label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                    placeholder="Masukkan Kata Laluan"
                                    value={katalaluan}
                                    onChange={(e) => setKatalaluan(e.target.value)}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full px-4 py-3.5 text-white font-bold bg-[#003082] rounded-xl hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-md active:scale-[0.98]"
                                >
                                    Log Masuk
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                                >
                                    Lupa Kata Laluan?
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
