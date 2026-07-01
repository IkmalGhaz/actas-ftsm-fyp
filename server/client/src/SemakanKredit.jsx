import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { ShieldCheck, Star, Globe, BookOpen, Layers } from 'lucide-react';

// Sasaran kredit mengikut program — Buku Panduan FTSM 2023/2024
const SASARAN_BY_PROGRAM = {
    'Sains Komputer':                   { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 },
    'Teknologi Maklumat':               { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 },
    'Kejuruteraan Perisian Multimedia': { wf: 5, cw: 10, citra: 25, wp: 76, lp: 6  },
    'Kejuruteraan Perisian Maklumat':   { wf: 5, cw: 10, citra: 25, wp: 76, lp: 6  },
};
const DEFAULT_SASARAN = { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 };

function KreditCard({ label, current, target, Icon, colorBg, colorIcon, colorBar }) {
    const surplus = current > target ? current - target : 0;
    const pct     = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    const done    = current >= target;
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
                    <h3 className="text-2xl font-black text-gray-900 mt-1 leading-none">
                        {current}
                        <span className="text-xs font-semibold text-gray-400"> / {target}</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">kredit</p>
                </div>
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${colorBg}`}>
                    <Icon size={18} className={colorIcon} />
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full rounded-full sk-bar-anim"
                        style={{ '--pct': `${pct}%`, backgroundColor: done ? '#10b981' : colorBar }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold ${
                        surplus > 0 ? 'text-amber-600' :
                        done ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                        {surplus > 0 ? `+${surplus} lebihan` : done ? '✓ Lengkap' : `${target - current} lagi`}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">{pct}%</span>
                </div>
            </div>
        </div>
    );
}

function SemakanKredit() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [kreditData, setKreditData] = useState({ wf: 0, cw: 0, citra: 0, wp: 0, lp: 0 });
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');

    const sasaran      = SASARAN_BY_PROGRAM[user?.program] ?? DEFAULT_SASARAN;
    const totalSasaran = sasaran.wf + sasaran.cw + sasaran.citra + sasaran.wp + sasaran.lp;

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        api.get(`/api/akademik/${user.no_matrik}`)
            .then(({ data }) => {
                const subjekList = data.senarai_keputusan || [];
                let wf = 0, cw = 0, citra = 0, wp = 0, lp = 0;
                subjekList.forEach(({ kategori, jam_kredit }) => {
                    const k = parseInt(jam_kredit) || 0;
                    if (kategori === 'Wajib Fakulti')         wf    += k;
                    else if (kategori === 'Citra Wajib')      cw    += k;
                    else if (kategori === 'Citra Universiti') citra += k;
                    else if (kategori === 'Wajib Program')    wp    += k;
                    else if (kategori === 'Lengkap Program')  lp    += k;
                });
                setKreditData({ wf, cw, citra, wp, lp });
            })
            .catch(() => setError('Gagal memuat data kredit. Sila cuba semula.'))
            .finally(() => setLoading(false));
    }, []);

    if (!user) return null;

    const totalDiambil = kreditData.wf + kreditData.cw + kreditData.citra + kreditData.wp + kreditData.lp;
    const baki         = Math.max(totalSasaran - totalDiambil, 0);
    const totalPct     = totalSasaran > 0 ? Math.round((totalDiambil / totalSasaran) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
            <style>{`
                @keyframes skBarGrow { from { width: 0; } to { width: var(--pct); } }
                .sk-bar-anim { width: var(--pct); animation: skBarGrow 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
                @media (prefers-reduced-motion: reduce) { .sk-bar-anim { animation: none; } }
            `}</style>

            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                    <ShieldCheck className="text-[#002060]" size={26} />
                    Semakan &amp; Audit Kredit Graduasi
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                    Program: <span className="font-bold text-gray-700">{user.program ?? '—'}</span>
                    &ensp;·&ensp; Sasaran: <span className="font-bold text-gray-700">{totalSasaran} kredit</span>
                </p>
            </div>

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
                    {/* Banner ringkasan */}
                    <div className="rounded-3xl overflow-hidden" style={{ background: '#002060' }}>
                        <div className="px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.22em' }}>
                                    STATUS KREDIT KESELURUHAN
                                </p>
                                <h2 className="text-white font-black tracking-tight mt-1" style={{ fontSize: 48, lineHeight: 1 }}>
                                    {totalDiambil}
                                    <span className="text-lg font-medium text-white/40 ml-2">/ {totalSasaran} kredit</span>
                                </h2>
                                <p className="text-white/30 text-xs mt-2 font-medium">
                                    {user.program ?? 'FTSM UKM'}&ensp;·&ensp;
                                    <span className="font-mono">{user.no_matrik}</span>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="px-6 py-3 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>BAKI</p>
                                    <p className="text-white text-2xl font-black mt-0.5">{baki} kredit</p>
                                </div>
                                <div className="px-6 py-3 rounded-2xl text-center"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#C9A227', fontSize: 10, fontWeight: 700, letterSpacing: '0.18em' }}>SELESAI</p>
                                    <p className="text-white text-2xl font-black mt-0.5">{totalPct}%</p>
                                </div>
                                <button
                                    onClick={() => navigate('/tambah-kursus')}
                                    className="px-5 py-3 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90 active:scale-95"
                                    style={{ background: '#C9A227', color: '#002060' }}
                                >
                                    + Daftar Kursus
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid kad kategori — 5 equal cols on xl */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                        <KreditCard label="Wajib Fakulti"    current={kreditData.wf}    target={sasaran.wf}    Icon={ShieldCheck} colorBg="bg-blue-50"    colorIcon="text-blue-600"    colorBar="#3b82f6" />
                        <KreditCard label="Citra Wajib"      current={kreditData.cw}    target={sasaran.cw}    Icon={Star}        colorBg="bg-amber-50"   colorIcon="text-amber-500"   colorBar="#f59e0b" />
                        <KreditCard label="Citra Universiti" current={kreditData.citra} target={sasaran.citra} Icon={Globe}       colorBg="bg-purple-50"  colorIcon="text-purple-600"  colorBar="#8b5cf6" />
                        <KreditCard label="Wajib Program"    current={kreditData.wp}    target={sasaran.wp}    Icon={BookOpen}    colorBg="bg-emerald-50" colorIcon="text-emerald-600" colorBar="#10b981" />
                        <KreditCard label="Lengkap Program"  current={kreditData.lp}    target={sasaran.lp}    Icon={Layers}      colorBg="bg-rose-50"    colorIcon="text-rose-500"    colorBar="#f43f5e" />
                    </div>

                    {/* Nota kategori */}
                    <div className="rounded-2xl p-5 text-sm text-gray-700 space-y-1.5"
                        style={{ background: 'rgba(0,32,96,0.03)', border: '1px solid rgba(0,32,96,0.08)' }}>
                        <p className="font-bold mb-2 text-[10px] uppercase tracking-widest"
                            style={{ color: 'rgba(0,32,96,0.4)' }}>
                            Panduan Kategori Kredit
                        </p>
                        <p><span className="font-semibold">Wajib Fakulti (WF):</span> Kokurikulum LMCE — 5 kredit</p>
                        <p><span className="font-semibold">Citra Wajib (CW):</span> Kursus LMCW mandatori — 10 kredit</p>
                        <p><span className="font-semibold">Citra Universiti:</span> Kursus C1–C6 termasuk elektif tambahan — 25 kredit</p>
                        <p><span className="font-semibold">Wajib Program (WP):</span> Teras program anda — {sasaran.wp} kredit</p>
                        <p><span className="font-semibold">Lengkap Program (LP):</span> Kursus trek pilihan — {sasaran.lp} kredit</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default SemakanKredit;
