import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function ChatSidebar({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) {
  return (
    <div className="w-72 h-full border-r border-white/5 flex flex-col bg-dark-900/50">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <motion.button
          onClick={onNewChat}
          className="btn-primary w-full !text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} />
          New Chat
        </motion.button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 mb-1 cursor-pointer transition-all duration-200 ${
                activeChatId === chat.id
                  ? 'bg-accent-purple/10 border border-accent-purple/20 text-white'
                  : 'hover:bg-white/5 text-dark-100 hover:text-white border border-transparent'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={14} className="shrink-0" />
              <span className="flex-1 text-sm truncate">{chat.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {chats.length === 0 && (
          <div className="text-center py-8 text-dark-300 text-sm">
            <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
