import { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import Layout from '../components/Layout/Layout';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineTrash } from 'react-icons/hi';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ page, limit: pagination.limit, search });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.limit]);

  useEffect(() => {
    fetchUsers(1);
  }, [search]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await usersAPI.updateRole(id, newRole);
      toast.success('Role updated');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This will also delete all their assets.`)) return;
    try {
      await usersAPI.delete(id);
      toast.success('User deleted');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage users and their roles (Admin only)</p>
      </div>

      <div className="page-content">
        <div className="toolbar">
          <div className="toolbar-search">
            <HiOutlineSearch />
            <input
              type="text"
              className="form-input"
              placeholder="Search users by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No users found</div>
            <p>Try adjusting your search.</p>
          </div>
        ) : (
          <>
            <div className="table-container glass">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Crypto Assets</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                            {u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          className="form-input"
                          style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: '0.82rem' }}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td>
                        <span className="badge badge-info">{u._count?.assets || 0}</span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleDelete(u.id, u.name)}
                          title="Delete user"
                          style={{ color: 'var(--error)' }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  ‹
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                    onClick={() => fetchUsers(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  ›
                </button>
                <span className="pagination-info">{pagination.total} users</span>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default UsersPage;
