import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, Map, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/career-paths', icon: Compass, label: 'Explore' },
    { path: '/roadmap', icon: Map, label: 'Roadmap' },
    { path: '/chat', icon: MessageSquare, label: 'Mentor' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
      <div className="glass rounded-3xl p-2 flex items-center justify-around shadow-2xl border border-white/20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-3 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1",
                isActive ? "bg-white/20 text-blue-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="p-3 rounded-2xl text-slate-400 hover:text-red-400 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
