import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginStudent } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      return setError('Email and password are required.');
    }

    setLoading(true);
    try {
      const { data } = await loginStudent(form);
      login(data.token, data.student);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        {/* Animated Left Side - The Action Format */}
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to manage your grievances</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-pulse" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Login to Portal'}
            </button>
          </form>

          <div className="auth-link">
            Don&apos;t have an account? <Link to="/register">Register here</Link>
          </div>
        </div>

        {/* Static Right Side - Premium Landing Information */}
        <div className="auth-hero hero-slide-right">
          <h1>Get Your Grievance Resolved.</h1>
          <p>
            Experience a seamless, fast, and transparent way to share your concerns. Let us help you elevate your student experience securely and confidently.
          </p>
        </div>

      </div>
    </div>
  );
}
