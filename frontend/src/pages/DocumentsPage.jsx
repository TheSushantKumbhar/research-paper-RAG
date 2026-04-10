import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, CheckCircle, Loader, AlertCircle } from 'lucide-react';
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
    setUploadProgress('Uploading and processing...');

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
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer mb-8 ${
          dragOver
            ? 'border-accent-purple bg-accent-purple/5'
            : 'border-white/10 hover:border-accent-purple/30 hover:bg-white/[0.02]'
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
          <div className="flex flex-col items-center gap-3">
            <Loader size={32} className="text-accent-purple animate-spin" />
            <p className="text-sm text-dark-100">{uploadProgress}</p>
            <p className="text-xs text-dark-300">
              Extracting text, generating embeddings, and storing vectors...
            </p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Upload size={24} className="text-accent-purple" />
            </div>
            <p className="text-white font-medium mb-1">
              Drop a PDF here or click to browse
            </p>
            <p className="text-dark-300 text-sm">
              PDFs will be chunked and embedded for semantic search
            </p>
          </>
        )}
      </motion.div>

      {/* Upload status */}
      <AnimatePresence>
        {uploadProgress && !uploading && uploadProgress.startsWith('Error') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle size={16} />
            {uploadProgress}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Uploaded Papers ({documents.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-dark-300 text-sm">
            <FileText size={32} className="mx-auto mb-3 opacity-40" />
            <p>No documents uploaded yet</p>
            <p className="text-xs mt-1">Upload research papers to build your knowledge base</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-4 mb-3 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/15 shrink-0">
                    <FileText size={18} className="text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{doc.filename}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-dark-300 flex items-center gap-1">
                        <CheckCircle size={11} className="text-green-500" />
                        {doc.num_chunks} chunks
                      </span>
                      <span className="text-xs text-dark-400">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity btn-danger !py-1.5"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
