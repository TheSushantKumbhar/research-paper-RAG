import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto w-full relative">
      <form onSubmit={handleSubmit} className="relative flex items-end bg-[#0a0a0a] border border-[#222] hover:border-[#444] transition-colors focus-within:border-[#666] rounded-[20px] elegant-shadow">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message RAG assistant..."
          className="w-full bg-transparent border-none outline-none text-white placeholder-stone-500 py-[18px] pl-6 pr-14 resize-none overflow-hidden min-h-[60px] text-sm font-medium"
          rows={1}
        />
        <motion.button
          type="submit"
          disabled={!input.trim() || disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-3 bottom-[9px] w-10 h-10 flex items-center justify-center bg-white text-black rounded-full focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-200 transition-colors"
        >
          <Send size={16} strokeWidth={2} className="mr-0.5 mt-0.5" />
        </motion.button>
      </form>
      <div className="text-center mt-3">
        <span className="text-[11px] font-medium text-stone-500">
          AI can make mistakes. Verify citations.
        </span>
      </div>
    </div>
  );
}
