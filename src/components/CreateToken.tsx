'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, Keypair, ComputeBudgetProgram } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
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
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // Enhanced transaction confirmation with aggressive timeout
  const confirmTransactionWithTimeout = async (signature: string, connection: any, timeoutMs: number = 30000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await connection.getSignatureStatus(signature);
        
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          return { success: true, status: status.value.confirmationStatus };
        }
        
        if (status.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        
        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.warn('Status check failed, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error('Transaction confirmation timeout - transaction may still be processing');
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
      const totalSupply = BigInt(Number(supply) * Math.pow(10, decimals));

      // Step 1: Upload logo to IPFS (if provided)
      let logoUri = '';
      if (logo) {
        setStatus('📤 Uploading logo to IPFS...');
        try {
          const ipfsService = new IPFSService();
          logoUri = await ipfsService.uploadImage(logo);
          setStatus(`✅ Logo uploaded to IPFS: ${logoUri}`);
        } catch (error) {
          console.error('Logo upload failed:', error);
          setStatus('⚠️ Logo upload failed, continuing without logo...');
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
        throw new Error('Failed to upload metadata to IPFS');
      }

      // Step 3: Get recent blockhash with aggressive retry
      setStatus('🔗 Getting recent blockhash...');
      let blockhash: string;
      let lastValidBlockHeight: number;
      
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const blockhashResponse = await connection.getLatestBlockhash('processed'); // Use 'processed' for faster response
          blockhash = blockhashResponse.blockhash;
          lastValidBlockHeight = blockhashResponse.lastValidBlockHeight;
          break;
        } catch (error) {
          if (attempt === 4) throw new Error('Failed to get recent blockhash after 5 attempts');
          setStatus(`🔗 Blockhash attempt ${attempt + 1}/5 failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 4: Generate mint account keypair
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      
      // Calculate rent for mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      // Step 5: Create and initialize mint account with priority fees
      setStatus('🏗️ Creating mint account with priority fees...');
      const mintTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Add priority fee instruction
      mintTx.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 50000 // Higher priority fee for faster processing
        }),
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 200000 // Higher compute limit
        })
      );

      mintTx.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintPublicKey,
          lamports: mintRent,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintPublicKey,
          decimals,
          publicKey, // Mint authority
          publicKey, // Freeze authority (same as mint authority for now)
          TOKEN_PROGRAM_ID
        )
      );

      // Include the mint keypair as a signer
      mintTx.partialSign(mintKeypair);

      setStatus('📤 Sending mint creation transaction...');
      const mintSignature = await sendTransaction(mintTx, connection);
      
      // Use aggressive confirmation with shorter timeout
      setStatus('⏳ Waiting for mint confirmation (30s timeout)...');
      await confirmTransactionWithTimeout(mintSignature, connection, 30000);

      setStatus('✅ Mint account created successfully! Creating metadata...');

      // Step 6: Create metadata account with Metaplex
      const newBlockhashResponse = await connection.getLatestBlockhash('processed');
      const newBlockhash = newBlockhashResponse.blockhash;
      const newLastValidBlockHeight = newBlockhashResponse.lastValidBlockHeight;

      const metadataTx = new Transaction({
        recentBlockhash: newBlockhash,
        feePayer: publicKey,
      });

      // Add priority fee for metadata creation
      metadataTx.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 50000
        }),
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 200000
        })
      );

      const metadataInstruction = MetaplexService.createMetadataInstruction(
        mintPublicKey,
        publicKey,
        publicKey,
        name,
        symbol,
        metadataUri
      );

      metadataTx.add(metadataInstruction);

      setStatus('📤 Sending metadata creation transaction...');
      const metadataSignature = await sendTransaction(metadataTx, connection);
      
      setStatus('⏳ Waiting for metadata confirmation (30s timeout)...');
      await confirmTransactionWithTimeout(metadataSignature, connection, 30000);

      setStatus('✅ Metadata created! Creating associated token account...');

      // Step 7: Create associated token account and mint tokens
      const finalBlockhashResponse = await connection.getLatestBlockhash('processed');
      const finalBlockhash = finalBlockhashResponse.blockhash;
      const finalLastValidBlockHeight = finalBlockhashResponse.lastValidBlockHeight;

      const tokenTx = new Transaction({
        recentBlockhash: finalBlockhash,
        feePayer: publicKey,
      });

      // Add priority fee for final transaction
      tokenTx.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 50000
        }),
        ComputeBudgetProgram.setComputeUnitLimit({
          units: 200000
        })
      );

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey,
        false,
        TOKEN_PROGRAM_ID
      );

      const createATAInstruction = createAssociatedTokenAccountInstruction(
        publicKey, // Payer
        associatedTokenAccount,
        publicKey, // Owner
        mintPublicKey,
        TOKEN_PROGRAM_ID
      );

      const mintToInstruction = createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        publicKey, // Mint authority
        totalSupply,
        [], // No additional signers
        TOKEN_PROGRAM_ID
      );

      tokenTx.add(createATAInstruction, mintToInstruction);

      setStatus('📤 Sending token minting transaction...');
      const mintToSignature = await sendTransaction(tokenTx, connection);
      
      setStatus('⏳ Waiting for final confirmation (30s timeout)...');
      await confirmTransactionWithTimeout(mintToSignature, connection, 30000);

      // Step 8: Verify metadata account was created
      setStatus('🔍 Verifying metadata account...');
      const metadataExists = await MetaplexService.verifyMetadataAccount(
        connection,
        mintPublicKey
      );

      if (!metadataExists) {
        console.warn('Metadata account verification failed');
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
• **Mint Creation**: ${mintSignature}
• **Metadata**: ${metadataSignature}
• **Token Minting**: ${mintToSignature}

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
      </div>
    </div>
  );
}