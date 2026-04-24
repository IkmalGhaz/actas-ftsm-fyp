import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function UrusDataPelajar() {
    const studentList = [
        { id: 'A202965', name: 'Ahmad Aliff Hariz', program: 'Kejuruteraan Perisian', status: 'Aktif' },
        { id: 'A203321', name: 'Nurul Jamilah', program: 'Sains Komputer', status: 'Aktif' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pengurusan Pangkalan Data Pelajar</h1>
                <p className="text-gray-500 font-medium">Sesi 2025/2026 Semester 1</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari No. Matrik atau Nama..." 
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm active:scale-[0.98] text-sm">
                    <Plus size={18} />
                    Tambah Pelajar Baru
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Senarai Pelajar</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase">No. Matrik</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase">Nama Pelajar</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase">Program</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {studentList.map((student, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{student.id}</td>
                                    <td className="px-4 py-4 text-gray-600 text-sm font-medium">{student.name}</td>
                                    <td className="px-4 py-4 text-gray-600 text-sm font-medium">{student.program}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            student.status === 'Aktif' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button className="text-blue-500 hover:text-blue-700 transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-400 font-medium">Menunjukkan 2 dari 1,240 rekod</p>
                </div>
            </div>
        </div>
    );
}
