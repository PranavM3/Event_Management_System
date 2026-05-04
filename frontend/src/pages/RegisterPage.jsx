import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Calendar } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    password: '', phone: '', roles: ['user'],
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRoleChange = (role) => setForm({ ...form, roles: [role] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');
    if (!form.firstName || !form.email || !form.password) {
      setInlineError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      let msg = '';
      if (!err.response) {
        msg = 'Server not running';
      } else if (err.response.status === 400 || err.response.status === 409) {
        msg = err.response?.data?.message || 'Invalid details provided';
      } else {
        msg = 'Registration failed';
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
      <div className="auth-card wide">
        <div className="auth-header">
          <div className="auth-logo">
            <Calendar size={28} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join EventSphere</p>
        </div>

        {inlineError && (
          <div style={{ color: 'var(--color-danger)', fontSize: '14px', marginBottom: '16px', textAlign: 'center', backgroundColor: 'var(--color-danger-bg)', padding: '10px', borderRadius: '8px' }}>
            {inlineError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input type="text" name="firstName" className="form-input"
                placeholder="John" value={form.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" className="form-input"
                placeholder="Doe" value={form.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address *</label>
            <input type="email" name="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" name="phone" className="form-input"
              placeholder="1234567890" value={form.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="input-with-icon">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button" className="input-icon-btn" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="role-selector">
              {['user', 'organizer'].map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-btn ${form.roles[0] === role ? 'active' : ''}`}
                  onClick={() => handleRoleChange(role)}
                >
                  {role === 'user' ? '👤 Attendee' : '🎯 Organizer'}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : <><UserPlus size={18} /> Create Account</>}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
