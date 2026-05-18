import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Send, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';

function PenilaianSubjek() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [senaraiSubjek, setSenaraiSubjek] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State borang
    const [subjekDipilih, setSubjekDipilih] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [komen, setKomen] = useState('');
    const [statusHantar, setStatusHantar] = useState('');
    const [berjaya, setBerjaya] = useState(false);

    useEffect(() => {
        // Hanya pelajar yang boleh akses borang ini
        if (!user || user.role !== 'pelajar') {
            navigate('/');
            return;
        }

        // Tarik subjek yang pelajar dah ambil dari API akademik sedia ada
        const fetchSubjekDiambil = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                setSenaraiSubjek(response.data.senarai_keputusan || []);
            } catch (error) {
                console.error("Gagal menarik senarai kursus:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjekDiambil();
    }, [user, navigate]);

    const handleHantarPenilaian = async (e) => {
        e.preventDefault();
        if (!subjekDipilih || rating === 0 || !komen.trim()) {
            alert("Sila lengkapkan pilihan subjek, rating bintang, dan komen anda.");
            return;
        }

        setStatusHantar('Menghantar...');
        try {
            await axios.post('http://localhost:5000/api/pelajar/penilaian', {
                no_matrik: user.no_matrik,
                kod_kursus: subjekDipilih,
                rating: rating,
                komen: komen
            });
            
            setBerjaya(true);
            setStatusHantar('');
            
            // Reset form selepas 3 saat
            setTimeout(() => {
                setBerjaya(false);
                setSubjekDipilih('');
                setRating(0);
                setKomen('');
            }, 3000);
            
        } catch (error) {
            console.error("Ralat menghantar penilaian:", error);
            alert("Gagal menghantar penilaian. Sila cuba lagi.");
            setStatusHantar('');
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="text-center bg-gradient-to-br from-blue-600 to-indigo-800 p-10 rounded-3xl shadow-lg text-white">
                <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                    <Star className="text-yellow-300" size={32} fill="currentColor" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Penilaian Kursus FTSM</h1>
                <p className="text-blue-100 font-medium max-w-xl mx-auto">
                    Suara anda penting. Nilai kursus yang telah anda ambil untuk membantu pihak pengurusan meningkatkan kualiti akademik fakulti.
                </p>
            </div>

            {/* Borang Penilaian */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                    
                    {berjaya && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in zoom-in duration-300">
                            <CheckCircle size={80} className="text-emerald-500 mb-4" />
                            <h2 className="text-2xl font-black text-gray-800">Terima Kasih!</h2>
                            <p className="text-gray-500 font-medium mt-2 text-center max-w-sm">Maklum balas anda telah dihantar secara terus kepada Ketua Program FTSM.</p>
                        </div>
                    )}

                    <form onSubmit={handleHantarPenilaian} className="space-y-8">
                        
                        {/* Pilihan Subjek */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <BookOpen size={18} className="text-blue-500" />
                                1. Pilih Kursus
                            </label>
                            <select 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-700 font-medium cursor-pointer"
                                value={subjekDipilih}
                                onChange={(e) => setSubjekDipilih(e.target.value)}
                            >
                                <option value="" disabled>-- Sila pilih kursus yang ingin dinilai --</option>
                                {senaraiSubjek.map((subjek, index) => (
                                    <option key={index} value={subjek.kod_kursus}>
                                        {subjek.kod_kursus} - {subjek.nama_kursus} (Sem {subjek.semester_diambil})
                                    </option>
                                ))}
                            </select>
                            {senaraiSubjek.length === 0 && <p className="text-xs text-red-500 font-medium mt-1">Anda belum mendaftar apa-apa kursus dalam sistem.</p>}
                        </div>

                        {/* Rating Bintang */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <Star size={18} className="text-blue-500" />
                                2. Berikan Rating Anda
                            </label>
                            <div className="flex gap-2 justify-center py-6 bg-gray-50 rounded-2xl border border-gray-100">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        <Star 
                                            size={48} 
                                            className={`transition-colors duration-200 ${
                                                star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-200"
                                            }`} 
                                            fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                                {rating === 1 && "Sangat Mengecewakan"}
                                {rating === 2 && "Kurang Memuaskan"}
                                {rating === 3 && "Sederhana Baik"}
                                {rating === 4 && "Sangat Baik"}
                                {rating === 5 && "Cemerlang!"}
                            </p>
                        </div>

                        {/* Ruangan Komen */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <MessageSquare size={18} className="text-blue-500" />
                                3. Ulasan / Komen Tambahan
                            </label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[150px]"
                                placeholder="Apakah pendapat anda tentang silibus kursus ini? Adakah ia sukar difahami atau sangat menyeronokkan?"
                                value={komen}
                                onChange={(e) => setKomen(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Butang Hantar */}
                        <button 
                            type="submit" 
                            disabled={statusHantar === 'Menghantar...' || !subjekDipilih}
                            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:shadow-none active:scale-[0.98]"
                        >
                            <Send size={20} />
                            {statusHantar || 'Hantar Penilaian Subjek'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default PenilaianSubjek;