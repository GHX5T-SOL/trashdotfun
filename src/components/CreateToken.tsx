'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair, SendTransactionError } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, mintTo, getAssociatedTokenAddress } from '@solana/spl-token';

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
      const totalSupply = BigInt(parseInt(supply) * Math.pow(10, decimals));

      // Generate a unique keypair for the mint account
      const mintKeypair = Keypair.generate();
      const mintPublicKey = mintKeypair.publicKey;

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      // Step 1: Create and initialize mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(82); // Size for mint account
      const mintTx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      });

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

      // Include mintKeypair as a signer (though wallet will sign in practice)
      mintTx.partialSign(mintKeypair);

      setStatus('Sending mint creation transaction...');
      const mintSignature = await sendTransaction(mintTx, connection);
      await connection.confirmTransaction({
        signature: mintSignature,
        blockhash,
        lastValidBlockHeight,
      });
      setStatus('Mint account created successfully!');

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
        new PublicKey('BiX9RsKCEUe7oHX9Rnwj3VmJ2fzTKwXizgaxEwUCSsHh')
      );
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        publicKey, // Payer
        associatedTokenAccount,
        publicKey, // Owner
        mintPublicKey,
        new PublicKey('BiX9RsKCEUe7oHX9Rnwj3VmJ2fzTKwXizgaxEwUCSsHh')
      );
      newTx.add(createATAInstruction);

      const mintToInstruction = await mintTo(
        connection,
        publicKey, // Payer/authority
        mintPublicKey,
        associatedTokenAccount,
        publicKey, // Authority
        totalSupply,
        [], // No additional signers
        { commitment: 'finalized' },
        new PublicKey('BiX9RsKCEUe7oHX9Rnwj3VmJ2fzTKwXizgaxEwUCSsHh')
      );
      newTx.add(mintToInstruction);

      setStatus('Sending minting transaction...');
      let mintToSignature;
      try {
        mintToSignature = await sendTransaction(newTx, connection);
      } catch (error) {
        if (error instanceof SendTransactionError) {
          const logs = await connection.getTransaction(mintToSignature, 'json');
          console.error('Transaction logs:', logs);
          setStatus(`Transaction failed. Logs: ${JSON.stringify(logs?.logs || 'No logs available')}. Check console for details.`);
        } else {
          throw error;
        }
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