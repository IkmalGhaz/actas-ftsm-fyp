import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login';
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    if (!user) {
        return <Navigate to="/" replace />;
    }
    return <SidebarLayout>{children}</SidebarLayout>;
};

function App() {
    return (
        <Router>
            <div className="App font-sans bg-gray-50 text-gray-900 min-h-screen">
                <Routes>
                    <Route path="/" element={<Login />} />
                    
                    {/* Pelajar Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
                    <Route path="/semakan-kredit" element={<ProtectedRoute><SemakanKredit /></ProtectedRoute>} />
                    <Route path="/carta-prestasi" element={<ProtectedRoute><CartaPrestasi /></ProtectedRoute>} />
                    <Route path="/penilaian-subjek" element={<ProtectedRoute><PenilaianSubjek /></ProtectedRoute>} />

                    {/* Ketua Program Routes */}
                    <Route path="/kp/dashboard" element={<ProtectedRoute><DashboardKP /></ProtectedRoute>} />
                    <Route path="/kp/pantau-kursus" element={<ProtectedRoute><PantauKursus /></ProtectedRoute>} />
                    <Route path="/kp/analisis-gred" element={<ProtectedRoute><AnalisisGred /></ProtectedRoute>} />
                    <Route path="/kp/maklum-balas" element={<ProtectedRoute><MaklumBalasKP /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;