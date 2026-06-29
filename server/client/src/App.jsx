import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
import ResetPassword from './ResetPassword';
import Dashboard from './dashboard';
import Simulator from './Simulator';
import SemakanKredit from './SemakanKredit';
import CartaPrestasi from './CartaPrestasi';
import PenilaianSubjek from './PenilaianSubjek';
import SidebarLayout from './components/SidebarLayout';
import DashboardKP from './DashboardKP';
import PantauKursus from './PantauKursus';
import AnalisisGred from './AnalisisGred';
import MaklumBalasKP from './MaklumBalasKP';
import JanaLaporan from './JanaLaporan';
import UrusDataPelajar from './UrusDataPelajar';
import KonfigurasiSistem from './KonfigurasiSistem';
import TambahKursus from './TambahKursus';

const ProtectedRoute = ({ children, roles }) => {
    const raw = localStorage.getItem('user');
    if (!raw) return <Navigate to="/" replace />;
    const user = JSON.parse(raw);
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return <SidebarLayout>{children}</SidebarLayout>;
};

function App() {
    return (
        <Router>
            <div className="App font-sans bg-gray-50 text-gray-900 min-h-screen">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Pelajar Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute roles={['pelajar']}><Dashboard /></ProtectedRoute>} />
                    <Route path="/simulator" element={<ProtectedRoute roles={['pelajar']}><Simulator /></ProtectedRoute>} />
                    <Route path="/semakan-kredit" element={<ProtectedRoute roles={['pelajar']}><SemakanKredit /></ProtectedRoute>} />
                    <Route path="/carta-prestasi" element={<ProtectedRoute roles={['pelajar']}><CartaPrestasi /></ProtectedRoute>} />
                    <Route path="/penilaian-subjek" element={<ProtectedRoute roles={['pelajar']}><PenilaianSubjek /></ProtectedRoute>} />
                    <Route path="/tambah-kursus" element={<ProtectedRoute roles={['pelajar']}><TambahKursus /></ProtectedRoute>} />

                    {/* Ketua Program Routes */}
                    <Route path="/kp/dashboard" element={<ProtectedRoute roles={['kp']}><DashboardKP /></ProtectedRoute>} />
                    <Route path="/kp/pantau-kursus" element={<ProtectedRoute roles={['kp']}><PantauKursus /></ProtectedRoute>} />
                    <Route path="/kp/analisis-gred" element={<ProtectedRoute roles={['kp']}><AnalisisGred /></ProtectedRoute>} />
                    <Route path="/kp/maklum-balas" element={<ProtectedRoute roles={['kp']}><MaklumBalasKP /></ProtectedRoute>} />

                    {/* Pegawai Routes */}
                    <Route path="/pegawai/jana-laporan" element={<ProtectedRoute roles={['pegawai']}><JanaLaporan /></ProtectedRoute>} />
                    <Route path="/pegawai/urus-pelajar" element={<ProtectedRoute roles={['pegawai']}><UrusDataPelajar /></ProtectedRoute>} />
                    <Route path="/pegawai/tetapan" element={<ProtectedRoute roles={['pegawai']}><KonfigurasiSistem /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;