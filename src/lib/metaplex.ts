import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

export class MetaplexService {
  private static readonly METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  
  /**
   * Create metadata instruction for a token mint using Metaplex v1 structure
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

    // Create metadata instruction data according to Metaplex v1 specification
    const instructionData = this.createMetadataInstructionData(name, symbol, uri);
    
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

  /**
   * Create proper metadata instruction data for Metaplex v1
   * @param name - Token name
   * @param symbol - Token symbol
   * @param uri - Metadata URI (IPFS)
   * @returns Buffer containing the instruction data
   */
  private static createMetadataInstructionData(name: string, symbol: string, uri: string): Buffer {
    // Metaplex v1 CreateMetadataAccount instruction
    // Instruction index: 0 (CreateMetadataAccount)
    const instructionIndex = 0;
    
    // Calculate total buffer size correctly
    // 1 (instruction) + 4 (name len) + name + 4 (symbol len) + symbol + 4 (uri len) + uri + 4 (creators len) + 2 (seller fee) + 4 (collection) + 4 (uses)
    const totalSize = 1 + 4 + name.length + 4 + symbol.length + 4 + uri.length + 4 + 2 + 4 + 4;
    
    // Create the data buffer with correct size
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Instruction index
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
   * Create a complete metadata instruction with all required fields
   * @param mint - The mint public key
   * @param mintAuthority - The mint authority public key
   * @param payer - The payer public key
   * @param metadata - Complete metadata object
   * @returns TransactionInstruction for creating metadata
   */
  static createCompleteMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    metadata: {
      name: string;
      symbol: string;
      uri: string;
      description?: string;
      image?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    }
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

    // Create metadata instruction data
    const instructionData = this.createCompleteMetadataInstructionData(metadata);
    
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

  /**
   * Create complete metadata instruction data
   * @param metadata - Complete metadata object
   * @returns Buffer containing the instruction data
   */
  private static createCompleteMetadataInstructionData(metadata: {
    name: string;
    symbol: string;
    uri: string;
    description?: string;
    image?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  }): Buffer {
    // Metaplex v1 CreateMetadataAccount instruction
    const instructionIndex = 0;
    
    // Calculate total size needed
    let totalSize = 1 + 4 + metadata.name.length + 4 + metadata.symbol.length + 4 + metadata.uri.length;
    totalSize += 4 + 0; // Creator array (empty)
    totalSize += 2; // Seller fee basis points
    totalSize += 4 + 0; // Collection (empty)
    totalSize += 4 + 0; // Uses (empty)
    
    // Create the data buffer
    const data = Buffer.alloc(totalSize);
    let offset = 0;
    
    // Instruction index
    data.writeUInt8(instructionIndex, offset);
    offset += 1;
    
    // Name length and data
    data.writeUInt32LE(metadata.name.length, offset);
    offset += 4;
    data.write(metadata.name, offset, 'utf8');
    offset += metadata.name.length;
    
    // Symbol length and data
    data.writeUInt32LE(metadata.symbol.length, offset);
    offset += 4;
    data.write(metadata.symbol, offset, 'utf8');
    offset += metadata.symbol.length;
    
    // URI length and data
    data.writeUInt32LE(metadata.uri.length, offset);
    offset += 4;
    data.write(metadata.uri, offset, 'utf8');
    offset += metadata.uri.length;
    
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
}
