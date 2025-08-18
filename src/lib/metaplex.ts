import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';

export class MetaplexService {
  private static readonly METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  private static readonly GORBAGANA_RPC = 'https://rpc.gorbagana.wtf/';

  /**
   * Create metadata instruction for a token mint using Umi framework
   * @param mint - The mint public key
   * @param mintAuthority - The mint authority public key
   * @param payer - The payer public key
   * @param name - Token name
   * @param symbol - Token symbol
   * @param uri - Metadata URI (IPFS)
   * @returns TransactionInstruction for creating metadata
   */
  static createMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ): TransactionInstruction {
    // Derive the metadata account address
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        this.METAPLEX_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      this.METAPLEX_PROGRAM_ID
    );

    // Create Umi instance using our backend proxy to avoid CORS issues
    const umi = createUmi('/api/rpc').use(mplTokenMetadata());

    // Create metadata data structure
    const data = {
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: 0, // No royalties for basic tokens
      creators: null,
      collection: null,
      uses: null,
    };

    try {
      // Create the metadata account using Umi
      const transactionBuilder = createMetadataAccountV3(umi, {
        metadata: metadataAccount,
        mint,
        mintAuthority,
        payer,
        updateAuthority: mintAuthority,
        data,
        isMutable: true,
        collectionDetails: null,
      });

      // Extract the instruction from the transaction builder
      const instructions = transactionBuilder.getInstructions();
      
      if (!instructions || instructions.length === 0) {
        throw new Error('No instructions returned from Umi transaction builder');
      }

      const instruction = instructions[0];

      // Check if the instruction has the expected structure
      if (!instruction.accounts || !Array.isArray(instruction.accounts)) {
        throw new Error(`Umi instruction accounts is not an array: ${typeof instruction.accounts}`);
      }

      // Convert Umi instruction to Solana TransactionInstruction
      return new TransactionInstruction({
        keys: instruction.accounts.map(account => ({
          pubkey: account.pubkey,
          isSigner: account.isSigner,
          isWritable: account.isWritable,
        })),
        programId: instruction.programId,
        data: instruction.data,
      });

    } catch (error) {
      console.error('Error creating Umi metadata instruction:', error);
      
      // Fallback: Create a basic instruction manually if Umi fails
      console.log('Falling back to manual instruction creation...');
      
      // Create the instruction data manually based on Metaplex v1 structure
      const instructionData = this.createFallbackMetadataInstructionData(name, symbol, uri);
      
      return new TransactionInstruction({
        keys: [
          { pubkey: metadataAccount, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: mintAuthority, isSigner: true, isWritable: false },
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System Program
        ],
        programId: this.METAPLEX_PROGRAM_ID,
        data: instructionData,
      });
    }
  }

  /**
   * Create a simplified metadata instruction for Gorbagana Chain
   * @param mint - The mint public key
   * @param mintAuthority - The mint authority public key
   * @param payer - The payer public key
   * @param name - Token name
   * @param symbol - Token symbol
   * @param uri - Metadata URI (IPFS)
   * @returns TransactionInstruction for creating metadata
   */
  static createLatestMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ): TransactionInstruction {
    return this.createMetadataInstruction(mint, mintAuthority, payer, name, symbol, uri);
  }

  /**
   * Get the metadata account address for a mint
   * @param mint - The mint public key
   * @returns PublicKey of the metadata account
   */
  static getMetadataAccount(mint: PublicKey): PublicKey {
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        this.METAPLEX_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      this.METAPLEX_PROGRAM_ID
    );
    return metadataAccount;
  }

  /**
   * Check if metadata account already exists
   * @param connection - Solana connection
   * @param mint - The mint public key
   * @returns Promise<boolean> - true if metadata exists
   */
  static async metadataAccountExists(connection: Connection, mint: PublicKey): Promise<boolean> {
    try {
      const metadataAccount = this.getMetadataAccount(mint);
      const accountInfo = await connection.getAccountInfo(metadataAccount);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking metadata account existence:', error);
      return false;
    }
  }

  /**
   * Fallback method to create metadata instruction data manually
   * Based on Metaplex v1 CreateMetadataAccountV3 instruction structure
   */
  private static createFallbackMetadataInstructionData(name: string, symbol: string, uri: string): Buffer {
    // Instruction discriminator for CreateMetadataAccountV3
    const instructionDiscriminator = Buffer.from([33, 57, 6, 167, 15, 219, 11, 16]);

    // Create the data buffer with proper structure
    const data = Buffer.concat([
      // Instruction discriminator
      instructionDiscriminator,
      
      // Data length (u32) - name length
      this.writeUint32(name.length),
      
      // Name (string)
      Buffer.from(name, 'utf8'),
      
      // Symbol length (u32)
      this.writeUint32(symbol.length),
      
      // Symbol (string)
      Buffer.from(symbol, 'utf8'),
      
      // URI length (u32)
      this.writeUint32(uri.length),
      
      // URI (string)
      Buffer.from(uri, 'utf8'),
      
      // Seller fee basis points (u16) - 0 for no royalties
      this.writeUint16(0),
      
      // Creators (null for basic tokens) - 1 byte for null
      Buffer.from([0]), // 0 = null creators
      
      // Collection (null for basic tokens) - 1 byte for null
      Buffer.from([0]), // 0 = null collection
      
      // Uses (null for basic tokens) - 1 byte for null
      Buffer.from([0]), // 0 = null uses
      
      // Is mutable (bool) - true
      Buffer.from([1]), // 1 = true
      
      // Collection details (null for basic tokens) - 1 byte for null
      Buffer.from([0]), // 0 = null collection details
      
      // Rule set (null for basic tokens) - 1 byte for null
      Buffer.from([0]), // 0 = null rule set
    ]);

    return data;
  }

  /**
   * Write uint32 to buffer (little endian)
   */
  private static writeUint32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32LE(value, 0);
    return buffer;
  }

  /**
   * Write uint16 to buffer (little endian)
   */
  private static writeUint16(value: number): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value, 0);
    return buffer;
  }
}
