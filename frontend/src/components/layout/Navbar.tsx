import { useState, useRef, useEffect } from "react";
import { Bell, ChevronDown, Menu, X, Pill, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PatientAvatar from "@/components/patient/PatientAvatar";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (state: boolean) => void;
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white h-20 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Right section */}
      <div className="flex items-center gap-6">

        {/* Notification button */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200"></div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="hidden md:flex flex-col text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>

            {/* Avatar */}
            <PatientAvatar fullName={user?.full_name} size="md" />

            <ChevronDown
              size={16}
              className={`text-slate-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>

              <div className="py-2">

                <Link
                  to="/medications"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Pill size={16} />
                  <span>Medications</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>

              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
