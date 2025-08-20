'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Keypair, 
  Transaction, 
  SystemProgram,
  ComputeBudgetProgram,
  Connection,
  PublicKey
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
import LoadingSpinner from './LoadingSpinner';

export default function CreateToken() {
  // Prevent SSR rendering of this component
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trash-green via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗑️</div>
          <h1 className="text-2xl font-bold text-trash-yellow mb-2">TrashdotFun</h1>
          <p className="text-green-200">Loading token creation interface...</p>
        </div>
      </div>
    );
  }

  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState<number>(1000000);
  const [decimals, setDecimals] = useState<number>(9);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [telegram, setTelegram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdToken, setCreatedToken] = useState<{
    name: string;
    symbol: string;
    initialSupply: number;
    decimals: number;
    mintAddress: string;
    metadataUri?: string;
    telegram?: string;
    twitter?: string;
    website?: string;
    description?: string;
    metadataCreated?: boolean;
    transactionSignature?: string;
    social?: {
      telegram?: string;
      twitter?: string;
      website?: string;
    };
  } | null>(null);

  // Use proxy connection to avoid CORS issues (as recommended by Gorbagana devs)
  const proxyConnection = useMemo(() => {
    // During SSR, return null to avoid creating Connection objects
    if (typeof window === 'undefined') {
      return null;
    }
    
    const proxyUrl = `${window.location.origin}/api/rpc`;
    console.log('🔗 CreateToken - Creating proxy connection to:', proxyUrl);
    console.log('🔗 CreateToken - This ensures ALL RPC calls go through our proxy');
    console.log('🔗 CreateToken - Following Gorbagana dev recommendation: RPC server → my server → frontend');
    
    return new Connection(proxyUrl, 'confirmed');
  }, []);

  // Use proxy connection for all operations
  const workingConnection = useMemo(() => {
    if (!proxyConnection) {
      console.warn('🔗 CreateToken - No proxy connection available, falling back to default');
      return connection;
    }
    
    console.log('🔗 CreateToken - Using proxy connection for all operations');
    return proxyConnection;
  }, [proxyConnection, connection]);

  // Custom transaction confirmation with timeout
  const confirmTransactionWithTimeout = async (
    signature: string,
    timeoutMs: number
  ): Promise<boolean> => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await workingConnection.getSignatureStatus(signature);
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

  // Check if metadata account exists
  const checkMetadataAccountExists = async (mint: PublicKey): Promise<boolean> => {
    try {
      const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METAPLEX_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        METAPLEX_PROGRAM_ID
      );
      
      const accountInfo = await workingConnection.getAccountInfo(metadataAccount);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking metadata account existence:', error);
      return false;
    }
  };

  // Custom sendTransaction wrapper that ensures ALL RPC calls go through our proxy
  const sendTransactionWithProxy = useCallback(async (transaction: Transaction, options?: any) => {
    if (!sendTransaction) {
      throw new Error('Wallet does not support sending transactions');
    }

    console.log('🔗 CreateToken - Using custom sendTransaction wrapper to ensure proxy usage');
    
    try {
      // Send the transaction through our proxy
      const signature = await sendTransaction(transaction, workingConnection, options);
      
      console.log('🔗 CreateToken - Transaction sent, signature:', signature);
      
      // Manually confirm the transaction using our proxy connection
      console.log('🔗 CreateToken - Confirming transaction through proxy...');
      const confirmation = await workingConnection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('🔗 CreateToken - Transaction confirmed successfully through proxy');
      return signature;
      
    } catch (error) {
      console.error('🔗 CreateToken - Error in custom sendTransaction wrapper:', error);
      throw error;
    }
  }, [sendTransaction, workingConnection]);

  // Nuclear approach: Completely bypass wallet adapter confirmation to prevent CORS bypass
  const sendTransactionNuclear = useCallback(async (transaction: Transaction, options?: any) => {
    if (!sendTransaction) {
      throw new Error('Wallet does not support sending transactions');
    }

    console.log('🔗 CreateToken - NUCLEAR MODE: Bypassing wallet adapter confirmation');
    console.log('🔗 CreateToken - This ensures ZERO direct RPC calls to rpc.gorbagana.wtf');
    
    try {
      // Step 1: Send the transaction (this only sends, doesn't confirm)
      console.log('🔗 CreateToken - Step 1: Sending transaction through proxy...');
      const signature = await sendTransaction(transaction, workingConnection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
        commitment: 'confirmed'
      });
      
      console.log('🔗 CreateToken - Transaction sent successfully, signature:', signature);
      
      // Step 2: Manually confirm using ONLY our proxy connection
      console.log('🔗 CreateToken - Step 2: Manual confirmation through proxy ONLY...');
      setStatus('Confirming transaction through our secure proxy...');
      
      // Use our custom confirmation function that ONLY uses our proxy
      const confirmation = await confirmTransactionWithTimeout(signature, 60000);
      
      if (!confirmation) {
        throw new Error('Transaction confirmation timeout - using proxy connection only');
      }
      
      console.log('🔗 CreateToken - NUCLEAR SUCCESS: Transaction confirmed through proxy only!');
      return signature;
      
    } catch (error) {
      console.error('🔗 CreateToken - NUCLEAR ERROR:', error);
      throw error;
    }
  }, [sendTransaction, workingConnection]);

  // ULTIMATE BYPASS: Raw transaction signing to completely avoid wallet adapter RPC calls
  const sendTransactionUltimate = useCallback(async (transaction: Transaction, options?: any) => {
    if (!publicKey || !signTransaction) {
      throw new Error('Wallet not connected or signing not supported');
    }

    console.log('🔗 CreateToken - ULTIMATE BYPASS: Raw transaction signing');
    console.log('🔗 CreateToken - This completely bypasses the wallet adapter');
    console.log('🔗 CreateToken - ZERO chance of CORS bypass');
    
    try {
      // Step 1: Sign the transaction manually
      console.log('🔗 CreateToken - Step 1: Manual transaction signing...');
      const signedTransaction = await signTransaction(transaction);
      console.log('🔗 CreateToken - Transaction signed successfully');
      
      // Step 2: Send raw transaction through our proxy ONLY
      console.log('🔗 CreateToken - Step 2: Sending raw transaction through proxy...');
      setStatus('Sending signed transaction through secure proxy...');
      
      const signature = await workingConnection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        }
      );
      
      console.log('🔗 CreateToken - Raw transaction sent, signature:', signature);
      
      // Step 3: Confirm using ONLY our proxy connection
      console.log('🔗 CreateToken - Step 3: Confirming through proxy ONLY...');
      setStatus('Confirming transaction through secure proxy...');
      
      const confirmation = await workingConnection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('🔗 CreateToken - ULTIMATE SUCCESS: Transaction confirmed through proxy only!');
      return signature;
      
    } catch (error) {
      console.error('🔗 CreateToken - ULTIMATE ERROR:', error);
      throw error;
    }
  }, [publicKey, signTransaction, workingConnection]);

  const handleCreateToken = useCallback(async () => {
    // Prevent token creation during SSR
    if (typeof window === 'undefined') {
      setStatus('Token creation is not available during server-side rendering.');
      return;
    }
    
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
    setCreatedToken(null);

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
        mintKeypair.publicKey,
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

      // Create metadata JSON with social links
      let metadataUri = '';
      if (logoUri || telegram || twitter || website || description) {
        setStatus('Creating metadata...');
        try {
          const metadata = {
            name,
            symbol,
            description: description || `Token created on TrashdotFun - ${name} (${symbol})`,
            image: logoUri,
            attributes: [],
            properties: {
              files: logoUri ? [
                {
                  type: "image/png",
                  uri: logoUri
                }
              ] : [],
              category: "image",
              creators: [],
              social: {
                telegram: telegram || undefined,
                twitter: twitter || undefined,
                website: website || undefined
              }
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
          // Use the corrected, non-deprecated instruction
          metadataIx = MetaplexService.createMetadataInstruction(
            mintPublicKey,
            publicKey,
            publicKey,
            name,
            symbol,
            metadataUri
          );
          console.log('Metaplex metadata instruction created using current format');
        } catch (error) {
          console.error('Metaplex metadata instruction failed:', error);
          // Try V3 instruction as fallback
          try {
            setStatus('Trying alternative metadata format...');
            metadataIx = MetaplexService.createMetadataV3Instruction(
              mintPublicKey,
              publicKey,
              publicKey,
              name,
              symbol,
              metadataUri
            );
            console.log('Metaplex metadata V3 instruction created as fallback');
          } catch (v3Error) {
            console.error('Metaplex metadata V3 instruction also failed:', v3Error);
            setStatus('All metadata formats failed, but continuing with token creation...');
          }
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
      
      // First sign the transaction with the mint keypair
      finalTx.sign(mintKeypair);
      
      // Get the wallet's sendTransaction function
      if (!sendTransaction) {
        throw new Error('Wallet does not support sending transactions');
      }
      
      // Send the transaction using our ULTIMATE BYPASS approach
      // This completely bypasses the wallet adapter and uses raw transaction signing
      console.log('🔗 CreateToken - Using ULTIMATE BYPASS for transaction...');
      const finalSignature = await sendTransactionUltimate(finalTx);
      
      // Wait for confirmation using our proxy connection
      setStatus('Waiting for transaction confirmation...');
      console.log('🔗 CreateToken - Transaction sent, confirming through proxy...');
      console.log('🔗 CreateToken - Using proxy connection for confirmation: RPC server → my server → frontend');
      const confirmation = await confirmTransactionWithTimeout(finalSignature, 60000);

      if (confirmation) {
        // Check if metadata was created
        let metadataCreated = false;
        if (metadataUri) {
          try {
            console.log('🔗 CreateToken - Checking metadata account through proxy...');
            console.log('🔗 CreateToken - Following RPC server → my server → frontend sequence');
            metadataCreated = await checkMetadataAccountExists(mintPublicKey);
            console.log('Metadata account exists:', metadataCreated);
          } catch (error) {
            console.error('Error checking metadata:', error);
          }
        }

        // Store created token info
        const tokenInfo = {
          name,
          symbol,
          initialSupply,
          decimals,
          mintAddress: mintPublicKey.toString(),
          transactionSignature: finalSignature,
          metadataCreated,
          social: {
            telegram,
            twitter,
            website
          }
        };
        setCreatedToken(tokenInfo);

        setStatus('🎉 Token created successfully! Check the details below.');
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
  }, [publicKey, workingConnection, name, symbol, initialSupply, decimals, logoFile, telegram, twitter, website, description, sendTransaction, connection]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
    } else {
      setStatus('Please select a valid image file.');
    }
  };

  const resetForm = () => {
    setName('');
    setSymbol('');
    setInitialSupply(1000000);
    setDecimals(9);
    setLogoFile(null);
    setTelegram('');
    setTwitter('');
    setWebsite('');
    setDescription('');
    setStatus('');
    setCreatedToken(null);
  };

  if (!publicKey) {
    return (
      <div className="bg-gradient-to-br from-green-800/50 to-green-900 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-600 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-trash-yellow mb-4">Wallet Not Connected</h2>
        <p className="text-green-200 mb-6">Please connect your wallet to start creating tokens</p>
        <div className="text-4xl animate-bounce">👇</div>
        <p className="text-green-300 text-sm mt-2">Use the wallet button in the header above</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Token Creation Form */}
      <div className="bg-gradient-to-br from-green-800/50 to-green-900 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-600">
        <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">🚀 Create New Token</h2>
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Token Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-trash-yellow mb-4">📝 Basic Information</h3>
            
              <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Token Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Oscar's Garbage Coin"
                />
              </div>

              <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Token Symbol *
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                  placeholder="e.g., OGC"
                  maxLength={6}
                />
              </div>

              <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Initial Supply *
                </label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(Number(e.target.value))}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                  placeholder="1000000"
                  min="1"
                />
              </div>

              <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Decimals *
                </label>
                <input
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(Number(e.target.value))}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                  placeholder="9"
                  min="0"
                  max="9"
                />
              </div>
          </div>

          {/* Social Media & Additional Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-trash-yellow mb-4">🌐 Social & Media</h3>

              <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Describe your token..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Telegram Link
              </label>
              <input
                type="url"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                placeholder="https://t.me/yourgroup"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                X (Twitter) Link
              </label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                placeholder="https://x.com/yourhandle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-200 mb-2">
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="mt-6">
          <label htmlFor="logo-file" className="block text-sm font-medium text-green-200 mb-2">
                  Token Logo (Optional)
                </label>
                <input
                  id="logo-file"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  aria-label="Upload token logo image"
            className="w-full px-4 py-3 bg-green-900/70 border-2 border-green-600 rounded-xl text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-trash-yellow focus:border-transparent transition-all duration-200"
                />
          <p className="text-xs text-green-300 mt-2">
            Supported formats: PNG, JPG, GIF (Max 5MB)
                </p>
              </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center">
              <button
                onClick={handleCreateToken}
                disabled={isLoading || !name || !symbol || !initialSupply}
            className="flex-1 bg-gradient-to-r from-trash-yellow to-yellow-400 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <LoadingSpinner size="sm" text="Creating..." />
              </span>
            ) : (
              '🚀 Create Token'
            )}
          </button>
          
          {createdToken && (
            <button
              onClick={resetForm}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
            >
              🆕 Create Another
              </button>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {status && (
        <div className="bg-gradient-to-br from-green-800/50 to-green-900 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-600">
          <div className="text-center">
            <div className="text-2xl mb-2">📢</div>
            <div className="whitespace-pre-wrap break-words text-green-200 leading-relaxed">
              {status}
            </div>
            </div>
          </div>
        )}

      {/* Created Token Details */}
      {createdToken && (
        <div className="bg-gradient-to-br from-green-800/50 to-green-900 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-600">
          <h2 className="text-3xl font-bold text-trash-yellow mb-6 text-center">🎉 Token Created Successfully!</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Token Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-trash-yellow mb-4">🪙 Token Information</h3>
              
              <div className="bg-green-900/30 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-200 font-medium">Name:</span>
                  <span className="text-white font-bold">{createdToken.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200 font-medium">Symbol:</span>
                  <span className="text-white font-bold">{createdToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200 font-medium">Supply:</span>
                  <span className="text-white font-bold">{createdToken.initialSupply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200 font-medium">Decimals:</span>
                  <span className="text-white font-bold">{createdToken.decimals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-200 font-medium">Metadata:</span>
                  <span className={`font-bold ${createdToken.metadataCreated ? 'text-green-400' : 'text-red-400'}`}>
                    {createdToken.metadataCreated ? '✅ Created' : '❌ Not Created'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-trash-yellow mb-4">🔧 Technical Details</h3>
              
              <div className="bg-green-900/30 rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-green-200 font-medium block mb-2">Mint Address:</span>
                  <code className="bg-green-800/50 px-3 py-2 rounded-lg text-white text-sm break-all">
                    {createdToken.mintAddress}
                  </code>
                </div>
                
                <div>
                  <span className="text-green-200 font-medium block mb-2">Transaction:</span>
                  <code className="bg-green-800/50 px-3 py-2 rounded-lg text-white text-sm break-all">
                    {createdToken.transactionSignature}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {createdToken.social && (createdToken.social.telegram || createdToken.social.twitter || createdToken.social.website) && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-trash-yellow mb-4 text-center">Social Links</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {createdToken.social.telegram && (
                  <a
                    href={createdToken.social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 hover:scale-105"
                  >
                    📱 Telegram
                  </a>
                )}
                {createdToken.social.twitter && (
                  <a
                    href={createdToken.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 hover:scale-105"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {createdToken.social.website && (
                  <a
                    href={createdToken.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 hover:scale-105"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
              <a
                href={`https://trashcan.io/address/${createdToken.mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-trash-yellow hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-colors duration-200 hover:scale-105 text-center"
              >
                🔍 View on Explorer
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(createdToken.mintAddress)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200 hover:scale-105"
              >
                📋 Copy Mint Address
              </button>
            </div>
            
            <p className="text-sm text-green-300">
              Add this token to your wallet using the mint address above
            </p>
            </div>
          </div>
        )}

      {/* Network Info */}
      <div className="bg-gradient-to-br from-green-800/50 to-green-900 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-600">
        <h3 className="text-xl font-bold text-trash-yellow mb-4 text-center">🌐 Network Information</h3>
        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <p className="text-green-200">
              <span className="font-medium">Network:</span> Gorbagana Chain
            </p>
            <p className="text-green-200">
              <span className="font-medium">Explorer:</span>{' '}
              <a href="https://trashscan.io" target="_blank" rel="noopener noreferrer" className="text-trash-yellow hover:text-yellow-400 underline">
                trashscan.io
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-green-200">
              <span className="font-medium">Token Program:</span>{' '}
              <code className="bg-green-800/50 px-2 py-1 rounded text-xs">
                TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
              </code>
            </p>
            <p className="text-green-200">
              <span className="font-medium">Metaplex:</span>{' '}
              <code className="bg-green-800/50 px-2 py-1 rounded text-xs">
                metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
              </code>
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center text-yellow-400 bg-yellow-900/20 px-4 py-2 rounded-lg">
            <span className="mr-2">⚠️</span>
            <span>Network congestion may cause delays</span>
          </div>
        </div>
      </div>
    </div>
  );
}