import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatSidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) {
  return (
    <div className="w-72 border-r border-[#222] bg-[#050505] flex flex-col pt-4">
      <div className="px-4 pb-4 border-b border-[#222]">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 border border-[#333] text-sm text-stone-200 hover:bg-white hover:text-black transition-all rounded-[12px] elegant-shadow hover:-translate-y-[1px]"
        >
          <Plus size={16} strokeWidth={2} />
          <span className="font-medium">New Thread</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <AnimatePresence mode="popLayout">
          {chats.map((chat) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-center justify-between px-3 py-2.5 cursor-pointer group transition-all rounded-[12px] ${
                activeChatId === chat.id
                  ? 'bg-[#1a1a1a] border border-[#333] text-white shadow-sm'
                  : 'border border-transparent text-stone-400 hover:bg-[#111] hover:text-stone-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <MessageSquare size={16} className={`shrink-0 ${activeChatId === chat.id ? 'text-white' : 'text-stone-500'}`} strokeWidth={1.5} />
                <span className="text-sm font-medium truncate">{chat.title || 'New Chat'}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-stone-500 hover:text-red-500 transition-all ${
                  activeChatId === chat.id ? 'opacity-40' : ''
                }`}
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {chats.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center px-4 py-12 text-stone-500 flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full border border-[#222] bg-[#111] flex items-center justify-center mb-3">
              <MessageSquare size={16} className="opacity-50" />
            </div>
            <p className="text-sm">No recent threads.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
