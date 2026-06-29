import { Settings, Save } from 'lucide-react';
import { useState } from 'react';

const STORAGE_KEY = 'actas_config';

function loadConfig() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return {
        statusPelajar: true,
        semester: 'Semester 1 2025/2026',
        tarikhMula: '2025-01-01',
        tarikhAkhir: '2025-05-31',
    };
}

export default function KonfigurasiSistem() {
    const init = loadConfig();
    const [statusPelajar, setStatusPelajar] = useState(init.statusPelajar);
    const [semester, setSemester]           = useState(init.semester);
    const [tarikhMula, setTarikhMula]       = useState(init.tarikhMula);
    const [tarikhAkhir, setTarikhAkhir]     = useState(init.tarikhAkhir);
    const [saved, setSaved]                 = useState(false);

    const handleSimpan = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ statusPelajar, semester, tarikhMula, tarikhAkhir }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Konfigurasi Sistem</h1>
                <p className="text-gray-500 font-medium mt-1">Tetapan akademik — {semester}</p>
            </div>

            <div className="flex justify-center">
                <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-blue-50 rounded-xl">
                            <Settings size={22} className="text-[#003082]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Konfigurasi Semester</h2>
                    </div>

                    <div className="space-y-7">

                        {/* Toggle: System status */}
                        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
                            <div>
                                <p className="font-bold text-gray-900">Status Sistem (Pelajar)</p>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Benarkan pelajar mengakses keputusan peperiksaan
                                </p>
                            </div>
                            <button
                                onClick={() => setStatusPelajar(!statusPelajar)}
                                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${statusPelajar ? 'bg-[#003082]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${statusPelajar ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Current semester */}
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                Semester Semasa
                            </label>
                            <input
                                type="text"
                                value={semester}
                                onChange={e => setSemester(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003082] focus:border-transparent text-sm bg-white transition-all"
                            />
                        </div>

                        {/* Date range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    Tarikh Mula
                                </label>
                                <input
                                    type="date"
                                    value={tarikhMula}
                                    onChange={e => setTarikhMula(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003082] focus:border-transparent text-sm bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                    Tarikh Akhir
                                </label>
                                <input
                                    type="date"
                                    value={tarikhAkhir}
                                    onChange={e => setTarikhAkhir(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003082] focus:border-transparent text-sm bg-white transition-all"
                                />
                            </div>
                        </div>

                        {/* Save */}
                        <div className="pt-2">
                            <button
                                onClick={handleSimpan}
                                className={`w-full py-3.5 font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
                                    saved
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-[#003082] hover:bg-blue-800 text-white'
                                }`}
                            >
                                <Save size={16} />
                                {saved ? 'Perubahan Tersimpan!' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
