import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-stone-200 font-sans">
      {/* Navbar bg */}
      <div className="fixed top-0 left-0 right-0 h-[64px] bg-[#000000]/70 backdrop-blur-md border-b border-[#222] z-40 transition-colors" />

      {/* Navbar Content */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between">
          <motion.div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/spaces')}
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Layers size={20} className="text-white" />
            <span className="text-lg font-bold text-white tracking-tight">Research Spaces</span>
          </motion.div>

          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-stone-400">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-xs uppercase tracking-widest text-stone-500 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content wrapper with pt-64 so it correctly sits under the fixed navbar */}
      <main className="flex-1 flex flex-col pt-[64px] w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
