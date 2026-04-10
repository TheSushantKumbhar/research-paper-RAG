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
    `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
      isActive
        ? 'border-white text-white'
        : 'border-transparent text-stone-500 hover:text-stone-300'
    }`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full max-w-[1600px] mx-auto">
      {/* Space Header */}
      <div className="border-b border-[#222] px-6 py-3 flex items-center justify-between bg-[#0a0a0a]">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/spaces')}
            className="text-stone-500 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={14} className="mr-1"/>
            Back
          </button>

          <div className="border-l border-[#222] pl-6">
            <h2 className="font-semibold text-white text-lg">{space?.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Tabs */}
          <nav className="flex gap-4">
            <NavLink to={`/spaces/${spaceId}/chat`} className={({ isActive }) => tabClass(isActive)}>
              <MessageSquare size={14} strokeWidth={2}/>
              Chat
            </NavLink>
            <NavLink to={`/spaces/${spaceId}/documents`} className={({ isActive }) => tabClass(isActive)}>
              <FileText size={14} strokeWidth={2} />
              Documents
            </NavLink>
          </nav>

          <div className="border-l border-[#222] pl-6">
            <button onClick={handleDelete} className="text-xs uppercase tracking-widest text-red-500/70 hover:text-red-500 flex items-center gap-1 transition-colors">
              <Trash2 size={13} strokeWidth={2}/>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden relative">
        <Outlet context={{ space, spaceId }} />
      </div>
    </div>
  );
}
