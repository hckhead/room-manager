import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, BedDouble, Users, TrendingUp, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
    const { logout } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: '대시보드', to: '/' },
        { icon: BedDouble, label: '방 관리', to: '/rooms' },
        { icon: Users, label: '입실자 관리', to: '/residents' },
        { icon: TrendingUp, label: '재무 현황', to: '/finance' },
    ];

    return (
        <div className={cn("h-full bg-slate-900 text-white flex flex-col border-r border-slate-800", className)}>
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight">Room Manager</h1>
                <p className="text-xs text-slate-400 mt-1">Enterprise Edition</p>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onNavigate}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    로그아웃
                </Button>
            </div>
        </div>
    );
}
