import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TambahKursus() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Pastikan nilai awal (state) sepadan dengan struktur borang
    const [formData, setFormData] = useState({
        kod_kursus: '',
        nama_kursus: '',
        jam_kredit: 3,
        kategori: 'Wajib Fakulti',
        gred: 'A',
        semester_diambil: 1
    });

    // Perlindungan Keselamatan: Jika user tiada dalam sesi log masuk, tendang keluar
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Tukar gred abjad kepada mata nilaian perpuluhan
        const gredMata = { 
            'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00, 
            'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'D': 1.00, 'E': 0.00 
        };
        const mataNilaian = gredMata[formData.gred] || 0.00;

        try {
            await axios.post('http://localhost:5000/api/tambah-kursus', {
                no_matrik: user?.no_matrik,
                mata_nilaian: mataNilaian,
                ...formData
            });
            alert("Selesai! Keputusan telah direkodkan.");
            navigate('/dashboard'); // Kembali ke Papan Pemuka utama
        } catch (error) {
            alert("Ralat pelayan semasa menyimpan. Sila cuba lagi.");
            console.error(error);
        }
    };

    // Jika user kosong, jangan render komponen untuk elak crash 'reading properties of null'
    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Daftar Keputusan Baharu</h2>
                    <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">Batal</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kod Kursus</label>
                            <input 
                                type="text" 
                                name="kod_kursus" 
                                required 
                                placeholder="Cth: TTTK2033" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase" 
                                value={formData.kod_kursus}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kursus</label>
                            <input 
                                type="text" 
                                name="nama_kursus" 
                                required 
                                placeholder="Cth: Rangkaian Komputer" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                                value={formData.nama_kursus}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select 
                                name="kategori" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                                value={formData.kategori}
                                onChange={handleChange}
                            >
                                <option value="Wajib Fakulti">Wajib Fakulti</option>
                                <option value="Wajib Universiti">Wajib Universiti</option>
                                <option value="Citra">Citra</option>
                                <option value="Elektif">Elektif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jam Kredit</label>
                            <input 
                                type="number" 
                                name="jam_kredit" 
                                min="1" 
                                max="6" 
                                required 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                                value={formData.jam_kredit}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semester Diambil</label>
                            <input 
                                type="number" 
                                name="semester_diambil" 
                                min="1" 
                                max="8" 
                                required 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                                value={formData.semester_diambil}
                                onChange={handleChange} 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gred Diperoleh</label>
                            <select 
                                name="gred" 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-emerald-600" 
                                value={formData.gred}
                                onChange={handleChange}
                            >
                                <option value="A">A</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="B-">B-</option>
                                <option value="C+">C+</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md">
                        Simpan Keputusan
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TambahKursus;