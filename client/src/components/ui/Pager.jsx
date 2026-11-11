import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// 1 … 4 5 6 … 12: the first and last page, and the current one with a neighbour on each side.
function pageList(page, total) {
  const keep = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  const out = [];
  let prev = 0;
  [...keep].sort((a, b) => a - b).forEach((n) => {
    if (n - prev > 1) out.push('gap');
    out.push(n);
    prev = n;
  });
  return out;
}

export default function Pager({ page, totalPages, total, limit, noun, onPage }) {
  if (!total) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <nav className="pager" aria-label={`${noun} pages`}>
      <span className="count">Showing {from} to {to} of {total} {noun}</span>
      {totalPages > 1 && (
        <>
          <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><LuChevronLeft aria-hidden="true" /></button>
          {pageList(page, totalPages).map((n, i) => (n === 'gap'
            ? <span key={`g${i}`} className="gap" aria-hidden="true">…</span>
            : <button key={n} type="button" aria-current={n === page ? 'page' : undefined} aria-label={`Page ${n}`} onClick={() => onPage(n)}>{n}</button>))}
          <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Next page"><LuChevronRight aria-hidden="true" /></button>
        </>
      )}
    </nav>
  );
}
