'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Use the backend proxy to avoid CORS issues (as recommended by Gorbagana devs)
  // RPC server -> your server -> your frontend
  const endpoint = useMemo(() => {
    // During SSR, return a placeholder that won't be used
    if (typeof window === 'undefined') {
      return 'https://placeholder.rpc'; // This won't be used during SSR
    }
    
    console.log('🔗 WalletContextProvider - Using Backend Proxy: /api/rpc');
    console.log('🔗 This follows Gorbagana dev recommendation: RPC server -> your server -> your frontend');
    return `${window.location.origin}/api/rpc`;
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}