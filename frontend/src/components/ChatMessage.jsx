import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Citations from './Citations';

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`py-8 ${isUser ? 'bg-transparent' : 'bg-[#050505] border-y border-[#1a1a1a]'}`}
    >
      <div className="max-w-4xl mx-auto flex gap-6 px-6">
        <div className={`w-10 h-10 rounded-[12px] flex-shrink-0 flex items-center justify-center border ${
          isUser 
            ? 'border-[#333] bg-[#111] text-stone-300' 
            : 'border-white bg-white text-black elegant-shadow'
        }`}>
          {isUser ? <User size={18} strokeWidth={2} /> : <Bot size={18} strokeWidth={2} />}
        </div>
        
        <div className="flex-1 min-w-0 pt-1 leading-relaxed">
          <div className="prose prose-invert prose-stone max-w-none prose-p:leading-loose prose-pre:bg-[#111] prose-pre:border prose-pre:border-[#222] prose-pre:rounded-[12px]">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : isStreaming ? (
              <div className="typing-cursor h-6" />
            ) : null}
          </div>

          {!isUser && message.citations?.length > 0 && (
            <div className="mt-8 pt-6">
              <span className="block text-sm font-semibold text-stone-400 mb-4">
                Sources from your Knowledge Base
              </span>
              <Citations citations={message.citations} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
