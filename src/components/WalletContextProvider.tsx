'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Use our backend proxy endpoint to avoid CORS issues
  // This routes: Frontend -> Our Backend -> Gorbagana RPC
  const endpoint = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/rpc`
    : 'http://localhost:3000/api/rpc';
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔗 WalletContextProvider - Using Backend Proxy Endpoint:', endpoint);
    console.log('🔗 This will route through: Frontend -> Backend -> Gorbagana RPC');
    console.log('🔗 Current origin:', window.location.origin);
  }
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
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