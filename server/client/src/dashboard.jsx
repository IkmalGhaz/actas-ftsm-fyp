import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    
    const [dataAkademik, setDataAkademik] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for the chart
    const mockTrendData = [
        { name: 'Sem 1', gpa: 3.20 },
        { name: 'Sem 2', gpa: 3.45 },
        { name: 'Sem 3', gpa: 3.60 },
        { name: 'Sem 4', gpa: 3.55 },
        { name: 'Sem 5', gpa: 3.67 },
    ];

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchAkademikData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/akademik/${user.no_matrik}`);
                setDataAkademik(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Gagal menarik data, menggunakan data demo:", error);
                setDataAkademik({
                    jumlah_kredit: 90,
                    pngk_semasa: 3.67,
                    senarai_keputusan: []
                });
                setLoading(false);
            }
        };

        fetchAkademikData();
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
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1: PNGK Terkini */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">PNGK Terkini</p>
                            <p className="text-4xl font-extrabold text-emerald-500">{dataAkademik?.pngk_semasa || "3.67"}</p>
                        </div>

                        {/* Card 2: Status */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">Status</p>
                            <div>
                                <span className="px-4 py-2 bg-[#F0F7FF] text-[#1E40AF] rounded-lg text-sm font-bold inline-block">
                                    Anugerah Dekan
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Kredit Graduasi */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                            <p className="text-sm text-gray-500 font-semibold mb-3">Kredit Graduasi</p>
                            <div className="flex items-end space-x-1 mb-3">
                                <span className="text-3xl font-extrabold text-gray-900 leading-none">{dataAkademik?.jumlah_kredit || 90}</span>
                                <span className="text-xl font-bold text-gray-400 leading-none">/120</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(Math.min((dataAkademik?.jumlah_kredit || 90) / 120 * 100, 100))}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 font-medium text-right">
                                {Math.round((dataAkademik?.jumlah_kredit || 90) / 120 * 100)}% Complete
                            </p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-10">Trend Pencapaian Akademik</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockTrendData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} domain={[3.0, 4.0]} ticks={[3.2, 3.4, 3.6, 3.8, 4.0]} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="gpa" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3} 
                                        dot={renderCustomDot}
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center mt-8 items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">GPA</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;