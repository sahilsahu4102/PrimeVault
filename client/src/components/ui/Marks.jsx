/* The drawn marks: the signature of the departure-poster system. Shape and fill carry the meaning,
   never colour alone, so every mark survives greyscale. Each is paired with a word wherever it appears. */

const Wrap = ({ label, children }) => (
  <span className="mk" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <svg viewBox="0 0 14 14" focusable="false">{children}</svg>
  </span>
);

/** Ownership: a solid dot is yours; an outlined diamond is editable because you are an admin. */
export const OwnerMark = ({ kind, label = true }) => {
  if (kind === 'yours') {
    return <Wrap label={label ? 'Yours: you can edit and delete' : null}><circle cx="7" cy="7" r="5.5" fill="currentColor" /></Wrap>;
  }
  if (kind === 'admin') {
    return <Wrap label={label ? 'Editable as admin' : null}><path d="M7 1.4 12.6 7 7 12.6 1.4 7z" fill="none" stroke="currentColor" strokeWidth="2" /></Wrap>;
  }
  return null;
};

/** State: solid square = on, ring = off, dashed ring = on its way, struck square = unreachable. */
export const StateMark = ({ kind }) => {
  switch (kind) {
    case 'active':
    case 'ready':
      return <Wrap><rect x="1.5" y="1.5" width="11" height="11" fill="currentColor" /></Wrap>;
    case 'inactive':
      return <Wrap><rect x="2.5" y="2.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" /></Wrap>;
    case 'waking':
      return <Wrap><rect x="2.5" y="2.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" /></Wrap>;
    case 'down':
      return (
        <Wrap>
          <rect x="2.5" y="2.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M1 13 13 1" stroke="currentColor" strokeWidth="2" />
        </Wrap>
      );
    default:
      return null;
  }
};
