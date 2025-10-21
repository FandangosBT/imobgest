"use client";

import { useEffect } from 'react';
import { useDemoStore } from '@/lib/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('../mocks/browser').then(({ worker }) => {
        worker.start({ onUnhandledRequest: 'bypass' });
      });
    }
    // Mark store as hydrated on client
    useDemoStore.setState({ hydrated: true });
  }, []);
  return <>{children}</>;
}
