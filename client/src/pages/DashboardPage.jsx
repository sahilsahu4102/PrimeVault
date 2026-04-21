import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assetsAPI, usersAPI } from '../services/api';
import Layout from '../components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    myAssets: 0,
    totalUsers: 0,
    activeAssets: 0,
  });
  const [recentAssets, setRecentAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const assetsRes = await assetsAPI.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' });
      const allAssets = assetsRes.data.data;
      
      let totalUsers = 0;
      if (isAdmin) {
        try {
          const usersRes = await usersAPI.getAll({ limit: 1 });
          totalUsers = usersRes.data.data.pagination.total;
        } catch {
          totalUsers = 0;
        }
      }

      setStats({
        totalAssets: allAssets.pagination.total,
        myAssets: allAssets.assets.filter((p) => p.userId === user.id).length,
        totalUsers,
        activeAssets: allAssets.assets.filter((p) => p.isActive).length,
      });
      setRecentAssets(allAssets.assets);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Crypto Assets',
      value: stats.totalAssets,
      icon: HiOutlineCube,
      color: 'var(--primary)',
      bg: 'rgba(108, 92, 231, 0.12)',
    },
    {
      label: 'Active Crypto Assets',
      value: stats.activeAssets,
      icon: HiOutlineTrendingUp,
      color: 'var(--success)',
      bg: 'var(--success-bg)',
    },
    ...(isAdmin
      ? [
          {
            label: 'Total Users',
            value: stats.totalUsers,
            icon: HiOutlineUsers,
            color: 'var(--accent)',
            bg: 'rgba(0, 206, 201, 0.12)',
          },
        ]
      : []),
    {
      label: 'Your Role',
      value: user?.role,
      icon: HiOutlineShieldCheck,
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="spinner spinner-lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome back, <strong>{user?.name}</strong>! Here's your overview.
        </p>
      </div>

      <div className="page-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card glass"
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div
                className="stat-icon"
                style={{ background: stat.bg, color: stat.color }}
              >
                <stat.icon />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recent Crypto Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 style={{ marginBottom: 16 }}>Recent Crypto Assets</h2>
          {recentAssets.length === 0 ? (
            <div className="empty-state glass">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No assets yet</div>
              <p>Create your first asset to get started.</p>
            </div>
          ) : (
            <div className="table-container glass">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {asset.name}
                      </td>
                      <td>
                        <span className="badge badge-primary">{asset.category}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                        ${asset.price.toFixed(2)}
                      </td>
                      <td>{asset.stock}</td>
                      <td>
                        <span
                          className={`badge ${
                            asset.isActive ? 'badge-success' : 'badge-error'
                          }`}
                        >
                          {asset.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{asset.user?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
