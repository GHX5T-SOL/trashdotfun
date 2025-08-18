'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Use the official Gorbagana RPC endpoint
  const endpoint = process.env.NEXT_PUBLIC_GOR_RPC_URL || 'https://rpc.gorbagana.wtf/';
  
  // Debug logging
  console.log('🔗 WalletContextProvider - RPC Endpoint:', endpoint);
  console.log('🔗 Environment variable value:', process.env.NEXT_PUBLIC_GOR_RPC_URL);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new UnsafeBurnerWalletAdapter(), // Supports injected wallets like Backpack
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