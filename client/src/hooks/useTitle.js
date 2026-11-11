import { useEffect } from 'react';

/** Sets the browser tab title for a page: "Assets · PrimeVault". */
export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · PrimeVault` : 'PrimeVault: a crypto asset manager and its REST API';
  }, [title]);
}
