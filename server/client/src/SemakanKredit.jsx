import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Bookmark, GraduationCap, Award } from 'lucide-react';

function SemakanKredit() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [kreditData, setKreditData] = useState({
        wajibFakulti: 0,
        wajibUniversiti: 0,
        citra: 0,
        elektif: 0
    });
    const [loading, setLoading] = useState(true);

    // Struktur Sasaran Kredit Mengikut Struktur Kurikulum FTSM (Jumlah: 120)
    const sasaranKredit = {
        wajibFakulti: 70,
        wajibUniversiti: 14,
        citra: 24,
        elektif: 12
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchKreditAudit = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                const subjekList = response.data.senarai_keputusan || [];

                let wf = 0, wu = 0, c = 0, e = 0;

                subjekList.forEach(subjek => {
                    const kat = subjek.kategori;
                    const kredit = parseInt(subjek.jam_kredit) || 0;

                    if (kat === 'Wajib Fakulti') wf += kredit;
                    else if (kat === 'Wajib Universiti') wu += kredit;
                    else if (kat === 'Citra') c += kredit;
                    else if (kat === 'Elektif') e += kredit;
                });

                setKreditData({ wajibFakulti: wf, wajibUniversiti: wu, citra: c, elektif: e });
            } catch (error) {
                console.error("Gagal melakukan audit kredit:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKreditAudit();
    }, [user, navigate]);

    if (!user) return null;

    const totalKreditDiambil = kreditData.wajibFakulti + kreditData.wajibUniversiti + kreditData.citra + kreditData.elektif;
    const totalSasaran = sasaranKredit.wajibFakulti + sasaranKredit.wajibUniversiti + sasaranKredit.citra + sasaranKredit.elektif;

    const renderCardKredit = (title, current, target, Icon, colorClass) => {
        const peratusan = Math.min(Math.round((current / target) * 100), 100);
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-black text-gray-900 mt-1">{current} <span className="text-sm font-semibold text-gray-400">/ {target} Kredit</span></h3>
                    </div>
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500`} style={{ width: `${peratusan}%`, backgroundColor: peratusan === 100 ? '#10b981' : '#3b82f6' }}></div>
                    </div>
                    <p className="text-right text-xs font-bold text-gray-500">{peratusan}% Selesai</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-blue-600" size={32} />
                    Semakan & Audit Kredit Graduasi
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Semak status pematuhan baki keperluan jam kredit graduasi anda.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : (
                <>
                    {/* Ringkasan Besar */}
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-1">Status Kredit Keseluruhan</p>
                            <h2 className="text-5xl font-black tracking-tight">{totalKreditDiambil} <span className="text-xl font-medium text-slate-400">/ {totalSasaran} Kredit Berjaya</span></h2>
                        </div>
                        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
                            <p className="text-xs font-bold uppercase text-blue-400">Baki Diperlukan</p>
                            <p className="text-2xl font-black mt-0.5">{Math.max(totalSasaran - totalKreditDiambil, 0)} Kredit</p>
                        </div>
                    </div>

                    {/* Grid Kad Pecahan Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderCardKredit("Wajib Fakulti", kreditData.wajibFakulti, sasaranKredit.wajibFakulti, Bookmark, "bg-blue-50 text-blue-600")}
                        {renderCardKredit("Wajib Universiti", kreditData.wajibUniversiti, sasaranKredit.wajibUniversiti, GraduationCap, "bg-purple-50 text-purple-600")}
                        {renderCardKredit("Kursus Citra", kreditData.citra, sasaranKredit.citra, Award, "bg-emerald-50 text-emerald-600")}
                        {renderCardKredit("Kursus Elektif", kreditData.elektif, sasaranKredit.elektif, ShieldCheck, "bg-orange-50 text-orange-600")}
                    </div>
                </>
            )}
        </div>
    );
}

export default SemakanKredit;