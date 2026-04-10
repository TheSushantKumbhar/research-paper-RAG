import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, BookOpen, Search, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black bg-dots flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.02] blur-[100px] rounded-full pointer-events-none" />

      {/* Nav */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Layers className="text-white" size={20} />
          <span className="text-white font-semibold tracking-tight">Research Spaces</span>
        </div>
        <div>
          {user ? (
            <button onClick={() => navigate('/spaces')} className="text-sm font-medium text-stone-400 hover:text-white transition-colors">
              Go to Spaces
            </button>
          ) : (
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-stone-400 hover:text-white transition-colors">Sign In</button>
              <button onClick={() => navigate('/signup')} className="text-sm font-medium text-black bg-white px-4 py-2 rounded-full hover:scale-105 transition-transform">Get Started</button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-stone-300 text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            RAG Pipeline Active
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
            Chat with your <br />
            <span className="text-stone-500">research papers.</span>
          </h1>
          
          <p className="text-lg text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload PDFs to isolated environments, instantly extract knowledge, and ask complex questions powered by local embeddings and Gemini.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/spaces' : '/signup')}
              className="bg-white text-black px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform elegant-shadow"
            >
              Start Researching
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 mt-32 relative z-10 w-full"
      >
        {[
          { icon: <BookOpen />, title: 'Namespace Isolation', desc: 'Every research space is a siloed knowledge base. Contexts never mix.' },
          { icon: <Zap />, title: 'Local Embeddings', desc: 'Powered by Ollama mxbai-embed-large for rapid, private indexing.' },
          { icon: <Search />, title: 'Deep Citations', desc: 'Every answer maps back directly to exact snippets from your uploaded papers.' }
        ].map((feat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-[#0a0a0a] border border-[#222]">
            <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#333] flex items-center justify-center text-white mb-4">
              {feat.icon}
            </div>
            <h3 className="text-white font-medium mb-2">{feat.title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
