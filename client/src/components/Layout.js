import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Settings, Wallet, Home, MessageSquare, BarChart3, Grid, BookOpen, Bell, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Grid, label: 'Apps', href: '/apps' },
    { icon: BookOpen, label: 'Templates', href: '#' },
    { icon: MessageSquare, label: 'Messages', href: '#' },
    { icon: BarChart3, label: 'Analytics', href: '#' },
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className={`font-bold text-white text-2xl ${sidebarOpen ? '' : 'text-center'}`}>
            {sidebarOpen ? '🚀 WABA BSP' : 'WB'}
          </h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-600 transition-all group"
              title={item.label}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t p-4 bg-gray-50">
          {sidebarOpen && (
            <div className="mb-4 pb-4 border-b">
              <p className="font-semibold text-sm text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
