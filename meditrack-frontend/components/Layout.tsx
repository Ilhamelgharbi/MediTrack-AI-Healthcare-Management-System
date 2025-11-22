import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Home, User, Users, Activity, LogOut, Bell, MessageSquare, Pill, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isChatPage = location.pathname === '/chat';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = user?.role === 'admin'
    ? [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/patients', icon: Users, label: 'Patients' },
        { path: '/chat', icon: MessageSquare, label: 'AI Assistant' }
      ]
    : [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/patients/me', icon: User, label: 'My Health Profile' },
        { path: '/medications', icon: Pill, label: 'Medications' },
        { path: '/reminders', icon: Clock, label: 'Reminders' },
        { path: '/chat', icon: MessageSquare, label: 'AI Assistant' }
      ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#1A2B44] text-white transition-all duration-300 ease-in-out shadow-xl
          ${sidebarOpen ? 'w-64' : 'w-20'} overflow-hidden
        `}
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-3 h-20">
          <div className="bg-[#2A7EF0] p-2 rounded-lg">
            <Activity size={24} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight font-heading">MediTrack AI</span>}
        </div>

        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-[#2A7EF0] text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10 bg-[#152338]">
           <button 
            onClick={handleLogout}
            className={`flex items-center gap-4 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} h-screen`}>
        {/* Navbar */}
        <header className="bg-white h-20 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-900 font-heading">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2A7EF0] to-blue-400 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                  {user?.avatar}
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/60 backdrop-blur-sm overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100/80">
                    <p className="text-sm font-semibold text-slate-900">{user?.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/medications"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Pill size={16} className="text-slate-500" />
                      <span>Medications</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User size={16} className="text-slate-500" />
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                    >
                      <LogOut size={16} className="text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-hidden ${isChatPage ? 'p-0' : 'p-8 max-w-7xl mx-auto w-full animate-fadeIn overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;