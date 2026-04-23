import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [dataAkademik, setDataAkademik] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchAkademikData = async () => {
            try {
                // Tarik data dari port 5000 (Backend)
                const response = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                setDataAkademik(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal menarik data:", error);
                setLoading(false);
            }
        };

        fetchAkademikData();
    }, [user, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-6xl mx-auto">
                
                {/* Header Profil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Papan Pemuka Prestasi</h1>
                        <p className="text-gray-500">Selamat datang, <span className="text-blue-600 font-semibold">{user.nama}</span></p>
                    </div>
                    
                    {/* INI BAHAGIAN BUTANG YANG BARU (DAFTAR KURSUS & LOG KELUAR) */}
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => navigate('/tambah-kursus')} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                        >
                            + Daftar Kursus
                        </button>
                        <button
                            onClick={() => navigate('/simulator')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-sm"
                        >
                            Simulator PNGK
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-all"
                        >
                            Log Keluar
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Menarik data akademik anda...</div>
                ) : (
                    <div className="space-y-8">
                        {/* Ringkasan Kredit & PNGK */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                                <p className="text-sm text-gray-400 uppercase font-bold tracking-wider">Kredit Terkumpul</p>
                                <p className="text-4xl font-black">{dataAkademik?.jumlah_kredit} <span className="text-lg font-normal text-gray-400">Jam</span></p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
                                <p className="text-sm text-gray-400 uppercase font-bold tracking-wider">PNGK Semasa</p>
                                <p className="text-4xl font-black text-emerald-600">{dataAkademik?.pngk_semasa}</p>
                            </div>
                        </div>

                        {/* Jadual Keputusan */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Kod Kursus</th>
                                        <th className="px-6 py-4">Nama Kursus</th>
                                        <th className="px-6 py-4">Kategori</th>
                                        <th className="px-6 py-4 text-center">Gred</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dataAkademik?.senarai_keputusan.map((subjek, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold">{subjek.kod_kursus}</td>
                                            <td className="px-6 py-4">{subjek.nama_kursus}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                                                    {subjek.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-black text-blue-900">{subjek.gred}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;