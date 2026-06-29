import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X, Mail, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
    const [loginError, setLoginError] = useState('');
    const [showPass,   setShowPass]   = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetSuccess = searchParams.get('reset') === 'success';

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
            setLoginError(error.response?.data?.message || 'Pelayan tidak dapat dihubungi. Pastikan server berjalan.');
        }
    };

    // SVG arc constants — 96 / 122 credits = 78.7%
    const R            = 80;
    const circumference = +(2 * Math.PI * R).toFixed(2);
    const targetOffset  = +(circumference * (1 - 96 / 122)).toFixed(2);

    return (
        <>
            <style>{`
                @keyframes drawArc {
                    from { stroke-dashoffset: ${circumference}; }
                    to   { stroke-dashoffset: ${targetOffset}; }
                }
                @keyframes loginFadeUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .lp-arc     { animation: drawArc 1.8s cubic-bezier(0.16,1,0.3,1) forwards; }
                .lp-fade-1  { animation: loginFadeUp 0.65s ease forwards 0.1s; opacity: 0; }
                .lp-fade-2  { animation: loginFadeUp 0.65s ease forwards 0.35s; opacity: 0; }
                .lp-fade-3  { animation: loginFadeUp 0.65s ease forwards 0.6s; opacity: 0; }
                .lp-fade-4  { animation: loginFadeUp 0.65s ease forwards 0.8s; opacity: 0; }
                @media (prefers-reduced-motion: reduce) {
                    .lp-arc, .lp-fade-1, .lp-fade-2, .lp-fade-3, .lp-fade-4 {
                        animation: none; opacity: 1;
                        stroke-dashoffset: ${targetOffset};
                    }
                }
            `}</style>

            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

            <div className="flex min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

                {/* ── LEFT PANEL ── */}
                <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
                    style={{ background: '#002060' }}>

                    {/* Decorative background rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                        {[280, 380, 480, 580].map((sz, i) => (
                            <div key={i} className="absolute rounded-full"
                                style={{ width: sz, height: sz, border: '1px solid rgba(255,255,255,0.04)' }} />
                        ))}
                    </div>

                    {/* Top wordmark */}
                    <div className="lp-fade-1 relative z-10">
                        <span style={{ color: '#C9A227', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em' }}>
                            ACTAS · FTSM · UKM
                        </span>
                    </div>

                    {/* Centre — credit arc */}
                    <div className="lp-fade-2 relative z-10 flex flex-col items-center gap-6">
                        <svg viewBox="0 0 200 200" width="248" height="248" aria-label="96 daripada 122 kredit selesai">
                            {/* Track */}
                            <circle cx="100" cy="100" r={R} fill="none"
                                stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
                            {/* Gold progress arc */}
                            <circle cx="100" cy="100" r={R} fill="none"
                                stroke="#C9A227" strokeWidth="9" strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference}
                                transform="rotate(-90 100 100)"
                                className="lp-arc" />
                            {/* Big number */}
                            <text x="100" y="94" textAnchor="middle" fill="white"
                                fontSize="48" fontFamily="'DM Serif Display', serif" fontWeight="400">
                                96
                            </text>
                            {/* Gold label */}
                            <text x="100" y="116" textAnchor="middle" fill="#C9A227"
                                fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" letterSpacing="3">
                                KREDIT
                            </text>
                            {/* Muted target */}
                            <text x="100" y="135" textAnchor="middle" fill="rgba(255,255,255,0.3)"
                                fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="400" letterSpacing="1">
                                / 122 SASARAN
                            </text>
                        </svg>
                    </div>

                    {/* Bottom — tagline */}
                    <div className="lp-fade-3 relative z-10 space-y-3">
                        <p style={{ fontFamily: "'DM Serif Display', serif", color: 'white', fontSize: 22, lineHeight: 1.4 }}>
                            Pantau perjalanan<br />akademik anda.
                        </p>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            TEPAT &nbsp;·&nbsp; MASA NYATA &nbsp;·&nbsp; TERPERINCI
                        </p>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="flex w-full lg:w-[58%] items-center justify-center p-8 bg-[#F5F7FF]">
                    <div className="w-full max-w-[420px] space-y-8">

                        {/* Branding */}
                        <div className="lp-fade-1">
                            <div className="flex items-center gap-4 mb-7">
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/UKM_logo.svg/1200px-UKM_logo.svg.png"
                                    alt="UKM" className="h-10 object-contain"
                                />
                                <div className="w-px h-8 bg-gray-200" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-snug">
                                    Fakulti<br />Teknologi &amp;<br />Sains Maklumat
                                </p>
                            </div>
                            <h1 className="text-3xl font-extrabold text-[#002060] tracking-tight">Log Masuk</h1>
                            <p className="text-gray-500 text-sm mt-1.5 font-medium">
                                Masukkan maklumat akaun anda untuk meneruskan.
                            </p>
                        </div>

                        {/* Alerts */}
                        {resetSuccess && (
                            <div className="lp-fade-2 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                                <CheckCircle2 size={16} className="flex-shrink-0" />
                                Kata laluan berjaya ditetapkan semula. Sila log masuk.
                            </div>
                        )}
                        {loginError && (
                            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                {loginError}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="lp-fade-3 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    No. Matrik / UKMPer
                                </label>
                                <input
                                    type="text" required
                                    placeholder="Cth: A21CS001"
                                    value={noMatrik}
                                    onChange={(e) => { setNoMatrik(e.target.value); setLoginError(''); }}
                                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#002060] transition-all"
                                    style={{ '--tw-ring-color': 'rgba(0,32,96,0.2)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    Kata Laluan
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        placeholder="Masukkan kata laluan"
                                        value={katalaluan}
                                        onChange={(e) => { setKatalaluan(e.target.value); setLoginError(''); }}
                                        className="w-full px-4 pr-11 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-[#002060] transition-all"
                                    />
                                    <button type="button" tabIndex={-1}
                                        onClick={() => setShowPass(p => !p)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label={showPass ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit"
                                className="w-full py-3.5 text-sm font-bold text-white rounded-xl transition-all shadow-md active:scale-[0.98] focus:outline-none focus:ring-4 hover:opacity-90"
                                style={{ background: '#002060', '--tw-ring-color': 'rgba(0,32,96,0.2)' }}>
                                Log Masuk
                            </button>
                        </form>

                        <div className="lp-fade-4 text-center">
                            <button type="button" onClick={() => setShowForgot(true)}
                                className="text-sm font-semibold transition-colors"
                                style={{ color: '#003082' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#C9A227'}
                                onMouseLeave={e => e.currentTarget.style.color = '#003082'}>
                                Lupa Kata Laluan?
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
