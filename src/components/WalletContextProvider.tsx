'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Use the backend proxy to avoid CORS issues (as recommended by Gorbagana devs)
  // RPC server -> your server -> your frontend
  const endpoint = useMemo(() => {
    if (typeof window !== 'undefined') {
      console.log('🔗 WalletContextProvider - Using Backend Proxy: /api/rpc');
      console.log('🔗 This follows Gorbagana dev recommendation: RPC server -> your server -> your frontend');
      return `${window.location.origin}/api/rpc`;
    }
    return 'https://rpc.gorbagana.wtf/';
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