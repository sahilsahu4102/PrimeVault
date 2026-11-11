import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuTable2, LuUsers, LuBookOpen, LuLogOut, LuArrowUpRight } from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';
import { DOCS_URL } from '../../services/api';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LuLayoutDashboard, label: 'Dashboard' },
    { to: '/assets', icon: LuTable2, label: 'Assets' },
    ...(isAdmin ? [{ to: '/users', icon: LuUsers, label: 'Users' }] : []),
  ];

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to main content</a>
      <aside className="rail">
        <Link to="/dashboard" className="wordmark">
          PrimeVault
          <small>Assignment project</small>
        </Link>

        <nav className="nav" aria-label="Main">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}>
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            <LuBookOpen aria-hidden="true" />
            API docs
            <LuArrowUpRight className="ext" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </nav>

        <div className="rail-user">
          <div className="who">
            <b>{user?.name}</b>
            <span>{user?.role}{isGuest ? ' · guest' : ''}</span>
          </div>
          <button type="button" className="btn btn-sm" onClick={handleLogout}>
            <LuLogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main" id="main">
        {isGuest && (
          <div className="guest-bar" role="note">
            <span>You are using a temporary guest account. It and anything you add are deleted 24 hours after it was created.</span>
            <Link to="/register">Create an account to keep your own</Link>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
