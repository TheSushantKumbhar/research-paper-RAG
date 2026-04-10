import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function Citations({ citations }) {
  const [expanded, setExpanded] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
      className="mt-3"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-medium text-accent-purple hover:text-accent-cyan transition-colors"
      >
        <BookOpen size={13} />
        <span>{citations.length} source{citations.length > 1 ? 's' : ''} cited</span>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="mt-2 space-y-2">
          {citations.map((citation, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-3 text-xs"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-accent-purple/15 flex items-center justify-center text-[10px] font-bold text-accent-purple">
                  {i + 1}
                </div>
                <span className="font-semibold text-accent-cyan truncate">
                  {citation.paper_name}
                </span>
              </div>
              <p className="text-dark-200 leading-relaxed pl-7">
                "{citation.snippet}"
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
