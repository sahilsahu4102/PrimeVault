import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      const errors = error.response?.data?.errors;
      if (errors?.length) {
        errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="particles">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      <motion.div
        className="auth-card glass-strong"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-header">
          <motion.div
            className="auth-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          >
            PT
          </motion.div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join PrimeVault and start managing assets</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem',
                }}
              />
              <input
                id="reg-name"
                type="text"
                name="name"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineMail
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem',
                }}
              />
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed
                style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem',
                }}
              />
              <input
                id="reg-password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Min 8 chars, uppercase, lowercase, number"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-role">Account Role</label>
            <select
              id="reg-role"
              name="role"
              className="form-input"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Create Account'}
          </motion.button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
