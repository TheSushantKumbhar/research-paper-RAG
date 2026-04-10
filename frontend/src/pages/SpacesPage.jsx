import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Your Spaces
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-dark-200 mt-1"
          >
            Create isolated knowledge bases for your research
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowModal(true)}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} />
          New Space
        </motion.button>
      </div>

      {/* Spaces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-cyan/10 flex items-center justify-center mx-auto mb-5 border border-white/5">
            <Sparkles size={32} className="text-accent-purple" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No spaces yet</h3>
          <p className="text-dark-200 text-sm mb-6 max-w-sm mx-auto">
            Create your first research space to start uploading papers and asking questions
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} />
            Create First Space
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card rounded-2xl p-8 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Create New Space</h2>
                <button onClick={() => setShowModal(false)} className="text-dark-300 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-2">Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g., Transformer Papers"
                    className="input-field"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-100 mb-2">Description (optional)</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="What papers will you explore in this space?"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" disabled={creating} className="btn-primary w-full">
                  {creating ? (
                    <div className="loading-dots">
                      <span></span><span></span><span></span>
                    </div>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Space
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
