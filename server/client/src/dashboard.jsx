import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, MessageSquare, AlertTriangle } from 'lucide-react';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [dataAkademik, setDataAkademik] = useState(null);
    const [notifikasi, setNotifikasi] = useState([]);
    const [loading, setLoading] = useState(true);

    // Proses data keputusan MySQL menjadi data carta GPA per Semester
    const chartData = useMemo(() => {
        if (!dataAkademik || !dataAkademik.senarai_keputusan || dataAkademik.senarai_keputusan.length === 0) {
            return [{ name: 'Sem 1', gpa: 0.00 }];
        }

        const dataMengikutSem = {};

        dataAkademik.senarai_keputusan.forEach(subjek => {
            const sem = subjek.semester_diambil;
            if (!dataMengikutSem[sem]) {
                dataMengikutSem[sem] = { totalMata: 0, totalKredit: 0 };
            }
            dataMengikutSem[sem].totalMata += (parseFloat(subjek.mata_nilaian) * parseInt(subjek.jam_kredit));
            dataMengikutSem[sem].totalKredit += parseInt(subjek.jam_kredit);
        });

        return Object.keys(dataMengikutSem).sort().map(sem => {
            const gpa = dataMengikutSem[sem].totalMata / dataMengikutSem[sem].totalKredit;
            return {
                name: `Sem ${sem}`,
                gpa: parseFloat(gpa.toFixed(2))
            };
        });
    }, [dataAkademik]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // Tarik data akademik
                const resAkademik = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                setDataAkademik(resAkademik.data);
                
                // Tarik mesej maklum balas dari KP
                const resNotif = await axios.get(`http://localhost:5000/api/pelajar/maklum-balas/${user.no_matrik}`);
                setNotifikasi(resNotif.data);
                
                setLoading(false);
            } catch (error) {
                console.error("Gagal menarik data papan pemuka Pelajar:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    if (!user) return null;

    const renderCustomDot = (props) => {
        const { cx, cy } = props;
        return (
            <svg x={cx - 4} y={cy - 4} width={8} height={8} fill="#3b82f6" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" stroke="none" />
            </svg>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Selamat Datang, {user.nama.split(' ')[0]}!</h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Kotak Mesej/Notifikasi Masuk dari KP (Pilihan 1) */}
                    {notifikasi.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Bell size={14} className="text-blue-500" /> Maklum Balas Ketua Program
                            </h4>
                            {notifikasi.map((item) => (
                                <div key={item.id} className="bg-amber-50 border border-amber-200/70 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{item.mesej}</p>
                                        <p className="text-xs text-amber-600 font-bold mt-2">
                                            Diterima pada: {new Date(item.tarikh).toLocaleDateString('ms-MY')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">PNGK Terkini</p>
                            <p className="text-4xl font-extrabold text-emerald-500">{dataAkademik?.pngk_semasa || "0.00"}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">Status</p>
                            <div>
                                <span className="px-4 py-2 bg-[#F0F7FF] text-[#1E40AF] rounded-lg text-sm font-bold inline-block">
                                    Anugerah Dekan
                                </span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">Kredit Graduasi</p>
                            <div className="flex items-end space-x-1 mb-3">
                                <span className="text-3xl font-extrabold text-gray-900 leading-none">{dataAkademik?.jumlah_kredit || 0}</span>
                                <span className="text-xl font-bold text-gray-400 leading-none">/120</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(Math.min((dataAkademik?.jumlah_kredit || 0) / 120 * 100, 100))}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 font-medium text-right">
                                {Math.round((dataAkademik?.jumlah_kredit || 0) / 120 * 100)}% Selesai
                            </p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-10">Trend Pencapaian Akademik</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} domain={[3.0, 4.0]} ticks={[3.0, 3.2, 3.4, 3.6, 3.8, 4.0]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={renderCustomDot} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center mt-8 items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">GPA</span>
                        </div>
                    </div>

                    {/* Jadual Rekod Kursus Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Rekod Keputusan Akademik</h3>
                            <button onClick={() => navigate('/tambah-kursus')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                                + Daftar Kursus
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Kod Kursus</th>
                                        <th className="p-4 font-semibold">Nama Kursus</th>
                                        <th className="p-4 font-semibold text-center">Kredit</th>
                                        <th className="p-4 font-semibold text-center">Semester</th>
                                        <th className="p-4 font-semibold text-center">Gred</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                                    {dataAkademik?.senarai_keputusan?.map((subjek, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-blue-600">{subjek.kod_kursus}</td>
                                            <td className="p-4 font-medium">{subjek.nama_kursus}</td>
                                            <td className="p-4 text-center">{subjek.jam_kredit}</td>
                                            <td className="p-4 text-center">Sem {subjek.semester_diambil}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-md font-extrabold text-xs inline-block min-w-[40px] text-center ${
                                                    subjek.gred.startsWith('A') ? 'bg-emerald-100 text-emerald-700' :
                                                    subjek.gred.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                                    subjek.gred.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {subjek.gred}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;