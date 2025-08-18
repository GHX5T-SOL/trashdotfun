'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Keypair, 
  Transaction, 
  SystemProgram,
  ComputeBudgetProgram,
  Connection
} from '@solana/web3.js';
import { 
  createInitializeMintInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE
} from '@solana/spl-token';
import { MetaplexService } from '../lib/metaplex';
import { IPFSService } from '../lib/ipfs';

export default function CreateToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState<number>(1000000);
  const [decimals, setDecimals] = useState<number>(9);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use proxy connection to avoid CORS issues (as recommended by Gorbagana devs)
  const proxyConnection = useMemo(() => {
    if (typeof window !== 'undefined') {
      console.log('🔗 CreateToken - Using proxy connection to avoid CORS');
      return new Connection(`${window.location.origin}/api/rpc`, 'confirmed');
    }
    return connection;
  }, [connection]);

  // Use proxy connection for all operations
  const workingConnection = useMemo(() => {
    return proxyConnection;
  }, [proxyConnection]);

  // Custom transaction confirmation with timeout
  const confirmTransactionWithTimeout = async (
    connection: Connection,
    signature: string,
    timeoutMs: number
  ): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await connection.getSignatureStatus(signature);
        if (status?.value?.confirmationStatus === 'confirmed' || 
            status?.value?.confirmationStatus === 'finalized') {
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    }
    return false;
  };

  const handleCreateToken = useCallback(async () => {
    if (!publicKey || !workingConnection) {
      setStatus('Please connect your wallet first.');
      return;
    }

    if (!name || !symbol || !initialSupply || !decimals) {
      setStatus('Please fill in all required fields.');
      return;
    }

    setStatus('Creating token...');
    setIsLoading(true);

    try {
      // Create mint keypair
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // Get the minimum rent for exemption using proxy connection
      setStatus('Getting mint account requirements...');
      const mintRent = await workingConnection.getMinimumBalanceForRentExemption(MINT_SIZE);

      // Create mint account instruction
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize mint instruction
      const initializeMintIx = createInitializeMintInstruction(
        mintPublicKey,
        decimals,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      );

      // Get associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      // Create associated token account instruction
      const createATAIx = createAssociatedTokenAccountInstruction(
        publicKey,
        associatedTokenAddress,
        publicKey,
        mintPublicKey,
        TOKEN_PROGRAM_ID
      );

      // Mint tokens to the associated token account
      const mintToIx = createMintToInstruction(
        mintPublicKey,
        associatedTokenAddress,
        publicKey,
        Number(initialSupply * Math.pow(10, decimals)),
        [],
        TOKEN_PROGRAM_ID
      );

      // Upload logo to IPFS if provided
      let logoUri = '';
      if (logoFile) {
        setStatus('Uploading logo to IPFS...');
        try {
          const ipfsService = new IPFSService();
          logoUri = await ipfsService.uploadImage(logoFile);
          console.log('Logo uploaded to IPFS:', logoUri);
        } catch (error) {
          console.error('Logo upload failed:', error);
          setStatus('Logo upload failed, but continuing with token creation...');
        }
      }

      // Create metadata JSON
      let metadataUri = '';
      if (logoUri) {
        setStatus('Creating metadata...');
        try {
          const metadata = {
            name,
            symbol,
            description: `Token created on TrashdotFun - ${name} (${symbol})`,
            image: logoUri,
            attributes: [],
            properties: {
              files: [
                {
                  type: "image/png",
                  uri: logoUri
                }
              ],
              category: "image",
              creators: []
            }
          };
          
          // Upload metadata to IPFS
          const ipfsService = new IPFSService();
          metadataUri = await ipfsService.uploadMetadata(metadata);
          console.log('Metadata uploaded to IPFS:', metadataUri);
        } catch (error) {
          console.error('Metadata creation failed:', error);
          setStatus('Metadata creation failed, but continuing with token creation...');
        }
      }

      // Create Metaplex metadata instruction if we have metadata
      let metadataIx = null;
      if (metadataUri) {
        try {
          setStatus('Creating Metaplex metadata...');
          metadataIx = MetaplexService.createLatestMetadataInstruction(
            mintPublicKey,
            publicKey,
            publicKey,
            name,
            symbol,
            metadataUri
          );
          console.log('Metaplex metadata instruction created');
        } catch (error) {
          console.error('Metaplex metadata instruction failed:', error);
          setStatus('Metaplex metadata failed, but continuing with token creation...');
        }
      }

      // Add compute budget instructions for priority fees
      const modifyComputeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400_000,
      });

      const addPriorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 50_000,
      });

      // Build final transaction
      const finalTx = new Transaction();
      
      // Add compute budget instructions first
      finalTx.add(modifyComputeUnitsIx, addPriorityFeeIx);
      
      // Add token creation instructions
      finalTx.add(createMintAccountIx, initializeMintIx, createATAIx, mintToIx);
      
      // Add metadata instruction if available
      if (metadataIx) {
        finalTx.add(metadataIx);
      }

      // Get recent blockhash using proxy connection
      setStatus('Getting recent blockhash...');
      const { blockhash } = await workingConnection.getLatestBlockhash('finalized');
      finalTx.recentBlockhash = blockhash;
      finalTx.feePayer = publicKey;

      // Sign and send transaction
      setStatus('Signing and sending transaction...');
      const finalSignature = await sendTransaction(finalTx, workingConnection, {
        signers: [mintKeypair],
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      // Wait for confirmation
      setStatus('Waiting for transaction confirmation...');
      const confirmation = await confirmTransactionWithTimeout(workingConnection, finalSignature, 60000);

      if (confirmation) {
        // Check if metadata was created
        let metadataCreated = false;
        if (metadataUri) {
          try {
            metadataCreated = await MetaplexService.metadataExists(workingConnection, mintPublicKey);
            console.log('Metadata account exists:', metadataCreated);
          } catch (error) {
            console.error('Error checking metadata:', error);
          }
        }

        // Show success message
        setStatus(`🎉 Token "${name}" (${symbol}) created successfully!

**Token Details:**
• **Name**: ${name}
• **Symbol**: ${symbol}
• **Supply**: ${initialSupply}
• **Decimals**: ${decimals}
• **Mint Address**: 
  ${mintPublicKey.toString().slice(0, 20)}...${mintPublicKey.toString().slice(-20)}

**Transaction Signature:**
${finalSignature.slice(0, 20)}...${finalSignature.slice(-20)}

**View Your Token:**
• **Gorbagana Explorer**: 
  https://trashcan.io/address/${mintPublicKey.toString()}
• **Add to Wallet**: Use the mint address above

**Metadata Status**: ${metadataCreated ? '✅ Created successfully' : '❌ Not created'}

**Note**: ${metadataCreated ? 'Token has full metadata support!' : 'Token created without metadata but will still function.'}`);
      } else {
        setStatus('❌ Transaction failed to confirm within timeout. Please check the explorer.');
      }

    } catch (error) {
      console.error('Token creation error:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        errorMessage = `CORS/RPC Connection Error: ${errorMessage}
        
This suggests the backend proxy isn't working properly. 
Please check the console for more details.`;
      }
      
      setStatus(`❌ Error creating token: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, workingConnection, name, symbol, initialSupply, decimals, logoFile, sendTransaction]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    } else {
      setStatus('Please select a valid image file.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 mb-4">🗑️ TrashdotFun</h1>
          <p className="text-xl text-gray-300">Create Your Trash Token on Gorbagana Chain</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <WalletMultiButton className="w-full mb-6" />
          
          {!publicKey && (
            <p className="text-center text-gray-400">
              Connect your wallet to start creating tokens
            </p>
          )}
        </div>

        {publicKey && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Create New Token</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Oscar's Garbage Coin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., OGC"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Supply
                </label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1000000"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Decimals
                </label>
                <input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="9"
                  min="0"
                  max="9"
                />
              </div>

              <div>
                <label htmlFor="logo-file" className="block text-sm font-medium text-gray-300 mb-2">
                  Token Logo (Optional)
                </label>
                <input
                  id="logo-file"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Upload token logo image"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: PNG, JPG, GIF
                </p>
              </div>

              <button
                onClick={handleCreateToken}
                disabled={isLoading || !name || !symbol || !initialSupply}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors duration-200"
              >
                {isLoading ? 'Creating Token...' : 'Create Token'}
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="whitespace-pre-wrap break-words text-sm text-gray-200 leading-relaxed">
              {status}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by Gorbagana Chain</p>
          <p className="mt-2">
            Explorer: <a href="https://trashscan.io" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">trashscan.io</a>
          </p>
          <p className="mt-1">
            Token Program: <code className="bg-gray-700 px-2 py-1 rounded text-xs">TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA</code>
          </p>
          <p className="mt-1">
            Metaplex: <code className="bg-gray-700 px-2 py-1 rounded text-xs">metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s</code>
          </p>
          <div className="mt-4 flex items-center justify-center text-yellow-400">
            <span className="mr-2">⚠️</span>
            <span>Network congestion may cause delays</span>
          </div>
        </div>
      </div>
    </div>
  );
}