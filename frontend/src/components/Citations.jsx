import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export default function Citations({ citations }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="grid grid-cols-1 mb-8 gap-3">
      {citations.map((cite, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring" }}
          className="group relative"
        >
          {/* Subtle glow border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity blur-sm pointer-events-none" />
          
          <div className="relative bg-[#050505] border border-[#222] p-5 rounded-[16px] group-hover:border-[#444] transition-all hover:elegant-shadow flex items-start gap-4">
            <div className="w-8 h-8 rounded-full border border-[#333] bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center text-stone-400 group-hover:text-white transition-colors">
              <span className="text-xs font-semibold">{index + 1}</span>
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className="text-sm font-semibold text-white truncate pr-4">
                  {cite.paper_name}
                </h4>
                <ExternalLink size={14} className="text-stone-600 group-hover:text-stone-300 transition-colors shrink-0" />
              </div>
              <p className="text-sm text-stone-400 leading-relaxed italic border-l-2 border-[#333] pl-4 py-1">
                "{cite.text.trim()}"
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
