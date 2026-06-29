import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, AlertTriangle, Search, CheckCircle, X } from 'lucide-react';

function getInitials(nama) {
    return (nama ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function cgpaBadge(cgpa) {
    const v = parseFloat(cgpa);
    if (v >= 3.67) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    if (v >= 3.00) return { bg: 'bg-blue-100',    text: 'text-blue-700'    };
    if (v >= 2.00) return { bg: 'bg-amber-100',   text: 'text-amber-700'   };
    return           { bg: 'bg-red-100',     text: 'text-red-700'     };
}

function MaklumBalasKP() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [carian, setCarian]       = useState('');

    const [pelajarDipilih, setPelajarDipilih] = useState(null);
    const [mesej, setMesej]         = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'kp') { navigate('/'); return; }
        axios.get('http://localhost:5000/api/kp/analitik-pelajar')
            .then(res => setSenaraiPelajar(res.data.senarai_pelajar || []))
            .catch(() => setFetchError('Gagal memuat senarai pelajar. Sila muat semula halaman.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const pelajarDitapis = useMemo(() =>
        senaraiPelajar.filter(p =>
            p.no_matrik.toLowerCase().includes(carian.toLowerCase()) ||
            p.nama.toLowerCase().includes(carian.toLowerCase())
        ), [senaraiPelajar, carian]);

    const kritikalCount = senaraiPelajar.filter(p => parseFloat(p.cgpa) < 2.00).length;

    const handleHantar = async (e) => {
        e.preventDefault();
        if (!pelajarDipilih || !mesej.trim()) return;
        setSendError('');
        setSubmitting(true);
        try {
            await axios.post('http://localhost:5000/api/kp/maklum-balas', {
                no_matrik: pelajarDipilih.no_matrik,
                mesej,
            });
            setSendSuccess(true);
            setMesej('');
            setTimeout(() => {
                setSendSuccess(false);
                setPelajarDipilih(null);
            }, 3500);
        } catch (err) {
            if (err.response)      setSendError(`Gagal menghantar: Ralat pelayan (${err.response.status}).`);
            else if (err.request)  setSendError('Gagal menghantar: Tiada respon dari pelayan.');
            else                   setSendError(`Gagal menghantar: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const selectPelajar = (p) => {
        setPelajarDipilih(p);
        setSendError('');
        setSendSuccess(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── HERO BANNER ── */}
            <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                <div className="px-10 py-9 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div>
                        <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                            KOMUNIKASI KETUA PROGRAM
                        </p>
                        <h1 className="text-white font-extrabold tracking-tight mt-2" style={{ fontSize: 28 }}>
                            Maklum Balas & Amaran Akademik
                        </h1>
                        <p className="text-white/30 text-sm mt-1 font-medium">
                            Hantar notifikasi atau amaran terus ke papan pemuka pelajar.
                        </p>
                    </div>

                    <div className="hidden lg:block self-stretch w-px bg-white/10" />

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                JUMLAH PELAJAR
                            </p>
                            <p className="text-white font-black tracking-tight mt-1"
                                style={{ fontFamily: "'DM Serif Display', serif", fontSize: 64, lineHeight: 1 }}>
                                {senaraiPelajar.length}
                            </p>
                            <p className="text-white/25 text-xs mt-1 font-medium">berdaftar</p>
                        </div>

                        {kritikalCount > 0 && (
                            <div className="px-5 py-4 rounded-2xl text-center"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <p style={{ color: '#fca5a5', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' }}>
                                    MEMERLUKAN PERHATIAN
                                </p>
                                <p className="text-white text-3xl font-black mt-1">{kritikalCount}</p>
                                <p style={{ color: 'rgba(252,165,165,0.5)', fontSize: 10, marginTop: 2 }}>
                                    PNGK &lt; 2.00
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── FETCH ERROR ── */}
            {fetchError && (
                <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                    {fetchError}
                </div>
            )}

            {/* ── MAIN PANELS ── */}
            {!fetchError && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left panel — student contact list */}
                    <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col"
                        style={{ height: 580 }}>

                        {/* Search header */}
                        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Senarai Pelajar
                            </p>
                            <div className="relative">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau no. matrik..."
                                    className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#002060] transition-all text-sm text-gray-700"
                                    value={carian}
                                    onChange={(e) => setCarian(e.target.value)}
                                />
                                {carian && (
                                    <button
                                        onClick={() => setCarian('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                            {carian && (
                                <p className="text-xs text-gray-400 mt-2 font-medium">
                                    {pelajarDitapis.length} keputusan ditemui
                                </p>
                            )}
                        </div>

                        {/* Student rows */}
                        <div className="overflow-y-auto flex-1 px-3 py-3">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                                        style={{ borderColor: '#002060' }} />
                                </div>
                            ) : pelajarDitapis.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2">
                                    <Search size={26} className="text-gray-200" />
                                    <p className="text-xs font-medium text-gray-400">Tiada pelajar ditemui</p>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    {pelajarDitapis.map(pelajar => {
                                        const isCritical = parseFloat(pelajar.cgpa) < 2.00;
                                        const isSelected = pelajarDipilih?.no_matrik === pelajar.no_matrik;
                                        const badge = cgpaBadge(pelajar.cgpa);
                                        return (
                                            <div
                                                key={pelajar.no_matrik}
                                                onClick={() => selectPelajar(pelajar)}
                                                className="flex items-center gap-3 py-3 rounded-xl cursor-pointer transition-all"
                                                style={isSelected ? {
                                                    background: 'rgba(0,32,96,0.06)',
                                                    paddingLeft: 9,
                                                    borderLeft: '3px solid #002060',
                                                    paddingRight: 12,
                                                } : {
                                                    paddingLeft: 12,
                                                    paddingRight: 12,
                                                }}
                                            >
                                                {/* Initials avatar */}
                                                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black select-none"
                                                    style={isCritical ? {
                                                        background: 'rgba(239,68,68,0.1)',
                                                        color: '#dc2626',
                                                    } : isSelected ? {
                                                        background: '#002060',
                                                        color: '#fff',
                                                    } : {
                                                        background: '#f3f4f6',
                                                        color: '#374151',
                                                    }}>
                                                    {getInitials(pelajar.nama)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-[#002060]' : 'text-gray-800'}`}>
                                                        {pelajar.nama}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                                        {pelajar.no_matrik}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                                                        {pelajar.cgpa}
                                                    </span>
                                                    {isCritical && (
                                                        <AlertTriangle size={12} className="text-red-400" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right panel — compose */}
                    <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col"
                        style={{ height: 580 }}>

                        {sendSuccess ? (
                            /* Success state */
                            <div className="flex flex-col items-center justify-center h-full gap-5 px-10 text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle size={34} className="text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-800">Mesej Berjaya Dihantar</h2>
                                    <p className="text-gray-400 text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                                        Maklum balas telah dihantar kepada{' '}
                                        <span className="font-semibold text-gray-600">{pelajarDipilih?.nama}</span>{' '}
                                        dan akan dipaparkan dalam papan pemuka mereka.
                                    </p>
                                </div>
                            </div>

                        ) : pelajarDipilih ? (
                            /* Compose form */
                            <form onSubmit={handleHantar} className="flex flex-col h-full">

                                {/* Recipient strip */}
                                <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white select-none"
                                            style={{ background: '#002060' }}>
                                            {getInitials(pelajarDipilih.nama)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                Penerima
                                            </p>
                                            <p className="text-base font-extrabold text-gray-800 leading-tight truncate">
                                                {pelajarDipilih.nama}
                                            </p>
                                            <p className="text-xs font-mono text-gray-400 mt-0.5">
                                                {pelajarDipilih.no_matrik}
                                                &ensp;·&ensp;PNGK {pelajarDipilih.cgpa}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setPelajarDipilih(null); setMesej(''); setSendError(''); }}
                                        className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>

                                {/* Textarea */}
                                <div className="flex-1 flex flex-col px-7 py-5 gap-2.5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                        Kandungan Maklum Balas
                                    </label>
                                    <textarea
                                        className="flex-1 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-[#002060] resize-none text-sm text-gray-700 leading-relaxed transition-all"
                                        placeholder="Contoh: Sila hadir ke pejabat saya pada hari Selasa ini untuk membincangkan prestasi akademik anda..."
                                        value={mesej}
                                        maxLength={1000}
                                        onChange={(e) => setMesej(e.target.value)}
                                        required
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className={`text-xs font-medium ${mesej.length >= 950 ? 'text-amber-500' : 'text-gray-300'}`}>
                                            {mesej.length} / 1000
                                        </span>
                                        <span className="text-xs text-gray-300 font-medium">
                                            Mesej akan dipaparkan di papan pemuka pelajar
                                        </span>
                                    </div>
                                </div>

                                {/* Footer — error + send */}
                                <div className="px-7 pb-6 space-y-3">
                                    {sendError && (
                                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                                            {sendError}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={submitting || !mesej.trim()}
                                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ background: '#002060' }}
                                    >
                                        <Send size={15} />
                                        {submitting ? 'Menghantar...' : 'Hantar Maklum Balas'}
                                    </button>
                                </div>
                            </form>

                        ) : (
                            /* Empty compose state */
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-10">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'rgba(0,32,96,0.05)' }}>
                                    <MessageSquare size={28} style={{ color: '#002060', opacity: 0.35 }} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-700">
                                        Pilih Penerima
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                                        Pilih nama pelajar dari senarai di sebelah kiri untuk mula menyediakan maklum balas atau amaran akademik.
                                    </p>
                                </div>
                                {kritikalCount > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-red-400 font-medium mt-1 px-3 py-2 rounded-lg bg-red-50">
                                        <AlertTriangle size={12} />
                                        <span>{kritikalCount} pelajar memerlukan perhatian segera (PNGK &lt; 2.00)</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}

export default MaklumBalasKP;
