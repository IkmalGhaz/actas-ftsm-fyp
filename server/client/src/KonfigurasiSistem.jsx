import { Settings } from 'lucide-react';
import { useState } from 'react';

export default function KonfigurasiSistem() {
    const [statusPelajar, setStatusPelajar] = useState(true);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Konfigurasi Sistem</h1>
                <p className="text-gray-500 font-medium">Sesi 2025/2026 Semester 1</p>
            </div>

            <div className="flex justify-center mt-10">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <Settings size={28} className="text-gray-800" />
                        <h2 className="text-2xl font-bold text-gray-900">Konfigurasi Semester</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                            <div>
                                <p className="font-bold text-gray-900">Status Sistem (Pelajar)</p>
                                <p className="text-sm text-gray-500 mt-1">Benarkan pelajar mengakses keputusan peperiksaan</p>
                            </div>
                            <button 
                                onClick={() => setStatusPelajar(!statusPelajar)}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${statusPelajar ? 'bg-[#7c3aed]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${statusPelajar ? 'translate-x-7' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Semester Semasa</label>
                            <input 
                                type="text" 
                                defaultValue="Semester 1 2025/2026"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tarikh Mula</label>
                                <input 
                                    type="date" 
                                    defaultValue="2025-01-01"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tarikh Akhir</label>
                                <input 
                                    type="date" 
                                    defaultValue="2025-05-31"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent text-sm bg-white"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="w-full py-3.5 bg-[#7c3aed] text-white font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-md active:scale-[0.98]">
                                Simpan Perubahan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
