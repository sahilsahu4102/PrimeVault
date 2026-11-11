import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuSearch, LuTrash2 } from 'react-icons/lu';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import Pager from '../components/ui/Pager';
import { StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { formatCount, formatDay } from '../utils/format';
import { readError } from '../utils/errors';
import useTitle from '../hooks/useTitle';

const LIMIT = 10;

const UsersPage = () => {
  useTitle('Users');
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
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

  const typed = useRef(q);
  useEffect(() => { if (q !== typed.current) { typed.current = q; setSearchInput(q); } }, [q]);
  useEffect(() => {
    if (searchInput.trim() === q) return undefined;
    const t = setTimeout(() => { typed.current = searchInput.trim(); update({ q: searchInput.trim() }); }, 400);
    return () => clearTimeout(t);
  }, [searchInput, q, update]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await usersAPI.getAll({ page, limit: LIMIT, search: q });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setLoadError(readError(err, 'Could not load users').message);
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (u, role) => {
    try {
      await usersAPI.updateRole(u.id, role);
      toast.success(`${u.name} is now ${role}`);
    } catch (err) {
      toast.error(readError(err, 'Could not change the role').message);
    }
    load(); // show what the server actually has
  };

  const handleDelete = async (u) => {
    setDeleting(true);
    try {
      await usersAPI.delete(u.id);
      toast.success(`Deleted ${u.name}`);
      setConfirmId(null);
      if (users.length === 1 && page > 1) update({ page: String(page - 1) }, { keepPage: true });
      else load();
    } catch (err) {
      toast.error(readError(err, 'Could not delete the user').message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page-head">
          <h1>Users</h1>
          <p className="lede">Visible to admins only. Changing a role takes effect on that user’s next request. Deleting a user also deletes every asset they own. Temporary guest accounts are not listed.</p>
        </div>

        <div className="toolbar">
          <div className="search">
            <LuSearch aria-hidden="true" />
            <input type="search" className="input" placeholder="Search name or email" aria-label="Search users" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
        </div>

        {slow && loading && <div className="notice is-wait" role="status" style={{ marginBottom: 16 }}><StateMark kind="waking" /><p>{WAKING_NOTE}</p></div>}

        <div className="tt-wrap">
          <table className="tt users" role="table" aria-busy={loading} aria-label="Users">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">Name</th>
                <th scope="col" role="columnheader">Email</th>
                <th scope="col" className="c-role" role="columnheader">Role</th>
                <th scope="col" className="c-count num" role="columnheader">Assets</th>
                <th scope="col" className="c-date" role="columnheader">Joined</th>
                <th scope="col" className="c-act" role="columnheader"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {loading && !users.length && [0, 1, 2, 3, 4].map((i) => (
                <tr key={i} className="row-state" role="row" aria-hidden="true"><td colSpan={6} role="cell"><span className="skel" style={{ width: `${68 - i * 7}%` }} /></td></tr>
              ))}

              {!loading && loadError && (
                <tr className="row-state is-tall" role="row"><td colSpan={6} role="cell">
                  <div className="notice is-error" role="alert"><StateMark kind="down" />
                    <div><b>Could not load users</b><p>{loadError}</p><p style={{ marginTop: 8 }}><button type="button" className="btn btn-sm" onClick={load}>Try again</button></p></div>
                  </div>
                </td></tr>
              )}

              {!loading && !loadError && users.length === 0 && (
                <tr className="row-state is-tall" role="row"><td colSpan={6} role="cell"><b>{q ? 'No users match this search.' : 'There are no users.'}</b></td></tr>
              )}

              {!loadError && users.map((u) => {
                const self = u.id === me?.id;
                return [
                  <tr key={u.id} role="row" style={loading ? { opacity: 0.55 } : undefined}>
                    <td className="c-uname" role="cell"><span className="name" title={u.name}>{u.name}{self && ' (you)'}</span></td>
                    <td className="c-email" role="cell"><span className="cell-txt" title={u.email}>{u.email}</span></td>
                    <td className="c-role" role="cell" data-label="Role">
                      <select className="select select-sm" aria-label={`Role of ${u.name}`} value={u.role} disabled={self}
                        title={self ? 'You cannot change your own role here' : undefined}
                        onChange={(e) => handleRoleChange(u, e.target.value)}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="c-count num" role="cell" data-label="Assets">{formatCount(u._count?.assets || 0)}</td>
                    <td className="c-date" role="cell" data-label="Joined">{formatDay(u.createdAt)}</td>
                    <td className="c-act" role="cell">
                      <div className="actions">
                        <button type="button" className="btn btn-sm btn-icon btn-danger" disabled={self} aria-label={`Delete ${u.name}`}
                          title={self ? 'You cannot delete your own account here' : 'Delete user'} onClick={() => setConfirmId(u.id)}><LuTrash2 aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>,
                  confirmId === u.id && (
                    <tr key={`${u.id}-confirm`} className="confirm" role="row">
                      <td colSpan={6} role="cell">
                        <div className="confirm-box" role="alertdialog" aria-label={`Confirm deleting ${u.name}`}>
                          <p>Delete {u.name}? Their {u._count?.assets || 0} asset{(u._count?.assets || 0) === 1 ? '' : 's'} will be deleted too. This cannot be undone.</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn btn-sm btn-danger" disabled={deleting} onClick={() => handleDelete(u)}>{deleting ? 'Deleting…' : 'Delete'}</button>
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

        <Pager page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} limit={LIMIT}
          noun="users" onPage={(n) => update({ page: n > 1 ? String(n) : '' }, { keepPage: true })} />
      </div>
    </Layout>
  );
};

export default UsersPage;
