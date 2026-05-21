import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart as BarChartIcon, TrendingUp, AlertCircle } from 'lucide-react';

function AnalisisGred() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [dataGred, setDataGred] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Keselamatan: Hanya KP dibenarkan masuk
        if (!user || user.role !== 'kp') {
            navigate('/');
            return;
        }

        const fetchTaburanGred = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kp/taburan-gred');
                // Format semula data untuk difahami oleh Recharts
                const formattedData = response.data.map(item => ({
                    name: `Gred ${item.gred ? item.gred.trim().toUpperCase() : '?'}`,
                    jumlah: parseInt(item.jumlah) || 0,
                    gredAsal: item.gred ? item.gred.trim().toUpperCase() : ''
                }));
                setDataGred(formattedData);
            } catch (error) {
                console.error("Gagal menarik data analisis gred:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTaburanGred();
    }, [user, navigate]);

    // Fungsi menentukan warna palang berdasarkan gred
    const getBarColor = (gred) => {
        if (!gred) return '#3b82f6';
        if (gred.startsWith('A')) return '#10b981'; // Emerald/Hijau untuk Cemerlang
        if (gred.startsWith('B')) return '#3b82f6'; // Biru untuk Baik
        if (gred.startsWith('C')) return '#f59e0b'; // Kuning untuk Sederhana
        return '#ef4444'; // Merah untuk Lulus Bersyarat/Gagal
    };

    // Kira jumlah keseluruhan subjek yang diambil
    const totalKeputusan = dataGred.reduce((sum, item) => sum + item.jumlah, 0);

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <BarChartIcon className="text-blue-600" size={32} />
                    Analisis Taburan Gred
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Gambaran keseluruhan lengkung prestasi bagi pencapaian pelajar fakulti.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Bahagian Carta Palang (Main View) */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Kekerapan Mengikut Gred Keseluruhan</h3>
                        
                        {dataGred.length > 0 ? (
                            /* KUNCI PENYELESAIAN: Tetapkan min-height dan flex-grow supaya ia tidak kempis */
                            <div className="w-full flex-grow" style={{ minHeight: '350px', height: '350px' }}>
                                {/* Guna 99% width kadang-kadang membantu masalah resize container Recharts */}
                                <ResponsiveContainer width="99%" height="100%">
                                    <BarChart data={dataGred} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12, fontWeight: 600}} dy={10} />
                                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <Tooltip 
                                            cursor={{fill: '#f3f4f6'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="jumlah" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                            {dataGred.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getBarColor(entry.gredAsal)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[350px] flex items-center justify-center text-gray-400">
                                Tiada data keputusan direkodkan lagi.
                            </div>
                        )}
                        
                        {/* Petunjuk Warna (Legend) */}
                        <div className="flex flex-wrap justify-center gap-6 mt-auto pt-8">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-gray-600">Cemerlang (A, A-)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs font-bold text-gray-600">Kepujian (B+, B, B-)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs font-bold text-gray-600">Lulus (C+, C)</span></div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs font-bold text-gray-600">Kritikal (D, E)</span></div>
                        </div>
                    </div>

                    {/* Bahagian Kad Analitik Ringkas */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md">
                            <TrendingUp className="text-blue-200 mb-4" size={28} />
                            <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-1">Jumlah Pendaftaran Subjek</p>
                            <h2 className="text-5xl font-black">{totalKeputusan}</h2>
                            <p className="text-sm text-blue-200 mt-2 font-medium">keseluruhan rekod peperiksaan pelajar setakat ini.</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-orange-500" size={24} />
                                <h3 className="font-bold text-gray-800">Tindakan Susulan</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                Berdasarkan taburan lengkung graf di sebelah, Ketua Program disarankan untuk mengenal pasti kursus-kursus yang menyumbang kepada gred di bawah paras C untuk pemulihan akademik.
                            </p>
                            <button onClick={() => navigate('/kp/pantau-kursus')} className="w-full py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-bold transition-colors">
                                Lihat Pemantauan Kursus
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default AnalisisGred;