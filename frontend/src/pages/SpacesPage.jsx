import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { spacesAPI } from '../api/client';
import SpaceCard from '../components/SpaceCard';

export default function SpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSpaces();
  }, []);

  async function loadSpaces() {
    try {
      const data = await spacesAPI.list();
      setSpaces(data);
    } catch (err) {
      console.error('Failed to load spaces:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);

    try {
      const space = await spacesAPI.create({ name: newName.trim(), description: newDesc.trim() });
      setSpaces([space, ...spaces]);
      setShowModal(false);
      setNewName('');
      setNewDesc('');
    } catch (err) {
      console.error('Failed to create space:', err);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-12 border-b border-[#222] pb-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Your Spaces
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-stone-400 mt-2 text-sm"
          >
            Isolated knowledge environments
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 rounded-[12px] font-medium flex items-center gap-2 hover:scale-105 transition-transform elegant-shadow"
        >
          <Plus size={16} strokeWidth={2} />
          <span>New Space</span>
        </motion.button>
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 border border-[#222] rounded-[24px]" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 border border-dashed border-[#333] rounded-[24px] bg-[#050505]"
        >
          <div className="w-12 h-12 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#333]">
            <Plus className="text-stone-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No spaces yet</h3>
          <p className="text-stone-400 text-sm mb-6 max-w-sm mx-auto">
            Create an isolated environment to upload papers and run specialized RAG queries.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary rounded-[12px]">
            Create First Space
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space, i) => (
            <SpaceCard
              key={space.id}
              space={space}
              index={i}
              onClick={() => navigate(`/spaces/${space.id}/chat`)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              className="bg-[#050505] border border-[#222] p-8 w-full max-w-md shadow-2xl rounded-[24px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">New Space</h2>
                <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-white transition-colors">
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Space Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g., Transformer Architectures"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-400 mb-2">Description <span className="opacity-50">(optional)</span></label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Brief description of the context within this space"
                    rows={3}
                    className="input-field max-h-32 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={creating} className="btn-primary w-full rounded-[12px]">
                    {creating ? (
                      <div className="loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    ) : (
                      'Create Space'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
