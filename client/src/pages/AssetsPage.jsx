import { useState, useEffect, useCallback } from 'react';
import { assetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  stock: '',
  isActive: true,
};

const AssetsPage = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAssets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await assetsAPI.getAll({
        page,
        limit: pagination.limit,
        search,
        category,
        sortBy,
        order,
      });
      setAssets(res.data.data.assets);
      setPagination(res.data.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, order, pagination.limit]);

  const fetchCategories = async () => {
    try {
      const res = await assetsAPI.getCategories();
      setCategories(res.data.data.categories);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAssets(1);
    fetchCategories();
  }, [search, category, sortBy, order]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openCreate = () => {
    setEditingAsset(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setForm({
      name: asset.name,
      description: asset.description || '',
      price: asset.price.toString(),
      category: asset.category,
      stock: asset.stock.toString(),
      isActive: asset.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      };

      if (editingAsset) {
        await assetsAPI.update(editingAsset.id, payload);
        toast.success('Asset updated successfully');
      } else {
        await assetsAPI.create(payload);
        toast.success('Asset created successfully');
      }

      setShowModal(false);
      fetchAssets(pagination.page);
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Operation failed';
      const errors = error.response?.data?.errors;
      if (errors?.length) {
        errors.forEach((err) => toast.error(err.message));
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await assetsAPI.delete(id);
      toast.success('Asset deleted');
      fetchAssets(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const canModify = (asset) => {
    return user?.role === 'ADMIN' || asset.userId === user?.id;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Crypto Assets</h1>
        <p className="page-subtitle">Manage your asset inventory</p>
      </div>

      <div className="page-content">
        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-search">
            <HiOutlineSearch />
            <input
              type="text"
              className="form-input"
              placeholder="Search assets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 150 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 140 }}
            value={`${sortBy}-${order}`}
            onChange={(e) => {
              const [s, o] = e.target.value.split('-');
              setSortBy(s);
              setOrder(o);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
            <option value="stock-desc">Stock: High → Low</option>
          </select>

          <motion.button
            className="btn btn-primary"
            onClick={openCreate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <HiOutlinePlus /> Add Asset
          </motion.button>
        </div>

        {/* Crypto Assets Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : assets.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No assets found</div>
            <p style={{ marginBottom: 16 }}>
              {search || category
                ? 'Try adjusting your search or filters'
                : 'Create your first asset to get started'}
            </p>
            {!search && !category && (
              <button className="btn btn-primary btn-sm" onClick={openCreate}>
                <HiOutlinePlus /> Create Asset
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container glass">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset, i) => (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {asset.name}
                        {asset.description && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {asset.description.substring(0, 60)}
                            {asset.description.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-primary">{asset.category}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                        ${asset.price.toFixed(2)}
                      </td>
                      <td>
                        <span style={{ color: asset.stock < 10 ? 'var(--warning)' : 'inherit' }}>
                          {asset.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${asset.isActive ? 'badge-success' : 'badge-error'}`}>
                          {asset.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{asset.user?.name}</td>
                      <td>
                        {canModify(asset) && (
                          <div className="table-actions">
                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() => openEdit(asset)}
                              title="Edit"
                            >
                              <HiOutlinePencil />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() => handleDelete(asset.id, asset.name)}
                              title="Delete"
                              style={{ color: 'var(--error)' }}
                            >
                              <HiOutlineTrash />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchAssets(pagination.page - 1)}
                >
                  ‹
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                    onClick={() => fetchAssets(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchAssets(pagination.page + 1)}
                >
                  ›
                </button>
                <span className="pagination-info">
                  {pagination.total} items
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="modal glass-strong"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="modal-title" style={{ marginBottom: 0 }}>
                  {editingAsset ? 'Edit Asset' : 'Create Asset'}
                </h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                  <HiOutlineX />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Asset Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Premium Widget"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    placeholder="Optional description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="29.99"
                      step="0.01"
                      min="0.01"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Electronics"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {saving ? (
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                    ) : editingAsset ? (
                      'Update Asset'
                    ) : (
                      'Create Asset'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default AssetsPage;
