import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [noMatrik, setNoMatrik] = useState('');
    const [katalaluan, setKatalaluan] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                no_matrik: noMatrik,
                katalaluan: katalaluan
            });
            
            if (response.status === 200) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/dashboard');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Pelayan bermasalah");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-900">ACTAS-FTSM</h2>
                    <p className="mt-2 text-sm text-gray-500">Sistem Analisis Kredit & Prestasi Akademik</p>
                </div>
                
                <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">No Matrik</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Cth: A202965"
                            value={noMatrik}
                            onChange={(e) => setNoMatrik(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kata Laluan</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={katalaluan}
                            onChange={(e) => setKatalaluan(e.target.value)}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md"
                    >
                        Log Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;