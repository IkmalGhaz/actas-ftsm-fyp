import { CheckCircle2 } from 'lucide-react';

export default function SemakanKredit() {
    // Mock Data based on the UI
    const progressData = [
        { label: "Kursus Wajib Fakulti", percentage: 80 },
        { label: "Kursus Wajib Universiti", percentage: 100 },
        { label: "Kursus Citra", percentage: 50 },
        { label: "Kursus Elektif", percentage: 20 }
    ];

    const courseList = [
        { id: "SK001", name: "Pengaturcaraan Asas", credit: 3, status: "Lulus" },
        { id: "UHAK1012", name: "Falsafah dan Isu Semasa", credit: 2, status: "Lulus" },
        { id: "LMCE1042", name: "English for Science", credit: 2, status: "Lulus" },
        { id: "TTTK2033", name: "Rangkaian Komputer", credit: 3, status: "Semasa" },
        { id: "TTTK3043", name: "Kejuruteraan Perisian", credit: 3, status: "Semasa" }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Semakan Kredit Graduasi</h1>
            </div>

            <div className="space-y-4">
                {progressData.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{item.label}</h3>
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-600">{item.percentage}%</span>
                                {item.percentage === 100 && <CheckCircle2 size={18} className="text-emerald-500" />}
                            </div>
                        </div>
                        <div className="w-full bg-blue-100/50 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Senarai Kursus</h3>
                    <p className="text-sm text-gray-500">Maklumat terperinci tentang kursus-kursus anda.</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-y border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Kod Kursus</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">Nama Kursus</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Kredit</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {courseList.map((course, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-gray-800">{course.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{course.name}</td>
                                    <td className="px-6 py-4 text-center font-medium text-gray-700">{course.credit}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                                            course.status === 'Lulus' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {course.status}
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
