import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signin } from '../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn, Calendar } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');
    if (!form.email || !form.password) {
      setInlineError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await signin(form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      let msg = '';
      if (!err.response) {
        msg = 'Server not running';
      } else if (err.response.status === 401 || err.response.status === 403 || err.response.status === 400) {
        msg = 'Invalid email or password';
      } else {
        msg = 'An error occurred during login';
      }
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow glow-1" />
      <div className="auth-glow glow-2" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Calendar size={28} />
          </div>
          <h1 className="auth-title">Sign In</h1>
          <p className="auth-subtitle">Access your EventSphere dashboard</p>
        </div>

        {inlineError && (
          <div style={{ color: 'var(--color-danger)', fontSize: '14px', marginBottom: '16px', textAlign: 'center', backgroundColor: 'var(--color-danger-bg)', padding: '10px', borderRadius: '8px' }}>
            {inlineError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-with-icon">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
