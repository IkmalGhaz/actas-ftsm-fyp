import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';

function Simulator() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Data akademik asal
    const [currentStats, setCurrentStats] = useState({
        cgpa: 3.46,
        totalCredits: 90 
    });

    const [simulatedCourses, setSimulatedCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', credits: 3, grade: 'A' });

    const gredMata = { 
        'A': 4.00, 'A-': 3.67, 'B+': 3.33, 'B': 3.00, 
        'B-': 2.67, 'C+': 2.33, 'C': 2.00, 'D': 1.00, 'E': 0.00 
    };

    const addCourse = () => {
        if (!newCourse.name) return alert("Masukkan nama subjek");
        setSimulatedCourses([...simulatedCourses, { ...newCourse, id: Date.now() }]);
        setNewCourse({ name: '', credits: 3, grade: 'A' });
    };

    const removeCourse = (id) => {
        setSimulatedCourses(simulatedCourses.filter(c => c.id !== id));
    };

    const calculateNewCgpa = () => {
        const currentTotalPoints = currentStats.cgpa * currentStats.totalCredits;
        let simulatedPoints = 0;
        let simulatedCredits = 0;

        simulatedCourses.forEach(c => {
            simulatedPoints += (gredMata[c.grade] * parseInt(c.credits));
            simulatedCredits += parseInt(c.credits);
        });

        const finalCgpa = (currentTotalPoints + simulatedPoints) / (currentStats.totalCredits + simulatedCredits);
        return isNaN(finalCgpa) ? currentStats.cgpa.toFixed(2) : finalCgpa.toFixed(2);
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-10">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <Calculator className="text-blue-500" /> Simulator PNGK
                </h1>
                <p className="text-gray-500 mt-2">Ramal keputusan semester akan datang anda.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bahagian Input */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold mb-4 text-gray-800">Tambah Subjek Simulasi</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nama Subjek</label>
                                <input type="text" placeholder="Contoh: Rangkaian Komputer" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50/50" 
                                    value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kredit</label>
                                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    value={newCourse.credits} onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}>
                                    {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Kredit</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Gred Sasaran</label>
                                <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-bold text-blue-600"
                                    value={newCourse.grade} onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}>
                                    {Object.keys(gredMata).map(g => <option key={g} value={g}>Gred {g}</option>)}
                                </select>
                            </div>

                            <button onClick={addCourse} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md active:scale-[0.98] mt-2">
                                Tambah ke Senarai
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bahagian Keputusan Simulasi */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl text-white shadow-md flex justify-between items-center">
                        <div>
                            <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-1">PNGK Simulasi Baharu</p>
                            <h2 className="text-6xl font-black tracking-tighter">{calculateNewCgpa()}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-200 text-xs font-medium">PNGK Semasa</p>
                            <p className="text-2xl font-bold">{currentStats.cgpa}</p>
                            <div className="h-px bg-blue-500 my-2 opacity-50"></div>
                            <p className="text-blue-200 text-xs font-medium">Total Kredit Semasa</p>
                            <p className="text-lg font-semibold">{currentStats.totalCredits}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left font-bold">Subjek</th>
                                    <th className="px-6 py-4 text-center font-bold">Kredit</th>
                                    <th className="px-6 py-4 text-center font-bold">Gred</th>
                                    <th className="px-6 py-4 text-right font-bold">Tindakan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {simulatedCourses.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{c.name}</td>
                                        <td className="px-6 py-4 text-center text-gray-600">{c.credits}</td>
                                        <td className="px-6 py-4 text-center font-bold text-blue-600">{c.grade}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => removeCourse(c.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Padam</button>
                                        </td>
                                    </tr>
                                ))}
                                {simulatedCourses.length === 0 && (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">Tiada subjek ditambah. Mula meramal sekarang!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Simulator;