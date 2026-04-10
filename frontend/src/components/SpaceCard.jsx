import { motion } from 'framer-motion';
import { FileText, ArrowRight } from 'lucide-react';

export default function SpaceCard({ space, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
      onClick={onClick}
      className="p-6 cursor-pointer group flex flex-col h-full bg-[#050505] border border-[#222] rounded-[24px] hover:border-[#444] transition-all hover:elegant-shadow"
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-[16px] border border-[#333] bg-[#121212] flex items-center justify-center text-white">
            <span className="text-xl font-medium">{space.name.charAt(0)}</span>
          </div>
          <motion.div 
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0"
          >
            <ArrowRight size={16} strokeWidth={2} />
          </motion.div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-stone-200 transition-colors">
          {space.name}
        </h3>
        
        {space.description && (
          <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">
            {space.description}
          </p>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-[#222] flex items-center gap-2 text-xs font-medium text-stone-500">
        <FileText size={14} strokeWidth={2} />
        <span>{space.document_count || 0} Documents</span>
      </div>
    </motion.div>
  );
}
