import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, TrendingUp, Award, BookOpen } from 'lucide-react';

function DashboardKP() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [kpData, setKpData] = useState({
        jumlah_pelajar: 0,
        purata_cgpa_fakulti: "0.00",
        senarai_pelajar: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Keselamatan: Pastikan hanya KP sahaja yang boleh masuk halaman ini
        if (!user || user.role !== 'kp') {
            navigate('/');
            return;
        }

        const fetchAnalitikFakulti = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kp/analitik-pelajar');
                setKpData(response.data);
            } catch (error) {
                console.error("Gagal menarik data analitik KP:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalitikFakulti();
    }, [user, navigate]);

    if (!user) return null;

    const muatTurunCSV = () => {
    if (!kpData.senarai_pelajar || kpData.senarai_pelajar.length === 0) {
        return alert("Tiada data untuk dimuat turun");
    }
    
    const headers = ["No Matrik", "Nama Pelajar", "Program", "Kredit Terkumpul", "PNGK"];
    const rows = kpData.senarai_pelajar.map(p => [
        p.no_matrik,
        `"${p.nama.toUpperCase()}"`,
        `"${p.program}"`,
        p.totalKredit,
        p.cgpa
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keseluruhan_Pelajar_FTSM.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const muatTurunCSV = () => {
    if (!kpData.senarai_pelajar || kpData.senarai_pelajar.length === 0) {
        return alert("Tiada data untuk dimuat turun");
    }
    
    const headers = ["No Matrik", "Nama Pelajar", "Program", "Kredit Terkumpul", "PNGK"];
    const rows = kpData.senarai_pelajar.map(p => [
        p.no_matrik,
        `"${p.nama.toUpperCase()}"`,
        `"${p.program}"`,
        p.totalKredit,
        p.cgpa
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Keseluruhan_Pelajar_FTSM.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header KP */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Papan Pemuka Ketua Program</h1>
                <p className="text-gray-500 mt-2 font-medium">Selamat datang, {user.nama}. Berikut adalah analitik keseluruhan prestasi pelajar.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Ringkasan Analitik Helang (Helicopter View) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Kad 1: Jumlah Pelajar */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                                <Users size={32} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Jumlah Pelajar</p>
                                <p className="text-3xl font-extrabold text-gray-900">{kpData.jumlah_pelajar}</p>
                            </div>
                        </div>

                        {/* Kad 2: Purata PNGK Fakulti */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Purata PNGK</p>
                                <p className="text-3xl font-extrabold text-emerald-600">{kpData.purata_cgpa_fakulti}</p>
                            </div>
                        </div>

                        {/* Kad 3: Status Pemantauan */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                                <Award size={32} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pelajar Cemerlang</p>
                                <p className="text-3xl font-extrabold text-gray-900">
                                    {kpData.senarai_pelajar.filter(p => parseFloat(p.cgpa) >= 3.67).length}
                                </p>
                            </div>
                        </div>

                        {/* Kad 4: Perlukan Perhatian */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                                <BookOpen size={32} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Perlu Perhatian</p>
                                <p className="text-3xl font-extrabold text-red-600">
                                    {kpData.senarai_pelajar.filter(p => parseFloat(p.cgpa) < 2.00).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Jadual Senarai Pelajar FTSM */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Senarai Prestasi Pelajar</h3>
                            <button onClick={muatTurunCSV} className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
    Muat Turun Laporan (CSV)
</button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 rounded-tl-lg font-semibold">No. Matrik</th>
                                        <th className="p-4 font-semibold">Nama Pelajar</th>
                                        <th className="p-4 font-semibold">Program</th>
                                        <th className="p-4 font-semibold text-center">Kredit Terkumpul</th>
                                        <th className="p-4 rounded-tr-lg font-semibold text-center">PNGK</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                    {kpData.senarai_pelajar.map((pelajar, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-blue-600">{pelajar.no_matrik}</td>
                                            <td className="p-4 font-medium">{pelajar.nama}</td>
                                            <td className="p-4 text-gray-500">{pelajar.program}</td>
                                            <td className="p-4 text-center font-medium">{pelajar.totalKredit}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-md font-extrabold text-xs inline-block min-w-[50px] text-center ${
                                                    parseFloat(pelajar.cgpa) >= 3.67 ? 'bg-emerald-100 text-emerald-700' :
                                                    parseFloat(pelajar.cgpa) >= 3.00 ? 'bg-blue-100 text-blue-700' :
                                                    parseFloat(pelajar.cgpa) >= 2.00 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {pelajar.cgpa}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {kpData.senarai_pelajar.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-gray-400 font-medium">
                                                Tiada rekod pelajar dijumpai di dalam pangkalan data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default DashboardKP;