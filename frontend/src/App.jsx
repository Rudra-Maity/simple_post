import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

// --- Icons ---
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6m4-6v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// --- Form Modal (Add / Edit) ---
function FormModal({ isOpen, onClose, onSubmit, initialData }) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setBody(initialData?.body || '');
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required.';
    if (!body.trim()) e.body = 'Body is required.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    await onSubmit({ title: title.trim(), body: body.trim() });
    setSubmitting(false);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{isEdit ? 'Edit Post' : 'New Post'}</span>
          <button style={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.field}>
            <label style={styles.label}>Title</label>
            <input
              style={{ ...styles.input, ...(errors.title ? styles.inputError : {}) }}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give it a title..."
              autoFocus
            />
            {errors.title && <p style={styles.fieldError}>{errors.title}</p>}
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Content Body</label>
            <textarea
              style={{ ...styles.input, ...styles.textarea, ...(errors.body ? styles.inputError : {}) }}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Spill your ideas..."
              rows={5}
            />
            {errors.body && <p style={styles.fieldError}>{errors.body}</p>}
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary, ...(submitting ? styles.btnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (isEdit ? 'Saving...' : 'Publishing...') : (isEdit ? 'Save Changes' : 'Publish Post')}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Delete Confirm Modal ---
function DeleteModal({ isOpen, post, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  if (!isOpen || !post) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...styles.modal, maxWidth: 380 }}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>Delete Post</span>
          <button style={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>
        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Are you sure you want to delete <strong style={{ color: '#111' }}>"{post.title}"</strong>? This cannot be undone.
          </p>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.btnGhost} onClick={onClose}>Cancel</button>
          <button
            style={{ ...styles.btn, ...styles.btnDanger, ...(deleting ? styles.btnDisabled : {}) }}
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---
export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formModal, setFormModal] = useState({ open: false, post: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, post: null });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/posts`);
      if (!res.ok) throw new Error('Failed to retrieve posts feed.');
      setPosts(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleAdd = async (data) => {
    try {
      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Could not publish post.');
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setFormModal({ open: false, post: null });
    } catch (e) { setError(e.message); }
  };



  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/posts/${deleteModal.post.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete the post.');
      setPosts(prev => prev.filter(p => p.id !== deleteModal.post.id));
      setDeleteModal({ open: false, post: null });
    } catch (e) {
      setError(e.message);
      setDeleteModal({ open: false, post: null });
    }
  };

  return (
    <div style={styles.page}>
      {/* NAV */}
      <nav style={styles.nav}>
        <span style={styles.logo}>PostDash</span>
        <button style={styles.navBtn} onClick={() => setFormModal({ open: true, post: null })}>
          + New Post
        </button>
      </nav>

      <main style={styles.main}>
        {/* ERROR */}
        {error && (
          <div style={styles.errorBanner}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>{error}</span>
          </div>
        )}

        {/* HEADER */}
        <div style={styles.pageHeader}>
          <span style={styles.pageTitle}>
            Community Feed <span style={styles.postCount}>({posts.length})</span>
          </span>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 40 }}>#</th>
                <th style={{ ...styles.th, width: '30%' }}>Title</th>
                <th style={styles.th}>Body</th>
                <th style={{ ...styles.th, textAlign: 'right', width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={styles.emptyCell}><span style={styles.spinner} /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={4} style={styles.emptyCell}>No posts yet — write the first one!</td></tr>
              ) : posts.map((post, i) => (
                <tr key={post.id} style={styles.tr}>
                  <td style={{ ...styles.td, color: '#aaa', fontSize: '0.78rem', fontFamily: 'monospace' }}>{i + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</td>
                  <td style={{ ...styles.td, color: '#6b7280', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.body}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      
                      <button
                        style={styles.iconBtn}
                        title="Delete"
                        onClick={() => setDeleteModal({ open: true, post })}
                        onMouseEnter={e => { e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.borderColor='#dc2626'; e.currentTarget.style.color='#dc2626'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.borderColor='#e4e4e0'; e.currentTarget.style.color='#6b7280'; }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODALS */}
      <FormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, post: null })}
        onSubmit={ handleAdd}
        initialData={formModal.post}
      />
      <DeleteModal
        isOpen={deleteModal.open}
        post={deleteModal.post}
        onClose={() => setDeleteModal({ open: false, post: null })}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// --- Styles ---
const styles = {
  page: { minHeight: '100vh', background: '#f5f5f0', fontFamily: "'DM Sans', sans-serif", color: '#1a1a18' },
  nav: { background: '#fff', borderBottom: '1px solid #e4e4e0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontFamily: 'monospace', fontWeight: 600, color: '#4f46e5', fontSize: '1.1rem', letterSpacing: '-0.02em' },
  navBtn: { background: '#4f46e5', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 7, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  main: { maxWidth: 860, margin: '0 auto', padding: '28px 20px' },
  errorBanner: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: '0.875rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { fontSize: '1rem', fontWeight: 600 },
  postCount: { fontSize: '0.8rem', color: '#6b7280', fontWeight: 400, marginLeft: 4 },
  tableWrap: { background: '#fff', border: '1px solid #e4e4e0', borderRadius: 10, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#fafaf8', fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #e4e4e0' },
  tr: { borderBottom: '1px solid #e4e4e0' },
  td: { padding: '12px 16px', fontSize: '0.88rem', verticalAlign: 'middle' },
  emptyCell: { textAlign: 'center', padding: 48, color: '#6b7280', fontSize: '0.9rem' },
  spinner: { display: 'inline-block', width: 22, height: 22, border: '2px solid #e4e4e0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  iconBtn: { background: 'none', border: '1px solid #e4e4e0', borderRadius: 6, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', transition: 'all 0.15s' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #e4e4e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '1rem', fontWeight: 600 },
  closeBtn: { background: 'none', border: 'none', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: '16px 20px' },
  modalFooter: { padding: '14px 20px', borderTop: '1px solid #e4e4e0', display: 'flex', gap: 8, justifyContent: 'flex-end' },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e4e4e0', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.875rem', color: '#1a1a18', background: '#f5f5f0', outline: 'none', boxSizing: 'border-box' },
  textarea: { resize: 'none', display: 'block' },
  inputError: { borderColor: '#dc2626' },
  fieldError: { fontSize: '0.78rem', color: '#dc2626', marginTop: 4 },
  btn: { padding: '8px 18px', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' },
  btnGhost: { padding: '8px 18px', borderRadius: 7, fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: '#f5f5f0', color: '#1a1a18', border: '1px solid #e4e4e0' },
  btnPrimary: { background: '#4f46e5', color: '#fff' },
  btnDanger: { background: '#dc2626', color: '#fff' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
};
