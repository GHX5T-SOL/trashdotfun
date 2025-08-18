import { PublicKey, Connection, TransactionInstruction, SystemProgram } from '@solana/web3.js';

export class MetaplexService {
  // Metaplex Program ID for Gorbagana Chain
  static readonly METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  
  /**
   * Get the metadata account address for a given mint
   */
  static getMetadataAccount(mint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        this.METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      this.METADATA_PROGRAM_ID
    )[0];
  }
  
  /**
   * Create metadata instruction using the correct, non-deprecated format
   * This follows the current Metaplex instruction structure
   */
  static createMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ): TransactionInstruction {
    const metadataAccount = this.getMetadataAccount(mint);
    
    // Create the correct instruction data structure
    // Using the current Metaplex instruction format
    const data = Buffer.alloc(1 + 4 + name.length + 4 + symbol.length + 4 + uri.length + 1 + 1);
    let offset = 0;
    
    // Instruction discriminator for create metadata (current version)
    data.writeUint8(0x0, offset); // Updated instruction code
    offset += 1;
    
    // Name length and data
    data.writeUint32LE(name.length, offset);
    offset += 4;
    data.write(name, offset);
    offset += name.length;
    
    // Symbol length and data
    data.writeUint32LE(symbol.length, offset);
    offset += 4;
    data.write(symbol, offset);
    offset += symbol.length;
    
    // URI length and data
    data.writeUint32LE(uri.length, offset);
    offset += 4;
    data.write(uri, offset);
    offset += uri.length;
    
    // Additional fields for current format
    data.writeUint8(0, offset); // Seller fee basis points
    offset += 1;
    data.writeUint8(0, offset); // Collection details
    
    return new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: mintAuthority, isSigner: true, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.METADATA_PROGRAM_ID,
      data,
    });
  }
  
  /**
   * Alternative: Create metadata using the latest Metaplex instruction format
   * This uses the most current instruction structure
   */
  static createLatestMetadataInstruction(
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    name: string,
    symbol: string,
    uri: string
  ): TransactionInstruction {
    const metadataAccount = this.getMetadataAccount(mint);
    
    // Use the latest instruction format with proper structure
    const data = Buffer.alloc(1 + 4 + name.length + 4 + symbol.length + 4 + uri.length + 1 + 1 + 1);
    let offset = 0;
    
    // Latest instruction discriminator
    data.writeUint8(0x0, offset);
    offset += 1;
    
    // Name
    data.writeUint32LE(name.length, offset);
    offset += 4;
    data.write(name, offset);
    offset += name.length;
    
    // Symbol
    data.writeUint32LE(symbol.length, offset);
    offset += 4;
    data.write(symbol, offset);
    offset += symbol.length;
    
    // URI
    data.writeUint32LE(uri.length, offset);
    offset += 4;
    data.write(uri, offset);
    offset += uri.length;
    
    // Current format fields
    data.writeUint8(0, offset); // Seller fee basis points
    offset += 1;
    data.writeUint8(0, offset); // Collection details
    offset += 1;
    data.writeUint8(0, offset); // Uses
    
    return new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: mintAuthority, isSigner: true, isWritable: false },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.METADATA_PROGRAM_ID,
      data,
    });
  }
  
  /**
   * Create metadata JSON for IPFS upload
   */
  static createMetadataJSON(
    name: string,
    symbol: string,
    description: string,
    imageUri: string
  ) {
    return {
      name,
      symbol,
      description,
      image: imageUri,
      attributes: [],
      properties: {
        files: [
          {
            type: "image/png",
            uri: imageUri
          }
        ],
        category: "image",
        creators: []
      }
    };
  }
  
  /**
   * Verify metadata account exists
   */
  static async verifyMetadataAccount(
    connection: Connection,
    mint: PublicKey
  ): Promise<boolean> {
    try {
      const metadataAccount = this.getMetadataAccount(mint);
      const accountInfo = await connection.getAccountInfo(metadataAccount);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error verifying metadata account:', error);
      return false;
    }
  }
}
