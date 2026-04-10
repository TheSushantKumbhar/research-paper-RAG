import { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, ArrowLeft, Trash2 } from 'lucide-react';
import { spacesAPI } from '../api/client';

export default function SpaceView() {
  const { spaceId } = useParams();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSpace();
  }, [spaceId]);

  async function loadSpace() {
    try {
      const data = await spacesAPI.get(spaceId);
      setSpace(data);
    } catch (err) {
      console.error('Failed to load space:', err);
      navigate('/spaces');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure? This will delete all documents, chats, and vectors in this space.')) return;
    try {
      await spacesAPI.delete(spaceId);
      navigate('/spaces');
    } catch (err) {
      console.error('Failed to delete space:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  const tabClass = (isActive) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/20'
        : 'text-dark-200 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* Space Header */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/spaces')}
            className="text-dark-200 hover:text-white transition-colors"
            whileHover={{ x: -2 }}
          >
            <ArrowLeft size={18} />
          </motion.button>

          <div>
            <h2 className="font-semibold text-white text-lg">{space?.name}</h2>
            {space?.description && (
              <p className="text-xs text-dark-300 mt-0.5">{space.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <nav className="flex gap-2">
            <NavLink to={`/spaces/${spaceId}/chat`} className={({ isActive }) => tabClass(isActive)}>
              <MessageSquare size={15} />
              Chat
            </NavLink>
            <NavLink to={`/spaces/${spaceId}/documents`} className={({ isActive }) => tabClass(isActive)}>
              <FileText size={15} />
              Documents
            </NavLink>
          </nav>

          <button onClick={handleDelete} className="btn-danger !py-1.5 !px-2.5">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet context={{ space, spaceId }} />
      </div>
    </div>
  );
}
