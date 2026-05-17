import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';

function UrusDataPelajar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [senaraiPelajar, setSenaraiPelajar] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk borang (Modal)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        no_matrik: '',
        nama: '',
        program: 'Kejuruteraan Perisian (Pembangunan Sistem Maklumat)',
        katalaluan: '123' // Default password
    });

    // Fungsi Tarik Data (Read)
    const fetchPelajar = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/pegawai/pelajar');
            setSenaraiPelajar(response.data);
        } catch (error) {
            console.error("Gagal menarik data pelajar:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'pegawai') {
            navigate('/');
            return;
        }
        fetchPelajar();
    }, [user, navigate]);

    // Buka Modal Tambah
    const bukaModalTambah = () => {
        setFormData({ 
            no_matrik: '', 
            nama: '', 
            program: 'Kejuruteraan Perisian (Pembangunan Sistem Maklumat)', 
            katalaluan: '123' 
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Buka Modal Kemas Kini (Update)
    const bukaModalEdit = (pelajar) => {
        setFormData(pelajar);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Fungsi Simpan (Create & Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update
                await axios.put(`http://localhost:5000/api/pegawai/pelajar/${formData.no_matrik}`, formData);
                alert("Berjaya dikemas kini!");
            } else {
                // Create
                await axios.post('http://localhost:5000/api/pegawai/pelajar', formData);
                alert("Berjaya ditambah!");
            }
            setIsModalOpen(false);
            fetchPelajar(); // Segar semula jadual
        } catch (error) {
            alert("Ralat! Mungkin No Matrik sudah wujud.");
            console.error(error);
        }
    };

    // Fungsi Padam (Delete)
    const handlePadam = async (no_matrik) => {
        if (window.confirm(`Adakah anda pasti mahu memadam rekod matrik ${no_matrik}? Semua gred berkaitan akan turut terpadam.`)) {
            try {
                await axios.delete(`http://localhost:5000/api/pegawai/pelajar/${no_matrik}`);
                alert("Data dipadam!");
                fetchPelajar();
            } catch (error) {
                alert("Gagal memadam data.");
                console.error(error);
            }
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Urus Data Pelajar
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Modul Pegawai: Daftar, kemas kini, dan padam rekod pelajar.</p>
                </div>
                
                <button 
                    onClick={bukaModalTambah}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                    <Plus size={20} /> Tambah Pelajar
                </button>
            </div>

            {/* Jadual Utama */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                    <th className="p-5 font-semibold">No. Matrik</th>
                                    <th className="p-5 font-semibold">Nama Pelajar</th>
                                    <th className="p-5 font-semibold">Program / Jurusan</th>
                                    <th className="p-5 font-semibold text-center">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                {senaraiPelajar.map((pelajar) => (
                                    <tr key={pelajar.no_matrik} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-5 font-bold text-blue-600">{pelajar.no_matrik}</td>
                                        <td className="p-5 font-medium uppercase">{pelajar.nama}</td>
                                        <td className="p-5 text-gray-500 text-xs font-semibold uppercase">{pelajar.program}</td>
                                        <td className="p-5 text-center space-x-3">
                                            <button onClick={() => bukaModalEdit(pelajar)} className="text-emerald-500 hover:text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-lg transition-colors">
                                                <Edit size={16} className="inline mr-1" /> Edit
                                            </button>
                                            <button onClick={() => handlePadam(pelajar.no_matrik)} className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded-lg transition-colors">
                                                <Trash2 size={16} className="inline mr-1" /> Padam
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-extrabold text-gray-800">
                                {isEditing ? 'Kemas Kini Rekod Pelajar' : 'Daftar Pelajar Baharu'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">No Matrik</label>
                                <input 
                                    type="text" 
                                    required 
                                    disabled={isEditing} 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 uppercase bg-gray-50/50" 
                                    value={formData.no_matrik} 
                                    onChange={(e) => setFormData({...formData, no_matrik: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Penuh</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase bg-gray-50/50" 
                                    value={formData.nama} 
                                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Program / Jurusan Rasmi FTSM</label>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.program}
                                    onChange={(e) => setFormData({...formData, program: e.target.value})}
                                >
                                    {/* Kategori Kejuruteraan Perisian */}
                                    <optgroup label="Kejuruteraan Perisian (SE)">
                                        <option value="Kejuruteraan Perisian (Pembangunan Sistem Maklumat)">Kejuruteraan Perisian (Pembangunan Sistem Maklumat)</option>
                                        <option value="Kejuruteraan Perisian (Pembangunan Sistem Multimedia)">Kejuruteraan Perisian (Pembangunan Sistem Multimedia)</option>
                                    </optgroup>

                                    {/* Kategori Teknologi Maklumat */}
                                    <optgroup label="Teknologi Maklumat (IT)">
                                        <option value="Teknologi Maklumat">Teknologi Maklumat</option>
                                    </optgroup>

                                    {/* Kategori Sains Komputer & Pecahan Major Mula Tahun 2 Sem 4 */}
                                    <optgroup label="Sains Komputer (CS)">
                                        <option value="Sains Komputer">Sains Komputer (Am / Belum Pilih Major)</option>
                                        <option value="Sains Komputer (Sains Data)">Sains Komputer (Sains Data)</option>
                                        <option value="Sains Komputer (Mesin Cerdas)">Sains Komputer (Mesin Cerdas)</option>
                                        <option value="Sains Komputer (Teknologi Perisian)">Sains Komputer (Teknologi Perisian)</option>
                                        <option value="Sains Komputer (Teknologi Rangkaian)">Sains Komputer (Teknologi Rangkaian)</option>
                                    </optgroup>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kata Laluan Akses</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50" 
                                    value={formData.katalaluan} 
                                    onChange={(e) => setFormData({...formData, katalaluan: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" className="flex-1 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                    Simpan Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UrusDataPelajar;