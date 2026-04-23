import { useState } from 'react';
import { Star } from 'lucide-react';

export default function PenilaianSubjek() {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [course, setCourse] = useState('TTTK3043 - Kejuruteraan Perisian');
    const [feedback, setFeedback] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Sila berikan penilaian bintang terlebih dahulu.');
            return;
        }
        alert('Penilaian berjaya dihantar. Terima kasih atas maklum balas anda!');
        setRating(0);
        setFeedback('');
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Penilaian Subjek</h1>
            </div>

            <div className="flex justify-center mt-10">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-blue-50 text-blue-500 rounded-full">
                            <Star size={36} fill="none" strokeWidth={2} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Penilaian Kursus</h2>
                    <p className="text-sm text-gray-500 mb-8">Maklum balas anda penting untuk penambahbaikan kualiti pengajaran.</p>

                    <form onSubmit={handleSubmit} className="text-left space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Kursus</label>
                            <select 
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 transition-all text-sm text-gray-800"
                            >
                                <option value="TTTK3043 - Kejuruteraan Perisian">TTTK3043 - Kejuruteraan Perisian</option>
                                <option value="TTTK2033 - Rangkaian Komputer">TTTK2033 - Rangkaian Komputer</option>
                                <option value="SK001 - Pengaturcaraan Asas">SK001 - Pengaturcaraan Asas</option>
                            </select>
                        </div>

                        <div className="text-center">
                            <label className="block text-sm font-bold text-gray-700 mb-3">Kepuasan Keseluruhan</label>
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star 
                                            size={32} 
                                            className={`${
                                                (hoveredRating || rating) >= star 
                                                ? 'text-yellow-400 fill-yellow-400' 
                                                : 'text-gray-200'
                                            } transition-colors`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ulasan / Cadangan</label>
                            <textarea 
                                rows="4" 
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 transition-all text-sm text-gray-800 resize-none"
                                placeholder="Tulis pendapat anda di sini..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]"
                        >
                            Hantar Penilaian
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
