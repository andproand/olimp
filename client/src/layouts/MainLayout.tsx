import React from 'react';
import { LayoutDashboard, Trophy, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
    children: React.ReactNode;
}

import { useNavigate, useLocation } from 'react-router-dom';

const MainLayout = ({ children }: MainLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 fixed top-0 left-0 right-0 h-16 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="Logo" className="w-auto h-8 object-contain" />
                    <span className="font-bold text-lg text-white">Олимп</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-300">8 класс</span>
                </div>
            </header>

            {/* Sidebar (Desktop) */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col shrink-0">
                <div className="p-6">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/')}
                    >
                        <img src="/logo.png" alt="Logo" className="w-auto h-[172px] object-contain" />
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem
                        icon={<LayoutDashboard />}
                        label="Дашборд"
                        active={isActive('/')}
                        onClick={() => navigate('/')}
                    />
                    <NavItem
                        icon={<Trophy />}
                        label="Олимпиады"
                        active={isActive('/olympiads') || isActive('/olympiads/new') || location.pathname.startsWith('/olympiad/')}
                        onClick={() => navigate('/olympiads')}
                    />
                    <NavItem
                        icon={<Settings />}
                        label="Настройки"
                        active={isActive('/settings')}
                        onClick={() => navigate('/settings')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-900">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Ученик</p>
                            <p className="text-xs text-slate-400">8 класс</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0">
                <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="flex md:hidden justify-around items-center fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 z-50 px-4">
                <MobileNavItem
                    icon={<LayoutDashboard />}
                    label="Дашборд"
                    active={isActive('/')}
                    onClick={() => navigate('/')}
                />
                <MobileNavItem
                    icon={<Trophy />}
                    label="Олимпиады"
                    active={isActive('/olympiads') || isActive('/olympiads/new') || location.pathname.startsWith('/olympiad/')}
                    onClick={() => navigate('/olympiads')}
                />
                <MobileNavItem
                    icon={<Settings />}
                    label="Настройки"
                    active={isActive('/settings')}
                    onClick={() => navigate('/settings')}
                />
            </nav>
        </div>
    );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            )}
        >
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
            {label}
        </button>
    );
};

const MobileNavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-all flex-1 max-w-[100px]",
                active
                    ? "text-blue-500 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
            )}
        >
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
};

export default MainLayout;
