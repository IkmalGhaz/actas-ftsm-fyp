import { Star, Users } from 'lucide-react';

export default function MaklumBalasKP() {
    const feedbackList = [
        {
            avatar: 'https://i.pravatar.cc/150?img=11',
            date: '25 Jan 2026',
            rating: 5,
            comment: 'Pensyarah sangat membantu dan kandungan kursus mudah difahami. Ceramah disampaikan dengan jelas dan bahan rujukan tambahan sangat berguna. Tugasan juga relevan dengan topik yang diajar.'
        },
        {
            avatar: 'https://i.pravatar.cc/150?img=5',
            date: '24 Jan 2026',
            rating: 3,
            comment: 'Tugasan agak sukar dan masa yang diberikan tidak mencukupi untuk menyiapkan dengan sempurna. Perlukan lebih banyak bimbingan dalam menyelesaikan masalah yang kompleks.'
        },
        {
            avatar: 'https://i.pravatar.cc/150?img=33',
            date: '23 Jan 2026',
            rating: 4,
            comment: 'Kelas yang menarik, tetapi makmal komputer perlu dinaik taraf. Beberapa perisian tidak berfungsi dengan baik dan menyebabkan kelewatan dalam praktikal. Keseluruhan pengalaman pembelajaran adalah baik.'
        }
    ];

    const renderStars = (rating) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        size={16} 
                        className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Maklum Balas & Penilaian Kursus</h1>
                <p className="text-gray-500 font-medium">Program Kejuruteraan Perisian</p>
            </div>

            <div className="flex gap-4">
                <div className="w-48">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Pilih Semester</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm">
                        <option>Sem 1 2025/2026</option>
                        <option>Sem 2 2024/2025</option>
                    </select>
                </div>
                <div className="w-64">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Pilih Kursus</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm">
                        <option>Semua Kursus</option>
                        <option>TTTK3043 - Kejuruteraan Perisian</option>
                        <option>TTTM2123 - Multimedia Kreatif</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold mb-2">Purata Rating</p>
                        <p className="text-4xl font-black text-gray-900">4.5 <span className="text-xl text-gray-400 font-bold">/ 5.0</span></p>
                    </div>
                    <div className="text-yellow-400">
                        <Star size={40} className="fill-none stroke-2" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 font-bold mb-2">Jumlah Respon</p>
                        <p className="text-4xl font-black text-gray-900">120 <span className="text-xl text-gray-400 font-bold">Pelajar</span></p>
                    </div>
                    <div className="text-blue-500">
                        <Users size={40} className="stroke-2" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Maklum Balas Pelajar</h3>
                {feedbackList.map((feedback, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <img src={feedback.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                                <span className="text-sm font-semibold text-gray-500">{feedback.date}</span>
                            </div>
                            {renderStars(feedback.rating)}
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">
                            {feedback.comment}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
