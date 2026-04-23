import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitGrievance } from '../api';

const CATEGORIES = ['Academic', 'Hostel', 'Transport', 'Other'];
const emptyForm = { title: '', description: '', category: 'Academic', status: 'Pending' };

export default function Dashboard() {
  const { student, logout } = useAuth();
  const navigate = useNavigate();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ── Submit grievance ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim() || !form.description.trim()) {
      return setFormError('Title and description are required.');
    }
    setSubmitLoading(true);
    try {
      await submitGrievance(form);
      setForm(emptyForm);
      setSuccess('Grievance submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setSubmitLoading(false);
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
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/my-grievances')}>My Grievances</button>
          <span>Hello, <strong>{student?.name}</strong></span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* CENTERED: Submit Form */}
        <div style={{ width: '100%' }}>
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <h2>Submit a Grievance</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Fill out the form below to submit a new ticket. We will look into it as soon as possible.
            </p>
            {formError && <div className="alert alert-error">{formError}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Short, descriptive title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={submitLoading}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={submitLoading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Please provide all relevant details..."
                  rows="5"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={submitLoading}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary btn-pulse" style={{ flex: 1 }} disabled={submitLoading}>
                  {submitLoading ? <><span className="spinner" /> Submitting...</> : 'Submit Grievance'}
                </button>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/my-grievances')}>
                  View My Tickets
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
