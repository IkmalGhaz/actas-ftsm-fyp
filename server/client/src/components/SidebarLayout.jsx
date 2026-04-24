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
    MessageSquare,
    FileText,
    Users,
    Settings
} from 'lucide-react';

export default function SidebarLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { nama: 'Pengguna', no_matrik: 'A000000', role: 'pelajar' };
    const isKP = user.role === 'kp';
    const isPegawai = user.role === 'pegawai';

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

    const pegawaiNavItems = [
        { name: 'Jana Laporan', path: '/pegawai/jana-laporan', icon: FileText },
        { name: 'Urus Data Pelajar', path: '/pegawai/urus-pelajar', icon: Users },
        { name: 'Tetapan Sistem', path: '/pegawai/tetapan', icon: Settings },
    ];

    let navItems = studentNavItems;
    let sidebarBgClass = 'bg-[#0B1536] text-white';
    let linkActiveClass = 'bg-blue-500 border-l-4 border-blue-600 text-white shadow-sm mx-2 rounded-lg';
    let linkInactiveClass = 'text-gray-400 hover:bg-[#15234B] hover:text-white border-l-4 border-transparent';
    let iconActiveClass = 'text-white';
    let iconInactiveClass = 'text-gray-400';
    let headerTextClass = 'text-white';
    let headerIconBg = 'bg-blue-500';
    let headerIconText = 'text-white';

    if (isKP) {
        navItems = kpNavItems;
        sidebarBgClass = 'bg-[#EBF0FF] text-gray-700';
        linkActiveClass = 'bg-blue-500 border-l-4 border-blue-600 text-white shadow-sm mx-2 rounded-lg';
        linkInactiveClass = 'text-gray-600 hover:bg-blue-100 hover:text-blue-700 border-l-4 border-transparent';
        iconInactiveClass = 'text-gray-500';
        headerTextClass = 'text-blue-600';
    } else if (isPegawai) {
        navItems = pegawaiNavItems;
        sidebarBgClass = 'bg-gradient-to-b from-blue-100 to-white text-gray-700 border-r border-blue-100';
        linkActiveClass = 'bg-white text-blue-600 shadow-sm mx-4 rounded-xl font-bold';
        linkInactiveClass = 'text-gray-600 hover:bg-blue-50/50 hover:text-blue-600 border-l-4 border-transparent mx-4 rounded-xl';
        iconActiveClass = 'text-blue-600';
        iconInactiveClass = 'text-gray-500';
        headerTextClass = 'text-gray-900';
        headerIconBg = 'bg-gray-900';
        headerIconText = 'text-white';
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`w-64 flex flex-col justify-between hidden md:flex ${sidebarBgClass}`}>
                <div>
                    <div className="p-6 flex items-center space-x-3 mb-6">
                        <div className={`${headerIconBg} p-2 rounded-lg shadow-sm`}>
                            <GraduationCap size={24} className={headerIconText} />
                        </div>
                        <h1 className={`text-xl font-bold tracking-wider ${headerTextClass}`}>
                            {isKP ? 'ACTAS-FTSM KP' : (isPegawai ? 'Pegawai FTSM' : 'ACTAS-FTSM')}
                        </h1>
                    </div>
                    
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3.5 space-x-4 transition-colors font-medium text-sm ${
                                        isActive ? linkActiveClass : linkInactiveClass
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? iconActiveClass : iconInactiveClass} />
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
                            isKP || isPegawai
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
                            <p className="text-xs text-gray-500 font-medium">{isKP ? 'Ketua Program' : (isPegawai ? 'Pegawai FTSM' : user.no_matrik)}</p>
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
