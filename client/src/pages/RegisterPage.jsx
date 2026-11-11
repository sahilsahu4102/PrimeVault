import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPoster from '../components/Auth/AuthPoster';
import ServerStatus from '../components/ui/ServerStatus';
import { StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { readError } from '../utils/errors';
import useTitle from '../hooks/useTitle';

const RegisterPage = () => {
  useTitle('Create an account');
  // no role: the server makes every public sign-up a USER; admins come from the seed script
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(null); // null | 'guest' | 'register'
  const [problem, setProblem] = useState({ for: null, message: '', list: [], fields: {} });
  const { register, guest } = useAuth();
  const navigate = useNavigate();
  const slow = useSlowNote(!!busy);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (problem.fields[e.target.name]) setProblem({ ...problem, fields: { ...problem.fields, [e.target.name]: undefined } });
  };

  const run = async (kind, action, fallback) => {
    setBusy(kind);
    setProblem({ for: null, message: '', list: [], fields: {} });
    try {
      await action();
      navigate('/dashboard');
    } catch (err) {
      setProblem({ for: kind, ...readError(err, fallback) });
    } finally {
      setBusy(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run('register', () => register(form), 'Registration failed');
  };

  const waitNote = slow && (
    <div className="notice is-wait" role="status">
      <StateMark kind="waking" />
      <p>{WAKING_NOTE}</p>
    </div>
  );
  const errorNote = (kind, title) => problem.for === kind && (
    <div className="notice is-error" role="alert">
      <StateMark kind="down" />
      <div>
        <b>{title}</b>
        {problem.list.length > 1
          ? <ul style={{ paddingLeft: 18 }}>{problem.list.map((m) => <li key={m}>{m}</li>)}</ul>
          : <p>{problem.message}</p>}
      </div>
    </div>
  );

  const fieldProps = (name) => ({
    name,
    className: `input${problem.fields[name] ? ' is-invalid' : ''}`,
    'aria-invalid': problem.fields[name] ? true : undefined,
    'aria-describedby': problem.fields[name] ? `reg-${name}-err` : name === 'password' ? 'reg-password-hint' : undefined,
    value: form[name],
    onChange: handleChange,
    required: true,
    disabled: !!busy,
  });
  const fieldError = (name) => problem.fields[name] && <p className="field-error" id={`reg-${name}-err`}>{problem.fields[name]}</p>;

  return (
    <div className="auth">
      <AuthPoster />

      <div className="gate">
        <div className="gate-inner">
          <section aria-labelledby="reg-title">
            <h2 id="reg-title">Create an account</h2>
            <p className="alt">Every new account is a USER: you can add assets and edit or delete your own.</p>
            <form className="stack" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="reg-name">Name</label>
                <input id="reg-name" type="text" autoComplete="name" {...fieldProps('name')} />
                {fieldError('name')}
              </div>
              <div className="field">
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" {...fieldProps('email')} />
                {fieldError('email')}
              </div>
              <div className="field">
                <label htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" autoComplete="new-password" {...fieldProps('password')} />
                <p className="field-hint" id="reg-password-hint">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</p>
                {fieldError('password')}
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={!!busy}>
                {busy === 'register' ? 'Creating account…' : 'Create account'}
              </button>
              {busy === 'register' && waitNote}
              {errorNote('register', 'Could not create the account')}
            </form>
            <p className="alt">Already registered? <Link to="/login">Sign in</Link></p>
          </section>

          <div className="divider" aria-hidden="true">or</div>

          <section aria-label="Guest access">
            <button type="button" className="btn btn-block" disabled={!!busy} onClick={() => run('guest', guest, 'Could not start a guest session')}>
              {busy === 'guest' ? 'Starting guest session…' : 'Continue as guest instead'}
            </button>
            {busy === 'guest' && waitNote}
            {errorNote('guest', 'Could not start a guest session')}
          </section>

          <ServerStatus />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
