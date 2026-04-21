import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineLogout,
  HiOutlineDocumentText,
} from 'react-icons/hi';

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/assets', icon: HiOutlineCube, label: 'Crypto Assets' },
    ...(isAdmin
      ? [{ to: '/users', icon: HiOutlineUsers, label: 'Users' }]
      : []),
  ];

  return (
    <div className="app-layout">
      <div className="app-bg" />

      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">PT</div>
          <span className="sidebar-logo-text">PrimeVault</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
          
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <HiOutlineDocumentText />
            API Docs
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" style={{ marginBottom: 12 }}>
            <div className="user-avatar">{getInitials(user?.name)}</div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ width: '100%' }}>
            <HiOutlineLogout />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;
