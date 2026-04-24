import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllGrievances, deleteGrievance, searchGrievances, updateGrievance } from '../api';

function categoryClass(cat) {
  const map = { Academic: 'badge-academic', Hostel: 'badge-hostel', Transport: 'badge-transport', Other: 'badge-other' };
  return map[cat] || 'badge-other';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function GrievanceList() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: 'Academic', status: 'Pending' });
  const [editId, setEditId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchGrievances = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAllGrievances({ page: p, limit: 6 });
      setGrievances(data.grievances);
      setTotalPages(data.pages);
      setTotal(data.total);
      setPage(p);
    } catch {
      setError('Failed to load grievances.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances(1);
  }, [fetchGrievances]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchGrievances(1);
    setSearching(true);
    setError('');
    try {
      const { data } = await searchGrievances(searchQuery);
      setGrievances(data.grievances);
      setTotalPages(1);
      setTotal(data.count);
      setPage(1);
    } catch {
      setError('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchGrievances(1);
  };

  // ── Edit ──
  const openEdit = (g) => {
    setEditId(g._id);
    setEditForm({ title: g.title, description: g.description, category: g.category, status: g.status });
    setEditError('');
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.title.trim() || !editForm.description.trim()) {
      return setEditError('Title and description are required.');
    }
    setEditLoading(true);
    try {
      await updateGrievance(editId, editForm);
      setEditModal(false);
      setSuccess('Grievance updated successfully!');
      fetchGrievances(page);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update grievance.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ──
  const openDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteGrievance(deleteId);
      setDeleteModal(false);
      setSuccess('Grievance deleted.');
      fetchGrievances(page > 1 && grievances.length === 1 ? page - 1 : page);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete grievance.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <span className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          📋 Grievance Portal
        </span>
        <div className="navbar-user">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>Back to Submit</button>
          <span>Hello, <strong>{student?.name}</strong></span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main Content strictly for reading/managing list */}
      <div style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header section with search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--gray-900)' }}>My Grievances</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>You have {total} total grievance(s).</p>
          </div>
          
          <form className="search-box" onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--gray-300)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
            />
            {searchQuery && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>Clear</button>
            )}
            <button type="submit" className="btn btn-primary btn-sm" disabled={searching}>
              {searching ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><span className="spinner" /> Loading tickets...</div>
        ) : grievances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
            <p style={{ color: 'var(--gray-500)', marginBottom: '16px' }}>No grievances found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Submit New Grievance</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {grievances.map((g) => (
                <div key={g._id} className="grievance-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className={`badge ${categoryClass(g.category)}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {g.category}
                    </span>
                    <span className={`badge ${g.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', background: g.status === 'Resolved' ? '#def7ec' : '#fef3c7', color: g.status === 'Resolved' ? '#047857' : '#b45309' }}>
                      {g.status}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--gray-900)' }}>{g.title}</h3>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1, whiteSpace: 'pre-wrap' }}>
                    {g.description.length > 80 ? g.description.substring(0, 80) + '...' : g.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{formatDate(g.createdAt)}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDelete(g._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                <button
                  className="btn btn-ghost"
                  disabled={page === 1}
                  onClick={() => fetchGrievances(page - 1)}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-600)', fontSize: '0.9rem' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-ghost"
                  disabled={page === totalPages}
                  onClick={() => fetchGrievances(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '450px' }}>
            <h2>Edit Grievance</h2>
            {editError && <div className="alert alert-error">{editError}</div>}
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm(prev => ({...prev, title: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm(prev => ({...prev, category: e.target.value}))}>
                  <option>Academic</option>
                  <option>Hostel</option>
                  <option>Transport</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" value={editForm.description} onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm(prev => ({...prev, status: e.target.value}))}>
                  <option>Pending</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2>Delete Grievance?</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: '24px' }}>Are you sure you want to permanently delete this grievance? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button className="btn btn-ghost" onClick={() => setDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}