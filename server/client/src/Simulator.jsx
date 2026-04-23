import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Simulator() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Data akademik asal (Kita anggap data ini datang dari Dashboard)
    // Untuk Mohamad Ikmal, kita set default PNGK 3.46
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

    // Fungsi Pengiraan Utama
    const calculateNewCgpa = () => {
        const currentTotalPoints = currentStats.cgpa * currentStats.totalCredits;
        let simulatedPoints = 0;
        let simulatedCredits = 0;

        simulatedCourses.forEach(c => {
            simulatedPoints += (gredMata[c.grade] * parseInt(c.credits));
            simulatedCredits += parseInt(c.credits);
        });

        const finalCgpa = (currentTotalPoints + simulatedPoints) / (currentStats.totalCredits + simulatedCredits);
        return finalCgpa.toFixed(2);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 text-blue-600 font-medium">← Kembali ke Papan Pemuka</button>
                
                <h1 className="text-3xl font-extrabold mb-2">Simulator PNGK ACTAS</h1>
                <p className="text-gray-500 mb-8">Ramal keputusan semester akan datang anda.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bahagian Input */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold mb-4 text-gray-700">Tambah Subjek Simulasi</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Nama Subjek" className="w-full px-4 py-2 border rounded-lg" 
                                    value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} />
                                
                                <select className="w-full px-4 py-2 border rounded-lg"
                                    value={newCourse.credits} onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}>
                                    {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} Kredit</option>)}
                                </select>

                                <select className="w-full px-4 py-2 border rounded-lg"
                                    value={newCourse.grade} onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}>
                                    {Object.keys(gredMata).map(g => <option key={g} value={g}>Gred {g}</option>)}
                                </select>

                                <button onClick={addCourse} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                                    Tambah ke Senarai
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bahagian Keputusan Simulasi */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg flex justify-between items-center">
                            <div>
                                <p className="text-blue-100 uppercase text-xs font-bold tracking-widest mb-1">PNGK Simulasi Baharu</p>
                                <h2 className="text-5xl font-black">{calculateNewCgpa()}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-xs">PNGK Semasa</p>
                                <p className="text-xl font-bold">{currentStats.cgpa}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Subjek</th>
                                        <th className="px-6 py-4 text-center">Kredit</th>
                                        <th className="px-6 py-4 text-center">Gred</th>
                                        <th className="px-6 py-4 text-right">Tindakan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {simulatedCourses.map(c => (
                                        <tr key={c.id}>
                                            <td className="px-6 py-4 font-medium">{c.name}</td>
                                            <td className="px-6 py-4 text-center">{c.credits}</td>
                                            <td className="px-6 py-4 text-center font-bold text-blue-600">{c.grade}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => removeCourse(c.id)} className="text-red-400 hover:text-red-600">Padam</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {simulatedCourses.length === 0 && (
                                        <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Tiada subjek ditambah. Mula meramal sekarang!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Simulator;