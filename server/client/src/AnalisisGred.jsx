import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalisisGred() {
    const gradeData = [
        { name: 'A', value: 30 },
        { name: 'A-', value: 25 },
        { name: 'B+', value: 20 },
        { name: 'B', value: 15 },
        { name: 'LAIN-LAIN', value: 10 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analisis Prestasi Akademik</h1>
                <p className="text-gray-500 font-medium">Program Kejuruteraan Perisian</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Taburan Gred Keseluruhan</h3>
                        <p className="text-sm text-gray-500 mt-1">Semester 1 2025/2026</p>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button className="px-4 py-1.5 text-sm font-bold bg-blue-500 text-white rounded-md shadow-sm">Carta Bar</button>
                        <button className="px-4 py-1.5 text-sm font-bold text-gray-600 rounded-md hover:bg-gray-200 transition-colors">Carta Pai</button>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} ticks={[0, 8, 16, 24, 32]} />
                            <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} name="Bilangan Pelajar" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                        <span className="text-sm font-medium text-gray-600">Bilangan Pelajar</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Kursus Paling Cemerlang</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                            <p className="font-semibold text-gray-800 text-sm">1. Multimedia Kreatif</p>
                            <p className="font-black text-blue-600">3.80 PNGK</p>
                        </div>
                        <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                            <p className="font-semibold text-gray-800 text-sm">2. Interaksi Manusia Komputer</p>
                            <p className="font-black text-gray-900">3.65 PNGK</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Kursus Kritikal (Kadar Gagal Tinggi)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                            <p className="font-semibold text-red-800 text-sm">1. Struktur Data</p>
                            <p className="font-black text-red-600">15% Gagal</p>
                        </div>
                        <div className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-xl transition-colors">
                            <p className="font-semibold text-gray-800 text-sm">2. Matematik Diskret</p>
                            <p className="font-black text-gray-900">10% Gagal</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
