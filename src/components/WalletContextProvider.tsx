'use client';

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection, ConnectionConfig } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Custom Connection class that intercepts ALL RPC calls and redirects them through our proxy
class ProxyConnection extends Connection {
  private proxyUrl: string;
  private originalConnection: Connection;

  constructor(proxyUrl: string, commitment?: string, config?: ConnectionConfig) {
    // Create a connection to our proxy
    super(proxyUrl, commitment, config);
    this.proxyUrl = proxyUrl;
    
    // Create the original connection for fallback (though we shouldn't need it)
    this.originalConnection = new Connection(proxyUrl, commitment, config);
  }

  // Override the RPC method to ensure ALL calls go through our proxy
  async rpcRequest(method: string, args: any[]): Promise<any> {
    console.log(`🔗 ProxyConnection - Intercepting RPC call: ${method}`);
    console.log(`🔗 Redirecting through proxy: ${this.proxyUrl}`);
    
    try {
      // Always use our proxy for ALL RPC calls
      return await super.rpcRequest(method, args);
    } catch (error) {
      console.error(`🔗 ProxyConnection - RPC call failed: ${method}`, error);
      throw error;
    }
  }

  // Override getParsedTransaction specifically since that's what's causing the CORS issue
  async getParsedTransaction(signature: string, commitmentOrConfig?: any): Promise<any> {
    console.log(`🔗 ProxyConnection - Intercepting getParsedTransaction: ${signature}`);
    console.log(`🔗 Using proxy: ${this.proxyUrl}`);
    
    try {
      return await super.getParsedTransaction(signature, commitmentOrConfig);
    } catch (error) {
      console.error(`🔗 ProxyConnection - getParsedTransaction failed:`, error);
      throw error;
    }
  }

  // Override getSignatureStatus as well
  async getSignatureStatus(signature: string, config?: any): Promise<any> {
    console.log(`🔗 ProxyConnection - Intercepting getSignatureStatus: ${signature}`);
    console.log(`🔗 Using proxy: ${this.proxyUrl}`);
    
    try {
      return await super.getSignatureStatus(signature, config);
    } catch (error) {
      console.error(`🔗 ProxyConnection - getSignatureStatus failed:`, error);
      throw error;
    }
  }
}

export default function WalletContextProvider({ children }: { children: React.ReactNode }) {
  // Prevent SSR rendering of wallet components
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Use the backend proxy to avoid CORS issues (as recommended by Gorbagana devs)
  // RPC server -> your server -> your frontend
  const endpoint = useMemo(() => {
    // During SSR, return a placeholder that won't be used
    if (typeof window === 'undefined') {
      return 'https://placeholder.rpc'; // This won't be used during SSR
    }
    
    const proxyUrl = `${window.location.origin}/api/rpc`;
    console.log('🔗 WalletContextProvider - Using Backend Proxy:', proxyUrl);
    console.log('🔗 This follows Gorbagana dev recommendation: RPC server -> your server -> your frontend');
    return proxyUrl;
  }, []);

  // Create a custom connection that ensures ALL RPC calls go through our proxy
  const connection = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const proxyUrl = `${window.location.origin}/api/rpc`;
    console.log('🔗 WalletContextProvider - Creating ProxyConnection wrapper');
    return new ProxyConnection(proxyUrl, 'confirmed');
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}