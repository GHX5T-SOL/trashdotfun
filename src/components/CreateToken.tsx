'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createInitializeMintInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createMintToInstruction,
  MINT_SIZE
} from '@solana/spl-token';

export default function CreateToken() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [description, setDescription] = useState('');
  // const [logo, setLogo] = useState<File | null>(null); // Will be implemented in next update
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

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
    setStatus('Creating token...');

    try {
      const decimals = 9;
      const totalSupply = BigInt(Number(supply) * Math.pow(10, decimals));

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Step 1: Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      
      // Calculate rent for mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
      
      const mintTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

      // Add instruction to create and initialize mint account
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

      setStatus('Sending mint creation transaction...');
      const mintSignature = await sendTransaction(mintTx, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature: mintSignature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Mint creation failed');
      }

      setStatus('Mint account created successfully! Creating associated token account...');

      // Step 2: Create associated token account and mint tokens
      const newBlockhash = await connection.getLatestBlockhash();
      const tokenTx = new Transaction({
        recentBlockhash: newBlockhash.blockhash,
        feePayer: publicKey,
      });

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

      setStatus('Sending token minting transaction...');
      const mintToSignature = await sendTransaction(tokenTx, connection);
      
      await connection.confirmTransaction({
        signature: mintToSignature,
        ...newBlockhash,
      });

      setStatus(`🎉 Token created successfully! 
      
Mint Address: ${mintPublicKey.toBase58()}
Token Name: ${name}
Symbol: ${symbol}
Total Supply: ${supply}
Decimals: ${decimals}

Transactions:
- Mint Creation: ${mintSignature}
- Token Minting: ${mintToSignature}

Note: Token metadata (name, symbol) is stored locally. For full metadata support, you can add it later using Metaplex.

You can view your token on the Gorbagana Explorer!`);

      // Reset form
      setName('');
      setSymbol('');
      setSupply('');
      setDescription('');
      // setLogo(null); // Will be implemented in next update

    } catch (error) {
      console.error('Token creation error:', error);
      setStatus(`Error: ${(error as Error).message}`);
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
            onChange={(e) => {
              // Logo upload will be implemented in the next update
              console.log('Logo selected:', e.target.files?.[0]?.name);
            }}
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-trash-yellow focus:ring-2 focus:ring-trash-yellow focus:ring-opacity-50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-trash-yellow file:text-black hover:file:bg-yellow-600"
            accept="image/*"
            disabled={isLoading}
            aria-describedby="logo-help"
          />
          <p id="logo-help" className="text-xs text-gray-400 mt-1">Logo upload will be implemented in the next update</p>
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
          {isLoading ? 'Creating Token...' : 'Create Token'}
        </button>
      </form>
      
      {status && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-sm text-white whitespace-pre-line">{status}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-400 text-center">
        <p>Powered by Gorbagana Chain</p>
        <p>RPC: rpc.gorbagana.wtf</p>
        <p>Token Program: {TOKEN_PROGRAM_ID.toBase58()}</p>
      </div>
    </div>
  );
}