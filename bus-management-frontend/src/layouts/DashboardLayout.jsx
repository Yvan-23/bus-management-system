import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    Bus,
    Map,
    Calendar,
    Users,
    Ticket,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    UserCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active }) => {
    return (
        <Link
            to={to}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
            )}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout, user } = useAuth();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/', allowedTypes: ['Admin'] },
        { icon: Bus, label: 'Buses', to: '/buses', allowedTypes: ['Admin'] },
        { icon: Map, label: 'Routes', to: '/routes', allowedTypes: ['Admin', 'Driver'] }, // Driver visibility added previously
        { icon: Calendar, label: 'Schedules', to: '/schedules', allowedTypes: ['Admin'] },
        { icon: Users, label: 'Drivers', to: '/drivers', allowedTypes: ['Admin'] },
        { icon: Ticket, label: 'My Tickets', to: '/tickets', allowedTypes: ['Passenger', 'Client'] },
        { icon: UserCircle, label: 'Users', to: '/users', allowedTypes: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        user && item.allowedTypes.includes(user.userType || user.role || 'Passenger')
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-6 border-b border-slate-200 flex items-center justify-between lg:justify-center">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Bus size={32} />
                        <span className="text-xl font-bold tracking-tight">BusManager</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {filteredNavItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-500 hover:text-slate-700 p-2 -ml-2"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-slate-900">{user?.name || 'Guest User'}</div>
                            <div className="text-xs text-slate-500">{user?.role || 'Admin'}</div>
                        </div>
                        <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
