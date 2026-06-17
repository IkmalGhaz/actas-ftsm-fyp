import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    BarChart3,
    BrainCircuit,
    Star,
    LogOut,
    MonitorPlay,
    MessageSquare,
    FileText,
    Users,
    Settings
} from 'lucide-react';

export default function SidebarLayout({ children }) {
    const location = useLocation();
    const navigate  = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { nama: 'Pengguna', no_matrik: 'A000000', role: 'pelajar' };
    const isKP      = user.role === 'kp';
    const isPegawai = user.role === 'pegawai';

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const studentNavItems = [
        { name: 'Papan Pemuka',     path: '/dashboard',        icon: LayoutDashboard },
        { name: 'Semakan Kredit',   path: '/semakan-kredit',   icon: CheckSquare },
        { name: 'Carta Prestasi',   path: '/carta-prestasi',   icon: BarChart3 },
        { name: 'Perancangan Pintar', path: '/simulator',      icon: BrainCircuit },
        { name: 'Penilaian Subjek', path: '/penilaian-subjek', icon: Star },
    ];

    const kpNavItems = [
        { name: 'Papan Pemuka',   path: '/kp/dashboard',      icon: LayoutDashboard },
        { name: 'Pantau Kursus',  path: '/kp/pantau-kursus',  icon: MonitorPlay },
        { name: 'Analisis Gred',  path: '/kp/analisis-gred',  icon: BarChart3 },
        { name: 'Maklum Balas',   path: '/kp/maklum-balas',   icon: MessageSquare },
    ];

    const pegawaiNavItems = [
        { name: 'Jana Laporan',    path: '/pegawai/jana-laporan', icon: FileText },
        { name: 'Urus Data Pelajar', path: '/pegawai/urus-pelajar', icon: Users },
        { name: 'Tetapan Sistem',  path: '/pegawai/tetapan',     icon: Settings },
    ];

    const navItems = isKP ? kpNavItems : (isPegawai ? pegawaiNavItems : studentNavItems);

    // ── Sidebar theme per role ─────────────────────────────────────────
    // Student: deep navy  |  KP: light blue  |  Pegawai: white/gradient
    const isDark = !isKP && !isPegawai;

    const sidebarBg = isDark
        ? 'bg-[#0B1536] text-white'
        : isKP
            ? 'bg-[#EBF0FF] text-gray-700'
            : 'bg-gradient-to-b from-slate-50 to-white text-gray-700 border-r border-gray-100';

    const activeLink = isDark
        ? 'bg-white/10 text-white border-l-[3px] border-[#F5A623] rounded-r-xl'
        : 'bg-white text-[#003082] shadow-sm rounded-xl font-bold border-l-[3px] border-[#003082]';

    const inactiveLink = isDark
        ? 'text-slate-400 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
        : isKP
            ? 'text-gray-500 hover:bg-blue-50 hover:text-[#003082] border-l-[3px] border-transparent rounded-xl'
            : 'text-gray-500 hover:bg-slate-100 hover:text-[#003082] border-l-[3px] border-transparent rounded-xl';

    const activeIcon  = isDark ? 'text-white' : 'text-[#003082]';
    const inactiveIcon = isDark ? 'text-slate-400' : 'text-gray-400';

    const roleLabelColor = isDark ? 'bg-[#F5A623]/20 text-[#F5A623]' : 'bg-blue-100 text-blue-700';
    const nameColor = isDark ? 'text-white' : 'text-gray-800';
    const avatarBg  = isDark ? 'bg-[#003082] text-white ring-2 ring-white/10' : 'bg-blue-100 text-blue-700';
    const logoutHover = isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50';
    const dividerColor = isDark ? 'border-white/10' : 'border-gray-200';

    const roleLabel = isKP ? 'Ketua Program' : isPegawai ? 'Pegawai FTSM' : 'Pelajar';

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">

            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className={`w-64 hidden md:flex flex-col ${sidebarBg}`}>

                {/* Branding */}
                <div className={`px-5 pt-5 pb-4 flex items-center gap-3 border-b ${dividerColor} mb-2`}>
                    <img src="/favicon.svg" alt="ACTAS" className="w-9 h-9 rounded-xl flex-shrink-0" />
                    <div className="min-w-0">
                        <h1 className={`text-[15px] font-extrabold tracking-wide leading-tight ${isDark ? 'text-white' : 'text-[#003082]'}`}>
                            ACTAS-FTSM
                        </h1>
                        <p className={`text-[10px] font-semibold uppercase tracking-widest opacity-55 ${isDark ? 'text-white' : 'text-gray-500'}`}>
                            {isKP ? 'Ketua Program' : isPegawai ? 'Pegawai FTSM' : 'Portal Pelajar'}
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-0.5 py-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-4 py-3 gap-3 transition-all text-sm font-medium ${isActive ? activeLink : inactiveLink}`}
                            >
                                <item.icon size={18} className={isActive ? activeIcon : inactiveIcon} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User profile + Logout */}
                <div className={`px-3 pb-4 pt-3 space-y-1 border-t ${dividerColor}`}>
                    {/* Avatar + name + role */}
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100/60'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarBg}`}>
                            {user.nama.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${nameColor}`}>
                                {user.nama.split(' ')[0]}
                            </p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${roleLabelColor}`}>
                                {roleLabel}
                            </span>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-2.5 gap-3 rounded-xl transition-colors text-sm font-medium ${logoutHover}`}
                    >
                        <LogOut size={16} />
                        <span>Log Keluar</span>
                    </button>
                </div>
            </aside>

            {/* ── Main area ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Top header */}
                <header className="bg-white border-b border-gray-100 px-8 py-3.5 flex justify-between items-center flex-shrink-0">
                    <div />
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-800 leading-tight">{user.nama}</p>
                            <p className="text-xs text-gray-500 font-medium">
                                {isKP ? 'Ketua Program' : isPegawai ? 'Pegawai FTSM' : user.no_matrik}
                            </p>
                        </div>
                        <div className="h-9 w-9 bg-[#003082] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {user.nama.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
