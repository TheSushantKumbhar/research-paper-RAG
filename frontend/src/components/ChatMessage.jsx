import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import Citations from './Citations';

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`flex gap-4 px-6 py-5 ${isUser ? '' : 'bg-white/[0.015]'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-accent-blue/15 border border-accent-blue/20'
            : 'bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-accent-purple/20'
        }`}
      >
        {isUser ? (
          <User size={15} className="text-accent-blue" />
        ) : (
          <Bot size={15} className="text-accent-purple" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-medium mb-1.5 block ${isUser ? 'text-accent-blue' : 'text-accent-purple'}`}>
          {isUser ? 'You' : 'Research Assistant'}
        </span>

        <div className={`text-sm leading-relaxed text-dark-100 whitespace-pre-wrap ${isStreaming ? 'typing-cursor' : ''}`}>
          {message.content}
        </div>

        {!isUser && !isStreaming && message.citations && (
          <Citations citations={message.citations} />
        )}
      </div>
    </motion.div>
  );
}
