import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

export default function DashboardKP() {
    // Mock Data based on the UI
    const gradeData = [
        { name: 'A', value: 35 },
        { name: 'B', value: 50 },
        { name: 'C', value: 25 },
        { name: 'D', value: 8 },
        { name: 'E', value: 2 },
    ];

    const atRiskStudents = [
        { name: 'Ahmad Bin Ali', grade: 'D', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { name: 'Siti Nurhaliza', grade: 'C-', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
        { name: 'Chong Wei', grade: 'D+', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
    ];

    const courseList = [
        { code: 'CSC101', name: 'Pengenalan Pengaturcaraan', credit: 3, students: 45 },
        { code: 'MTH201', name: 'Kalkulus Lanjutan', credit: 4, students: 30 },
        { code: 'ENG302', name: 'Kejuruteraan Perisian', credit: 3, students: 45 }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Papan Pemuka Ketua Program</h1>
                <p className="text-gray-500 font-medium">Program Kejuruteraan Perisian</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-gray-600 font-bold mb-4">Kursus Diajar</p>
                    <p className="text-4xl font-black text-gray-900">3</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <p className="text-gray-600 font-bold mb-4">Jumlah Pelajar</p>
                    <p className="text-4xl font-black text-gray-900">120</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                    <p className="text-gray-600 font-bold mb-4">Purata Gred Kelas</p>
                    <div className="flex items-end gap-3">
                        <p className="text-4xl font-black text-gray-900">3.42</p>
                        <div className="flex items-center text-emerald-500 font-bold mb-1">
                            <ArrowUpRight size={20} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-8">Taburan Gred Pelajar</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} ticks={[0, 15, 30, 45, 60]} />
                                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6">Pelajar Berisiko</h3>
                    <div className="space-y-4">
                        {atRiskStudents.map((student, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="flex items-center space-x-4">
                                    <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">Gred: {student.grade}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-all">
                                    Lihat
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Senarai Kursus Semester Ini</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500">Kod Kursus</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500">Nama Kursus</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 text-center">Jam Kredit</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 text-center">Bilangan Pelajar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {courseList.map((course, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-4 font-semibold text-gray-800 text-sm">{course.code}</td>
                                    <td className="px-4 py-4 text-gray-600 text-sm font-medium">{course.name}</td>
                                    <td className="px-4 py-4 text-center text-gray-600 text-sm font-medium">{course.credit}</td>
                                    <td className="px-4 py-4 text-center text-gray-600 text-sm font-medium">{course.students}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
