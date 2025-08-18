import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { 
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METAPLEX_PROGRAM_ID,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';

export class MetaplexService {
  private static readonly METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
  private static readonly GORBAGANA_RPC = 'https://rpc.gorbagana.wtf/';

  /**
   * Create metadata instruction for a token mint
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

    // Create metadata data
    const data: DataV2 = {
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: 0, // No royalties for basic tokens
      creators: null,
      collection: null,
      uses: null,
    };

    // Create the instruction
    return createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAccount,
        mint,
        mintAuthority,
        payer,
        updateAuthority: mintAuthority,
      },
      {
        createMetadataAccountArgsV3: {
          data,
          isMutable: true,
          collectionDetails: null,
        },
      },
      this.METAPLEX_PROGRAM_ID
    );
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
   * Check if metadata exists for a mint
   * @param connection - Solana connection
   * @param mint - The mint public key
   * @returns Promise<boolean> - true if metadata exists
   */
  static async metadataExists(connection: Connection, mint: PublicKey): Promise<boolean> {
    try {
      const metadataAccount = this.getMetadataAccount(mint);
      const accountInfo = await connection.getAccountInfo(metadataAccount);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking metadata existence:', error);
      return false;
    }
  }
}
