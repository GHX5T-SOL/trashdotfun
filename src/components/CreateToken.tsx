'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createInitializeMintInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction } from '@solana/spl-token';

export default function CreateToken() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [supply, setSupply] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setStatus('Please connect your wallet!');
      return;
    }

    try {
      setStatus('Creating token...');
      const decimals = 9;
      const totalSupply = BigInt(Number(supply) * Math.pow(10, decimals));

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Step 1: Generate a new keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;
      const mintRent = await connection.getMinimumBalanceForRentExemption(82); // Size for mint account
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
          space: 82, // Standard size for mint account
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintPublicKey,
          decimals,
          publicKey, // Mint authority
          null, // Freeze authority
          TOKEN_PROGRAM_ID
        )
      );

      // Include the mint keypair as a signer (wallet will sign it)
      mintTx.partialSign(mintKeypair);

      setStatus('Sending mint creation transaction...');
      const mintSignature = await sendTransaction(mintTx, connection);
      await connection.confirmTransaction({
        signature: mintSignature,
        blockhash,
        lastValidBlockHeight,
      });
      setStatus('Mint account created successfully! Proceeding to create associated token account...');

      // Step 2: Create associated token account and mint tokens
      const newBlockhash = await connection.getLatestBlockhash();
      const newTx = new Transaction({
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
      newTx.add(createATAInstruction);

      const mintToInstruction = createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount,
        publicKey, // Mint authority
        totalSupply,
        [], // No additional signers
        TOKEN_PROGRAM_ID
      );
      newTx.add(mintToInstruction);

      setStatus('Sending minting transaction...');
      let mintToSignature;
      try {
        mintToSignature = await sendTransaction(newTx, connection);
        if (!mintToSignature) {
          setStatus('Minting transaction failed. No signature returned.');
          return;
        }
      } catch (error) {
        setStatus(`Transaction failed: ${(error as Error).message}`);
        return;
      }
      await connection.confirmTransaction({
        signature: mintToSignature,
        ...newBlockhash,
      });

      // Handle logo (placeholder for metadata)
      if (logo) {
        setStatus(`Token created! Mint address: ${mintPublicKey.toBase58()}. Logo upload not implemented yet. Verify on explorer with signature: ${mintToSignature}`);
      } else {
        setStatus(`Token created! Mint address: ${mintPublicKey.toBase58()}. Verify on explorer with signature: ${mintToSignature}`);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
      <WalletMultiButton className="mb-6 w-full bg-trash-yellow text-black py-2 rounded-lg hover:bg-yellow-600" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">Token Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border-gray-500"
            placeholder="e.g., TrashCoin"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Token Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border-gray-500"
            placeholder="e.g., TRASH"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Total Supply</label>
          <input
            type="number"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="w-full p-2 rounded bg-gray-900 text-white border-gray-500"
            placeholder="e.g., 1000000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Token Logo</label>
          <input
            type="file"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
            className="w-full p-2 rounded bg-gray-900 text-white"
            accept="image/*"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-trash-yellow text-black py-2 rounded-lg hover:bg-yellow-600"
          disabled={!publicKey}
        >
          Create Token
        </button>
      </form>
      {status && <p className="mt-4 text-center text-white">{status}</p>}
    </div>
  );
}

export {};