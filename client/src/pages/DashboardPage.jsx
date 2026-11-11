import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { assetsAPI, authAPI, usersAPI } from '../services/api';
import Layout from '../components/Layout/Layout';
import { OwnerMark, StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { formatCount, formatPrice, ownerKind } from '../utils/format';
import useTitle from '../hooks/useTitle';

const DashboardPage = () => {
  useTitle('Dashboard');
  const { user, isAdmin } = useAuth();
  const [latest, setLatest] = useState(null); // null = not loaded yet
  const [totals, setTotals] = useState({ assets: null, active: null, yours: null, users: null });
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const slow = useSlowNote(loading);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    // Every figure comes from its own request, so each one is a real total and a failure shows as a dash.
    const [recent, active, me, users] = await Promise.allSettled([
      assetsAPI.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
      assetsAPI.getAll({ limit: 1, isActive: true }),
      authAPI.getMe(),
      isAdmin ? usersAPI.getAll({ limit: 1 }) : Promise.resolve(null),
    ]);
    const val = (r, pick) => (r.status === 'fulfilled' && r.value ? pick(r.value.data.data) : null);
    setLatest(val(recent, (d) => d.assets));
    setTotals({
      assets: val(recent, (d) => d.pagination.total),
      active: val(active, (d) => d.pagination.total),
      yours: val(me, (d) => d.user._count.assets),
      users: isAdmin ? val(users, (d) => d.pagination.total) : null,
    });
    setFailed([recent, active, me, ...(isAdmin ? [users] : [])].some((r) => r.status === 'rejected'));
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const fig = (n) => (loading ? '…' : n == null ? 'n/a' : formatCount(n));
  const inactive = totals.assets != null && totals.active != null ? totals.assets - totals.active : null;

  return (
    <Layout>
      <div className="page">
        <div className="page-head">
          <h1>Dashboard</h1>
          <p className="lede">Signed in as {user?.name}, {user?.role}. Every figure below is a total counted by the server.</p>
        </div>

        {loading && slow && (
          <div className="notice is-wait" role="status" style={{ marginBottom: 24 }}><StateMark kind="waking" /><p>{WAKING_NOTE}</p></div>
        )}
        {!loading && failed && (
          <div className="notice is-error" role="alert" style={{ marginBottom: 24 }}>
            <StateMark kind="down" />
            <div><b>Some figures could not be loaded</b><p>They show as n/a.</p>
              <p style={{ marginTop: 8 }}><button type="button" className="btn btn-sm" onClick={load}>Try again</button></p></div>
          </div>
        )}

        <div className="dash">
          <section aria-labelledby="latest-h">
            <h2 id="latest-h">Latest assets</h2>
            <div className="tt-wrap">
              <table className="tt latest" role="table" aria-busy={loading} aria-label="Latest assets">
                <thead role="rowgroup">
                  <tr role="row">
                    <th scope="col" className="c-mark" role="columnheader"><span className="sr-only">Ownership</span></th>
                    <th scope="col" role="columnheader">Name</th>
                    <th scope="col" className="c-cat" role="columnheader">Category</th>
                    <th scope="col" className="c-price num" role="columnheader">Price (USD)</th>
                    <th scope="col" className="c-status" role="columnheader">Status</th>
                    <th scope="col" className="c-owner" role="columnheader">Owner</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {loading && [0, 1, 2, 3, 4].map((i) => (
                    <tr key={i} className="row-state" role="row" aria-hidden="true"><td colSpan={6} role="cell"><span className="skel" style={{ width: `${68 - i * 7}%` }} /></td></tr>
                  ))}
                  {!loading && latest && latest.length === 0 && (
                    <tr className="row-state is-tall" role="row"><td colSpan={6} role="cell"><b>There are no assets yet.</b>{' '}<Link to="/assets/new">Add the first one</Link>.</td></tr>
                  )}
                  {!loading && !latest && (
                    <tr className="row-state is-tall" role="row"><td colSpan={6} role="cell"><b>The latest assets could not be loaded.</b></td></tr>
                  )}
                  {!loading && latest && latest.map((a) => {
                    const kind = ownerKind(a, user, isAdmin);
                    return (
                      <tr key={a.id} role="row">
                        <td className="c-mark" role="cell">{kind && <OwnerMark kind={kind} />}</td>
                        <td className="c-name" role="cell"><span className="name" title={a.name}>{a.name}</span></td>
                        <td className="c-cat" role="cell" data-label="Category"><span className="cell-txt">{a.category}</span></td>
                        <td className="c-price num" role="cell"><span className="price"><small>$</small>{formatPrice(a.price)}</span></td>
                        <td className="c-status" role="cell" data-label="Status"><span className="state-line"><StateMark kind={a.isActive ? 'active' : 'inactive'} />{a.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td className="c-owner" role="cell"><span className="cell-txt">{a.user?.name}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Link to="/assets" className="more-link">All assets <LuArrowRight aria-hidden="true" /></Link>
          </section>

          <section aria-labelledby="totals-h">
            <h2 id="totals-h">Totals</h2>
            <dl className="totals">
              <div><dt>Assets in total</dt><dd>{fig(totals.assets)}</dd></div>
              <div className="sub"><dt>Active</dt><dd>{fig(totals.active)}</dd></div>
              <div className="sub"><dt>Inactive</dt><dd>{loading ? '…' : inactive == null ? 'n/a' : formatCount(inactive)}</dd></div>
              <div><dt>Yours</dt><dd>{fig(totals.yours)}</dd></div>
              {isAdmin && <div><dt>Users</dt><dd>{fig(totals.users)}</dd></div>}
            </dl>
            <p className="totals-note">Assets are shared: every signed-in user sees all of them. “Yours” counts only the assets you own.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
