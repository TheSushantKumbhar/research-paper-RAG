import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/spaces')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Layers size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">Research Spaces</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-dark-100">{user?.username}</span>
            <motion.button
              onClick={handleLogout}
              className="btn-ghost !py-2 !px-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
