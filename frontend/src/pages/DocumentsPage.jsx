import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, Check, Loader, AlertCircle } from 'lucide-react';
import { documentsAPI } from '../api/client';

export default function DocumentsPage() {
  const { spaceId } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, [spaceId]);

  async function loadDocuments() {
    try {
      const data = await documentsAPI.list(spaceId);
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file) {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setUploadProgress('Processing document...');

    try {
      const doc = await documentsAPI.upload(spaceId, file);
      setDocuments([doc, ...documents]);
      setUploadProgress('');
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadProgress(`Error: ${err.message}`);
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(docId) {
    if (!confirm('Delete this document? Its vectors will also be removed from the knowledge base.')) return;
    try {
      await documentsAPI.delete(spaceId, docId);
      setDocuments(documents.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className={`border-[1.5px] border-dashed p-12 text-center transition-all duration-300 cursor-pointer mb-12 bg-[#050505] rounded-[24px] ${
          dragOver
            ? 'border-white bg-[#111]'
            : 'border-[#333] hover:border-[#555] hover:bg-[#0a0a0a]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader size={24} className="text-white animate-spin" strokeWidth={2} />
            <p className="text-sm font-semibold text-white">{uploadProgress}</p>
            <p className="text-xs text-stone-500">
              Extracting text and generating vector embeddings
            </p>
          </div>
        ) : (
          <div className="py-2">
            <div className="w-14 h-14 rounded-full border border-[#333] bg-[#111] flex items-center justify-center mx-auto mb-6">
              <Upload size={20} className="text-stone-300" strokeWidth={2}/>
            </div>
            <p className="text-xl font-bold text-white mb-2 tracking-tight">
              Upload Research Paper
            </p>
            <p className="text-stone-500 text-sm">
              Drag & drop a PDF file here or click to browse
            </p>
          </div>
        )}
      </motion.div>

      {/* Upload status */}
      <AnimatePresence>
        {uploadProgress && !uploading && uploadProgress.startsWith('Error') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-red-950/30 border border-red-900 rounded-2xl p-4 flex items-center gap-3 text-sm font-medium text-red-400"
          >
            <AlertCircle size={16} strokeWidth={2} />
            <span>{uploadProgress}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents List */}
      <div className="border-t border-[#222] pt-8">
        <h3 className="text-sm font-semibold text-stone-400 mb-6 flex items-center gap-2">
          Knowledge Base 
          <span className="px-2 py-0.5 bg-[#111] border border-[#333] text-stone-300 rounded-full text-[10px]">
            {documents.length}
          </span>
        </h3>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 border border-[#222] border-dashed rounded-2xl">
            <p className="text-stone-500 text-sm font-medium">No documents uploaded to this space yet.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="group flex items-center justify-between p-4 border border-[#222] bg-[#050505] rounded-[16px] hover:border-[#444] transition-all hover:bg-[#0a0a0a]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-[10px] border border-[#333] bg-[#111] flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-stone-300" strokeWidth={2}/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate mb-1 pr-4">{doc.filename}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                          <Check size={12} className="text-green-500" strokeWidth={3}/>
                          {doc.num_chunks} chunks
                        </span>
                        <span className="text-xs text-stone-600 font-medium tracking-wide">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-500 p-2 transition-all block max-md:opacity-100 hover:bg-red-500/10 rounded-lg"
                    title="Delete document"
                  >
                    <Trash2 size={16} strokeWidth={2}/>
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
