import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    CheckSquare, 
    BarChart3, 
    BrainCircuit, 
    Star, 
    LogOut,
    GraduationCap,
    MonitorPlay,
    MessageSquare
} from 'lucide-react';

export default function SidebarLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { nama: 'Pengguna', no_matrik: 'A000000', role: 'pelajar' };
    const isKP = user.role === 'kp';

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const studentNavItems = [
        { name: 'Papan Pemuka', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Semakan Kredit', path: '/semakan-kredit', icon: CheckSquare },
        { name: 'Carta Prestasi', path: '/carta-prestasi', icon: BarChart3 },
        { name: 'Perancangan Pintar', path: '/simulator', icon: BrainCircuit },
        { name: 'Penilaian Subjek', path: '/penilaian-subjek', icon: Star },
    ];

    const kpNavItems = [
        { name: 'Papan Pemuka', path: '/kp/dashboard', icon: LayoutDashboard },
        { name: 'Pantau Kursus', path: '/kp/pantau-kursus', icon: MonitorPlay },
        { name: 'Analisis Gred', path: '/kp/analisis-gred', icon: BarChart3 },
        { name: 'Maklum Balas', path: '/kp/maklum-balas', icon: MessageSquare },
    ];

    const navItems = isKP ? kpNavItems : studentNavItems;

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`w-64 flex flex-col justify-between hidden md:flex ${isKP ? 'bg-[#EBF0FF] text-gray-700' : 'bg-[#0B1536] text-white'}`}>
                <div>
                    <div className="p-6 flex items-center space-x-3 mb-6">
                        <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <h1 className={`text-xl font-bold tracking-wider ${isKP ? 'text-blue-600' : 'text-white'}`}>
                            ACTAS-FTSM {isKP && 'KP'}
                        </h1>
                    </div>
                    
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-6 py-3.5 space-x-4 transition-colors font-medium text-sm ${
                                        isActive 
                                        ? 'bg-blue-500 border-l-4 border-blue-600 text-white shadow-sm mx-2 rounded-lg' 
                                        : isKP 
                                            ? 'text-gray-600 hover:bg-blue-100 hover:text-blue-700 border-l-4 border-transparent'
                                            : 'text-gray-400 hover:bg-[#15234B] hover:text-white border-l-4 border-transparent'
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-white" : (isKP ? "text-gray-500" : "text-gray-400")} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 mb-4">
                    <button 
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-3 space-x-3 rounded-lg transition-colors font-medium text-sm ${
                            isKP 
                            ? 'text-gray-600 hover:text-blue-700 hover:bg-blue-100' 
                            : 'text-gray-400 hover:text-white hover:bg-[#15234B]'
                        }`}
                    >
                        <LogOut size={20} />
                        <span>Log Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Optional for mobile/desktop profile view) */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-end items-center">
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800">{user.nama}</p>
                            <p className="text-xs text-gray-500 font-medium">{isKP ? 'Ketua Program' : user.no_matrik}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                            {user.nama.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
