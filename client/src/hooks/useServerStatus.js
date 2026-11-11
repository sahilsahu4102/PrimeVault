import { useCallback, useEffect, useRef, useState } from 'react';
import { pingServer } from '../services/api';

/**
 * Pings the API's health endpoint once on mount (and on retry).
 * status: 'checking' (first 4 s) -> 'waking' (still no answer) -> 'ready' | 'down'.
 * Doubles as a wake-up call, so the sign-in request that follows is usually fast.
 */
export default function useServerStatus() {
  const [status, setStatus] = useState('checking');
  const abort = useRef(null);

  const check = useCallback(() => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setStatus('checking');
    const slow = setTimeout(() => setStatus((s) => (s === 'checking' ? 'waking' : s)), 4000);
    pingServer(controller.signal)
      .then(() => setStatus('ready'))
      .catch((e) => { if (!controller.signal.aborted) setStatus('down'); })
      .finally(() => clearTimeout(slow));
  }, []);

  useEffect(() => {
    check();
    return () => abort.current?.abort();
  }, [check]);

  return { status, retry: check };
}
