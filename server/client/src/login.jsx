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
                if (response.data.user.role === 'kp') {
                    navigate('/kp/dashboard');
                } else if (response.data.user.role === 'pegawai') {
                    navigate('/pegawai/jana-laporan');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            // For demo purpose, if backend is down or fails, bypass login
            if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
                if (noMatrik.toUpperCase().startsWith('KP')) {
                    localStorage.setItem('user', JSON.stringify({ nama: 'Dr. Rodziah', no_matrik: noMatrik, role: 'kp' }));
                    navigate('/kp/dashboard');
                } else if (noMatrik.toUpperCase().startsWith('P')) {
                    localStorage.setItem('user', JSON.stringify({ nama: 'En. Afiq', no_matrik: noMatrik, role: 'pegawai' }));
                    navigate('/pegawai/jana-laporan');
                } else {
                    localStorage.setItem('user', JSON.stringify({ nama: 'Ahmad Aliff', no_matrik: noMatrik || 'A123456', role: 'pelajar' }));
                    navigate('/dashboard');
                }
            } else {
                alert(error.response?.data?.message || "Pelayan bermasalah");
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F0F7FF]">
            {/* Left Side: Images */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-100 overflow-hidden relative border-r border-gray-200">
                <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-1 p-2 bg-gray-200">
                    <img className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Campus 1" />
                    <img className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Campus 2" />
                    <img className="object-cover w-full h-full col-span-2 row-span-2 hover:scale-105 transition-transform duration-500" src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Campus 3" />
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <div className="w-full max-w-[480px] p-10 space-y-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="text-center flex flex-col items-center">
                        <div className="flex space-x-6 mb-6 items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/UKM_logo.svg/1200px-UKM_logo.svg.png" alt="UKM Logo" className="h-16 object-contain" />
                            <div className="h-16 w-px bg-gray-200"></div>
                            <div className="text-left">
                                <p className="font-extrabold text-gray-800 text-xs tracking-wider uppercase leading-tight">Fakulti<br/>Teknologi Dan<br/>Sains Maklumat</p>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-blue-500 flex items-center justify-center gap-2 mt-2">
                            <div className="bg-blue-500 text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                            </div>
                            ACTAS-FTSM
                        </h2>
                        <p className="mt-3 text-2xl font-bold text-gray-800">Sistem Analisis Kredit</p>
                    </div>
                    
                    <form className="mt-10 space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nombor Matrik / UKMPer / Pengenalan</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                placeholder="Cth: KP12345 (Ketua Program) atau A12345 (Pelajar)"
                                value={noMatrik}
                                onChange={(e) => setNoMatrik(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kata Laluan</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50/50"
                                placeholder="Masukkan Kata Laluan"
                                value={katalaluan}
                                onChange={(e) => setKatalaluan(e.target.value)}
                            />
                        </div>
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full px-4 py-3.5 text-white font-bold bg-[#3b82f6] rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-md active:scale-[0.98]"
                            >
                                Log Masuk
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <a href="#" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">Lupa Kata Laluan?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;