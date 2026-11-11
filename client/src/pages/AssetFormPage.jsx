import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuArrowLeft } from 'react-icons/lu';
import { assetsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { OwnerMark, StateMark } from '../components/ui/Marks';
import useSlowNote, { WAKING_NOTE } from '../hooks/useSlowNote';
import { readError } from '../utils/errors';
import useTitle from '../hooks/useTitle';

const empty = { name: '', description: '', price: '', category: '', stock: '', isActive: true };

/** Add or edit one asset. A page rather than a pop-up: nothing here needs to interrupt the list. */
const AssetFormPage = () => {
  const { id } = useParams();
  const editing = !!id;
  useTitle(editing ? 'Edit asset' : 'Add asset');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const back = `/assets${from ? `?${from}` : ''}`;

  const [form, setForm] = useState(empty);
  const [asset, setAsset] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState({ message: '', list: [], fields: {} });
  const slow = useSlowNote(saving || loading);

  useEffect(() => { assetsAPI.getCategories().then((r) => setCategories(r.data.data.categories)).catch(() => {}); }, []);

  useEffect(() => {
    if (!editing) return undefined;
    let live = true;
    setLoading(true);
    assetsAPI.getById(id)
      .then((res) => {
        if (!live) return;
        const a = res.data.data.asset;
        setAsset(a);
        setForm({ name: a.name, description: a.description || '', price: String(a.price), category: a.category, stock: String(a.stock), isActive: a.isActive });
      })
      .catch((err) => { if (live) setLoadError(readError(err, 'Could not load this asset').message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [editing, id]);

  const set = (name) => (e) => {
    setForm({ ...form, [name]: e.target.value });
    if (problem.fields[name]) setProblem({ ...problem, fields: { ...problem.fields, [name]: undefined } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProblem({ message: '', list: [], fields: {} });
    try {
      const payload = { ...form, name: form.name.trim(), category: form.category.trim(), price: parseFloat(form.price), stock: parseInt(form.stock, 10) || 0 };
      if (editing) await assetsAPI.update(id, payload);
      else await assetsAPI.create(payload);
      toast.success(editing ? 'Asset updated' : 'Asset added');
      navigate(back);
    } catch (err) {
      setProblem(readError(err, 'The asset was not saved'));
    } finally {
      setSaving(false);
    }
  };

  const mine = asset && asset.userId === user?.id;
  const allowed = !editing || (asset && (isAdmin || mine));
  const fieldProps = (name, extra = {}) => ({
    id: `f-${name}`,
    className: `${extra.select ? 'select' : extra.area ? 'textarea' : 'input'}${problem.fields[name] ? ' is-invalid' : ''}`,
    'aria-invalid': problem.fields[name] ? true : undefined,
    'aria-describedby': problem.fields[name] ? `f-${name}-err` : undefined,
    disabled: saving,
  });
  const err = (name) => problem.fields[name] && <p className="field-error" id={`f-${name}-err`}>{problem.fields[name]}</p>;

  return (
    <Layout>
      <div className="page">
        <Link to={back} className="more-link" style={{ marginTop: 0, marginBottom: 20 }}><LuArrowLeft aria-hidden="true" /> Back to assets</Link>

        <div className="page-head">
          <h1>{editing ? 'Edit asset' : 'Add asset'}</h1>
          <p className="lede">
            {!editing && 'It will be listed under your name, and only you and admins can change it.'}
            {editing && asset && mine && <>This asset is yours <span style={{ whiteSpace: 'nowrap' }}><OwnerMark kind="yours" label={false} />.</span></>}
            {editing && asset && !mine && isAdmin && <>This asset belongs to {asset.user?.name}. You can edit it because you are an admin <span style={{ whiteSpace: 'nowrap' }}><OwnerMark kind="admin" label={false} />.</span></>}
          </p>
        </div>

        {loading && (
          <div role="status">
            <p className="state-line"><StateMark kind="waking" /> Loading the asset</p>
            {slow && <div className="notice is-wait" style={{ marginTop: 12 }}><StateMark kind="waking" /><p>{WAKING_NOTE}</p></div>}
          </div>
        )}

        {!loading && loadError && (
          <div className="notice is-error" role="alert"><StateMark kind="down" /><div><b>Could not load this asset</b><p>{loadError}</p></div></div>
        )}

        {!loading && !loadError && editing && asset && !allowed && (
          <div className="notice" role="alert"><StateMark kind="inactive" />
            <div><b>View only</b><p>Only the owner ({asset.user?.name}) or an admin can edit this asset.</p></div>
          </div>
        )}

        {!loading && !loadError && allowed && (
          <form className="stack" style={{ maxWidth: 720 }} onSubmit={handleSubmit}>
            {(problem.list.length > 0 || (problem.message && !Object.keys(problem.fields).length)) && (
              <div className="notice is-error" role="alert"><StateMark kind="down" />
                <div>
                  <b>The server did not accept this</b>
                  {problem.list.length > 1
                    ? <ul style={{ paddingLeft: 18 }}>{problem.list.map((m) => <li key={m}>{m}</li>)}</ul>
                    : <p>{problem.list[0] || problem.message}</p>}
                </div>
              </div>
            )}

            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="f-name">Name</label>
                <input type="text" required maxLength={100} placeholder="e.g. Ethereum" value={form.name} onChange={set('name')} {...fieldProps('name')} />
                {err('name')}
              </div>

              <div className="field span-2">
                <label htmlFor="f-description">Description (optional)</label>
                <textarea rows={3} maxLength={1000} value={form.description} onChange={set('description')} {...fieldProps('description', { area: true })} />
                <p className="field-hint">Up to 1000 characters.</p>
                {err('description')}
              </div>

              <div className="field">
                <label htmlFor="f-price">Price (USD)</label>
                <input type="number" inputMode="decimal" step="0.01" min="0.01" required placeholder="2500.75" value={form.price} onChange={set('price')} {...fieldProps('price')} />
                <p className="field-hint">Sent to the API as price. Must be above zero.</p>
                {err('price')}
              </div>

              <div className="field">
                <label htmlFor="f-stock">Quantity held</label>
                <input type="number" inputMode="numeric" step="1" min="0" placeholder="0" value={form.stock} onChange={set('stock')} {...fieldProps('stock')} />
                <p className="field-hint">Sent to the API as stock. A whole number, zero or more.</p>
                {err('stock')}
              </div>

              <div className="field">
                <label htmlFor="f-category">Category</label>
                <input type="text" list="category-options" required maxLength={50} placeholder="e.g. Layer 1" value={form.category} onChange={set('category')} {...fieldProps('category')} />
                <datalist id="category-options">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                {err('category')}
              </div>

              <div className="field">
                <label htmlFor="f-isActive">Status</label>
                <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} {...fieldProps('isActive', { select: true })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                {err('isActive')}
              </div>
            </div>

            {saving && slow && <div className="notice is-wait" role="status"><StateMark kind="waking" /><p>{WAKING_NOTE}</p></div>}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add asset'}</button>
              <Link to={back} className="btn" aria-disabled={saving}>Cancel</Link>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default AssetFormPage;
