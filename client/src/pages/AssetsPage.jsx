import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuSearch, LuPlus, LuPencil, LuTrash2, LuArrowUp, LuArrowDown } from 'react-icons/lu';
import { assetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import Pager from '../components/ui/Pager';
import { OwnerMark, StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { formatPrice, ownerKind } from '../utils/format';
import { readError } from '../utils/errors';
import useTitle from '../hooks/useTitle';

const LIMIT = 10;
const SORTS = [
  ['createdAt-desc', 'Newest first'],
  ['createdAt-asc', 'Oldest first'],
  ['price-desc', 'Price: high to low'],
  ['price-asc', 'Price: low to high'],
  ['name-asc', 'Name: A to Z'],
  ['name-desc', 'Name: Z to A'],
  ['stock-desc', 'Quantity: high to low'],
  ['stock-asc', 'Quantity: low to high'],
];
// the first direction a header sorts in when you click it
const FIRST_ORDER = { name: 'asc', category: 'asc', price: 'desc', stock: 'desc' };

// Defined out here so it keeps its identity (and the keyboard focus on its button) across renders.
const SortTh = ({ col, sortBy, order, onSort, className = '', children }) => (
  <th scope="col" className={className} role="columnheader" aria-sort={sortBy === col ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
    <button type="button" className="th-sort" onClick={() => onSort(col)}>
      {children}
      {sortBy === col && (order === 'asc' ? <LuArrowUp aria-hidden="true" /> : <LuArrowDown aria-hidden="true" />)}
    </button>
  </th>
);

const AssetsPage = () => {
  useTitle('Assets');
  const { user, isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'createdAt-desc';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [sortBy, order] = sort.split('-');

  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState(q);
  const slow = useSlowNote(loading);

  const update = useCallback((changes, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => { if (v) next.set(k, v); else next.delete(k); });
    if (!keepPage) next.delete('page');
    setParams(next);
  }, [params, setParams]);

  // The URL is the source of truth for the filters, so the back button and shared links work. The box
  // follows the URL when it changes from outside, and writes to it after a pause in typing.
  const typed = useRef(q);
  useEffect(() => {
    if (q !== typed.current) { typed.current = q; setSearchInput(q); }
  }, [q]);
  useEffect(() => {
    if (searchInput.trim() === q) return undefined;
    const t = setTimeout(() => { typed.current = searchInput.trim(); update({ q: searchInput.trim() }); }, 400);
    return () => clearTimeout(t);
  }, [searchInput, q, update]);

  useEffect(() => { assetsAPI.getCategories().then((r) => setCategories(r.data.data.categories)).catch(() => {}); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await assetsAPI.getAll({ page, limit: LIMIT, search: q, category, sortBy, order });
      setAssets(res.data.data.assets);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setLoadError(readError(err, 'Could not load assets').message);
    } finally {
      setLoading(false);
    }
  }, [page, q, category, sortBy, order]);

  useEffect(() => { load(); }, [load]);

  const headerSort = (col) => {
    const nextOrder = sortBy === col ? (order === 'asc' ? 'desc' : 'asc') : FIRST_ORDER[col];
    update({ sort: `${col}-${nextOrder}` });
  };
  const th = { sortBy, order, onSort: headerSort };

  const handleDelete = async (asset) => {
    setDeleting(true);
    try {
      await assetsAPI.delete(asset.id);
      toast.success(`Deleted “${asset.name}”`);
      setConfirmId(null);
      if (assets.length === 1 && page > 1) update({ page: String(page - 1) }, { keepPage: true });
      else load();
    } catch (err) {
      toast.error(readError(err, 'Delete failed').message);
    } finally {
      setDeleting(false);
    }
  };

  const canModify = (asset) => isAdmin || asset.userId === user?.id;
  const filtered = !!(q || category);
  const here = params.toString();

  return (
    <Layout>
      <div className="page">
        <div className="page-head">
          <h1>Assets</h1>
          <p className="lede">
            {isAdmin
              ? <>You are signed in as an ADMIN. You can edit and delete every asset; the ones you do not own carry <span style={{ whiteSpace: 'nowrap' }}><OwnerMark kind="admin" label={false} />.</span></>
              : <>You are signed in as a USER. Everyone’s assets are listed, and you can edit and delete the ones marked <span style={{ whiteSpace: 'nowrap' }}><OwnerMark kind="yours" label={false} />.</span></>}
          </p>
        </div>

        <div className="toolbar">
          <div className="search">
            <LuSearch aria-hidden="true" />
            <input type="search" className="input" placeholder="Search name or description" aria-label="Search assets"
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <select className="select" aria-label="Category" value={category} onChange={(e) => update({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" aria-label="Sort order" value={sort} onChange={(e) => update({ sort: e.target.value === 'createdAt-desc' ? '' : e.target.value })}>
            {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <Link to="/assets/new" state={{ from: here }} className="btn btn-primary btn-add"><LuPlus aria-hidden="true" /> Add asset</Link>
        </div>

        {slow && loading && (
          <div className="notice is-wait" role="status" style={{ marginBottom: 16 }}>
            <StateMark kind="waking" /><p>{WAKING_NOTE}</p>
          </div>
        )}

        <div className="tt-wrap">
          <table className="tt" role="table" aria-busy={loading} aria-label="Assets">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" className="c-mark" role="columnheader"><span className="sr-only">Ownership</span></th>
                <SortTh {...th} col="name">Name</SortTh>
                <SortTh {...th} col="category" className="c-cat">Category</SortTh>
                <SortTh {...th} col="price" className="c-price num">Price (USD)</SortTh>
                <SortTh {...th} col="stock" className="c-qty num">Quantity</SortTh>
                <th scope="col" className="c-status" role="columnheader">Status</th>
                <th scope="col" className="c-owner" role="columnheader">Owner</th>
                <th scope="col" className="c-act" role="columnheader"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {loading && !assets.length && [0, 1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="row-state" role="row" aria-hidden="true">
                  <td colSpan={8} role="cell"><span className="skel" style={{ width: `${70 - i * 6}%` }} /></td>
                </tr>
              ))}

              {!loading && loadError && (
                <tr className="row-state is-tall" role="row">
                  <td colSpan={8} role="cell">
                    <div className="notice is-error" role="alert"><StateMark kind="down" />
                      <div><b>Could not load assets</b><p>{loadError}</p>
                        <p style={{ marginTop: 8 }}><button type="button" className="btn btn-sm" onClick={load}>Try again</button></p></div>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && !loadError && assets.length === 0 && (
                <tr className="row-state is-tall" role="row">
                  <td colSpan={8} role="cell">
                    <p><b>{filtered ? 'No assets match these filters.' : 'There are no assets yet.'}</b></p>
                    <p style={{ marginTop: 10 }}>
                      {filtered
                        ? <button type="button" className="btn btn-sm" onClick={() => { setSearchInput(''); setParams(new URLSearchParams()); }}>Clear filters</button>
                        : <Link to="/assets/new" state={{ from: here }} className="btn btn-sm btn-primary"><LuPlus aria-hidden="true" /> Add the first asset</Link>}
                    </p>
                  </td>
                </tr>
              )}

              {!loadError && assets.map((asset) => {
                const kind = ownerKind(asset, user, isAdmin);
                const confirming = confirmId === asset.id;
                return [
                  <tr key={asset.id} role="row" style={loading ? { opacity: 0.55 } : undefined}>
                    <td className="c-mark" role="cell">{kind && <OwnerMark kind={kind} />}</td>
                    <td className="c-name" role="cell">
                      <span className="name" title={asset.name}>{asset.name}</span>
                      {asset.description && <span className="desc" title={asset.description}>{asset.description}</span>}
                    </td>
                    <td className="c-cat" role="cell" data-label="Category"><span className="cell-txt">{asset.category}</span></td>
                    <td className="c-price num" role="cell"><span className="price"><small>$</small>{formatPrice(asset.price)}</span></td>
                    <td className="c-qty num" role="cell" data-label="Quantity">{asset.stock.toLocaleString('en-US')}</td>
                    <td className="c-status" role="cell" data-label="Status">
                      <span className="state-line"><StateMark kind={asset.isActive ? 'active' : 'inactive'} />{asset.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="c-owner" role="cell"><span className="cell-txt">{asset.user?.name}</span></td>
                    <td className="c-act" role="cell">
                      {canModify(asset) && (
                        <div className="actions">
                          <Link to={`/assets/${asset.id}/edit`} state={{ from: here }} className="btn btn-sm btn-icon" aria-label={`Edit ${asset.name}`} title="Edit"><LuPencil aria-hidden="true" /></Link>
                          <button type="button" className="btn btn-sm btn-icon btn-danger" aria-label={`Delete ${asset.name}`} title="Delete" onClick={() => setConfirmId(asset.id)}><LuTrash2 aria-hidden="true" /></button>
                        </div>
                      )}
                    </td>
                  </tr>,
                  confirming && (
                    <tr key={`${asset.id}-confirm`} className="confirm" role="row">
                      <td colSpan={8} role="cell">
                        <div className="confirm-box" role="alertdialog" aria-label={`Confirm deleting ${asset.name}`}>
                          <p>Delete “{asset.name}”? This cannot be undone.</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn btn-sm btn-danger" disabled={deleting} onClick={() => handleDelete(asset)}>{deleting ? 'Deleting…' : 'Delete'}</button>
                            <button type="button" className="btn btn-sm" autoFocus onClick={() => setConfirmId(null)}>Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>

        {assets.length > 0 && (
          <div className="legend" aria-label="Legend">
            <span><OwnerMark kind="yours" label={false} /> Yours: you can edit and delete</span>
            {isAdmin && <span><OwnerMark kind="admin" label={false} /> Editable as admin</span>}
            {!isAdmin && <span>No mark: view only</span>}
            <span><StateMark kind="active" /> Active</span>
            <span><StateMark kind="inactive" /> Inactive</span>
          </div>
        )}

        <Pager page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={LIMIT}
          noun="assets" onPage={(n) => update({ page: n > 1 ? String(n) : '' }, { keepPage: true })} />
      </div>
    </Layout>
  );
};

export default AssetsPage;
