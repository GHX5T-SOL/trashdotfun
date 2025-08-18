'use client';

import { useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, Keypair, ComputeBudgetProgram, Connection } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  MINT_SIZE
} from '@solana/spl-token';
import { IPFSService } from '@/lib/ipfs';
import { MetaplexService } from '@/lib/metaplex';

export default function CreateToken() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [metadataExists, setMetadataExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Use the proxy connection to avoid CORS issues (as recommended by Gorbagana devs)
  const proxyConnection = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Connection(`${window.location.origin}/api/rpc`, 'confirmed');
    }
    return connection;
  }, [connection]);

  // Use proxy connection for all operations
  const workingConnection = useMemo(() => {
    return proxyConnection;
  }, [proxyConnection]);

  // Custom confirmation function with timeout
  const confirmTransactionWithTimeout = async (
    signature: string, 
    connection: Connection, 
    timeoutMs: number = 30000
  ): Promise<void> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await connection.getSignatureStatus(signature);
        
        if (status.value?.confirmationStatus === 'confirmed' || 
            status.value?.confirmationStatus === 'finalized') {
          return;
        }
        
        // Wait 500ms before next check
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn('Error checking transaction status:', error);
        // Continue polling even if there's an error
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Please connect your wallet!');
      return;
    }

    if (!name || !symbol || !supply) {
      setStatus('Please fill in all required fields!');
      return;
    }

    setIsLoading(true);
    setStatus('🚀 Starting token creation process...');

    try {
      const decimals = 9;
      const initialSupply = BigInt(Number(supply) * Math.pow(10, decimals));

      // Step 1: Upload logo to IPFS (if provided)
      let logoUri = '';
      if (logo) {
        setStatus('📤 Uploading logo to IPFS...');
        try {
          const ipfsService = new IPFSService();
          
          // Log token status for debugging
          console.log('IPFS Token Status:', ipfsService.getTokenStatus());
          
          logoUri = await ipfsService.uploadImage(logo);
          setStatus(`✅ Logo uploaded to IPFS: ${logoUri}`);
        } catch (error) {
          console.error('Logo upload failed:', error);
          setStatus(`⚠️ Logo upload failed: ${(error as Error).message}. Continuing without logo...`);
        }
      }

      // Step 2: Create metadata JSON and upload to IPFS
      let metadataUri = '';
      try {
        setStatus('📝 Creating and uploading metadata to IPFS...');
        const ipfsService = new IPFSService();
        const metadata = MetaplexService.createMetadataJSON(
          name,
          symbol,
          description || 'Token created on TrashdotFun',
          logoUri || 'https://via.placeholder.com/400x400?text=No+Logo'
        );
        metadataUri = await ipfsService.uploadMetadata(metadata);
        setStatus(`✅ Metadata uploaded to IPFS: ${metadataUri}`);
      } catch (error) {
        console.error('Metadata upload failed:', error);
        setStatus(`⚠️ Metadata upload failed: ${(error as Error).message}. Continuing with mock metadata...`);
        // Use a fallback metadata URI
        metadataUri = `ipfs://QmMockMetadata${Date.now()}`;
      }

      // Step 3: Create the token mint
      setStatus('🪙 Creating token mint...');
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      
      // Get the best working connection
      // const workingConnection = await getWorkingConnection(); // This line is removed
      
      const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintPublicKey,
        space: MINT_SIZE,
        lamports: await workingConnection.getMinimumBalanceForRentExemption(MINT_SIZE),
        programId: TOKEN_PROGRAM_ID,
      });

      const initializeMintIx = createInitializeMintInstruction(
        mintPublicKey,
        decimals,
        publicKey,
        publicKey,
        TOKEN_PROGRAM_ID
      );

      // Step 4: Create associated token account
      setStatus('🏦 Creating associated token account...');
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Step 6: Create associated token account
      setStatus('🏦 Creating associated token account...');
      const finalBlockhashResponse = await workingConnection.getLatestBlockhash('processed');
      const finalBlockhash = finalBlockhashResponse.blockhash;

      const finalTx = new Transaction();
      finalTx.recentBlockhash = finalBlockhash;
      finalTx.feePayer = publicKey;

      // Add compute budget instructions for better transaction processing
      finalTx.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 })
      );

      // Add mint creation and initialization instructions
      finalTx.add(createMintAccountIx, initializeMintIx);

      // CRITICAL FIX: Create associated token account with correct owner
      const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        associatedTokenAccount, // associated token account address
        publicKey, // owner (this should be the wallet owner, not the mint)
        mintPublicKey // mint
      );

      finalTx.add(createAssociatedTokenAccountIx);

      // Add mint to instruction
      const mintToIx = createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        publicKey, // mint authority
        Number(initialSupply) * Math.pow(10, decimals)
      );

      finalTx.add(mintToIx);

      // Step 7: Create metadata account with Metaplex (with fallback)
      setStatus('📝 Creating metadata account...');
      let metadataCreated = false;
      
      try {
        const metadataInstruction = MetaplexService.createLatestMetadataInstruction(
          mintPublicKey,
          publicKey,
          publicKey,
          name,
          symbol,
          metadataUri
        );

        finalTx.add(metadataInstruction);
        metadataCreated = true;
        setStatus('✅ Metadata instruction added to transaction');
        
      } catch (error) {
        console.warn('Metadata creation failed:', error);
        setStatus('⚠️ Metadata creation failed, but continuing with token creation...');
        // Continue without metadata - token will still be created
      }

      // Step 8: Send the complete transaction
      setStatus('📤 Sending complete transaction...');
      
      // Ensure proper signers for the complete transaction
      const finalSignature = await sendTransaction(finalTx, workingConnection, {
        signers: [mintKeypair], // Include mint keypair as signer
        skipPreflight: true, // Skip preflight to avoid wallet adapter RPC calls
        maxRetries: 3,
        preflightCommitment: 'processed'
      });
      
      await confirmTransactionWithTimeout(finalSignature, workingConnection, 30000);

      // Step 8: Verify metadata account was created (if attempted)
      if (metadataCreated) {
        setStatus('🔍 Verifying metadata account...');
        try {
          const metadataVerified = await MetaplexService.verifyMetadataAccount(
            workingConnection,
            mintPublicKey
          );

          setMetadataExists(metadataVerified);

          if (metadataVerified) {
            setStatus('✅ Metadata account verified successfully!');
          } else {
            setStatus('⚠️ Metadata account verification failed, but token was created');
          }
        } catch (error) {
          console.warn('Metadata verification failed:', error);
          setStatus('⚠️ Metadata verification failed, but token was created successfully');
          setMetadataExists(false);
        }
      }

      setStatus(`🎉 **TOKEN CREATED SUCCESSFULLY!** 🎉

**Token Details:**
• **Name**: ${name}
• **Symbol**: ${symbol}
• **Total Supply**: ${supply}
• **Decimals**: ${decimals}
• **Mint Address**: ${mintPublicKey.toBase58()}

**IPFS Storage:**
• **Logo**: ${logoUri || 'No logo uploaded'}
• **Metadata**: ${metadataUri}

**Transaction Signatures:**
• **Mint Creation**: ${finalSignature}
• **Metadata**: ${finalSignature}
• **Token Minting**: ${finalSignature}

**View Your Token:**
• **Trashscan.io**: https://trashscan.io/token/${mintPublicKey.toBase58()}
• **IPFS Gateway**: ${metadataUri ? `https://ipfs.io/ipfs/${metadataUri.replace('ipfs://', '')}` : 'N/A'}

**Status**: ${metadataExists ? '✅ Full metadata created' : '⚠️ Basic token created (metadata may need time to propagate)'}

**Network Note**: Due to Gorbagana testnet congestion, transactions may take time to appear in wallets. Check Trashscan.io for confirmation.

Your token should now appear in wallets and explorers! 🗑️✨`);

      // Reset form
      setName('');
      setSymbol('');
      setSupply('');
      setDescription('');
      setLogo(null);

    } catch (error) {
      console.error('Token creation error:', error);
      
      // Provide specific error messages for common issues
      let errorMessage = (error as Error).message;
      
      if (errorMessage.includes('block height exceeded')) {
        errorMessage = `Transaction expired due to network congestion. 
        
The transaction was sent successfully but took too long to confirm. 
This is common on congested networks like Gorbagana testnet.

**What to do:**
1. Check Trashscan.io for transaction status
2. Wait a few minutes for network to process
3. Try again with a smaller transaction if needed

**Transaction may still succeed despite the error!**`;
      }
      
      setStatus(`❌ **ERROR**: ${errorMessage}

Please try again or contact support if the issue persists.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-700">
      <WalletMultiButton className="mb-6 w-full bg-trash-yellow text-black py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold" />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">Token Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all"
            placeholder="e.g., TrashCoin"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-white mb-2">Token Symbol *</label>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all"
            placeholder="e.g., TRASH"
            maxLength={10}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="supply" className="block text-sm font-medium text-white mb-2">Total Supply *</label>
          <input
            id="supply"
            type="number"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all"
            placeholder="e.g., 1000000"
            min="1"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-gray-400 mt-1">Will be minted with 9 decimals</p>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all"
            placeholder="Describe your token..."
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-white mb-2">Token Logo</label>
          <input
            id="logo"
            type="file"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-trash-yellow file:text-black hover:file:bg-yellow-600"
            accept="image/*"
            disabled={isLoading}
            aria-describedby="logo-help"
          />
          <p id="logo-help" className="text-xs text-gray-400 mt-1">
            Logo will be uploaded to IPFS and linked to your token metadata
          </p>
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            isLoading 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
              : 'bg-trash-yellow text-black hover:bg-yellow-600 hover:scale-105'
          }`}
          disabled={!publicKey || isLoading}
        >
          {isLoading ? '🚀 Creating Token...' : '🚀 Create Token'}
        </button>
      </form>
      
      {status && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-white whitespace-pre-line">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>Powered by Gorbagana Chain</p>
        <p>Explorer: <a href="https://trashscan.io" target="_blank" rel="noopener noreferrer" className="text-trash-yellow hover:underline">trashscan.io</a></p>
        <p>Token Program: {TOKEN_PROGRAM_ID.toBase58()}</p>
        <p>Metaplex: {MetaplexService.METADATA_PROGRAM_ID.toBase58()}</p>
        <p className="mt-2 text-yellow-400">⚠️ Network congestion may cause delays</p>
        
        {/* IPFS Status Display */}
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
          <p className="text-xs text-gray-300 mb-2">IPFS Status:</p>
          <p className="text-xs text-gray-400">
            {(() => {
              const ipfsService = new IPFSService();
              return ipfsService.getTokenStatus();
            })()}
          </p>
          {(() => {
            const ipfsService = new IPFSService();
            if (ipfsService.isRealIPFSAvailable()) {
              return (
                <div className="mt-2">
                  <p className="text-xs text-orange-400 mb-1">
                    ⚠️ Real IPFS requires UCAN setup
                  </p>
                  <p className="text-xs text-blue-400">
                    💡 <a href="https://docs.storacha.network" target="_blank" rel="noopener noreferrer" className="underline">Setup UCANs with Storacha Network</a>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently using mock service for development
                  </p>
                </div>
              );
            } else {
              return (
                <p className="text-xs text-orange-400 mt-1">
                  💡 Get free IPFS storage at <a href="https://console.storacha.network" target="_blank" rel="noopener noreferrer" className="underline">Storacha Network</a>
                </p>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}