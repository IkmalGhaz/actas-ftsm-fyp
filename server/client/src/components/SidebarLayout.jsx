import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    CheckSquare, 
    BarChart3, 
    BrainCircuit, 
    Star, 
    LogOut,
    GraduationCap
} from 'lucide-react';

export default function SidebarLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { nama: 'Pelajar', no_matrik: 'A000000' };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = [
        { name: 'Papan Pemuka', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Semakan Kredit Bergraduasi', path: '/semakan-kredit', icon: CheckSquare },
        { name: 'Carta Prestasi', path: '/carta-prestasi', icon: BarChart3 },
        { name: 'Perancangan Pintar', path: '/simulator', icon: BrainCircuit },
        { name: 'Penilaian Subjek', path: '/penilaian-subjek', icon: Star },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0B1536] text-white flex flex-col justify-between hidden md:flex">
                <div>
                    <div className="p-6 flex items-center space-x-3 mb-6">
                        <div className="bg-blue-500 p-2 rounded-lg">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold tracking-wider">ACTAS-FTSM</h1>
                    </div>
                    
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-6 py-3.5 space-x-4 transition-colors ${
                                        isActive 
                                        ? 'bg-blue-500 border-l-4 border-blue-400 text-white' 
                                        : 'text-gray-400 hover:bg-[#15234B] hover:text-white border-l-4 border-transparent'
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-white" : "text-gray-400"} />
                                    <span className="font-medium text-sm">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 mb-4">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-gray-400 hover:text-white hover:bg-[#15234B] rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Log Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header (Optional for mobile/desktop profile view) */}
                <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-end items-center">
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                            <p className="text-xs text-gray-500">{user.no_matrik}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
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
