import React from 'react';
import { LayoutDashboard, Trophy, Settings, User, Award } from 'lucide-react';
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
        <div className="min-h-screen bg-slate-950 text-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col">
                <div className="p-6">
                    <h1
                        className="text-2xl font-bold text-blue-500 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate('/')}
                    >
                        <Award className="w-8 h-8" />
                        Мои олимпиады
                    </h1>
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
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
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

export default MainLayout;
