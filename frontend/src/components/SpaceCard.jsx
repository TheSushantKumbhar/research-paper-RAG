import { motion } from 'framer-motion';
import { FileText, Calendar } from 'lucide-react';

export default function SpaceCard({ space, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      onClick={onClick}
      className="glass-card glass-card-hover rounded-2xl p-6 cursor-pointer group transition-all duration-300"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-accent-purple/5 to-accent-cyan/5 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 flex items-center justify-center border border-accent-purple/20">
            <FileText size={20} className="text-accent-purple" />
          </div>
          <span className="text-xs text-dark-200 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(space.created_at).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent-purple transition-colors">
          {space.name}
        </h3>

        {space.description && (
          <p className="text-sm text-dark-200 mb-4 line-clamp-2">{space.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-dark-100">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2.5 py-1.5">
            <FileText size={12} />
            <span>{space.document_count || 0} papers</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
