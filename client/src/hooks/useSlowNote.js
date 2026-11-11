import { useEffect, useState } from 'react';

export const WAKING_NOTE = 'The demo server was asleep and is waking up. The first request can take about a minute.';

/** True once `busy` has stayed true for `after` ms. Lets a button say why it is taking long. */
export default function useSlowNote(busy, after = 4000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return undefined;
    }
    const t = setTimeout(() => setSlow(true), after);
    return () => clearTimeout(t);
  }, [busy, after]);
  return slow;
}
