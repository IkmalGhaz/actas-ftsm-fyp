import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer, Filter, Download, Users, FileText } from 'lucide-react';

function JanaLaporan() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tapisan, setTapisan] = useState('Semua'); // Pilihan: Semua, Dekan, Kritikal

    useEffect(() => {
        // Hanya Pegawai FTSM yang boleh akses halaman ini
        if (!user || user.role !== 'pegawai') {
            navigate('/');
            return;
        }

        const fetchDataLaporan = async () => {
            try {
                // Kita gunakan API KP yang dah siap tarik semua pelajar
                const response = await axios.get('http://localhost:5000/api/kp/analitik-pelajar');
                setSenaraiPelajar(response.data.senarai_pelajar);
            } catch (error) {
                console.error("Gagal menarik data untuk laporan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataLaporan();
    }, [user, navigate]);

    // Logik Tapisan (Filter) Laporan
    const pelajarDitapis = senaraiPelajar.filter(pelajar => {
        const cgpa = parseFloat(pelajar.cgpa);
        if (tapisan === 'Dekan') return cgpa >= 3.67;
        if (tapisan === 'Kritikal') return cgpa < 2.00;
        return true; // Untuk 'Semua'
    });

    // Fungsi Cetak (Akan buka window print untuk save as PDF)
    const handleCetak = () => {
        window.print();
    };

    if (!user) return null;

    const muatTurunCSV = () => {
    if (!pelajarDitapis || pelajarDitapis.length === 0) {
        return alert("Tiada data untuk dimuat turun");
    }
    
    const headers = ["No Matrik", "Nama Pelajar", "Program", "Kredit Terkumpul", "PNGK"];
    const rows = pelajarDitapis.map(p => [
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
    link.setAttribute("download", `Laporan_Pegawai_Kategori_${tapisan}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Laporan (Disembunyikan semasa mencetak) */}
            <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-600" size={32} />
                        Penjanaan Laporan Rasmi
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Modul Pegawai FTSM: Saring dan cetak rekod akademik mahasiswa.</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleCetak}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                        <Printer size={18} />
                        Cetak PDF
                    </button>
                    <button onClick={muatTurunCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm">
    <Download size={18} />
    Eksport CSV
</button>
                </div>
            </div>

            {/* Kawalan Tapisan (Disembunyikan semasa mencetak) */}
            <div className="print:hidden bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <Filter size={16} /> Tapisan Laporan:
                </div>
                <div className="flex gap-2">
                    {['Semua', 'Dekan', 'Kritikal'].map(jenis => (
                        <button
                            key={jenis}
                            onClick={() => setTapisan(jenis)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                                tapisan === jenis 
                                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
                            }`}
                        >
                            {jenis === 'Dekan' ? 'Anugerah Dekan (>= 3.67)' : jenis === 'Kritikal' ? 'Amaran Akademik (< 2.00)' : 'Semua Pelajar'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 print:hidden">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                /* Kepala Surat Rasmi (Hanya muncul bila dicetak) */
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                    
                    {/* Letterhead untuk Cetakan */}
                    <div className="hidden print:block text-center border-b-2 border-gray-800 pb-6 mb-6">
                        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">Fakulti Teknologi & Sains Maklumat</h1>
                        <h2 className="text-lg font-bold text-gray-700 mt-1">Universiti Kebangsaan Malaysia</h2>
                        <p className="text-sm mt-3 font-medium text-gray-500 uppercase">
                            Dokumen Rasmi: Senarai Rekod Akademik Pelajar - Kategori {tapisan}
                        </p>
                    </div>

                    <div className="flex justify-between items-center mb-6 print:hidden">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-blue-500" />
                            Pratonton Laporan ({pelajarDitapis.length} Rekod)
                        </h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider print:bg-transparent print:border-b print:border-gray-800">
                                    <th className="p-4 font-semibold print:px-0">No. Matrik</th>
                                    <th className="p-4 font-semibold">Nama Pelajar</th>
                                    <th className="p-4 font-semibold">Program</th>
                                    <th className="p-4 font-semibold text-center">Kredit</th>
                                    <th className="p-4 font-semibold text-center">PNGK</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100 print:divide-gray-300">
                                {pelajarDitapis.map((pelajar, index) => (
                                    <tr key={index} className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent">
                                        <td className="p-4 font-bold text-blue-600 print:text-black print:px-0">{pelajar.no_matrik}</td>
                                        <td className="p-4 font-medium uppercase">{pelajar.nama}</td>
                                        <td className="p-4 text-gray-500 text-xs">{pelajar.program}</td>
                                        <td className="p-4 text-center">{pelajar.totalKredit}</td>
                                        <td className="p-4 text-center font-bold">{pelajar.cgpa}</td>
                                    </tr>
                                ))}

                                {pelajarDitapis.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400 font-medium">
                                            Tiada pelajar dijumpai untuk kategori ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Rasmi (Hanya muncul bila dicetak) */}
                    <div className="hidden print:block mt-12 pt-8 text-sm text-gray-600">
                        <p>Laporan ini dijana secara automatik oleh Sistem ACTAS-FTSM.</p>
                        <p>Dicetak pada: {new Date().toLocaleDateString('ms-MY')} oleh Pegawai FTSM.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JanaLaporan;