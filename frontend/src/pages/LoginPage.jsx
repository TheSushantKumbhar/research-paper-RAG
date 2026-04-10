import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/spaces');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black bg-dots">
      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-10 text-center"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 elegant-shadow shadow-white/10">
            <Layers className="text-black" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-stone-400 text-sm">Sign in to your account</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring" }}
          className="bg-[#050505] border border-[#222] rounded-[24px] p-8 elegant-shadow"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-400 text-sm text-center bg-red-950/30 py-3 rounded-xl border border-red-900/50"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 !py-3 rounded-[12px]"
            >
              {loading ? (
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:text-stone-300 transition-colors font-medium">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
