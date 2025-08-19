'use client';

import { useEffect, useState } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnlyWrapper({ children, fallback }: ClientOnlyWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-trash-green via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗑️</div>
          <h1 className="text-2xl font-bold text-trash-yellow mb-2">TrashdotFun</h1>
          <p className="text-green-200">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
