import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Search, AlertTriangle, CheckCircle } from 'lucide-react';

function PantauKursus() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [senaraiKursus, setSenaraiKursus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carian, setCarian] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') {
            navigate('/');
            return;
        }

        const fetchKursusData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kp/pantau-kursus');
                setSenaraiKursus(response.data);
            } catch (error) {
                console.error("Gagal menarik data pemantauan kursus:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKursusData();
    }, [user, navigate]);

    // Fungsi tapisan carian (Real-time search)
    const kursusDitapis = senaraiKursus.filter(kursus => 
        kursus.kod_kursus.toLowerCase().includes(carian.toLowerCase()) || 
        kursus.nama_kursus.toLowerCase().includes(carian.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="text-blue-600" size={32} />
                        Pemantauan Kursus
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Analisis kesihatan dan prestasi untuk setiap subjek berdaftar.</p>
                </div>
                
                {/* Kotak Carian */}
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Cari kod atau nama kursus..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        value={carian}
                        onChange={(e) => setCarian(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-5 font-semibold">Kod Kursus</th>
                                    <th className="p-5 font-semibold">Maklumat Subjek</th>
                                    <th className="p-5 font-semibold text-center">Jumlah Pelajar</th>
                                    <th className="p-5 font-semibold text-center">Purata Mata (GPA)</th>
                                    <th className="p-5 font-semibold text-center">Status Kesukaran</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                {kursusDitapis.map((kursus, index) => {
                                    const gpa = parseFloat(kursus.purata_mata);
                                    let statusColor, statusText, StatusIcon;
                                    
                                    // Logik amaran subjek 'Killer'
                                    if (kursus.jumlah_pelajar === 0) {
                                        statusColor = "text-gray-500 bg-gray-100";
                                        statusText = "Tiada Rekod";
                                        StatusIcon = CheckCircle;
                                    } else if (gpa >= 3.00) {
                                        statusColor = "text-emerald-700 bg-emerald-100";
                                        statusText = "Sangat Baik";
                                        StatusIcon = CheckCircle;
                                    } else if (gpa >= 2.00) {
                                        statusColor = "text-yellow-700 bg-yellow-100";
                                        statusText = "Sederhana";
                                        StatusIcon = AlertTriangle;
                                    } else {
                                        statusColor = "text-red-700 bg-red-100 font-bold";
                                        statusText = "Subjek Kritikal";
                                        StatusIcon = AlertTriangle;
                                    }

                                    return (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-5 font-extrabold text-gray-900 tracking-wide">
                                                {kursus.kod_kursus}
                                            </td>
                                            <td className="p-5">
                                                <p className="font-bold text-blue-600 mb-0.5">{kursus.nama_kursus}</p>
                                                <span className="text-xs font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-md">
                                                    {kursus.kategori} • {kursus.jam_kredit} Kredit
                                                </span>
                                            </td>
                                            <td className="p-5 text-center font-bold text-gray-700">
                                                {kursus.jumlah_pelajar}
                                            </td>
                                            <td className="p-5 text-center">
                                                <span className="text-lg font-black tracking-tight">
                                                    {kursus.purata_mata}
                                                </span>
                                            </td>
                                            <td className="p-5 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs ${statusColor}`}>
                                                    <StatusIcon size={14} />
                                                    <span>{statusText}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {kursusDitapis.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-400">
                                            <BookOpen size={48} className="mx-auto text-gray-200 mb-3" />
                                            <p className="font-medium">Tiada kursus yang sepadan dengan carian "{carian}".</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PantauKursus;