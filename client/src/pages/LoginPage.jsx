import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPoster from '../components/Auth/AuthPoster';
import ServerStatus from '../components/ui/ServerStatus';
import { StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { readError } from '../utils/errors';
import useTitle from '../hooks/useTitle';

const LoginPage = () => {
  useTitle('Sign in');
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(null); // null | 'guest' | 'login'
  const [error, setError] = useState({ for: null, message: '' });
  const { login, guest } = useAuth();
  const navigate = useNavigate();
  const slow = useSlowNote(!!busy);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const run = async (kind, action, fallback) => {
    setBusy(kind);
    setError({ for: null, message: '' });
    try {
      await action();
      navigate('/dashboard');
    } catch (err) {
      setError({ for: kind, message: readError(err, fallback).message });
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run('login', () => login(form), 'Sign-in failed');
  };

  const waitNote = slow && (
    <div className="notice is-wait" role="status">
      <StateMark kind="waking" />
      <p>{WAKING_NOTE}</p>
    </div>
  );
  const errorNote = (kind) => error.for === kind && (
    <div className="notice is-error" role="alert">
      <StateMark kind="down" />
      <div><b>{kind === 'guest' ? 'Could not start a guest session' : 'Could not sign in'}</b><p>{error.message}</p></div>
    </div>
  );

  return (
    <div className="auth">
      <AuthPoster />

      <div className="gate">
        <div className="gate-inner">
          <section aria-labelledby="guest-title">
            <h2 id="guest-title">Try it as a guest</h2>
            <p className="alt">Creates a temporary account with normal USER rights. It and anything you add are deleted after 24 hours.</p>
            <button type="button" className="btn btn-primary btn-block" disabled={!!busy} onClick={() => run('guest', guest, 'Could not start a guest session')}>
              {busy === 'guest' ? 'Starting guest session…' : 'Continue as guest'}
            </button>
            {busy === 'guest' && waitNote}
            {errorNote('guest')}
          </section>

          <div className="divider" aria-hidden="true">or sign in</div>

          <section aria-labelledby="signin-title">
            <h2 id="signin-title" className="sr-only">Sign in with email</h2>
            <form className="stack" onSubmit={handleSubmit} noValidate={false}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" name="email" className="input" autoComplete="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required disabled={!!busy} />
              </div>
              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input id="login-password" type="password" name="password" className="input" autoComplete="current-password"
                  value={form.password} onChange={handleChange} required disabled={!!busy} />
              </div>
              <button type="submit" className="btn btn-block" disabled={!!busy}>
                {busy === 'login' ? 'Signing in…' : 'Sign in'}
              </button>
              {busy === 'login' && waitNote}
              {errorNote('login')}
            </form>
            <p className="alt">No account? <Link to="/register">Create one</Link></p>
          </section>

          <ServerStatus />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
