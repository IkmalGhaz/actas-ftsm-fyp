import { Search, Filter, AlertTriangle, FileText, Phone } from 'lucide-react';

export default function PantauKursus() {
    const courses = [
        {
            title: 'Kejuruteraan Perisian (TTTK3043)',
            status: 'Aktif',
            penyelaras: 'Dr. Azlan',
            pelajar: 45,
            stats: { lulus: 98, gagal: 2, purata: 3.20 },
            alert: null,
            statusColor: 'bg-gray-100 text-gray-600'
        },
        {
            title: 'Multimedia Kreatif (TTTM2123)',
            status: 'Semakan',
            penyelaras: 'Prof. Hamidah',
            pelajar: 38,
            stats: { lulus: 85, gagal: 15, purata: 2.80 },
            alert: 'Amaran: 5 pelajar mempunyai kehadiran < 80%',
            statusColor: 'bg-gray-100 text-gray-600'
        },
        {
            title: 'Pengaturcaraan Web Lanjutan (TTTK3113)',
            status: 'Selesai',
            penyelaras: 'Pn. Siti Aminah',
            pelajar: 52,
            stats: { lulus: 92, gagal: 8, purata: 3.55 },
            alert: null,
            statusColor: 'bg-gray-100 text-gray-600'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pemantauan Kursus</h1>
                <p className="text-gray-500 font-medium">Program Kejuruteraan Perisian</p>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari kod kursus..." 
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-sm">
                    <Filter size={18} />
                    Filter
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 text-lg leading-tight pr-4">{course.title}</h3>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${course.statusColor}`}>
                                    {course.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Penyelaras: {course.penyelaras} | {course.pelajar} Pelajar</p>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-gray-900">{course.stats.lulus}%</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Lulus</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-red-500">{course.stats.gagal}%</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Gagal</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-blue-500">{course.stats.purata.toFixed(2)}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Purata Gred</p>
                                </div>
                            </div>

                            {course.alert && (
                                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl mb-6">
                                    <AlertTriangle className="text-gray-600 mt-0.5" size={18} />
                                    <p className="text-sm text-gray-700">{course.alert}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mt-auto">
                            <button className="w-full flex justify-center items-center gap-2 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm active:scale-[0.98]">
                                <FileText size={18} />
                                Lihat Laporan Lengkap
                            </button>
                            <button className="w-full flex justify-center items-center gap-2 py-3 bg-white border border-blue-200 text-blue-500 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm active:scale-[0.98]">
                                <Phone size={18} />
                                Hubungi Penyelaras
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
