import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    // State untuk simpan data akademik dari database
    const [dataAkademik, setDataAkademik] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Jika belum login, tendang balik ke page depan
        if (!user) {
            navigate('/');
            return;
        }

        // Fungsi tarik data dari Node.js (Otak)
        const fetchAkademikData = async () => {
            try {
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
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            {/* Header Profil */}
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Papan Pemuka Prestasi</h1>
                    <p className="text-gray-500">Selamat datang, <span className="font-semibold text-blue-600">{user.nama}</span> ({user.no_matrik})</p>
                    <p className="text-sm text-gray-400 mt-1">{user.program}</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="px-5 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                >
                    Log Keluar
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 mt-20">Memuatkan data akademik...</div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* Kad Rumusan (Kredit & PNGK) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 border-l-4 border-l-blue-500">
                            <div className="p-4 bg-blue-50 rounded-full">
                                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Kredit Terkumpul</p>
                                <p className="text-3xl font-bold text-gray-800">{dataAkademik?.jumlah_kredit} <span className="text-lg font-normal text-gray-500">jam</span></p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 border-l-4 border-l-emerald-500">
                            <div className="p-4 bg-emerald-50 rounded-full">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">PNGK Semasa</p>
                                <p className="text-3xl font-bold text-gray-800">{dataAkademik?.pngk_semasa}</p>
                            </div>
                        </div>
                    </div>

                    {/* Jadual Keputusan Kursus */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Sejarah Akademik (Terperinci)</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Kod Kursus</th>
                                        <th className="px-6 py-4 font-medium">Nama Kursus</th>
                                        <th className="px-6 py-4 font-medium">Kategori</th>
                                        <th className="px-6 py-4 font-medium text-center">Kredit</th>
                                        <th className="px-6 py-4 font-medium text-center">Gred</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {dataAkademik?.senarai_keputusan.map((subjek, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">{subjek.kod_kursus}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{subjek.nama_kursus}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                                    {subjek.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center font-medium text-gray-600">{subjek.jam_kredit}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`font-bold ${subjek.gred.includes('A') ? 'text-emerald-500' : 'text-gray-700'}`}>
                                                    {subjek.gred}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default Dashboard;