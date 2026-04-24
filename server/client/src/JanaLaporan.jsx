import { Download } from 'lucide-react';

export default function JanaLaporan() {
    const studentList = [
        { name: 'Ahmad bin Daud', id: '2021001', program: 'Sains Komputer', pngk: 3.75, status: 'Lulus' },
        { name: 'Siti Fatimah Abdullah', id: '2021002', program: 'Kejuruteraan Perisian', pngk: 3.20, status: 'Lulus' },
        { name: 'Chong Wei Lim', id: '2021003', program: 'Sains Komputer', pngk: 2.85, status: 'Lulus' },
        { name: 'Nurul Huda binti Ali', id: '2021004', program: 'Sistem Maklumat', pngk: 1.95, status: 'Gagal' },
        { name: 'Thiru Kumaran a/l Raja', id: '2021005', program: 'Kejuruteraan Perisian', pngk: 3.50, status: 'Lulus' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Penjanaan Laporan Akademik</h1>
                <p className="text-gray-500 font-medium">Sesi 2025/2026 Semester 1</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl">
                <h3 className="font-bold text-gray-900 mb-6">Parameter Laporan</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jenis Laporan</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option>Senarai Anugerah Dekan</option>
                            <option>Senarai Pelajar Berisiko</option>
                            <option>Laporan Keseluruhan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Program</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option>Semua Program</option>
                            <option>Kejuruteraan Perisian</option>
                            <option>Sains Komputer</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Format</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                            <option>PDF Document (.pdf)</option>
                            <option>Excel Spreadsheet (.xlsx)</option>
                        </select>
                    </div>
                </div>

                <button className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm active:scale-[0.98]">
                    <Download size={18} />
                    Jana & Muat Turun
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Senarai Pelajar FTSM</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700">Nama Pelajar</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700">ID Pelajar</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700">Program</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 text-right">PNGK Semasa</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-700 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {studentList.map((student, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-semibold text-gray-800 text-sm">{student.name}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{student.id}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{student.program}</td>
                                    <td className="px-6 py-4 text-gray-800 font-bold text-sm text-right">{student.pngk.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            student.status === 'Lulus' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
