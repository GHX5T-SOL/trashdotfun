import { Connection, PublicKey, TransactionInstruction, Transaction } from '@solana/web3.js';
import { 
  createInitializeMintInstruction,
  createMintToInstruction,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE
} from '@solana/spl-token';

export class MetaplexService {
  private static readonly METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  private static readonly RENT_PROGRAM_ID = new PublicKey('SysvarRent111111111111111111111111111111111');
  
  /**
   * Create a complete token creation transaction with metadata using modern approach
   * This method creates the entire transaction in the correct order
   */
  static createTokenCreationTransaction(
    mintKeypair: any,
    payer: PublicKey,
    mintAuthority: PublicKey,
    name: string,
    symbol: string,
    uri: string,
    decimals: number,
    initialSupply: number,
    associatedTokenAddress: PublicKey
  ): Transaction {
    const transaction = new Transaction();
    
    // 1. Create mint account
    const createMintAccountIx = this.createMintAccountInstruction(
      mintKeypair.publicKey,
      payer,
      MINT_SIZE
    );
    
    // 2. Initialize mint
    const initializeMintIx = createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      mintAuthority,
      mintAuthority,
      TOKEN_PROGRAM_ID
    );
    
    // 3. Create associated token account
    const createATAIx = createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAddress,
      mintAuthority,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // 4. Mint tokens to associated token account
    const mintToIx = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAddress,
      mintAuthority,
      initialSupply,
      [],
      TOKEN_PROGRAM_ID
    );
    
    // 5. Create metadata account (using modern approach)
    const createMetadataIx = this.createModernMetadataInstruction(
      mintKeypair.publicKey,
      mintAuthority,
      payer,
      name,
      symbol,
      uri
    );
    
    // Add all instructions in the correct order
    transaction.add(
      createMintAccountIx,
      initializeMintIx,
      createATAIx,
      mintToIx,
      createMetadataIx
    );
    
    return transaction;
  }
  
  /**
   * Create mint account instruction
   */
  private static createMintAccountInstruction(
    mintPublicKey: PublicKey,
    payer: PublicKey,
    space: number
  ): TransactionInstruction {
    const { SystemProgram } = require('@solana/web3.js');
    
    return SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintPublicKey,
      space: space,
      lamports: 0, // Will be set by the client
      programId: TOKEN_PROGRAM_ID,
    });
  }
  
  /**
   * Create metadata instruction using the modern CreateMetadataAccountV3 approach
   * This is the current standard instruction that should work on Gorbagana
   */
  private static createModernMetadataInstruction(
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

    // Create metadata instruction data for CreateMetadataAccountV3 (instruction index: 33)
    const instructionData = this.createMetadataV3InstructionData(name, symbol, uri);
    
    console.log('🔧 MetaplexService - Creating V3 instruction:');
    console.log('🔧 MetaplexService - Instruction index: 33 (CreateMetadataAccountV3)');
    console.log('🔧 MetaplexService - Data length:', instructionData.length);
    console.log('🔧 MetaplexService - First byte:', instructionData[0]);
    console.log('🔧 MetaplexService - Metadata account:', metadataAccount.toString());
    
    return new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: mintAuthority, isSigner: true, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System Program
        { pubkey: this.RENT_PROGRAM_ID, isSigner: false, isWritable: false }, // Rent Program
      ],
      programId: this.METAPLEX_PROGRAM_ID,
      data: instructionData,
    });
  }

  /**
   * Create metadata V3 instruction data (CreateMetadataAccountV3)
   * This is the current standard that should work on modern Solana forks
   */
  private static createMetadataV3InstructionData(name: string, symbol: string, uri: string): Buffer {
    // Metaplex CreateMetadataAccountV3 instruction (index: 33)
    const instructionIndex = 33;
    
    // Calculate total buffer size for V3
    const totalSize = 1 + 4 + name.length + 4 + symbol.length + 4 + uri.length + 4 + 2 + 1 + 1 + 4 + 4;
    
    // Create the data buffer
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Instruction index (33 = CreateMetadataAccountV3)
    data.writeUInt8(instructionIndex, offset);
    offset += 1;
    
    // Name length and data
    data.writeUInt32LE(name.length, offset);
    offset += 4;
    data.write(name, offset, 'utf8');
    offset += name.length;
    
    // Symbol length and data
    data.writeUInt32LE(symbol.length, offset);
    offset += 4;
    data.write(symbol, offset, 'utf8');
    offset += symbol.length;
    
    // URI length and data
    data.writeUInt32LE(uri.length, offset);
    offset += 4;
    data.write(uri, offset, 'utf8');
    offset += uri.length;
    
    // Creator array (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    // Seller fee basis points (0 for now)
    data.writeUInt16LE(0, offset);
    offset += 2;
    
    // Has collection (false)
    data.writeUInt8(0, offset);
    offset += 1;
    
    // Has uses (false)
    data.writeUInt8(0, offset);
    offset += 1;
    
    // Collection (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    // Uses (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    return data;
  }

  /**
   * Alternative: Try using the CreateMetadataAccount instruction (index: 0)
   * This is the most basic instruction that should be compatible
   */
  private static createBasicMetadataInstruction(
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

    // Create metadata instruction data for CreateMetadataAccount (instruction index: 0)
    const instructionData = this.createBasicMetadataInstructionData(name, symbol, uri);
    
    console.log('🔧 MetaplexService - Creating Basic instruction:');
    console.log('🔧 MetaplexService - Instruction index: 0 (CreateMetadataAccount)');
    console.log('🔧 MetaplexService - Data length:', instructionData.length);
    console.log('🔧 MetaplexService - First byte:', instructionData[0]);
    console.log('🔧 MetaplexService - Metadata account:', metadataAccount.toString());
    
    return new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: mintAuthority, isSigner: true, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false }, // System Program
        { pubkey: this.RENT_PROGRAM_ID, isSigner: false, isWritable: false }, // Rent Program
      ],
      programId: this.METAPLEX_PROGRAM_ID,
      data: instructionData,
    });
  }

  /**
   * Create basic metadata instruction data (CreateMetadataAccount)
   */
  private static createBasicMetadataInstructionData(name: string, symbol: string, uri: string): Buffer {
    // Metaplex CreateMetadataAccount instruction (index: 0)
    const instructionIndex = 0;
    
    // Calculate total buffer size for basic CreateMetadataAccount
    const totalSize = 1 + 4 + name.length + 4 + symbol.length + 4 + uri.length + 4 + 2 + 4 + 4;
    
    // Create the data buffer
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Instruction index (0 = CreateMetadataAccount)
    data.writeUInt8(instructionIndex, offset);
    offset += 1;
    
    // Name length and data
    data.writeUInt32LE(name.length, offset);
    offset += 4;
    data.write(name, offset, 'utf8');
    offset += name.length;
    
    // Symbol length and data
    data.writeUInt32LE(symbol.length, offset);
    offset += 4;
    data.write(symbol, offset, 'utf8');
    offset += symbol.length;
    
    // URI length and data
    data.writeUInt32LE(uri.length, offset);
    offset += 4;
    data.write(uri, offset, 'utf8');
    offset += uri.length;
    
    // Creator array (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    // Seller fee basis points (0 for now)
    data.writeUInt16LE(0, offset);
    offset += 2;
    
    // Collection (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    // Uses (empty for now)
    data.writeUInt32LE(0, offset);
    offset += 4;
    
    return data;
  }

  /**
   * Get the metadata account address for a mint
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
   * Create a transaction with fallback metadata instructions
   * This tries multiple instruction types to find one that works
   */
  static createTokenCreationTransactionWithFallback(
    mintKeypair: any,
    payer: PublicKey,
    mintAuthority: PublicKey,
    name: string,
    symbol: string,
    uri: string,
    decimals: number,
    initialSupply: number,
    associatedTokenAddress: PublicKey,
    useV3Instruction: boolean = true
  ): Transaction {
    const transaction = new Transaction();
    
    // 1. Create mint account
    const createMintAccountIx = this.createMintAccountInstruction(
      mintKeypair.publicKey,
      payer,
      MINT_SIZE
    );
    
    // 2. Initialize mint
    const initializeMintIx = createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      mintAuthority,
      mintAuthority,
      TOKEN_PROGRAM_ID
    );
    
    // 3. Create associated token account
    const createATAIx = createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAddress,
      mintAuthority,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // 4. Mint tokens to associated token account
    const mintToIx = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAddress,
      mintAuthority,
      initialSupply,
      [],
      TOKEN_PROGRAM_ID
    );
    
    // 5. Create metadata account with fallback
    let createMetadataIx;
    if (useV3Instruction) {
      createMetadataIx = this.createModernMetadataInstruction(
        mintKeypair.publicKey,
        mintAuthority,
        payer,
        name,
        symbol,
        uri
      );
    } else {
      createMetadataIx = this.createBasicMetadataInstruction(
        mintKeypair.publicKey,
        mintAuthority,
        payer,
        name,
        symbol,
        uri
      );
    }
    
    // Add all instructions in the correct order
    transaction.add(
      createMintAccountIx,
      initializeMintIx,
      createATAIx,
      mintToIx,
      createMetadataIx
    );
    
    return transaction;
  }
}
