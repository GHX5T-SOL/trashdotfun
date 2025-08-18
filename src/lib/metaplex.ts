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
   * Create metadata instruction for token (simplified version)
   * This creates a basic metadata account structure
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
    
    // Create a simple instruction to initialize the metadata account
    // This is a simplified approach that should work with Gorbagana Chain
    const data = Buffer.alloc(1 + 4 + name.length + 4 + symbol.length + 4 + uri.length);
    let offset = 0;
    
    // Instruction discriminator for create metadata
    data.writeUint8(0, offset);
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
