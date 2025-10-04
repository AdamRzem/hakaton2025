// app/hooks/useDatabase.tsx
import { useEffect, useState } from 'react';
import { initDB } from '../database';

export default function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      try {
        await initDB();
        if (mounted) setReady(true);
      } catch (err: any) {
        console.error('DB init error', err);
        if (mounted) {
          setError(err);
        }
      }
    }
    prepare();
    return () => {
      mounted = false;
    };
  }, []);

  return { ready, error };
}
