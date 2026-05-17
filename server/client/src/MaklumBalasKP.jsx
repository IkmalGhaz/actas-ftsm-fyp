import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, AlertCircle, Search, UserCheck } from 'lucide-react';

function MaklumBalasKP() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carian, setCarian] = useState('');
    
    // State untuk form mesej
    const [pelajarDipilih, setPelajarDipilih] = useState(null);
    const [mesej, setMesej] = useState('');
    const [statusHantar, setStatusHantar] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'kp') {
            navigate('/');
            return;
        }

        // Kita tarik senarai pelajar dari API sedia ada untuk senarai dropdown/carian
        const fetchPelajar = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/kp/analitik-pelajar');
                setSenaraiPelajar(response.data.senarai_pelajar);
            } catch (error) {
                console.error("Gagal menarik data pelajar:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPelajar();
    }, [user, navigate]);

    const pelajarDitapis = senaraiPelajar.filter(p => 
        p.no_matrik.toLowerCase().includes(carian.toLowerCase()) || 
        p.nama.toLowerCase().includes(carian.toLowerCase())
    );

    const handleHantarMesej = async (e) => {
        e.preventDefault();
        if (!pelajarDipilih || !mesej.trim()) return;

        setStatusHantar('Menghantar...');
        try {
            await axios.post('http://localhost:5000/api/kp/maklum-balas', {
                no_matrik: pelajarDipilih.no_matrik,
                mesej: mesej
            });
            alert(`Mesej berjaya dihantar kepada ${pelajarDipilih.nama}!`);
            setMesej('');
            setPelajarDipilih(null);
            setStatusHantar('');
        } catch (error) {
            alert("Ralat menghantar mesej.");
            setStatusHantar('');
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    <MessageSquare className="text-blue-600" size={32} />
                    Maklum Balas & Amaran
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Hantar notifikasi atau surat amaran terus ke dalam Papan Pemuka pelajar.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Panel Kiri: Senarai Pelajar (Buku Alamat) */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari nama atau matrik..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={carian}
                                onChange={(e) => setCarian(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2">
                        {loading ? (
                            <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>
                        ) : (
                            <div className="space-y-1">
                                {pelajarDitapis.map(pelajar => {
                                    const isCritical = parseFloat(pelajar.cgpa) < 2.00;
                                    const isSelected = pelajarDipilih?.no_matrik === pelajar.no_matrik;
                                    return (
                                        <div 
                                            key={pelajar.no_matrik}
                                            onClick={() => setPelajarDipilih(pelajar)}
                                            className={`p-4 rounded-xl cursor-pointer border transition-all ${
                                                isSelected 
                                                ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                                : 'border-transparent hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`font-bold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>{pelajar.nama}</p>
                                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">{pelajar.no_matrik} • PNGK: {pelajar.cgpa}</p>
                                                </div>
                                                {isCritical && <AlertCircle size={16} className="text-red-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel Kanan: Borang Mesej */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    {pelajarDipilih ? (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent rounded-t-2xl">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Penerima Maklum Balas:</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        <UserCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-gray-900">{pelajarDipilih.nama}</h3>
                                        <p className="text-sm font-medium text-gray-500">{pelajarDipilih.no_matrik}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <form onSubmit={handleHantarMesej} className="p-6 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kandungan Mesej Rasmi</label>
                                    <p className="text-xs text-gray-500 mb-3">Mesej ini akan dipaparkan secara langsung di Papan Pemuka pelajar tersebut.</p>
                                </div>
                                
                                <textarea 
                                    className="w-full flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700 leading-relaxed bg-gray-50/50"
                                    placeholder="Contoh: Sila hadir ke pejabat saya pada hari Selasa ini untuk membincangkan prestasi akademik anda..."
                                    value={mesej}
                                    onChange={(e) => setMesej(e.target.value)}
                                    required
                                ></textarea>
                                
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={statusHantar === 'Menghantar...'}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-70 active:scale-95"
                                    >
                                        <Send size={18} />
                                        {statusHantar || 'Hantar Maklum Balas'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-10 text-center">
                            <MessageSquare size={64} className="text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-700 mb-2">Pilih Penerima</h3>
                            <p className="font-medium text-sm">Sila pilih nama pelajar daripada senarai di sebelah kiri untuk mula menaip maklum balas atau amaran akademik.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default MaklumBalasKP;