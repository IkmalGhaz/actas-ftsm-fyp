import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Medal, Clock } from 'lucide-react';

export default function CartaPrestasi() {
    // Mock Data based on UI
    const chartData = [
        { name: 'Sem 1', png: 3.20, pngk: 3.20 },
        { name: 'Sem 2', png: 3.50, pngk: 3.35 },
        { name: 'Sem 3', png: 3.10, pngk: 3.25 },
        { name: 'Sem 4', png: 3.85, pngk: 3.40 },
        { name: 'Sem 5', png: 3.60, pngk: 3.45 }
    ];

    const renderCustomDot = (props) => {
        const { cx, cy, stroke } = props;
        return (
            <svg x={cx - 4} y={cy - 4} width={8} height={8} fill={stroke} viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="4" stroke="none" />
            </svg>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Carta Prestasi</h1>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-8">Analisis Terperinci PNG vs PNGK</h3>
                
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} dy={10} />
                            <YAxis domain={[0, 4.0]} ticks={[0, 1, 2, 3, 4]} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 500}} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                            <Line 
                                type="monotone" 
                                dataKey="png" 
                                name="PNG (Semester)" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                dot={renderCustomDot}
                                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="pngk" 
                                name="PNGK (Kumulatif)" 
                                stroke="#93c5fd" 
                                strokeWidth={3} 
                                strokeDasharray="5 5"
                                dot={renderCustomDot}
                                activeDot={{ r: 6, fill: '#93c5fd', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-gray-50 text-gray-600 rounded-full">
                        <Medal size={32} />
                    </div>
                    <div>
                        <p className="text-gray-900 font-bold mb-1">Prestasi Terbaik</p>
                        <p className="text-2xl font-black text-blue-500">Semester 4 - PNG 3.85</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                        <Clock size={32} />
                    </div>
                    <div>
                        <p className="text-gray-900 font-bold mb-1">Jam Kredit Terkumpul</p>
                        <p className="text-2xl font-black text-blue-500">Total Kredit 90 Jam</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
