import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Star, Globe, BookOpen, Layers } from 'lucide-react';

// Sasaran kredit mengikut program — Buku Panduan FTSM 2023/2024
const SASARAN_BY_PROGRAM = {
    'Sains Komputer':                   { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 },
    'Teknologi Maklumat':               { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 },
    'Kejuruteraan Perisian Multimedia': { wf: 5, cw: 10, citra: 25, wp: 76, lp: 6  },
    'Kejuruteraan Perisian Maklumat':   { wf: 5, cw: 10, citra: 25, wp: 76, lp: 6  },
};
const DEFAULT_SASARAN = { wf: 5, cw: 10, citra: 25, wp: 64, lp: 18 };

function SemakanKredit() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [kreditData, setKreditData] = useState({ wf: 0, cw: 0, citra: 0, wp: 0, lp: 0 });
    const [loading, setLoading] = useState(true);

    const sasaran = SASARAN_BY_PROGRAM[user?.program] ?? DEFAULT_SASARAN;
    const totalSasaran = sasaran.wf + sasaran.cw + sasaran.citra + sasaran.wp + sasaran.lp;

    useEffect(() => {
        if (!user) { navigate('/'); return; }

        const fetchAudit = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                const subjekList = data.senarai_keputusan || [];

                let wf = 0, cw = 0, citra = 0, wp = 0, lp = 0;

                subjekList.forEach(({ kategori, jam_kredit }) => {
                    const k = parseInt(jam_kredit) || 0;
                    if (kategori === 'Wajib Fakulti')    wf    += k;
                    else if (kategori === 'Citra Wajib') cw    += k;
                    else if (kategori === 'Citra Universiti') citra += k;
                    else if (kategori === 'Wajib Program')    wp    += k;
                    else if (kategori === 'Lengkap Program')  lp    += k;
                });

                setKreditData({ wf, cw, citra, wp, lp });
            } catch (err) {
                console.error('Gagal audit kredit:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAudit();
    }, []);

    if (!user) return null;

    const totalDiambil = kreditData.wf + kreditData.cw + kreditData.citra + kreditData.wp + kreditData.lp;
    const baki = Math.max(totalSasaran - totalDiambil, 0);

    const KreditCard = ({ label, current, target, Icon, colorBg, colorIcon, colorBar }) => {
        const pct = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
        const done = pct === 100;
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">
                            {current}
                            <span className="text-sm font-semibold text-gray-400"> / {target} Kredit</span>
                        </h3>
                    </div>
                    <div className={`p-3 rounded-xl ${colorBg}`}>
                        <Icon size={22} className={colorIcon} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: done ? '#10b981' : colorBar }}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {done ? '✓ Lengkap' : `${target - current} kredit lagi`}
                        </span>
                        <span className="text-xs font-bold text-gray-500">{pct}%</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={32} />
                    Semakan &amp; Audit Kredit Graduasi
                </h1>
                <p className="text-gray-500 mt-1 font-medium">
                    Program: <span className="font-bold text-gray-700">{user.program ?? '—'}</span>
                    &ensp;·&ensp; Sasaran: <span className="font-bold text-gray-700">{totalSasaran} kredit</span>
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : (
                <>
                    {/* Banner ringkasan */}
                    <div className="bg-gradient-to-br from-[#003082] to-[#1a4fa8] p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-blue-200 mb-1">Status Kredit Keseluruhan</p>
                            <h2 className="text-5xl font-black tracking-tight">
                                {totalDiambil}
                                <span className="text-xl font-medium text-blue-200"> / {totalSasaran} Kredit Selesai</span>
                            </h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10 text-center">
                                <p className="text-xs font-bold uppercase text-blue-200">Baki Diperlukan</p>
                                <p className="text-2xl font-black mt-0.5">{baki} Kredit</p>
                            </div>
                            <div className="px-6 py-3 bg-white/10 backdrop-blur rounded-2xl border border-white/10 text-center">
                                <p className="text-xs font-bold uppercase text-blue-200">Selesai</p>
                                <p className="text-2xl font-black mt-0.5">
                                    {totalSasaran > 0 ? Math.round((totalDiambil / totalSasaran) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Grid kad kategori */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        <KreditCard
                            label="Wajib Fakulti"
                            current={kreditData.wf}  target={sasaran.wf}
                            Icon={ShieldCheck}
                            colorBg="bg-blue-50"    colorIcon="text-blue-600"  colorBar="#3b82f6"
                        />
                        <KreditCard
                            label="Citra Wajib"
                            current={kreditData.cw}  target={sasaran.cw}
                            Icon={Star}
                            colorBg="bg-amber-50"   colorIcon="text-amber-500" colorBar="#f59e0b"
                        />
                        <KreditCard
                            label="Citra Universiti"
                            current={kreditData.citra} target={sasaran.citra}
                            Icon={Globe}
                            colorBg="bg-purple-50"  colorIcon="text-purple-600" colorBar="#8b5cf6"
                        />
                        <KreditCard
                            label="Wajib Program"
                            current={kreditData.wp}  target={sasaran.wp}
                            Icon={BookOpen}
                            colorBg="bg-emerald-50" colorIcon="text-emerald-600" colorBar="#10b981"
                        />
                        <KreditCard
                            label="Lengkap Program"
                            current={kreditData.lp}  target={sasaran.lp}
                            Icon={Layers}
                            colorBg="bg-rose-50"    colorIcon="text-rose-500"  colorBar="#f43f5e"
                        />
                    </div>

                    {/* Nota kategori */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 space-y-1">
                        <p className="font-bold text-blue-900 mb-2">Panduan Kategori Kredit</p>
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
